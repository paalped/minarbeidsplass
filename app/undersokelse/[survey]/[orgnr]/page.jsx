import Link from "next/link";
import { notFound } from "next/navigation";
import { LoginGate } from "@/components/login-gate";
import { PageShell } from "@/components/page-shell";
import { SurveyForm } from "@/components/survey-form";
import { ensureCompany, getSessionUser, getSurveyBySlug, getSurveyResponse } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { surveyCountsTowardRanking } from "@/lib/survey";

export async function generateMetadata({ params }) {
  const { survey: slug, orgnr: raw } = await params;
  const survey = await getSurveyBySlug(decodeURIComponent(slug));
  return pageMetadata({
    title: survey?.title ?? "Undersøkelse",
    path: `/undersokelse/${decodeURIComponent(slug)}/${decodeURIComponent(raw)}`,
    index: false,
  });
}

export default async function SurveyPage({ params }) {
  const { survey: slug, orgnr: raw } = await params;
  const orgnr = decodeURIComponent(raw);
  const surveySlug = decodeURIComponent(slug);

  const [company, survey, user] = await Promise.all([
    ensureCompany(orgnr),
    getSurveyBySlug(surveySlug),
    getSessionUser(),
  ]);

  if (!company || !survey) notFound();

  const nextPath = `/undersokelse/${survey.slug}/${company.orgnr}`;
  const counts = surveyCountsTowardRanking(survey);

  if (!user) {
    return (
      <LoginGate
        title={`Logg inn for å svare om ${company.name}`}
        description={
          counts
            ? "Undersøkelsen teller i kåringen, derfor magisk lenke på e-post. Lesing og sladder på bedriftssiden er fortsatt åpent."
            : "Verktøysvarene er knyttet til deg, derfor magisk lenke på e-post. Lesing og sladder på bedriftssiden er fortsatt åpent."
        }
        nextPath={nextPath}
      />
    );
  }

  const existing = await getSurveyResponse(survey.id, company.orgnr, user.id);

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl">
        <p className="kicker">{survey.title}</p>
        <h1 className="mt-2 font-serif text-4xl">{company.name}</h1>
        <p className="mt-3 text-muted">{survey.description}</p>
        {existing ? (
          <p className="mt-4 text-sm text-good">
            Du har svart før
            {typeof existing.overall_score === "number" && existing.overall_score > 0
              ? ` (snitt ${existing.overall_score.toFixed(1).replace(".", ",")})`
              : ""}
            . Du kan oppdatere svarene under.
          </p>
        ) : null}
        <p className="mt-2 mb-8 text-sm">
          <Link href={`/bedrifter/${company.orgnr}`} className="text-rust underline">
            Tilbake til bedriftssiden
          </Link>
        </p>
        <SurveyForm company={company} survey={survey} existing={existing} />
      </div>
    </PageShell>
  );
}
