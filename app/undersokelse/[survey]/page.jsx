import { notFound, redirect } from "next/navigation";
import { CompanySearch } from "@/components/company-search";
import { LoginForm } from "@/components/login-form";
import { PageShell } from "@/components/page-shell";
import { getSessionUser, getSurveyBySlug } from "@/lib/data";
import { looksLikeCompanyKey } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { surveyCountsTowardRanking } from "@/lib/survey";

export async function generateMetadata({ params }) {
  const { survey: slug } = await params;
  if (looksLikeCompanyKey(slug)) return { title: "Undersøkelse" };
  const survey = await getSurveyBySlug(decodeURIComponent(slug));
  if (!survey) return { title: "Undersøkelse" };
  const ranking = surveyCountsTowardRanking(survey);
  return pageMetadata({
    title: survey.title,
    description:
      survey.description ??
      (ranking
        ? "Arbeidsplassundersøkelse om ledelse, arbeidsmiljø, lønn og kultur. Svarene inngår i kåringen av Norges beste arbeidsplass."
        : "Kartlegg verktøy og systemer på arbeidsplassen. Teller ikke i kåringen."),
    path: `/undersokelse/${survey.slug}`,
  });
}

export default async function SurveyCompanyPickPage({ params }) {
  const { survey: slug } = await params;
  const decoded = decodeURIComponent(slug);

  if (looksLikeCompanyKey(decoded)) {
    redirect(`/undersokelse/arbeidsplass-2026/${decoded}`);
  }

  const [user, survey] = await Promise.all([getSessionUser(), getSurveyBySlug(decoded)]);
  if (!survey) notFound();

  const nextPath = `/undersokelse/${survey.slug}`;

  return (
    <PageShell>
      <p className="kicker">
        {surveyCountsTowardRanking(survey) ? "Teller i kåringen" : "Teller ikke i kåringen"}
      </p>
      <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-tight">{survey.title}</h1>
      <p className="mt-4 max-w-xl text-muted">{survey.description}</p>
      <div className="mt-8 max-w-xl">
        {user ? (
          <CompanySearch intent="survey" surveySlug={survey.slug} autoFocus />
        ) : (
          <>
            <p className="mb-6 text-muted">
              Søk opp bedriften og svar etter innlogging. Magisk lenke på e-post, ingen passord.
            </p>
            <LoginForm nextPath={nextPath} />
          </>
        )}
      </div>
    </PageShell>
  );
}
