import { getEnhet } from "./brreg";
import { readWorkStyle } from "./fit";
import { isBrregOrgnr } from "./format";
import { RANKING_PAGE_SIZE } from "./site";
import { createClient } from "./supabase/server";

export async function getSessionUser() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let profile = null;
  const full = await supabase
    .from("profiles")
    .select("display_name, is_admin, work_style")
    .eq("id", user.id)
    .maybeSingle();
  if (!full.error) {
    profile = full.data;
  } else {
    const fallback = await supabase
      .from("profiles")
      .select("display_name, is_admin")
      .eq("id", user.id)
      .maybeSingle();
    profile = fallback.data;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: profile?.display_name ?? user.email?.split("@")[0] ?? "Anonym",
    isAdmin: Boolean(profile?.is_admin),
    workStyle: readWorkStyle(profile?.work_style),
  };
}

function rankingQuery(supabase) {
  return supabase
    .from("company_rankings")
    .select("*")
    .order("overall_score", { ascending: false })
    .order("response_count", { ascending: false })
    .order("name", { ascending: true });
}

function withRanks(rows) {
  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

function rankingNeedle(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[%_*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesRankingQuery(row, needle) {
  if (!needle) return true;
  const digits = needle.replace(/\s/g, "");
  return (
    String(row.name ?? "")
      .toLowerCase()
      .includes(needle) || String(row.orgnr ?? "").includes(digits)
  );
}

async function fetchAllRanked(supabase) {
  const pageSize = 1000;
  const rows = [];
  let from = 0;
  while (true) {
    const { data, error } = await rankingQuery(supabase).range(from, from + pageSize - 1);
    if (error) return [];
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }
  return withRanks(rows);
}

export async function getRankings(limit = 25) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await rankingQuery(supabase).limit(limit);
  if (error || !data) return [];
  return withRanks(data);
}

export async function getRankingBoard({
  page = 1,
  pageSize = RANKING_PAGE_SIZE,
  q = "",
} = {}) {
  const empty = {
    rows: [],
    unranked: [],
    total: 0,
    rankedTotal: 0,
    page: 1,
    pageSize,
    pageCount: 1,
    query: "",
    leader: null,
    top: [],
  };
  const supabase = await createClient();
  if (!supabase) return empty;

  const ranked = await fetchAllRanked(supabase);
  const query = String(q ?? "").trim();
  const needle = rankingNeedle(query);
  const matches = needle ? ranked.filter((row) => matchesRankingQuery(row, needle)) : ranked;
  const rankedTotal = ranked.length;
  const total = matches.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, Number(page) || 1), pageCount);
  const start = (safePage - 1) * pageSize;

  let unranked = [];
  if (needle.length >= 2) {
    unranked = await findUnrankedCompanies(
      supabase,
      needle,
      new Set(matches.map((row) => row.orgnr)),
    );
  }

  return {
    rows: matches.slice(start, start + pageSize),
    unranked,
    total,
    rankedTotal,
    page: safePage,
    pageSize,
    pageCount,
    query,
    leader: ranked[0] ?? null,
    top: ranked.slice(0, 25),
  };
}

async function findUnrankedCompanies(supabase, needle, exclude) {
  const digits = needle.replace(/\s/g, "");
  const term = needle.replace(/[%_]/g, "");
  let request = supabase
    .from("companies")
    .select("orgnr, name, municipality, nace_text")
    .limit(20);

  if (/^\d{6,9}$/.test(digits)) {
    request = request.ilike("orgnr", `%${digits}%`);
  } else {
    request = request.ilike("name", `%${term}%`);
  }

  const { data: companies } = await request;
  const leftover = (companies ?? []).filter((company) => !exclude.has(company.orgnr));
  if (leftover.length === 0) return [];

  const { data: stats } = await supabase
    .from("company_stats")
    .select("orgnr, response_count, overall_score")
    .in(
      "orgnr",
      leftover.map((company) => company.orgnr),
    );

  const byOrgnr = new Map((stats ?? []).map((row) => [row.orgnr, row]));
  return leftover.map((company) => {
    const row = byOrgnr.get(company.orgnr);
    return {
      ...company,
      rank: null,
      response_count: row?.response_count ?? 0,
      overall_score: row?.overall_score ?? null,
    };
  });
}

export async function getNews(limit = 12) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

export async function getNewsBySlug(slug) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase.from("news").select("*").eq("slug", slug).maybeSingle();
  return data ?? null;
}

export async function getRecentCompanies(limit = 12) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getCompanyStats(orgnr) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("company_rankings")
    .select("*")
    .eq("orgnr", orgnr)
    .maybeSingle();

  if (data) return data;

  const { data: stats } = await supabase
    .from("company_stats")
    .select("*")
    .eq("orgnr", orgnr)
    .maybeSingle();

  if (!stats) return null;

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("orgnr", orgnr)
    .maybeSingle();

  if (!company) return null;

  return { ...company, ...stats };
}

export async function upsertCompany(company) {
  const supabase = await createClient();
  if (!supabase) return company;

  const row = {
    orgnr: company.orgnr,
    name: company.name,
    org_form: company.org_form,
    nace_code: company.nace_code,
    nace_text: company.nace_text,
    municipality: company.municipality,
    employee_count: company.employee_count,
    is_verified: company.is_verified,
    brreg_fetched_at: company.brreg_fetched_at,
  };

  const { data, error } = await supabase.from("companies").upsert(row).select("*").maybeSingle();
  if (error) return company;
  return data ?? company;
}

export async function ensureCompany(orgnr) {
  const supabase = await createClient();

  if (supabase) {
    const { data } = await supabase.from("companies").select("*").eq("orgnr", orgnr).maybeSingle();
    if (data) {
      if (data.is_verified || !isBrregOrgnr(orgnr)) return data;
    }
  }

  if (isBrregOrgnr(orgnr)) {
    const fromBrreg = await getEnhet(orgnr);
    if (fromBrreg) return upsertCompany(fromBrreg);
  }

  return null;
}

export async function getPosts(orgnr) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("company_orgnr", orgnr)
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

function sortSurvey(data) {
  if (!data) return null;
  data.survey_questions = [...(data.survey_questions ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return data;
}

export async function getSurveys() {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("surveys")
    .select("id, slug, title, description, teaser, is_active, sort_order, counts_toward_ranking")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (!error && data) return data;

  const { data: fallback } = await supabase
    .from("surveys")
    .select("id, slug, title, description, is_active")
    .eq("is_active", true);

  return (fallback ?? []).map((survey, index) => ({
    ...survey,
    teaser: null,
    sort_order: index,
    counts_toward_ranking: survey.slug === "arbeidsplass-2026",
  }));
}

export async function getSurveyBySlug(slug) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("surveys")
    .select("*, survey_questions(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return sortSurvey(data);
}

export async function getSurveyById(id) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("surveys")
    .select("*, survey_questions(*)")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  return sortSurvey(data);
}

export async function getActiveSurvey() {
  const surveys = await getSurveys();
  const workplace = surveys.find((s) => s.counts_toward_ranking) ?? surveys[0];
  if (!workplace) return null;
  return getSurveyBySlug(workplace.slug);
}

export async function getSurveyResponse(surveyId, orgnr, userId) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("survey_responses")
    .select("*")
    .eq("survey_id", surveyId)
    .eq("company_orgnr", orgnr)
    .eq("user_id", userId)
    .maybeSingle();

  return data ?? null;
}

export async function getCompanyCulture(orgnr) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("company_culture").select("*").eq("orgnr", orgnr).maybeSingle();
  if (error) return null;
  return data ?? null;
}

export async function getCvEntries(userId) {
  const supabase = await createClient();
  if (!supabase || !userId) return [];

  const { data } = await supabase
    .from("cv_entries")
    .select("*, company:companies (orgnr, name, municipality, is_verified)")
    .eq("user_id", userId)
    .order("is_current", { ascending: false })
    .order("started_on", { ascending: false });

  return data ?? [];
}

export async function getChatMessages(limit = 80) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("chat_messages")
    .select("id, user_id, display_name, body, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).slice().reverse();
}
