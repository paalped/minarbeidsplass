import { NextResponse } from "next/server";
import { getB2bContext } from "@/lib/b2b-data";
import { sanitizeEmployerReply } from "@/lib/b2b";
import { getSessionUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Du må være innlogget." }, { status: 401 });

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase er ikke konfigurert." }, { status: 503 });

  const body = await request.json();
  const { membership } = await getB2bContext(user, body.orgnr);
  if (!membership) return NextResponse.json({ error: "Ingen tilgang." }, { status: 403 });

  const cleaned = sanitizeEmployerReply(body.body);
  if (cleaned.error) return NextResponse.json({ error: cleaned.error }, { status: 400 });

  const postId = String(body.post_id ?? "");
  const { data: post } = await supabase
    .from("posts")
    .select("id, company_orgnr")
    .eq("id", postId)
    .maybeSingle();
  if (!post || post.company_orgnr !== membership.orgnr) {
    return NextResponse.json({ error: "Fant ikke innlegget." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("employer_replies")
    .upsert(
      { post_id: post.id, orgnr: membership.orgnr, body: cleaned.body },
      { onConflict: "post_id" },
    )
    .select("id, post_id, body, created_at")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ reply: data });
}
