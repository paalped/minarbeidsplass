import Link from "next/link";
import { AdminGate } from "@/components/admin-gate";
import { AdminNav } from "@/components/admin-nav";
import { PageShell } from "@/components/page-shell";
import { requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Nyheter · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNewsPage() {
  const { user, supabase, ok } = await requireAdmin();

  if (!user || !ok) {
    return <AdminGate user={user} ok={ok} nextPath="/admin/nyheter" />;
  }

  return <NewsList supabase={supabase} />;
}

async function NewsList({ supabase }) {
  const { data: articles } = await supabase
    .from("news")
    .select("id, slug, title, excerpt, published_at")
    .order("published_at", { ascending: false });

  return (
    <PageShell>
      <p className="kicker">Admin</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl">Nyheter</h1>
          <p className="mt-3 max-w-xl text-muted">
            Saker vises på forsiden og under Nyheter, nyeste først.
          </p>
        </div>
        <Link
          href="/admin/nyheter/ny"
          className="inline-flex h-12 shrink-0 items-center justify-center bg-rust px-5 text-paper hover:bg-rust-dark"
        >
          Ny sak
        </Link>
      </div>
      <AdminNav current="/admin/nyheter" />

      {articles?.length ? (
        <ul className="mt-8 divide-y divide-line border border-line bg-white">
          {articles.map((article) => (
            <li key={article.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <p className="font-medium">{article.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {formatDate(article.published_at)} · /nyheter/{article.slug}
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <Link href={`/nyheter/${article.slug}`} className="text-muted underline">
                  Vis
                </Link>
                <Link href={`/admin/nyheter/${article.id}`} className="text-rust underline">
                  Rediger
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-muted">Ingen saker ennå. Skriv den første.</p>
      )}
    </PageShell>
  );
}
