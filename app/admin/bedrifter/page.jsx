import { AdminGate } from "@/components/admin-gate";
import { AdminNav } from "@/components/admin-nav";
import { ClaimActions, PlanSelect } from "@/components/admin-claim-actions";
import { PageShell } from "@/components/page-shell";
import { requireAdmin } from "@/lib/admin";
import { claimRoleLabel } from "@/lib/b2b";
import { getPendingClaims } from "@/lib/b2b-data";
import { formatOrgnr } from "@/lib/format";

export const metadata = {
  title: "Bedriftskrav",
  robots: { index: false, follow: false },
};

export default async function AdminCompaniesPage() {
  const { user, supabase, ok } = await requireAdmin();
  if (!user || !ok) return <AdminGate user={user} ok={ok} nextPath="/admin/bedrifter" />;

  const claims = await getPendingClaims();
  const { data: accounts } = await supabase
    .from("company_accounts")
    .select("orgnr, plan, verified_at, company:companies (name)");

  return (
    <PageShell>
      <p className="kicker">Admin</p>
      <h1 className="mt-2 font-serif text-4xl">Bedrifter</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Godkjenn krav mot roller i Enhetsregisteret. BankID/Signicat kommer senere. Innsikt åpnes
        med plan, og vises aldri før k ≥ 5.
      </p>
      <AdminNav current="/admin/bedrifter" />

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Ventende krav</h2>
        {claims.length === 0 ? (
          <p className="mt-4 text-muted">Ingen ventende krav.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {claims.map((claim) => (
              <li key={claim.id} className="paper-card p-5">
                <p className="font-medium">
                  {claim.company?.name ?? claim.orgnr} · {formatOrgnr(claim.orgnr)}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Oppgitt rolle: {claimRoleLabel(claim.declared_role)}
                  {claim.company?.municipality ? ` · ${claim.company.municipality}` : ""}
                </p>
                {Array.isArray(claim.brreg_roles) && claim.brreg_roles.length ? (
                  <ul className="mt-3 list-disc pl-5 text-sm text-muted">
                    {claim.brreg_roles.slice(0, 8).map((role, index) => (
                      <li key={`${role.type}-${index}`}>
                        {role.type}
                        {role.name ? `: ${role.name}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-muted">Ingen roller hentet fra Brreg.</p>
                )}
                <div className="mt-4">
                  <ClaimActions claimId={claim.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Verifiserte kontoer</h2>
        {(accounts ?? []).length === 0 ? (
          <p className="mt-4 text-muted">Ingen verifiserte bedrifter ennå.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {(accounts ?? []).map((row) => (
              <li key={row.orgnr} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>
                  {row.company?.name ?? row.orgnr} · {formatOrgnr(row.orgnr)}
                </span>
                <PlanSelect orgnr={row.orgnr} plan={row.plan} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
