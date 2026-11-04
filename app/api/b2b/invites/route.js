import { NextResponse } from "next/server";
import { getB2bContext } from "@/lib/b2b-data";
import { COMPANY_ROLES, isCompanyAdminRole } from "@/lib/b2b";
import { getSessionUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Du må være innlogget." }, { status: 401 });

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase er ikke konfigurert." }, { status: 503 });

  const body = await request.json();
  const { membership } = await getB2bContext(user, body.orgnr);
  if (!membership || (!isCompanyAdminRole(membership.role) && !user.isAdmin)) {
    return NextResponse.json({ error: "Bare bedriftsadmin kan invitere." }, { status: 403 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const role = String(body.role ?? "responder");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Ugyldig e-post." }, { status: 400 });
  }
  if (!COMPANY_ROLES.some((item) => item.key === role)) {
    return NextResponse.json({ error: "Ugyldig rolle." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("company_invites")
    .upsert({ orgnr: membership.orgnr, email, role }, { onConflict: "orgnr,email" })
    .select("*")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ invite: data });
}

export async function DELETE(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Du må være innlogget." }, { status: 401 });

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase er ikke konfigurert." }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const orgnr = searchParams.get("orgnr");
  const { membership } = await getB2bContext(user, orgnr);
  if (!membership || (!isCompanyAdminRole(membership.role) && !user.isAdmin)) {
    return NextResponse.json({ error: "Ingen tilgang." }, { status: 403 });
  }

  const { error } = await supabase.from("company_invites").delete().eq("id", id).eq("orgnr", membership.orgnr);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
