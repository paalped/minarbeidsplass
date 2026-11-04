import { NextResponse } from "next/server";
import { ensureCompany, getCvEntries } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { currentWorkplace, validateCvPayload } from "@/lib/cv";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase er ikke konfigurert." }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Du må være innlogget." }, { status: 401 });
  const entries = await getCvEntries(user.id);
  return NextResponse.json({ entries });
}

export async function POST(request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase er ikke konfigurert." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Du må være innlogget." }, { status: 401 });

  const parsed = validateCvPayload(await request.json());
  if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const company = await ensureCompany(parsed.entry.company_orgnr);
  if (!company) {
    return NextResponse.json({ error: "Fant ikke bedriften." }, { status: 404 });
  }

  if (parsed.entry.is_current) {
    const existing = currentWorkplace(await getCvEntries(user.id));
    if (existing) {
      return NextResponse.json(
        { error: "Du har allerede en nåværende jobb. Avslutt den i CV-en først." },
        { status: 409 },
      );
    }
  }

  const { data, error } = await supabase
    .from("cv_entries")
    .insert({ ...parsed.entry, company_orgnr: company.orgnr, user_id: user.id })
    .select("*, company:companies (orgnr, name, municipality, is_verified)")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Den perioden er allerede lagt inn for denne bedriften." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ entry: data });
}
