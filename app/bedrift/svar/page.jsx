import { B2bEmpty, B2bGate } from "@/components/b2b-gate";
import { B2bNav } from "@/components/b2b-nav";
import { EmployerReplyList } from "@/components/employer-reply-form";
import { PageShell } from "@/components/page-shell";
import { getB2bContext, getEmployerPosts } from "@/lib/b2b-data";
import { getSessionUser } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Arbeidsgiversvar",
  path: "/bedrift/svar",
  index: false,
});

export default async function B2bRepliesPage({ searchParams }) {
  const user = await getSessionUser();
  const { orgnr } = await searchParams;
  if (!user) return <B2bGate user={user} nextPath="/bedrift/svar" />;

  const { membership, account } = await getB2bContext(user, orgnr);
  if (!membership) {
    return <B2bEmpty title="Ingen bedrift ennå" description="Krev bedriften før du svarer på omtaler." />;
  }

  const posts = await getEmployerPosts(membership.orgnr);

  return (
    <PageShell>
      <p className="kicker">Bedriftsportal</p>
      <h1 className="mt-2 font-serif text-4xl">Offisielle svar</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Ett svar per omtale, merket Verifisert arbeidsgiver. Dere kan ikke fjerne, skjule eller
        vektes ned innlegg. Moderering skjer bare ved brudd på retningslinjene.
      </p>
      <B2bNav current="/bedrift/svar" orgnr={membership.orgnr} role={membership.role} plan={account?.plan} />
      <EmployerReplyList orgnr={membership.orgnr} posts={posts} />
    </PageShell>
  );
}
