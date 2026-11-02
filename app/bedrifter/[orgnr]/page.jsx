import Link from "next/link";
import { notFound } from "next/navigation";
import { GossipFeed } from "@/components/gossip-feed";
import { GossipForm } from "@/components/gossip-form";
import { PageShell } from "@/components/page-shell";
import { ScoreBadge, ScoreBar } from "@/components/score-badge";
import { ensureCompany, getCompanyStats, getPosts, getSessionUser, getSurveys } from "@/lib/data";
import { formatNumber, formatOrgnr } from "@/lib/format";
import { CATEGORIES } from "@/lib/site";
import { surveyCountsTowardRanking } from "@/lib/survey";

export async function generateMetadata({ params }) {
  const { orgnr } = await params;
  const company = await ensureCompany(decodeURIComponent(orgnr));
  return { title: company?.name ?? "Bedrift" };
}

export default async function CompanyPage({ params }) {
  const { orgnr: raw } = await params;
  const orgnr = decodeURIComponent(raw);
  const company = await ensureCompany(orgnr);
  if (!company) notFound();

  const [stats, posts, user, surveys] = await Promise.all([
    getCompanyStats(company.orgnr),
    getPosts(company.orgnr),
    getSessionUser(),
    getSurveys(),
  ]);

  const categoryScores = stats ? categoryEntries(stats) : [];

  return (
    <PageShell>
      <p className="kicker">{company.is_verified ? "Verifisert i Brreg" : "Manuelt lagt inn"}</p>
      <div className="mt-2 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{company.name}</h1>
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
          {(surveys.length > 0 ? surveys : [{ slug: "arbeidsplass-2026", title: "Ta undersøkelsen", counts_toward_ranking: true }]).map(
            (survey) => {
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
            },
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
