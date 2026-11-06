import Link from "next/link";
import { notFound } from "next/navigation";
import { CompanySearch } from "@/components/company-search";
import { LoginForm } from "@/components/login-form";
import { PageShell } from "@/components/page-shell";
import { allWorkplaces, companyFromEntry, formatCvPeriod } from "@/lib/cv";
import { getCvEntries, getPublishedUserSurvey, getSessionUser } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { userSurveySharePath } from "@/lib/user-surveys";

export async function generateMetadata({ params }) {
  const { token } = await params;
  const survey = await getPublishedUserSurvey(token);
  return pageMetadata({
    title: survey?.title ?? "Brukerundersøkelse",
    description: survey?.description || "En brukerundersøkelse om arbeidsplassen. Krever innlogging. Teller ikke i kåringen.",
    path: userSurveySharePath(token),
    index: false,
  });
}

export default async function UserSurveyPickPage({ params }) {
  const { token } = await params;
  const survey = await getPublishedUserSurvey(token);
  if (!survey) notFound();

  const nextPath = userSurveySharePath(token);
  const user = await getSessionUser();
  const workplaces = user ? allWorkplaces(await getCvEntries(user.id)) : [];

  return (
    <PageShell>
      <p className="kicker">Brukerundersøkelse · teller ikke i kåringen</p>
      <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-tight">{survey.title}</h1>
      {survey.description ? <p className="mt-4 max-w-xl text-muted">{survey.description}</p> : null}
      <p className="mt-3 max-w-xl text-muted">
        Svarene går til den som laget undersøkelsen som et tall, uten navn. Du svarer for en
        arbeidsplass du kjenner.
      </p>

      {user ? (
        <div className="mt-8 max-w-xl">
          {workplaces.length ? (
            <ul className="divide-y divide-line border border-line bg-white">
              {workplaces.map((entry) => {
                const company = companyFromEntry(entry);
                return (
                  <li key={entry.id}>
                    <Link
                      href={`${nextPath}/${company.orgnr}`}
                      className="block px-4 py-4 hover:bg-paper-2/60"
                    >
                      <p className="font-medium">{company.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {[entry.is_current ? "Nåværende" : null, entry.title, formatCvPeriod(entry)]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mb-6 text-muted">
              Ingen arbeidsplasser i CV-en ennå. Søk opp bedriften under, eller{" "}
              <Link href="/profil" className="text-rust underline">
                legg den inn i profilen
              </Link>
              .
            </p>
          )}
          <div className="mt-8">
            <CompanySearch
              intent="survey"
              pathPrefix={nextPath}
              size="md"
              inputId="user-survey-company"
              label="Eller søk opp en annen arbeidsplass"
            />
          </div>
        </div>
      ) : (
        <div className="mt-8 max-w-lg">
          <p className="mb-6 text-muted">
            Magisk lenke på e-post. Den som laget undersøkelsen ser bare hvor mange som har svart,
            ikke hvem du er.
          </p>
          <LoginForm nextPath={nextPath} />
        </div>
      )}
    </PageShell>
  );
}
