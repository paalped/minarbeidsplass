import { B2bGate } from "@/components/b2b-gate";
import { ClaimForm } from "@/components/claim-form";
import { PageShell } from "@/components/page-shell";
import { getSessionUser } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Krev bedrift",
  description: "Krev bedriftsprofilen mot Enhetsregisteret. Verifisering godkjennes mot roller i Brreg.",
  path: "/bedrift/krev",
  index: false,
});

export default async function ClaimPage() {
  const user = await getSessionUser();
  if (!user) return <B2bGate user={user} nextPath="/bedrift/krev" />;

  return (
    <PageShell>
      <p className="kicker">Bedriftsportal</p>
      <h1 className="mt-2 font-serif text-4xl">Krev bedriften</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Søk opp enheten i Brønnøysundregistrene og oppgi rollen din. Vi henter roller fra Brreg som
        støtte for verifisering. BankID kommer senere. Inntil videre må plattformadmin godkjenne.
      </p>
      <ClaimForm />
    </PageShell>
  );
}
