import { NextResponse } from "next/server";
import { getMySurveyStats, getOwnedSurveys } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { MAX_USER_SURVEYS } from "@/lib/user-surveys";

async function requireUser() {
  const supabase = await createClient();
  if (!supabase) {
    return { error: NextResponse.json({ error: "Supabase er ikke konfigurert." }, { status: 503 }) };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Du må være innlogget." }, { status: 401 }) };
  }
  return { supabase, user };
}

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const [surveys, counts] = await Promise.all([getOwnedSurveys(auth.user.id), getMySurveyStats()]);
  return NextResponse.json({
    surveys: surveys.map((survey) => ({
      ...survey,
      response_count: counts[survey.id] ?? 0,
    })),
  });
}

export async function POST() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const existing = await getOwnedSurveys(auth.user.id);
  if (existing.length >= MAX_USER_SURVEYS) {
    return NextResponse.json(
      { error: `Du kan ha opptil ${MAX_USER_SURVEYS} egne undersøkelser.` },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from("surveys")
    .insert({
      owner_id: auth.user.id,
      title: "Uten tittel",
      description: "",
      teaser: null,
      is_active: false,
      counts_toward_ranking: false,
      status: "draft",
      sort_order: 1000,
    })
    .select("id, slug, title, description, status, share_token, published_at, created_at")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Kunne ikke opprette undersøkelsen. Kjør SQL-migrasjonen 010." },
      { status: 400 },
    );
  }

  return NextResponse.json({ survey: data });
}
