export const site = {
  name: "Min Arbeidsplass",
  tagline: "Sladder, sannhet og Norges beste arbeidsplass.",
  seoTitle: "Min Arbeidsplass — hvordan det er å jobbe i norske bedrifter",
  description:
    "Bytter du jobb? Søk opp arbeidsplassen, les om arbeidsmiljø, ledelse og lønn, ta undersøkelsen og se hvem som kåres til Norges beste arbeidsplass.",
};

export const CATEGORIES = [
  { key: "ledelse", label: "Ledelse" },
  { key: "miljo", label: "Arbeidsmiljø" },
  { key: "lonn", label: "Lønn og goder" },
  { key: "balanse", label: "Balanse" },
  { key: "utvikling", label: "Faglig utvikling" },
  { key: "kultur", label: "Kultur" },
  { key: "anbefaling", label: "Anbefaling" },
];

export const CATEGORY_LABELS = {
  ledelse: "Ledelse",
  miljo: "Arbeidsmiljø",
  lonn: "Lønn og goder",
  balanse: "Balanse",
  utvikling: "Faglig utvikling",
  kultur: "Kultur",
  anbefaling: "Anbefaling",
  rolle: "Din rolle",
  stacktype: "Hyllevare eller eget",
  time: "Timeføring",
  gis: "Kart og GIS",
  cad: "CAD og BIM",
  fag: "Kjernesystemet",
  samhandling: "Samhandling",
  innkjop: "Innkjøp og bytte",
  oppsummering: "Det som sitter igjen",
  fit: "Slik det faktisk er her",
};

export function categoryLabel(key) {
  return CATEGORY_LABELS[key] ?? key;
}

export const LIKERT_LABELS = ["Svært uenig", "Uenig", "Nøytral", "Enig", "Svært enig"];

export const MIN_RANKING_RESPONSES = 3;
export const RANKING_PAGE_SIZE = 25;
