import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { PageShell } from "@/components/page-shell";
import { getCvEntries, getSessionUser, getSurveyBySlug } from "@/lib/data";
import { companyFromEntry, formatCvPeriod, previousWorkplaces } from "@/lib/cv";
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
  const workplaces = user ? previousWorkplaces(await getCvEntries(user.id)) : [];

  return (
    <PageShell>
      <p className="kicker">
        {surveyCountsTowardRanking(survey) ? "Teller i kåringen" : "Teller ikke i kåringen"}
      </p>
      <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-tight">{survey.title}</h1>
      <p className="mt-4 max-w-xl text-muted">{survey.description}</p>
      <p className="mt-3 max-w-xl text-muted">
        Du kan bare svare for tidligere arbeidsplasser i CV-en. Nåværende jobb er unntatt.
      </p>
      <div className="mt-8 max-w-xl">
        {user ? (
          workplaces.length ? (
            <ul className="divide-y divide-line border border-line bg-white">
              {workplaces.map((entry) => {
                const company = companyFromEntry(entry);
                return (
                  <li key={entry.id}>
                    <Link
                      href={`/undersokelse/${survey.slug}/${company.orgnr}`}
                      className="block px-4 py-4 hover:bg-paper-2/60"
                    >
                      <p className="font-medium">{company.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {[entry.title, formatCvPeriod(entry)].filter(Boolean).join(" · ")}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="paper-card p-6">
              <p className="font-serif text-2xl">CV-en mangler tidligere jobber</p>
              <p className="mt-3 text-muted">
                Legg inn arbeidsplasser du har sluttet i. Deretter kan du ta undersøkelsen for de
                stedene.
              </p>
              <Link
                href="/profil"
                className="mt-6 inline-flex h-11 items-center bg-rust px-4 text-paper hover:bg-rust-dark"
              >
                Gå til profilen
              </Link>
            </div>
          )
        ) : (
          <>
            <p className="mb-6 text-muted">
              Logg inn, og velg blant tidligere arbeidsplasser i CV-en. Magisk lenke på e-post,
              ingen passord.
            </p>
            <LoginForm nextPath={nextPath} />
          </>
        )}
      </div>
    </PageShell>
  );
}
