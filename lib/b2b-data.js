import { CATEGORIES } from "./site";
import { MIN_BENCHMARK_COMPANIES, MIN_COMPANY_RESPONSES, nacePrefix, ocaiFromFit } from "./b2b";
import { createClient } from "./supabase/server";

export async function acceptCompanyInvites(supabase) {
  if (!supabase) return 0;
  const { data, error } = await supabase.rpc("accept_company_invites");
  if (error) return 0;
  return Number(data ?? 0);
}

export async function getCompanyMemberships(userId) {
  const supabase = await createClient();
  if (!supabase || !userId) return [];

  await acceptCompanyInvites(supabase);

  const { data, error } = await supabase
    .from("company_members")
    .select("orgnr, role, status, company:companies (orgnr, name, municipality, nace_code, nace_text, employee_count)")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function getOwnClaims(userId) {
  const supabase = await createClient();
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from("company_claims")
    .select("id, orgnr, declared_role, status, created_at, company:companies (name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getCompanyAccount(orgnr) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("company_accounts").select("*").eq("orgnr", orgnr).maybeSingle();
  if (error) return null;
  return data ?? null;
}

export async function getCompanyBranding(orgnr) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("company_branding").select("*").eq("orgnr", orgnr).maybeSingle();
  if (error) return null;
  return data ?? null;
}

export async function getB2bContext(user, orgnr) {
  if (!user) return { memberships: [], membership: null, account: null, branding: null };
  const memberships = await getCompanyMemberships(user.id);
  const membership =
    memberships.find((item) => item.orgnr === orgnr) ?? memberships[0] ?? null;
  const account = membership ? await getCompanyAccount(membership.orgnr) : null;
  const branding = membership ? await getCompanyBranding(membership.orgnr) : null;
  return { memberships, membership, account, branding };
}

export async function getPendingClaims() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("company_claims")
    .select("id, orgnr, user_id, declared_role, status, brreg_roles, created_at, company:companies (name, municipality)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function getCompanyInvites(orgnr) {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("company_invites")
    .select("id, email, role, created_at")
    .eq("orgnr", orgnr)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getCompanyTeam(orgnr) {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("company_members")
    .select("user_id, role, status, created_at, profile:profiles (display_name)")
    .eq("orgnr", orgnr)
    .order("created_at", { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function getEmployerPosts(orgnr) {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("posts")
    .select("id, nickname, body, created_at, reply:employer_replies!post_id (id, body, created_at)")
    .eq("company_orgnr", orgnr)
    .order("created_at", { ascending: false })
    .limit(80);
  if (error) return [];
  return (data ?? []).map(normalizePost);
}

function normalizePost(row) {
  const reply = Array.isArray(row.reply) ? row.reply[0] : row.reply;
  return {
    id: row.id,
    nickname: row.nickname,
    body: row.body,
    created_at: row.created_at,
    reply: reply ?? null,
  };
}

export async function getCompanyInsights(orgnr) {
  const supabase = await createClient();
  if (!supabase) return { ok: false, status: 503, body: { error: "Supabase er ikke konfigurert." } };

  const { data, error } = await supabase.rpc("company_insights", { target_orgnr: orgnr });
  if (error) {
    const message = error.message ?? "";
    if (message.includes("forbidden") || message.includes("not_authenticated") || error.code === "42501") {
      return { ok: false, status: 403, body: { error: "Ingen tilgang." } };
    }
    return { ok: false, status: 400, body: { error: message || "Kunne ikke hente innsikt." } };
  }

  const payload = data ?? {};
  if (!payload.eligible) {
    return {
      ok: false,
      status: 403,
      body: {
        error: payload.reason === "plan" ? "Krever Insights-plan." : "For få svar.",
        reason: payload.reason ?? "k_anonymity",
        min: payload.min ?? MIN_COMPANY_RESPONSES,
      },
    };
  }

  return { ok: true, status: 200, body: payload };
}

export async function getIndustryBenchmark(company) {
  const supabase = await createClient();
  if (!supabase || !company?.nace_code) return null;

  const { data, error } = await supabase
    .from("company_stats")
    .select(
      "orgnr, overall_score, score_ledelse, score_miljo, score_lonn, score_balanse, score_utvikling, score_kultur, score_anbefaling, response_count, company:companies (nace_code, nace_text)",
    )
    .gte("response_count", MIN_COMPANY_RESPONSES);

  if (error) return null;
  const rows = (data ?? []).filter((row) => row.orgnr !== company.orgnr && row.company?.nace_code);

  function average(matches, grain, code, label) {
    if (matches.length < MIN_BENCHMARK_COMPANIES) return null;
    const avg = (key) => {
      const nums = matches.map((row) => Number(row[key])).filter(Number.isFinite);
      if (!nums.length) return null;
      return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
    };
    const categories = Object.fromEntries(CATEGORIES.map((category) => [category.key, avg(`score_${category.key}`)]));
    return {
      grain,
      nace_code: code,
      nace_text: label,
      company_count: matches.length,
      overall: avg("overall_score"),
      categories,
    };
  }

  const exact = average(
    rows.filter((row) => row.company.nace_code === company.nace_code),
    "5",
    company.nace_code,
    company.nace_text,
  );
  if (exact) return exact;

  const prefix = nacePrefix(company.nace_code, 2);
  if (!prefix) return null;
  return average(
    rows.filter((row) => nacePrefix(row.company.nace_code, 2) === prefix),
    "2",
    prefix,
    `Næringskode ${prefix}`,
  );
}

export function presentInsights(payload, benchmark) {
  return {
    ...payload,
    culture: payload.culture
      ? { ...payload.culture, ocai: ocaiFromFit(payload.culture) }
      : null,
    benchmark,
  };
}

export { MIN_COMPANY_RESPONSES };
