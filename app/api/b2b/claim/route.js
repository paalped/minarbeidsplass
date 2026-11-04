import { NextResponse } from "next/server";
import { CLAIM_ROLES } from "@/lib/b2b";
import { getEnhet, getEnhetRoller } from "@/lib/brreg";
import { ensureCompany, getSessionUser } from "@/lib/data";
import { isBrregOrgnr } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Du må være innlogget." }, { status: 401 });

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase er ikke konfigurert." }, { status: 503 });

  const body = await request.json();
  const orgnr = String(body.orgnr ?? "").trim();
  const declared_role = String(body.declared_role ?? "").trim();
  if (!isBrregOrgnr(orgnr)) {
    return NextResponse.json({ error: "Bare enheter i Enhetsregisteret kan verifiseres." }, { status: 400 });
  }
  if (!CLAIM_ROLES.some((role) => role.key === declared_role)) {
    return NextResponse.json({ error: "Velg rollen du har i Brreg." }, { status: 400 });
  }

  const company = await ensureCompany(orgnr);
  if (!company) return NextResponse.json({ error: "Fant ikke bedriften i Brreg." }, { status: 404 });

  const { data: existingMember } = await supabase
    .from("company_members")
    .select("orgnr")
    .eq("orgnr", company.orgnr)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (existingMember) {
    return NextResponse.json({ error: "Du har allerede tilgang til denne bedriften." }, { status: 409 });
  }

  const enhet = await getEnhet(company.orgnr);
  const brreg_roles = await getEnhetRoller(company.orgnr);

  const { data, error } = await supabase
    .from("company_claims")
    .upsert(
      {
        orgnr: company.orgnr,
        user_id: user.id,
        declared_role,
        status: "pending",
        brreg_roles,
        note: enhet ? `Brreg: ${enhet.name}` : null,
        reviewed_at: null,
      },
      { onConflict: "orgnr,user_id" },
    )
    .select("id, orgnr, status, declared_role")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ claim: data, company });
}
