import { B2bEmpty, B2bGate } from "@/components/b2b-gate";
import { B2bNav } from "@/components/b2b-nav";
import { InsightsBlank, InsightsBoard } from "@/components/insights-board";
import { PageShell } from "@/components/page-shell";
import { getB2bContext, getCompanyInsights, getIndustryBenchmark, presentInsights } from "@/lib/b2b-data";
import { getSessionUser } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Bedriftsinnsikt",
  path: "/bedrift/innsikt",
  index: false,
});

export default async function B2bInsightsPage({ searchParams }) {
  const user = await getSessionUser();
  const { orgnr } = await searchParams;
  if (!user) return <B2bGate user={user} nextPath="/bedrift/innsikt" />;

  const { membership, account } = await getB2bContext(user, orgnr);
  if (!membership) {
    return <B2bEmpty title="Ingen bedrift ennå" description="Krev bedriften før du ser innsikt." />;
  }

  const result = await getCompanyInsights(membership.orgnr);
  const insights = result.ok
    ? presentInsights(result.body, await getIndustryBenchmark(membership.company))
    : null;

  return (
    <PageShell>
      <p className="kicker">Bedriftsportal</p>
      <h1 className="mt-2 font-serif text-4xl">Innsikt</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Aggregerte tall uten person, e-post eller tidspunkt. Svar under fem vises ikke. Nye svar
        innlemmes med 48–96 timers tilfeldig forsinkelse.
      </p>
      <B2bNav current="/bedrift/innsikt" orgnr={membership.orgnr} role={membership.role} plan={account?.plan} />
      {insights ? (
        <InsightsBoard insights={insights} companyName={membership.company?.name ?? membership.orgnr} />
      ) : (
        <InsightsBlank reason={result.body?.reason} />
      )}
    </PageShell>
  );
}
