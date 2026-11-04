import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { validateArticle } from "@/lib/news-admin";

export async function POST(request) {
  const { ok, supabase } = await requireAdmin();
  if (!ok || !supabase) {
    return NextResponse.json({ error: "Ikke tilgang." }, { status: 401 });
  }

  const parsed = validateArticle(await request.json());
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data, error } = await supabase.from("news").insert(parsed.article).select("*").maybeSingle();
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Den nettadressen er allerede i bruk." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ article: data });
}
