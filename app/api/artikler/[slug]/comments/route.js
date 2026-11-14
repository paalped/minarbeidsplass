import { NextResponse } from "next/server";
import { getNewsBySlug } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export async function POST(request, { params }) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase er ikke konfigurert." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Logg inn for å kommentere." }, { status: 401 });
  }

  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) {
    return NextResponse.json({ error: "Fant ikke artikkelen." }, { status: 404 });
  }

  const payload = await request.json();
  const text = String(payload.body ?? "").trim();
  if (text.length < 3 || text.length > 2000) {
    return NextResponse.json({ error: "Kommentaren må være mellom 3 og 2000 tegn." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  const display_name = profile?.display_name?.trim() || user.email?.split("@")[0] || "Anonym";

  const { data, error } = await supabase
    .from("article_comments")
    .insert({
      article_slug: article.slug,
      user_id: user.id,
      display_name,
      body: text,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "42P01" || error.message?.includes("article_comments")) {
      return NextResponse.json(
        { error: "Kommentarer er ikke skrudd på ennå. Kjør SQL-filen 011_articles.sql i Supabase." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ comment: data });
}
