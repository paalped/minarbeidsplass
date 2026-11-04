import { notFound, redirect } from "next/navigation";
import { CompanySearch } from "@/components/company-search";
import { LoginGate } from "@/components/login-gate";
import { PageShell } from "@/components/page-shell";
import { getSessionUser, getSurveyBySlug } from "@/lib/data";
import { looksLikeCompanyKey } from "@/lib/format";
import { surveyCountsTowardRanking } from "@/lib/survey";

export async function generateMetadata({ params }) {
  const { survey: slug } = await params;
  if (looksLikeCompanyKey(slug)) return { title: "Undersøkelse" };
  const survey = await getSurveyBySlug(decodeURIComponent(slug));
  return { title: survey?.title ?? "Undersøkelse" };
}

export default async function SurveyCompanyPickPage({ params }) {
  const { survey: slug } = await params;
  const decoded = decodeURIComponent(slug);

  if (looksLikeCompanyKey(decoded)) {
    redirect(`/undersokelse/arbeidsplass-2026/${decoded}`);
  }

  const user = await getSessionUser();
  if (!user) {
    return (
      <LoginGate
        title="Logg inn for å ta undersøkelsen"
        description="Undersøkelser er for innloggede. Du kommer tilbake hit etter magisk lenke."
        nextPath={`/undersokelse/${decoded}`}
      />
    );
  }

  const survey = await getSurveyBySlug(decoded);
  if (!survey) notFound();

  return (
    <PageShell>
      <p className="kicker">
        {surveyCountsTowardRanking(survey) ? "Teller i kåringen" : "Teller ikke i kåringen"}
      </p>
      <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-tight">{survey.title}</h1>
      <p className="mt-4 max-w-xl text-muted">{survey.description}</p>
      <div className="mt-8 max-w-xl">
        <CompanySearch intent="survey" surveySlug={survey.slug} autoFocus />
      </div>
    </PageShell>
  );
}
