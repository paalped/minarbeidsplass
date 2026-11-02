import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { PageShell } from "@/components/page-shell";
import { countBuckets, requireAdmin } from "@/lib/admin";
import { formatNumber } from "@/lib/format";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const { user, supabase, ok } = await requireAdmin();

  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg">
          <p className="kicker">Admin</p>
          <h1 className="mt-2 font-serif text-3xl">Logg inn for å se statistikken</h1>
          <p className="mt-3 mb-8 text-muted">Bare administratorer kommer videre herfra.</p>
          <LoginForm nextPath="/admin" />
        </div>
      </PageShell>
    );
  }

  if (!ok) {
    const grantSql = `update public.profiles
set is_admin = true
where id = (
  select id from auth.users
  where email = '${user.email ?? "din@epost.no"}'
  limit 1
);`;

    return (
      <PageShell>
        <p className="kicker">Admin</p>
        <h1 className="mt-2 font-serif text-3xl">Du er inne, men ikke admin</h1>
        <p className="mt-3 max-w-xl text-muted">
          Kjør <code className="text-ink">003_admin.sql</code> i Supabase, og gi deretter din bruker
          tilgang med SQL under.
        </p>
        <pre className="paper-card mt-6 overflow-auto p-4 text-sm">{grantSql}</pre>
      </PageShell>
    );
  }

  const [{ data: profiles }, { data: responses }, { data: surveys }] = await Promise.all([
    supabase.from("profiles").select("created_at"),
    supabase.from("survey_responses").select("created_at, survey_id"),
    supabase.from("surveys").select("id, slug, title"),
  ]);

  const users = countBuckets((profiles ?? []).map((row) => row.created_at));
  const taken = countBuckets((responses ?? []).map((row) => row.created_at));
  const bySurvey = (surveys ?? []).map((survey) => {
    const stamps = (responses ?? [])
      .filter((row) => row.survey_id === survey.id)
      .map((row) => row.created_at);
    return { ...survey, ...countBuckets(stamps) };
  });

  return (
    <PageShell>
      <p className="kicker">Admin</p>
      <h1 className="mt-2 font-serif text-4xl">Oversikt</h1>
      <p className="mt-3 max-w-xl text-muted">
        Tall i norsk tid. Undersøkelser teller innsendte svar — én per person, bedrift og
        undersøkelse.
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Brukere</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <StatCard label="Totalt" value={users.total} />
          <StatCard label="Sist uke" value={users.week} />
          <StatCard label="I dag" value={users.today} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Undersøkelser tatt</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <StatCard label="Totalt" value={taken.total} />
          <StatCard label="Sist uke" value={taken.week} />
          <StatCard label="I dag" value={taken.today} />
        </div>
        {bySurvey.length > 0 ? (
          <ul className="mt-6 divide-y divide-line border border-line bg-white">
            {bySurvey.map((survey) => (
              <li key={survey.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
                <span>{survey.title}</span>
                <span className="text-sm text-muted">
                  {formatNumber(survey.total)} totalt · {formatNumber(survey.week)} uke ·{" "}
                  {formatNumber(survey.today)} i dag
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Last ned CSV</h2>
        <p className="mt-2 max-w-xl text-muted">
          Åpnes som fil. Brukere inkluderer e-post. Svar inkluderer bedrift, undersøkelse og
          råsvarene.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="/api/admin/export?type=users"
            className="inline-flex h-12 items-center bg-rust px-5 text-paper hover:bg-rust-dark"
          >
            Brukere
          </a>
          <a
            href="/api/admin/export?type=responses"
            className="inline-flex h-12 items-center border border-pine bg-paper px-5 text-pine hover:bg-paper-2"
          >
            Undersøkelsessvar
          </a>
        </div>
      </section>

      <p className="mt-8 text-sm">
        <Link href="/" className="text-rust underline">
          Til forsiden
        </Link>
      </p>
    </PageShell>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="paper-card p-5">
      <p className="kicker">{label}</p>
      <p className="mt-2 font-serif text-4xl tabular-nums">{formatNumber(value) ?? "0"}</p>
    </div>
  );
}
