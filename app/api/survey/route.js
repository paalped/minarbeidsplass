import { NextResponse } from "next/server";
import { ensureCompany, getSurveyById } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { isQuestionComplete, sanitizeAnswers, scoreAnswers } from "@/lib/survey";

export async function POST(request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase er ikke konfigurert." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Du må være innlogget." }, { status: 401 });
  }

  const body = await request.json();

  const survey = await getSurveyById(body.survey_id);
  if (!survey) {
    return NextResponse.json({ error: "Ugyldig undersøkelse." }, { status: 400 });
  }

  const company = await ensureCompany(body.company_orgnr ?? "");
  if (!company) {
    return NextResponse.json({ error: "Fant ikke bedriften." }, { status: 404 });
  }

  const answers = sanitizeAnswers(survey.survey_questions, body.answers ?? {});
  const incomplete = survey.survey_questions.filter(
    (question) => !isQuestionComplete(question, survey.survey_questions, answers),
  );
  if (incomplete.length > 0) {
    return NextResponse.json({ error: "Alle påkrevde spørsmål må besvares." }, { status: 400 });
  }

  let scores;
  try {
    scores = scoreAnswers(survey.survey_questions, answers);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ugyldige svar." },
      { status: 400 },
    );
  }

  const row = {
    survey_id: survey.id,
    company_orgnr: company.orgnr,
    user_id: user.id,
    answers,
    overall_score: scores.overall_score,
    category_scores: scores.category_scores,
  };

  const { data, error } = await supabase
    .from("survey_responses")
    .upsert(row, { onConflict: "survey_id,company_orgnr,user_id" })
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ response: data });
}
