import { slugify } from "./news-admin";
import { LIKERT_LABELS } from "./site";
import { pageUrl } from "./seo";

export const MAX_USER_SURVEYS = 10;
export const MAX_USER_QUESTIONS = 25;
export const MAX_USER_OPTIONS = 12;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUserSurvey(survey) {
  return Boolean(survey?.owner_id);
}

export function isUuid(value) {
  return UUID.test(String(value ?? ""));
}

export function userSurveySharePath(token) {
  return `/u/${token}`;
}

export function userSurveyShareUrl(token) {
  return pageUrl(userSurveySharePath(token));
}

export function userSurveyStatusLabel(status) {
  return status === "published" ? "Publisert" : "Kladd";
}

function optionList(raw) {
  const list = Array.isArray(raw) ? raw : [];
  const seen = new Set();
  const options = [];
  for (const item of list) {
    const label = String(typeof item === "string" ? item : item?.label ?? "").trim().slice(0, 80);
    if (label.length < 1) continue;
    let value = slugify(typeof item === "object" ? item.value || label : label) || `valg-${options.length + 1}`;
    if (seen.has(value)) value = `${value}-${options.length + 1}`;
    seen.add(value);
    options.push({ value, label });
    if (options.length >= MAX_USER_OPTIONS) break;
  }
  return options;
}

export function normalizeUserQuestions(raw) {
  if (!Array.isArray(raw)) return [];
  const questions = [];
  for (const item of raw.slice(0, MAX_USER_QUESTIONS)) {
    const prompt = String(item?.prompt ?? "").trim().slice(0, 400);
    if (prompt.length < 3) continue;
    const question_type = ["likert", "text", "single"].includes(item?.question_type)
      ? item.question_type
      : "likert";
    const category = String(item?.category ?? "Spørsmål").trim().slice(0, 40) || "Spørsmål";
    const settings = {};
    if (question_type === "single") {
      const options = optionList(item.options ?? item.settings?.options);
      if (options.length < 2) continue;
      settings.options = options;
    }
    if (question_type === "likert") {
      const low = String(item.poles?.low ?? item.settings?.poles?.low ?? "").trim().slice(0, 80);
      const high = String(item.poles?.high ?? item.settings?.poles?.high ?? "").trim().slice(0, 80);
      if (low || high) {
        settings.poles = {
          low: low || LIKERT_LABELS[0],
          high: high || LIKERT_LABELS[4],
        };
      }
    }
    questions.push({
      id: isUuid(item?.id) ? item.id : null,
      prompt,
      question_type,
      required: item?.required !== false,
      category,
      sort_order: questions.length + 1,
      settings,
    });
  }
  return questions;
}

export function validateUserSurveyFields(body) {
  const title = String(body?.title ?? "").trim().slice(0, 140);
  const description = String(body?.description ?? "").trim().slice(0, 2000);
  if (title && title.length < 3) {
    return { error: "Tittelen må være minst tre tegn." };
  }
  return {
    title: title || "Uten tittel",
    description,
    teaser: description.slice(0, 180) || null,
    questions: normalizeUserQuestions(body?.questions),
  };
}

export function publishError(fields) {
  if (!fields.title || fields.title === "Uten tittel" || fields.title.length < 3) {
    return "Gi undersøkelsen en tittel før du publiserer.";
  }
  if (fields.questions.length < 1) {
    return "Legg inn minst ett spørsmål før du publiserer.";
  }
  return null;
}

export function blankQuestion(type = "likert") {
  return {
    id: `tmp-${crypto.randomUUID()}`,
    prompt: "",
    question_type: type,
    required: true,
    category: "Spørsmål",
    options: type === "single" ? ["Ja", "Nei"] : [],
    poles: { low: LIKERT_LABELS[0], high: LIKERT_LABELS[4] },
  };
}

export function questionsForEditor(questions) {
  return (questions ?? []).map((question) => ({
    id: question.id,
    prompt: question.prompt ?? "",
    question_type: question.question_type,
    required: question.required !== false,
    category: question.category || "Spørsmål",
    options: (question.settings?.options ?? []).map((option) => option.label),
    poles: {
      low: question.settings?.poles?.low ?? LIKERT_LABELS[0],
      high: question.settings?.poles?.high ?? LIKERT_LABELS[4],
    },
  }));
}
