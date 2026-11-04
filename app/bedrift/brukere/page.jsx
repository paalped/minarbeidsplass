import Link from "next/link";
import { B2bEmpty, B2bGate } from "@/components/b2b-gate";
import { B2bNav } from "@/components/b2b-nav";
import { InviteDelete, InviteForm, MemberActions } from "@/components/team-forms";
import { PageShell } from "@/components/page-shell";
import { getB2bContext, getCompanyInvites, getCompanyTeam } from "@/lib/b2b-data";
import { companyRoleLabel, isCompanyAdminRole } from "@/lib/b2b";
import { getSessionUser } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Bedriftstilganger",
  path: "/bedrift/brukere",
  index: false,
});

export default async function B2bUsersPage({ searchParams }) {
  const user = await getSessionUser();
  const { orgnr } = await searchParams;
  if (!user) return <B2bGate user={user} nextPath="/bedrift/brukere" />;

  const { membership, account } = await getB2bContext(user, orgnr);
  if (!membership) {
    return <B2bEmpty title="Ingen bedrift ennå" description="Krev bedriften før du inviterer kolleger." />;
  }
  if (!isCompanyAdminRole(membership.role) && !user.isAdmin) {
    return (
      <PageShell>
        <p className="kicker">Bedriftsportal</p>
        <h1 className="mt-2 font-serif text-3xl">Bare admin kan styre tilganger</h1>
        <Link href={`/bedrift?orgnr=${membership.orgnr}`} className="mt-6 inline-block underline">
          Tilbake
        </Link>
      </PageShell>
    );
  }

  const [team, invites] = await Promise.all([
    getCompanyTeam(membership.orgnr),
    getCompanyInvites(membership.orgnr),
  ]);

  return (
    <PageShell>
      <p className="kicker">Bedriftsportal</p>
      <h1 className="mt-2 font-serif text-4xl">Tilganger</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Admin styrer profil og brukere. Svarer kan lese innsikt og publisere offisielle svar.
      </p>
      <B2bNav current="/bedrift/brukere" orgnr={membership.orgnr} role={membership.role} plan={account?.plan} />

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Inviter</h2>
        <InviteForm orgnr={membership.orgnr} />
      </section>

      {invites.length ? (
        <section className="mt-10">
          <h2 className="font-serif text-2xl">Ventende</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {invites.map((invite) => (
              <li key={invite.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span>
                  {invite.email} · {companyRoleLabel(invite.role)}
                </span>
                <InviteDelete orgnr={membership.orgnr} id={invite.id} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Team</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {team.map((member) => (
            <li key={member.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span>
                {member.profile?.display_name ?? "Bruker"}{" "}
                {member.status !== "active" ? <span className="text-muted">(trukket tilbake)</span> : null}
              </span>
              <MemberActions orgnr={membership.orgnr} member={member} currentUserId={user.id} />
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
