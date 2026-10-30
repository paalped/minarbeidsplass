import { NextResponse } from "next/server";
import { ensureCompany } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase er ikke konfigurert." }, { status: 503 });
  }

  const body = await request.json();

  const orgnr = (body.company_orgnr ?? "").trim();
  const text = (body.body ?? "").trim();
  const nickname = (body.nickname ?? "Anonym").trim().slice(0, 40) || "Anonym";

  if (text.length < 3 || text.length > 2000) {
    return NextResponse.json({ error: "Innlegget må være mellom 3 og 2000 tegn." }, { status: 400 });
  }

  const company = await ensureCompany(orgnr);
  if (!company) {
    return NextResponse.json({ error: "Fant ikke bedriften." }, { status: 404 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("posts")
    .insert({
      company_orgnr: company.orgnr,
      author_id: user?.id ?? null,
      nickname,
      body: text,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ post: data });
}
