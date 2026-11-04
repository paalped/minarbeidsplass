import Link from "next/link";
import { B2bGate } from "@/components/b2b-gate";
import { B2bNav } from "@/components/b2b-nav";
import { PageShell } from "@/components/page-shell";
import { getB2bContext, getOwnClaims } from "@/lib/b2b-data";
import { claimRoleLabel, companyRoleLabel, hasInsights, planLabel, PLANS } from "@/lib/b2b";
import { getSessionUser } from "@/lib/data";
import { formatOrgnr } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Bedriftsportal",
  description: "Verifisert arbeidsgiverprofil, offisielle svar og innsikt uten å røre ansattes anonymitet.",
  path: "/bedrift",
  index: false,
});

export default async function B2bHomePage({ searchParams }) {
  const user = await getSessionUser();
  const { orgnr } = await searchParams;
  if (!user) return <B2bGate user={user} />;

  const claims = await getOwnClaims(user.id);
  const { memberships, membership, account } = await getB2bContext(user, orgnr);
  if (!membership) {
    return (
      <PageShell>
        <p className="kicker">Bedriftsportal</p>
        <h1 className="mt-2 font-serif text-4xl">Krev bedriften din</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Basic er gratis: logo, intro og ett offisielt svar per omtale. Dere kan ikke slette
          sladder. Innsikt krever minst fem forsinkede svar og Insights-plan.
        </p>
        <Link
          href="/bedrift/krev"
          className="mt-6 inline-flex h-12 items-center bg-rust px-5 text-paper hover:bg-rust-dark"
        >
          Krev en bedrift i Brreg
        </Link>
        {claims.length ? (
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {claims.map((claim) => (
              <li key={claim.id} className="flex flex-wrap justify-between gap-2 py-3">
                <span>
                  {claim.company?.name ?? claim.orgnr} · {claimRoleLabel(claim.declared_role)}
                </span>
                <span className="text-sm text-muted">
                  {claim.status === "pending"
                    ? "Venter på verifisering"
                    : claim.status === "verified"
                      ? "Verifisert"
                      : "Avvist"}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <PlanList />
      </PageShell>
    );
  }

  const company = membership.company;
  return (
    <PageShell>
      <p className="kicker">Bedriftsportal</p>
      <h1 className="mt-2 font-serif text-4xl">{company?.name ?? membership.orgnr}</h1>
      <p className="mt-2 text-muted">
        {formatOrgnr(membership.orgnr)} · {companyRoleLabel(membership.role)} ·{" "}
        {planLabel(account?.plan)}
      </p>
      <B2bNav current="/bedrift" orgnr={membership.orgnr} role={membership.role} plan={account?.plan} />
      {memberships.length > 1 ? (
        <p className="mt-4 text-sm text-muted">
          Flere bedrifter:{" "}
          {memberships.map((item) => (
            <Link key={item.orgnr} href={`/bedrift?orgnr=${item.orgnr}`} className="mr-3 underline">
              {item.company?.name ?? item.orgnr}
            </Link>
          ))}
        </p>
      ) : null}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href={`/bedrift/svar?orgnr=${membership.orgnr}`} className="paper-card p-5 hover:bg-white">
          <p className="kicker">Basic</p>
          <h2 className="mt-2 font-serif text-2xl">Svar på omtaler</h2>
          <p className="mt-2 text-muted">Ett verifisert svar per innlegg. Innlegget blir stående.</p>
        </Link>
        <Link href={`/bedrift/profil?orgnr=${membership.orgnr}`} className="paper-card p-5 hover:bg-white">
          <p className="kicker">Profil</p>
          <h2 className="mt-2 font-serif text-2xl">Merkevare</h2>
          <p className="mt-2 text-muted">Logo, intro, verdier og karrierelenke på den åpne siden.</p>
        </Link>
        <Link
          href={hasInsights(account?.plan) ? `/bedrift/innsikt?orgnr=${membership.orgnr}` : `/bedrifter/${membership.orgnr}`}
          className="paper-card p-5 hover:bg-white"
        >
          <p className="kicker">Innsikt</p>
          <h2 className="mt-2 font-serif text-2xl">{hasInsights(account?.plan) ? "Dashbord" : "Låst"}</h2>
          <p className="mt-2 text-muted">
            k ≥ 5 og 48–96 timer forsinkelse. Ingen personsporing, ingen sletting av negative svar.
          </p>
        </Link>
      </div>
      <p className="mt-8 max-w-2xl text-sm text-muted">
        BankID/Signicat mot roller i Enhetsregisteret er neste steg. Inntil videre godkjennes krav
        av plattformadmin mot Brreg-roller.
      </p>
      <PlanList />
    </PageShell>
  );
}

function PlanList() {
  return (
    <section className="mt-12">
      <h2 className="font-serif text-2xl">Planer</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div key={plan.key} className="paper-card p-5">
            <p className="kicker">{plan.price}</p>
            <h3 className="mt-2 font-serif text-2xl">{plan.label}</h3>
            <p className="mt-2 text-muted">{plan.summary}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
