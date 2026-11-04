import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { getSessionUser, getSurveys } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { surveyCountsTowardRanking } from "@/lib/survey";

export const metadata = pageMetadata({
  title: "Arbeidsplassundersøkelse",
  description:
    "Ta arbeidsplassundersøkelsen om ledelse, arbeidsmiljø, lønn og kultur. Svarene kårer Norges beste arbeidsplass. Verktøyundersøkelsen kartlegger systemene folk jobber i.",
  path: "/undersokelse",
});

export default async function SurveyIndexPage() {
  const [user, surveys] = await Promise.all([getSessionUser(), getSurveys()]);

  return (
    <PageShell>
      <p className="kicker">Undersøkelser</p>
      <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-tight">
        Arbeidsplassundersøkelse og verktøy — to spørsmålssett, én kåring.
      </h1>
      <p className="mt-4 max-w-2xl text-muted">
        Si hvordan det faktisk er å jobbe der du jobber. Svarene om ledelse, arbeidsmiljø, lønn,
        balanse, utvikling og kultur styrer Norges beste arbeidsplass. Seks spørsmål om hvordan
        stedet faktisk er (autonomi, tempo, samarbeid) brukes bare til match, ikke til kåringen.
        Verktøyundersøkelsen kartlegger timesystem, GIS, CAD og kjernesystem.
      </p>
      <p className="mt-3 max-w-2xl text-muted">
        {user
          ? "Velg undersøkelse, deretter en tidligere arbeidsplass fra CV-en. Ett svar per person, bedrift og undersøkelse."
          : "Du kan lese om undersøkelsene her. For å svare trenger du magisk lenke på e-post og tidligere jobber i CV-en."}
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
                href={
                  user
                    ? `/undersokelse/${survey.slug}`
                    : `/logg-inn?next=${encodeURIComponent(`/undersokelse/${survey.slug}`)}`
                }
                className="mt-6 inline-flex h-11 items-center justify-center bg-rust px-4 text-paper hover:bg-rust-dark"
              >
                {user ? "Velg bedrift" : "Logg inn for å svare"}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
