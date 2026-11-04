import { LoginForm } from "@/components/login-form";
import { PageShell } from "@/components/page-shell";
import { getSessionUser } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Logg inn",
  description: "Logg inn med magisk lenke for å ta undersøkelsen og bruke chatten.",
  path: "/logg-inn",
  index: false,
});

function safeNext(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  const nextPath = safeNext(next);
  const user = await getSessionUser();

  return (
    <PageShell>
      <div className="mx-auto max-w-lg">
        <p className="kicker">Konto</p>
        <h1 className="mt-2 font-serif text-3xl">
          {user ? `Du er inne som ${user.displayName}` : "Logg inn med e-post"}
        </h1>
        <p className="mt-3 mb-8 text-muted">
          Ingen passord. Vi sender en magisk lenke. Kreves for undersøkelse og chat — ikke for å lese
          eller sladre.
        </p>
        {user ? (
          <a href={nextPath} className="inline-block bg-pine px-5 py-3 text-paper">
            Fortsett
          </a>
        ) : (
          <LoginForm nextPath={nextPath} />
        )}
      </div>
    </PageShell>
  );
}
