import Link from "next/link";
import { notFound } from "next/navigation";
import { FitMatchCard } from "@/components/fit-match-card";
import { GossipFeed } from "@/components/gossip-feed";
import { GossipForm } from "@/components/gossip-form";
import { PageShell } from "@/components/page-shell";
import { ScoreBadge, ScoreBar } from "@/components/score-badge";
import { JsonLd } from "@/components/json-ld";
import {
  ensureCompany,
  getCompanyCulture,
  getCompanyStats,
  getCvEntries,
  getPosts,
  getSessionUser,
  getSurveys,
} from "@/lib/data";
import { formatNumber, formatOrgnr } from "@/lib/format";
import { cvRelation } from "@/lib/cv";
import { companyJsonLd, pageMetadata } from "@/lib/seo";
import { CATEGORIES } from "@/lib/site";
import { surveyCountsTowardRanking } from "@/lib/survey";

export async function generateMetadata({ params }) {
  const { orgnr } = await params;
  const company = await ensureCompany(decodeURIComponent(orgnr));
  if (!company) return { title: "Bedrift" };
  const stats = await getCompanyStats(company.orgnr);
  const place = company.municipality ? ` i ${company.municipality}` : "";
  const scoreBit =
    stats?.overall_score && stats.response_count >= 3
      ? ` Score ${stats.overall_score.toFixed(1).replace(".", ",")}/5 fra ${stats.response_count} svar.`
      : "";
  return pageMetadata({
    title: `${company.name} — hvordan er det å jobbe der?`,
    description: `Les hvordan det er å jobbe i ${company.name}${place}. Arbeidsmiljø, ledelse, lønn og anonym sladder.${scoreBit}`,
    path: `/bedrifter/${company.orgnr}`,
  });
}

export default async function CompanyPage({ params }) {
  const { orgnr: raw } = await params;
  const orgnr = decodeURIComponent(raw);
  const company = await ensureCompany(orgnr);
  if (!company) notFound();

  const [stats, posts, user, surveys, culture] = await Promise.all([
    getCompanyStats(company.orgnr),
    getPosts(company.orgnr),
    getSessionUser(),
    getSurveys(),
    getCompanyCulture(company.orgnr),
  ]);
  const relation = user ? cvRelation(await getCvEntries(user.id), company.orgnr) : "none";
  const canSurvey = relation === "previous";

  const categoryScores = stats ? categoryEntries(stats) : [];

  return (
    <PageShell>
      <JsonLd data={companyJsonLd(company, stats)} />
      <p className="kicker">{company.is_verified ? "Verifisert i Brreg" : "Manuelt lagt inn"}</p>
      <div className="mt-2 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{company.name}</h1>
          <p className="mt-2 max-w-2xl text-lg text-muted">
            Hvordan er det å jobbe i {company.name}? Se score fra arbeidsplassundersøkelsen, og les
            anonym sladder fra folk som kjenner stedet.
          </p>
          <p className="mt-3 text-muted">
            {[
              formatOrgnr(company.orgnr),
              company.org_form,
              company.municipality,
              company.nace_text,
              company.employee_count ? `${formatNumber(company.employee_count)} ansatte` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex w-fit shrink-0 flex-col gap-2 sm:flex-row">
          {user && !canSurvey ? (
            <Link
              href="/profil"
              className="inline-flex h-12 shrink-0 items-center justify-center whitespace-nowrap bg-rust px-5 text-paper hover:bg-rust-dark"
            >
              {relation === "current" ? "Avslutt jobben i CV-en for å svare" : "Legg inn i CV for å svare"}
            </Link>
          ) : (
            (surveys.length > 0
              ? surveys
              : [{ slug: "arbeidsplass-2026", title: "Ta undersøkelsen", counts_toward_ranking: true }]
            ).map((survey) => {
              const ranking = surveyCountsTowardRanking(survey);
              return (
                <Link
                  key={survey.slug}
                  href={`/undersokelse/${survey.slug}/${company.orgnr}`}
                  className={
                    ranking
                      ? "inline-flex h-12 shrink-0 items-center justify-center whitespace-nowrap bg-rust px-5 text-paper hover:bg-rust-dark"
                      : "inline-flex h-12 shrink-0 items-center justify-center whitespace-nowrap border border-pine bg-paper px-5 text-pine hover:bg-paper-2"
                  }
                >
                  {survey.title}
                </Link>
              );
            })
          )}
        </div>
      </div>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="paper-card p-6">
          <p className="kicker">Score</p>
          {stats?.overall_score ? (
            <>
              <div className="mt-4">
                <ScoreBadge score={stats.overall_score} count={stats.response_count} size="lg" />
              </div>
              <ul className="mt-8 space-y-4">
                {categoryScores.map(([key, value]) => (
                  <li key={key}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{CATEGORIES.find((c) => c.key === key)?.label ?? key}</span>
                      <span className="tabular-nums">{value?.toFixed(1).replace(".", ",")}</span>
                    </div>
                    <ScoreBar value={value} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-4 text-muted">
              Ingen kåring ennå. Vær blant de første tre som tar undersøkelsen, så kommer{" "}
              {company.name} på listen.
            </p>
          )}
        </div>

        <div>
          <h2 className="font-serif text-2xl">Sladder</h2>
          <p className="mt-1 mb-4 text-sm text-muted">Anonymt. Ingen innlogging.</p>
          <GossipForm orgnr={company.orgnr} defaultNickname={user?.displayName} />
          <div className="mt-6">
            <GossipFeed posts={posts} />
          </div>
        </div>
      </section>

      <FitMatchCard
        companyName={company.name}
        workStyle={user?.workStyle ?? null}
        culture={culture}
        loggedIn={Boolean(user)}
      />
    </PageShell>
  );
}

function categoryEntries(stats) {
  return CATEGORIES.map((category) => {
    const key = `score_${category.key}`;
    const value = stats[key];
    return [category.key, typeof value === "number" ? value : null];
  });
}
