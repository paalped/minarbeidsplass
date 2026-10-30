import { getEnhet } from "./brreg";
import { isBrregOrgnr } from "./format";
import { createClient } from "./supabase/server";

export async function getSessionUser() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: profile?.display_name ?? user.email?.split("@")[0] ?? "Anonym",
  };
}

export async function getRankings(limit = 25) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("company_rankings")
    .select("*")
    .order("overall_score", { ascending: false })
    .order("response_count", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
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

export async function getActiveSurvey() {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("surveys")
    .select("*, survey_questions(*)")
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return null;

  data.survey_questions = [...(data.survey_questions ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return data;
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
