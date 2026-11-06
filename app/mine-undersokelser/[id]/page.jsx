import Link from "next/link";
import { notFound } from "next/navigation";
import { LoginGate } from "@/components/login-gate";
import { PageShell } from "@/components/page-shell";
import { UserSurveyEditor } from "@/components/user-survey-editor";
import { getMySurveyStats, getOwnedSurvey, getSessionUser } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Rediger undersøkelse",
  path: "/mine-undersokelser",
  index: false,
});

export default async function EditUserSurveyPage({ params }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return (
      <LoginGate
        title="Logg inn for å redigere"
        description="Kladden din er bare synlig når du er innlogget."
        nextPath={`/mine-undersokelser/${id}`}
      />
    );
  }

  const [survey, counts] = await Promise.all([getOwnedSurvey(id, user.id), getMySurveyStats()]);
  if (!survey) notFound();

  return (
    <PageShell>
      <p className="kicker">
        <Link href="/mine-undersokelser" className="underline underline-offset-4">
          Mine undersøkelser
        </Link>
      </p>
      <h1 className="mt-2 font-serif text-4xl">Bygg undersøkelsen</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Lagre kladd så ofte du vil. Test hvordan den oppleves før du publiserer — testdata lagres
        ikke. Svarene teller ikke i kåringen, og du får aldri se hvem som har svart.
      </p>
      <UserSurveyEditor survey={survey} responseCount={counts[survey.id] ?? 0} />
    </PageShell>
  );
}
