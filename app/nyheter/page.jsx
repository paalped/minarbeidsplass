import { NewsCard } from "@/components/news-card";
import { PageShell } from "@/components/page-shell";
import { getNews } from "@/lib/data";

export const metadata = { title: "Nyheter" };

export default async function NewsPage() {
  const news = await getNews(20);
  const featured = news[0];
  const rest = news.slice(1);

  return (
    <PageShell>
      <p className="kicker">Redaksjonen</p>
      <h1 className="mt-2 font-serif text-4xl">Nyheter</h1>
      {featured ? (
        <div className="mt-8">
          <NewsCard article={featured} featured />
          <div className="mt-4">
            {rest.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-6 text-muted">Ingen saker publisert ennå.</p>
      )}
    </PageShell>
  );
}
