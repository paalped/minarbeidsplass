import { NewsCard } from "@/components/news-card";
import { PageShell } from "@/components/page-shell";
import { getNews } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Nyheter om arbeidsliv og kåringen",
  description:
    "Saker om arbeidsplassundersøkelsen, sladder og kåringen av Norges beste arbeidsplass. For jobbsøkere og folk som allerede er i arbeid.",
  path: "/nyheter",
});

export default async function NewsPage() {
  const news = await getNews(20);

  return (
    <PageShell>
      <p className="kicker">Redaksjonen</p>
      <h1 className="mt-2 font-serif text-4xl">Nyheter</h1>
      <p className="mt-3 max-w-xl text-muted">
        Arbeidsliv, arbeidsplassundersøkelsen og kåringen av Norges beste arbeidsplass.
      </p>
      {news.length ? (
        <div className="mt-8">
          {news.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-muted">Ingen saker publisert ennå.</p>
      )}
    </PageShell>
  );
}
