import Link from "next/link";
import { LoginGate } from "@/components/login-gate";
import { PageShell } from "@/components/page-shell";
import { getSessionUser, getSurveys } from "@/lib/data";
import { surveyCountsTowardRanking } from "@/lib/survey";

export const metadata = { title: "Undersøkelser" };

export default async function SurveyIndexPage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <LoginGate
        title="Logg inn for å ta undersøkelsene"
        description="Undersøkelser og chat er for innloggede. Sladder på bedriftssiden er fortsatt åpent og anonymt."
        nextPath="/undersokelse"
      />
    );
  }

  const surveys = await getSurveys();

  return (
    <PageShell>
      <p className="kicker">Undersøkelser</p>
      <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-tight">
        To spørsmålssett. Én kåring.
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Arbeidsplassundersøkelsen styrer Norges beste arbeidsplass. Verktøyundersøkelsen kartlegger
        systemene folk faktisk jobber i — og teller ikke i kåringen.
      </p>

      {surveys.length === 0 ? (
        <p className="mt-10 text-muted">
          Ingen undersøkelser er lastet inn. Kjør SQL-migrasjonen i Supabase.
        </p>
      ) : (
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {surveys.map((survey) => (
            <li key={survey.id} className="paper-card flex flex-col p-6">
              <p className="kicker">
                {surveyCountsTowardRanking(survey) ? "Teller i kåringen" : "Teller ikke i kåringen"}
              </p>
              <h2 className="mt-2 font-serif text-3xl">{survey.title}</h2>
              <p className="mt-3 flex-1 text-muted">{survey.teaser ?? survey.description}</p>
              <Link
                href={`/undersokelse/${survey.slug}`}
                className="mt-6 inline-flex h-11 items-center justify-center bg-rust px-4 text-paper hover:bg-rust-dark"
              >
                Velg bedrift
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
