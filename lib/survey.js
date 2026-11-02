export function surveyCountsTowardRanking(survey) {
  if (typeof survey?.counts_toward_ranking === "boolean") return survey.counts_toward_ranking;
  return survey?.slug === "arbeidsplass-2026";
}

export function questionsByCategory(questions) {
  const groups = [];
  for (const question of questions) {
    const last = groups[groups.length - 1];
    if (last && last.key === question.category) {
      last.questions.push(question);
    } else {
      groups.push({ key: question.category, questions: [question] });
    }
  }
  return groups;
}

export function firstInCategory(questions, category) {
  return questions
    .filter((q) => q.category === category)
    .sort((a, b) => a.sort_order - b.sort_order)[0];
}

export function isQuestionVisible(question, questions, answers) {
  const rule = question.settings?.show_if;
  if (!rule?.same_category_first) return true;
  const gate = firstInCategory(questions, question.category);
  if (!gate || gate.id === question.id) return true;
  return answers[gate.id] === rule.same_category_first;
}

export function visibleQuestions(questions, answers) {
  return questions.filter((q) => isQuestionVisible(q, questions, answers));
}

export function otherKey(questionId) {
  return `${questionId}__other`;
}

function hasValue(question, answers) {
  const value = answers[question.id];
  if (question.question_type === "likert") return typeof value === "number" && value >= 1 && value <= 5;
  if (question.question_type === "multi") {
    if (!Array.isArray(value) || value.length === 0) return false;
    if (value.includes("annet") && question.settings?.allow_other) {
      return String(answers[otherKey(question.id)] ?? "").trim().length >= 2;
    }
    return true;
  }
  if (question.question_type === "single") {
    if (!value) return false;
    if (value === "annet" && question.settings?.allow_other) {
      return String(answers[otherKey(question.id)] ?? "").trim().length >= 2;
    }
    return true;
  }
  return String(value ?? "").trim().length > 0;
}

export function isQuestionComplete(question, questions, answers) {
  if (!isQuestionVisible(question, questions, answers)) return true;
  if (!question.required) return true;
  return hasValue(question, answers);
}

export function sanitizeAnswers(questions, answers) {
  const out = {};
  for (const question of visibleQuestions(questions, answers)) {
    if (answers[question.id] !== undefined) out[question.id] = answers[question.id];
    const extra = answers[otherKey(question.id)];
    if (extra) out[otherKey(question.id)] = extra;
  }
  return out;
}

export function scoreAnswers(questions, answers) {
  const visible = visibleQuestions(questions, answers);
  const missing = visible.filter((q) => q.required && !hasValue(q, answers));
  if (missing.length > 0) {
    throw new Error("Ikke alle påkrevde spørsmål er besvart.");
  }

  const likert = visible.filter((q) => q.question_type === "likert" && typeof answers[q.id] === "number");
  const byCategory = {};
  const all = [];

  for (const question of likert) {
    const value = answers[question.id];
    all.push(value);
    byCategory[question.category] ??= [];
    byCategory[question.category].push(value);
  }

  const avg = (nums) =>
    nums.length === 0
      ? 0
      : Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;

  const category_scores = Object.fromEntries(
    Object.entries(byCategory).map(([key, nums]) => [key, avg(nums)]),
  );

  return {
    overall_score: avg(all),
    category_scores,
  };
}
