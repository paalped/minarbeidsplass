import Link from "next/link";
import { LoginGate } from "@/components/login-gate";
import { PageShell } from "@/components/page-shell";

export function B2bGate({ user, nextPath = "/bedrift", children }) {
  if (!user) {
    return (
      <LoginGate
        kicker="Bedriftsportal"
        title="Logg inn for å kreve bedriften"
        description="Magisk lenke på e-post. BankID/Signicat mot roller i Enhetsregisteret kommer som neste steg. Inntil videre verifiserer plattformadmin kravet mot Brreg."
        nextPath={nextPath}
      />
    );
  }

  return children;
}

export function B2bEmpty({ title, description }) {
  return (
    <PageShell>
      <p className="kicker">Bedriftsportal</p>
      <h1 className="mt-2 font-serif text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{description}</p>
      <Link
        href="/bedrift/krev"
        className="mt-6 inline-flex h-12 items-center bg-rust px-5 text-paper hover:bg-rust-dark"
      >
        Krev en bedrift
      </Link>
    </PageShell>
  );
}
