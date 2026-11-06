import Link from "next/link";
import { notFound } from "next/navigation";
import { LoginGate } from "@/components/login-gate";
import { PageShell } from "@/components/page-shell";
import { SurveyForm } from "@/components/survey-form";
import { getOwnedSurvey, getSessionUser } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

const PREVIEW_COMPANY = { orgnr: "preview", name: "Forhåndsvisning" };

export const metadata = pageMetadata({
  title: "Test undersøkelse",
  path: "/mine-undersokelser",
  index: false,
});

export default async function TestUserSurveyPage({ params }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return (
      <LoginGate
        title="Logg inn for å teste"
        description="Bare du kan teste kladden før den publiseres."
        nextPath={`/mine-undersokelser/${id}/test`}
      />
    );
  }

  const survey = await getOwnedSurvey(id, user.id);
  if (!survey) notFound();

  const questions = survey.survey_questions ?? [];
  const editHref = `/mine-undersokelser/${survey.id}`;

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl">
        <p className="kicker">Test · svarene lagres ikke</p>
        <h1 className="mt-2 font-serif text-4xl">{survey.title}</h1>
        {survey.description ? <p className="mt-3 text-muted">{survey.description}</p> : null}
        <p className="mt-3 text-muted">
          Slik ser undersøkelsen ut for den som får lenken. Du kan gå gjennom alle stegene. Ingenting
          telles, og ingen andre ser dette.
        </p>
        <p className="mt-2 mb-8 text-sm">
          <Link href={editHref} className="text-rust underline">
            Tilbake til kladden
          </Link>
        </p>
        {questions.length === 0 ? (
          <div className="paper-card p-6">
            <p className="font-serif text-2xl">Ingen spørsmål å teste</p>
            <p className="mt-3 text-muted">Legg inn minst ett spørsmål og lagre kladden først.</p>
          </div>
        ) : (
          <SurveyForm
            company={PREVIEW_COMPANY}
            survey={survey}
            preview
            backHref={editHref}
          />
        )}
      </div>
    </PageShell>
  );
}
