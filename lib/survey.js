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

export function scoreAnswers(questions, answers) {
  const likert = questions.filter((q) => q.question_type === "likert");
  const missing = likert.filter((q) => q.required && typeof answers[q.id] !== "number");
  if (missing.length > 0) {
    throw new Error("Ikke alle påkrevde spørsmål er besvart.");
  }

  const byCategory = {};
  const all = [];

  for (const question of likert) {
    const value = answers[question.id];
    if (typeof value !== "number") continue;
    all.push(value);
    byCategory[question.category] ??= [];
    byCategory[question.category].push(value);
  }

  const avg = (nums) =>
    Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;

  const category_scores = Object.fromEntries(
    Object.entries(byCategory).map(([key, nums]) => [key, avg(nums)]),
  );

  return {
    overall_score: avg(all),
    category_scores,
  };
}
