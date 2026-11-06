import Link from "next/link";
import { CreateSurveyButton } from "@/components/user-survey-editor";
import { LoginGate } from "@/components/login-gate";
import { PageShell } from "@/components/page-shell";
import { formatNumber } from "@/lib/format";
import { getMySurveyStats, getOwnedSurveys, getSessionUser } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { userSurveyStatusLabel } from "@/lib/user-surveys";

export const metadata = pageMetadata({
  title: "Mine undersøkelser",
  description: "Lag dine egne arbeidsplassundersøkelser, lagre kladd og del en lenke. Du ser bare hvor mange som har svart.",
  path: "/mine-undersokelser",
  index: false,
});

export default async function MySurveysPage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <LoginGate
        title="Logg inn for å lage undersøkelser"
        description="Lag en kladd, publiser når den er ferdig, og del lenken. De som svarer må også logge inn. Du ser bare antallet svar."
        nextPath="/mine-undersokelser"
      />
    );
  }

  const [surveys, counts] = await Promise.all([getOwnedSurveys(user.id), getMySurveyStats()]);

  return (
    <PageShell>
      <p className="kicker">Mine undersøkelser</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl">Spør om arbeidsplassen, på din måte</h1>
          <p className="mt-3 max-w-xl text-muted">
            Dette er dine undersøkelser. De teller ikke i kåringen. Du lagrer kladd, publiserer når
            den er ferdig, og får en lenke. På dashbordet ser du bare hvor mange som har svart —
            aldri hvem.
          </p>
        </div>
        <CreateSurveyButton />
      </div>

      {surveys.length === 0 ? (
        <p className="mt-10 text-muted">Ingen undersøkelser ennå. Lag den første.</p>
      ) : (
        <ul className="mt-10 divide-y divide-line border border-line bg-white">
          {surveys.map((survey) => (
            <li key={survey.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <p className="font-medium">{survey.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {userSurveyStatusLabel(survey.status)} · {formatNumber(counts[survey.id] ?? 0)} svar
                </p>
              </div>
              <Link href={`/mine-undersokelser/${survey.id}`} className="text-sm text-rust underline">
                Åpne
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
