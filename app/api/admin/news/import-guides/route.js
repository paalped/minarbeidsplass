import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { JOB_ARTICLES } from "@/lib/job-articles";

export async function POST() {
  const { ok, supabase } = await requireAdmin();
  if (!ok || !supabase) {
    return NextResponse.json({ error: "Ikke tilgang." }, { status: 401 });
  }

  const rows = JOB_ARTICLES.map((article) => ({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    body: article.body,
    published_at: article.published_at,
    kind: "artikkel",
    search_query: article.query,
  }));

  const { error } = await supabase.from("news").upsert(rows, { onConflict: "slug" });
  if (error) {
    if (error.message?.includes("kind") || error.message?.includes("search_query")) {
      return NextResponse.json(
        { error: "Kjør supabase/migrations/011_articles.sql i Supabase først." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ count: rows.length });
}
