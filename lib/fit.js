export const MIN_FIT_RESPONSES = 3;

export const FIT_DIMENSIONS = [
  {
    key: "autonomy",
    label: "Autonomi vs. struktur",
    low: "Tydelig struktur og forankring",
    high: "Frihet til å ta avgjørelser selv",
    workplacePrompt:
      "Folk tar avgjørelser selv på sparket, uten å vente på formell forankring gjennom linjen.",
    userPrompt: "Jeg trives best når jeg kan ta avgjørelser selv, uten å vente på formell forankring.",
  },
  {
    key: "learning",
    label: "Eksperiment vs. kontroll",
    low: "Risikominimering og kontroll",
    high: "Eksperimentering og læring av feil",
    workplacePrompt: "Det er rom for å prøve, feile og lære — ikke bare å minimere risiko.",
    userPrompt: "Jeg trives med å prøve, feile og lære, mer enn med stram kontroll og null feil.",
  },
  {
    key: "results",
    label: "Resultat vs. tilstedeværelse",
    low: "Timer og synlighet teller mest",
    high: "Det er leveransen som teller",
    workplacePrompt: "Suksess måles på det som blir levert, ikke på timer ved pulten.",
    userPrompt: "Jeg vil vurderes på det jeg leverer, ikke på hvor synlig jeg er eller hvor lenge jeg sitter.",
  },
  {
    key: "change",
    label: "Tempo vs. forutsigbarhet",
    low: "Stabile rutiner og forutsigbarhet",
    high: "Høyt tempo og stadig endring",
    workplacePrompt: "Tempoet er høyt, og ting endrer seg ofte.",
    userPrompt: "Jeg trives med høyt tempo og at ting endrer seg, mer enn med faste rutiner.",
  },
  {
    key: "collaboration",
    label: "Samarbeid vs. konkurranse",
    low: "Intern konkurranse og individuelle mål",
    high: "Samarbeid foran intern konkurranse",
    workplacePrompt: "Vi lykkes sammen. Intern konkurranse styrer i liten grad hverdagen.",
    userPrompt: "Jeg trives best med samarbeid, ikke med intern konkurranse om å synes.",
  },
  {
    key: "balance",
    label: "Balanse vs. intensitet",
    low: "Høyt arbeidspress over tid",
    high: "Rom for liv utenfor jobben",
    workplacePrompt: "Arbeidspresset er til å leve med, og det er rom for livet utenfor jobben.",
    userPrompt: "Balanse mellom jobb og resten av livet er viktigere for meg enn maks intensitet.",
  },
];

export function fitDimension(key) {
  return FIT_DIMENSIONS.find((item) => item.key === key) ?? null;
}

export function countsTowardScore(question) {
  if (question?.settings?.counts_toward_score === false) return false;
  if (question?.settings?.fit_key) return false;
  return true;
}

export function extractFitScores(questions, answers) {
  const scores = {};
  for (const question of questions ?? []) {
    const key = question.settings?.fit_key;
    const value = answers?.[question.id];
    if (!key || typeof value !== "number" || value < 1 || value > 5) continue;
    scores[key] = value;
  }
  return scores;
}

export function readWorkStyle(value) {
  if (!value || typeof value !== "object") return null;
  const scores = {};
  for (const dimension of FIT_DIMENSIONS) {
    const n = Number(value[dimension.key]);
    if (!Number.isFinite(n) || n < 1 || n > 5) return null;
    scores[dimension.key] = n;
  }
  return scores;
}

export function cultureScores(row) {
  if (!row || (row.response_count ?? 0) < MIN_FIT_RESPONSES) return null;
  const scores = {};
  for (const dimension of FIT_DIMENSIONS) {
    const n = Number(row[`score_${dimension.key}`]);
    if (!Number.isFinite(n)) return null;
    scores[dimension.key] = n;
  }
  return scores;
}

function pole(score, dimension) {
  if (score >= 3.5) return dimension.high;
  if (score <= 2.5) return dimension.low;
  return `et midtpunkt mellom ${dimension.low.toLowerCase()} og ${dimension.high.toLowerCase()}`;
}

export function computeFitMatch(workStyle, culture) {
  if (!workStyle || !culture) return null;

  const rows = FIT_DIMENSIONS.map((dimension) => {
    const user = workStyle[dimension.key];
    const company = culture[dimension.key];
    return {
      ...dimension,
      user,
      company,
      gap: Math.abs(user - company),
    };
  });

  const avgGap = rows.reduce((sum, row) => sum + row.gap, 0) / rows.length;
  const percent = Math.max(0, Math.min(100, Math.round((1 - avgGap / 4) * 100)));
  const aligned = [...rows].sort((a, b) => a.gap - b.gap).filter((row) => row.gap <= 1).slice(0, 2);
  const warnings = [...rows].sort((a, b) => b.gap - a.gap).filter((row) => row.gap >= 1.5).slice(0, 2);

  const highlight = aligned[0] ?? rows[0];
  const summary = `Stedet preges av ${pole(highlight.company, highlight)}, noe som ${
    highlight.gap <= 1 ? "treffer det du ser etter" : "kan skille seg fra det du foretrekker"
  }.`;

  const notes = warnings.map((row) => {
    const companySide = pole(row.company, row);
    const userSide = pole(row.user, row);
    return `Obs: her rapporteres ${companySide.toLowerCase()}, mens du har lagt deg mot ${userSide.toLowerCase()}.`;
  });

  return { percent, summary, notes, rows, aligned, warnings };
}
