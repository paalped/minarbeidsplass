import Link from "next/link";
import { CurrentSection, PreviousSection } from "@/components/cv-sections";
import { LoginGate } from "@/components/login-gate";
import { PageShell } from "@/components/page-shell";
import { ProfileNameForm } from "@/components/profile-name-form";
import { WorkStyleForm } from "@/components/work-style-form";
import { currentWorkplace, previousEntries } from "@/lib/cv";
import { getCvEntries, getSessionUser } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Profil og CV",
  description:
    "Legg inn CV og ta en treminutters arbeidstil-test. Undersøkelsen er bare åpen for jobber du har sluttet i.",
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
        <h2 className="font-serif text-2xl">Egne undersøkelser</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Lag en kladd, publiser og del en lenke. De som svarer må logge inn. Du ser bare antallet
          svar, aldri hvem. Teller ikke i kåringen.
        </p>
        <Link
          href="/mine-undersokelser"
          className="mt-4 inline-flex h-11 items-center bg-pine px-4 text-paper hover:bg-pine-soft"
        >
          Mine undersøkelser
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Kallenavn</h2>
        <ProfileNameForm displayName={user.displayName} />
      </section>

      <section id="arbeidsstil" className="mt-10 scroll-mt-24">
        <h2 className="font-serif text-2xl">Arbeidstil</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Seks spørsmål, tre minutter. Vi matcher deg mot hvordan folk beskriver stedet — ikke mot
          et generelt terningkast. Kåringen er uendret.
        </p>
        <WorkStyleForm initial={user.workStyle} />
      </section>

      <CurrentSection current={current} />
      <PreviousSection previous={previous} />
    </PageShell>
  );
}
