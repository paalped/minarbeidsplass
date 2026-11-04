import { CurrentSection, PreviousSection } from "@/components/cv-sections";
import { LoginGate } from "@/components/login-gate";
import { PageShell } from "@/components/page-shell";
import { ProfileNameForm } from "@/components/profile-name-form";
import { currentWorkplace, previousEntries } from "@/lib/cv";
import { getCvEntries, getSessionUser } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Profil og CV",
  description:
    "Legg inn nåværende og tidligere arbeidsplasser. Undersøkelsen er bare åpen for jobber du har sluttet i.",
  path: "/profil",
  index: false,
});

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <LoginGate
        title="Logg inn for å se profilen"
        description="Her legger du inn CV og nåværende arbeidsplass. Undersøkelsen kan bare tas for tidligere jobber."
        nextPath="/profil"
      />
    );
  }

  const entries = await getCvEntries(user.id);
  const current = currentWorkplace(entries);
  const previous = previousEntries(entries);

  return (
    <PageShell>
      <p className="kicker">Profil</p>
      <h1 className="mt-2 font-serif text-4xl">CV og arbeidsplasser</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Undersøkelsen er for steder du har sluttet. Nåværende jobb ligger i CV-en, men du kan ikke
        svare om den før den er avsluttet.
      </p>
      <p className="mt-2 text-sm text-muted">{user.email}</p>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Kallenavn</h2>
        <ProfileNameForm displayName={user.displayName} />
      </section>

      <CurrentSection current={current} />
      <PreviousSection previous={previous} />
    </PageShell>
  );
}
