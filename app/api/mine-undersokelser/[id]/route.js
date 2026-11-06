import { NextResponse } from "next/server";
import { getOwnedSurvey } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { publishError, validateUserSurveyFields } from "@/lib/user-surveys";

async function requireOwner(id) {
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
  const survey = await getOwnedSurvey(id, user.id);
  if (!survey) {
    return { error: NextResponse.json({ error: "Fant ikke undersøkelsen." }, { status: 404 }) };
  }
  return { supabase, user, survey };
}

async function syncQuestions(supabase, surveyId, questions, existing) {
  const keep = new Set(questions.map((question) => question.id).filter(Boolean));
  const toDelete = (existing ?? []).filter((question) => !keep.has(question.id)).map((question) => question.id);
  if (toDelete.length) {
    const { error } = await supabase.from("survey_questions").delete().in("id", toDelete).eq("survey_id", surveyId);
    if (error) throw new Error(error.message);
  }

  for (const question of questions) {
    const row = {
      survey_id: surveyId,
      sort_order: question.sort_order,
      category: question.category,
      prompt: question.prompt,
      question_type: question.question_type,
      required: question.required,
      settings: question.settings,
    };
    if (question.id && (existing ?? []).some((item) => item.id === question.id)) {
      const { error } = await supabase.from("survey_questions").update(row).eq("id", question.id).eq("survey_id", surveyId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("survey_questions").insert(row);
      if (error) throw new Error(error.message);
    }
  }
}

export async function GET(_request, { params }) {
  const { id } = await params;
  const auth = await requireOwner(id);
  if (auth.error) return auth.error;

  const { data: stats } = await auth.supabase.rpc("my_survey_stats");
  const response_count = (stats ?? []).find((row) => row.survey_id === auth.survey.id)?.response_count ?? 0;
  return NextResponse.json({ survey: auth.survey, response_count });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const auth = await requireOwner(id);
  if (auth.error) return auth.error;

  const body = await request.json();
  const fields = validateUserSurveyFields({
    title: body.title ?? auth.survey.title,
    description: body.description ?? auth.survey.description,
    questions: body.questions ?? auth.survey.survey_questions,
  });
  if (fields.error) {
    return NextResponse.json({ error: fields.error }, { status: 400 });
  }

  const nextStatus = body.status === "published" || body.status === "draft" ? body.status : auth.survey.status;
  if (nextStatus === "published") {
    const blocked = publishError(fields);
    if (blocked) return NextResponse.json({ error: blocked }, { status: 400 });
  }

  try {
    await syncQuestions(auth.supabase, auth.survey.id, fields.questions, auth.survey.survey_questions);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kunne ikke lagre spørsmålene." },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from("surveys")
    .update({
      title: fields.title,
      description: fields.description,
      teaser: fields.teaser,
      status: nextStatus,
      counts_toward_ranking: false,
    })
    .eq("id", auth.survey.id)
    .eq("owner_id", auth.user.id)
    .select("id, slug, title, description, status, share_token, published_at, created_at")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Kunne ikke lagre." }, { status: 400 });
  }

  const survey = await getOwnedSurvey(auth.survey.id, auth.user.id);
  return NextResponse.json({ survey });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const auth = await requireOwner(id);
  if (auth.error) return auth.error;

  const { error } = await auth.supabase
    .from("surveys")
    .delete()
    .eq("id", auth.survey.id)
    .eq("owner_id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
