import Link from "next/link";
import { B2bEmpty, B2bGate } from "@/components/b2b-gate";
import { B2bNav } from "@/components/b2b-nav";
import { BrandingForm } from "@/components/branding-form";
import { PageShell } from "@/components/page-shell";
import { getB2bContext } from "@/lib/b2b-data";
import { isCompanyAdminRole } from "@/lib/b2b";
import { getSessionUser } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Bedriftsprofil",
  path: "/bedrift/profil",
  index: false,
});

export default async function B2bProfilePage({ searchParams }) {
  const user = await getSessionUser();
  const { orgnr } = await searchParams;
  if (!user) return <B2bGate user={user} nextPath="/bedrift/profil" />;

  const { membership, account, branding } = await getB2bContext(user, orgnr);
  if (!membership) {
    return <B2bEmpty title="Ingen bedrift ennå" description="Krev bedriften før du redigerer profilen." />;
  }
  if (!isCompanyAdminRole(membership.role) && !user.isAdmin) {
    return (
      <PageShell>
        <p className="kicker">Bedriftsportal</p>
        <h1 className="mt-2 font-serif text-3xl">Bare admin kan endre profilen</h1>
        <Link href={`/bedrift?orgnr=${membership.orgnr}`} className="mt-6 inline-block underline">
          Tilbake
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <p className="kicker">Bedriftsportal</p>
      <h1 className="mt-2 font-serif text-4xl">Offentlig profil</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Dette vises på den åpne bedriftssiden. Det endrer ikke scorer eller sladder.
      </p>
      <B2bNav current="/bedrift/profil" orgnr={membership.orgnr} role={membership.role} plan={account?.plan} />
      <BrandingForm orgnr={membership.orgnr} initial={branding} />
      <Link href={`/bedrifter/${membership.orgnr}`} className="mt-6 inline-block text-sm text-rust underline">
        Se den offentlige siden
      </Link>
    </PageShell>
  );
}
