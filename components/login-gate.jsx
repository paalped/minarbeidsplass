import { LoginForm } from "@/components/login-form";
import { PageShell } from "@/components/page-shell";

export function LoginGate({ kicker = "Innlogging kreves", title, description, nextPath }) {
  return (
    <PageShell>
      <div className="mx-auto max-w-lg">
        <p className="kicker">{kicker}</p>
        <h1 className="mt-2 font-serif text-3xl">{title}</h1>
        <p className="mt-3 mb-8 text-muted">{description}</p>
        <LoginForm nextPath={nextPath} />
      </div>
    </PageShell>
  );
}
