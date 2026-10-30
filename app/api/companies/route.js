import { NextResponse } from "next/server";
import { getEnhet } from "@/lib/brreg";
import { upsertCompany } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const body = await request.json();

  if (body.source === "brreg" || body.orgnr) {
    const orgnr = (body.orgnr ?? "").trim();
    const fromBrreg = await getEnhet(orgnr);
    if (!fromBrreg) {
      return NextResponse.json({ error: "Fant ikke enheten i Brreg." }, { status: 404 });
    }
    const company = await upsertCompany(fromBrreg);
    return NextResponse.json({ company });
  }

  if (body.source === "manual") {
    const name = (body.name ?? "").trim();
    if (name.length < 2) {
      return NextResponse.json({ error: "Skriv inn et firmanavn." }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Manuell lagring krever at Supabase er konfigurert." },
        { status: 503 },
      );
    }

    const { data: existing } = await supabase
      .from("companies")
      .select("*")
      .ilike("name", name)
      .limit(1);

    if (existing?.[0]) {
      return NextResponse.json({ company: existing[0] });
    }

    const company = {
      orgnr: `m-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`,
      name,
      org_form: null,
      nace_code: null,
      nace_text: null,
      municipality: body.municipality?.trim() || null,
      employee_count: null,
      is_verified: false,
      brreg_fetched_at: null,
    };

    const saved = await upsertCompany(company);
    return NextResponse.json({ company: saved });
  }

  return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
}
