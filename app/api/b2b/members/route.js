import { NextResponse } from "next/server";
import { getB2bContext, getCompanyTeam } from "@/lib/b2b-data";
import { isCompanyAdminRole } from "@/lib/b2b";
import { getSessionUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Du må være innlogget." }, { status: 401 });

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase er ikke konfigurert." }, { status: 503 });

  const body = await request.json();
  const { membership } = await getB2bContext(user, body.orgnr);
  if (!membership || (!isCompanyAdminRole(membership.role) && !user.isAdmin)) {
    return NextResponse.json({ error: "Bare bedriftsadmin kan endre tilganger." }, { status: 403 });
  }

  const targetId = String(body.user_id ?? "");
  if (!targetId || targetId === user.id) {
    return NextResponse.json({ error: "Du kan ikke endre din egen tilgang her." }, { status: 400 });
  }

  const team = await getCompanyTeam(membership.orgnr);
  const admins = team.filter((row) => row.status === "active" && row.role === "admin");
  const target = team.find((row) => row.user_id === targetId);
  if (!target) return NextResponse.json({ error: "Fant ikke personen." }, { status: 404 });

  const nextRole = body.role === "admin" || body.role === "responder" ? body.role : target.role;
  const nextStatus = body.status === "revoked" || body.status === "active" ? body.status : target.status;
  if (target.role === "admin" && admins.length < 2 && (nextRole !== "admin" || nextStatus !== "active")) {
    return NextResponse.json({ error: "Bedriften må ha minst én admin." }, { status: 400 });
  }

  const { error } = await supabase
    .from("company_members")
    .update({ role: nextRole, status: nextStatus })
    .eq("orgnr", membership.orgnr)
    .eq("user_id", targetId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
