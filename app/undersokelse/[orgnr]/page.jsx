import Link from "next/link";
import { notFound } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { PageShell } from "@/components/page-shell";
import { SurveyForm } from "@/components/survey-form";
import {
  ensureCompany,
  getActiveSurvey,
  getSessionUser,
  getSurveyResponse,
} from "@/lib/data";

export const metadata = { title: "Undersøkelse" };

export default async function SurveyPage({ params }) {
  const { orgnr: raw } = await params;
  const orgnr = decodeURIComponent(raw);
  const [company, survey, user] = await Promise.all([
    ensureCompany(orgnr),
    getActiveSurvey(),
    getSessionUser(),
  ]);

  if (!company) notFound();

  if (!survey) {
    return (
      <PageShell>
        <h1 className="font-serif text-3xl">Undersøkelsen er ikke klar</h1>
        <p className="mt-3 text-muted">Kjør SQL-migrasjonen i Supabase for å laste inn spørsmålene.</p>
      </PageShell>
    );
  }

  const nextPath = `/undersokelse/${company.orgnr}`;

  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg">
          <p className="kicker">Innlogging kreves</p>
          <h1 className="mt-2 font-serif text-3xl">Logg inn for å svare om {company.name}</h1>
          <p className="mt-3 mb-8 text-muted">
            Lesing og sladder er åpent. Undersøkelsen teller i kåringen, derfor magisk lenke på e-post.
          </p>
          <LoginForm nextPath={nextPath} />
        </div>
      </PageShell>
    );
  }

  const existing = await getSurveyResponse(survey.id, company.orgnr, user.id);

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl">
        <p className="kicker">Undersøkelse</p>
        <h1 className="mt-2 font-serif text-4xl">{company.name}</h1>
        <p className="mt-3 text-muted">{survey.description}</p>
        {existing ? (
          <p className="mt-4 text-sm text-good">
            Du har svart før (snitt {existing.overall_score.toFixed(1).replace(".", ",")}). Du kan
            oppdatere svarene under.
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
