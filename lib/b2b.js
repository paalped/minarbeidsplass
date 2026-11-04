export const MIN_COMPANY_RESPONSES = 5;
export const MIN_BENCHMARK_COMPANIES = 2;

export const COMPANY_ROLES = [
  { key: "admin", label: "Bedriftsadmin" },
  { key: "responder", label: "Svarer" },
];

export const CLAIM_ROLES = [
  { key: "daglig_leder", label: "Daglig leder" },
  { key: "styreleder", label: "Styreleder" },
  { key: "hr", label: "Delegert HR-ansvarlig" },
];

export const PLANS = [
  {
    key: "basic",
    label: "Basic",
    price: "0 kr",
    summary: "Verifisert eierskap, profil og offisielle svar.",
  },
  {
    key: "insights",
    label: "Insights",
    price: "Lisens etter antall ansatte",
    summary: "Dashbord, bransjebenchmark og trender. Krever minst fem forsinkede svar.",
  },
  {
    key: "talent",
    label: "Talent Match",
    price: "Per utlysning",
    summary: "Stillinger mot kandidater med kompatibel kulturprofil. Kommer.",
  },
];

export const OCAI_POLES = [
  { key: "clan", label: "Klan", hint: "Samarbeid og rom for livet utenfor jobben" },
  { key: "adhocracy", label: "Adhockrati", hint: "Eksperimentering og høyt tempo" },
  { key: "market", label: "Marked", hint: "Leveranse og konkurranse" },
  { key: "hierarchy", label: "Hierarki", hint: "Struktur og forutsigbarhet" },
];

const TRACKER_RE =
  /googletagmanager|google-analytics|doubleclick\.net|facebook\.com\/tr|hotjar|segment\.io|mixpanel|javascript:|data:text\/html|<script|<iframe|on\w+\s*=/i;

export function claimRoleLabel(key) {
  return CLAIM_ROLES.find((item) => item.key === key)?.label ?? key;
}

export function companyRoleLabel(key) {
  return COMPANY_ROLES.find((item) => item.key === key)?.label ?? key;
}

export function planLabel(key) {
  return PLANS.find((item) => item.key === key)?.label ?? key;
}

export function hasInsights(plan) {
  return plan === "insights" || plan === "talent";
}

export function isCompanyAdminRole(role) {
  return role === "admin";
}

export function httpsUrl(value, max = 400) {
  const url = String(value ?? "").trim();
  if (!url) return null;
  if (url.length > max) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function sanitizeEmployerReply(value) {
  const body = String(value ?? "").trim();
  if (body.length < 3 || body.length > 2000) {
    return { error: "Svaret må være mellom 3 og 2000 tegn." };
  }
  if (TRACKER_RE.test(body) || /<[^>]+>/.test(body)) {
    return { error: "Svaret kan ikke inneholde skript, HTML eller sporingslenker." };
  }
  return { body };
}

export function ocaiFromFit(scores) {
  if (!scores) return null;
  const num = (key) => Number(scores[key]);
  if (![num("autonomy"), num("learning"), num("results"), num("change"), num("collaboration"), num("balance")].every(Number.isFinite)) {
    return null;
  }
  const clan = (num("collaboration") + num("balance")) / 2;
  const adhocracy = (num("learning") + num("change")) / 2;
  const market = (num("results") + (6 - num("collaboration"))) / 2;
  const hierarchy = (6 - num("autonomy") + (6 - num("change"))) / 2;
  const raw = { clan, adhocracy, market, hierarchy };
  const sum = clan + adhocracy + market + hierarchy;
  if (sum <= 0) return null;
  const rounded = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Math.round((value / sum) * 100)]),
  );
  const drift = 100 - Object.values(rounded).reduce((a, b) => a + b, 0);
  const first = Object.keys(rounded)[0];
  rounded[first] += drift;
  return rounded;
}

export function nacePrefix(code, digits = 2) {
  const compact = String(code ?? "").replace(/\D/g, "");
  if (compact.length < digits) return null;
  return compact.slice(0, digits);
}
