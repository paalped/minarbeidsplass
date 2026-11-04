import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { validateArticle } from "@/lib/news-admin";

export async function PATCH(request, { params }) {
  const { ok, supabase } = await requireAdmin();
  if (!ok || !supabase) {
    return NextResponse.json({ error: "Ikke tilgang." }, { status: 401 });
  }

  const { id } = await params;
  const parsed = validateArticle(await request.json());
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("news")
    .update(parsed.article)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Den nettadressen er allerede i bruk." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Fant ikke saken." }, { status: 404 });
  }

  return NextResponse.json({ article: data });
}

export async function DELETE(_request, { params }) {
  const { ok, supabase } = await requireAdmin();
  if (!ok || !supabase) {
    return NextResponse.json({ error: "Ikke tilgang." }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
