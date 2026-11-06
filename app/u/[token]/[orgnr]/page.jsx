import Link from "next/link";
import { notFound } from "next/navigation";
import { LoginGate } from "@/components/login-gate";
import { PageShell } from "@/components/page-shell";
import { SurveyForm } from "@/components/survey-form";
import { ensureCompany, getPublishedUserSurvey, getSessionUser, getSurveyResponse } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { userSurveySharePath } from "@/lib/user-surveys";

export async function generateMetadata({ params }) {
  const { token, orgnr } = await params;
  const survey = await getPublishedUserSurvey(token);
  return pageMetadata({
    title: survey?.title ?? "Brukerundersøkelse",
    path: `${userSurveySharePath(token)}/${decodeURIComponent(orgnr)}`,
    index: false,
  });
}

export default async function UserSurveyTakePage({ params }) {
  const { token, orgnr: raw } = await params;
  const orgnr = decodeURIComponent(raw);
  const [survey, company, user] = await Promise.all([
    getPublishedUserSurvey(token),
    ensureCompany(orgnr),
    getSessionUser(),
  ]);

  if (!survey || !company) notFound();

  const nextPath = `${userSurveySharePath(token)}/${company.orgnr}`;

  if (!user) {
    return (
      <LoginGate
        title={`Logg inn for å svare om ${company.name}`}
        description="Brukerundersøkelser krever magisk lenke på e-post. Den som laget den ser bare antallet svar. Teller ikke i kåringen."
        nextPath={nextPath}
      />
    );
  }

  const existing = await getSurveyResponse(survey.id, company.orgnr, user.id);

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl">
        <p className="kicker">Brukerundersøkelse · teller ikke i kåringen</p>
        <h1 className="mt-2 font-serif text-4xl">{survey.title}</h1>
        <p className="mt-3 text-muted">{company.name}</p>
        {survey.description ? <p className="mt-3 text-muted">{survey.description}</p> : null}
        {existing ? (
          <p className="mt-4 text-sm text-good">Du har svart før. Du kan oppdatere svarene under.</p>
        ) : null}
        <p className="mt-2 mb-8 text-sm">
          <Link href={userSurveySharePath(token)} className="text-rust underline">
            Velg en annen arbeidsplass
          </Link>
        </p>
        <SurveyForm company={company} survey={survey} existing={existing} />
      </div>
    </PageShell>
  );
}
