import { LoginForm } from "@/components/login-form";
import { PageShell } from "@/components/page-shell";

export function AdminGate({ user, ok, nextPath = "/admin", children }) {
  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg">
          <p className="kicker">Admin</p>
          <h1 className="mt-2 font-serif text-3xl">Logg inn for å redigere siden</h1>
          <p className="mt-3 mb-8 text-muted">Bare administratorer kommer videre herfra.</p>
          <LoginForm nextPath={nextPath} />
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
          Kjør admin-migrasjonene i Supabase, og gi deretter din bruker tilgang med SQL under.
        </p>
        <pre className="paper-card mt-6 overflow-auto p-4 text-sm">{grantSql}</pre>
      </PageShell>
    );
  }

  return children;
}
