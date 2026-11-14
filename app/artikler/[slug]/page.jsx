import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleComments } from "@/components/article-comments";
import { CompanySearch } from "@/components/company-search";
import { JsonLd } from "@/components/json-ld";
import { PageShell } from "@/components/page-shell";
import { getArticleComments, getNewsBySlug, getSessionUser } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { articlePath, articleTopicLabel, relatedJobArticles } from "@/lib/job-articles";
import { articleJsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return { title: "Artikkel" };
  return pageMetadata({
    title: article.title,
    description: article.excerpt,
    path: articlePath(article.slug),
    type: "article",
    publishedTime: article.published_at,
  });
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const [user, comments] = await Promise.all([getSessionUser(), getArticleComments(slug)]);
  const paragraphs = article.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const related = relatedJobArticles(article);
  const kicker = article.search_query || articleTopicLabel(article.topic);

  return (
    <PageShell>
      <JsonLd data={articleJsonLd(article)} />
      <article className="mx-auto max-w-2xl">
        <p className="kicker">{article.kind === "sak" ? formatDate(article.published_at) : kicker}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight">{article.title}</h1>
        <p className="mt-4 text-lg text-muted">{article.excerpt}</p>
        <div className="mt-10 space-y-5 text-lg leading-relaxed">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      <aside className="mx-auto mt-12 max-w-2xl bg-pine px-5 py-8 text-paper sm:px-8">
        <p className="kicker text-paper-2">Min Arbeidsplass</p>
        <h2 className="mt-2 font-serif text-2xl">Søk opp arbeidsplassen</h2>
        <p className="mt-3 text-paper-2">
          Score, sladder og kåring — fra folk som har vært der. Ikke fra brosjyren.
        </p>
        <div className="mt-6">
          <CompanySearch intent="view" size="md" inputId={`search-${article.slug}`} />
        </div>
      </aside>

      {related.length ? (
        <aside className="mx-auto mt-12 max-w-2xl">
          <p className="kicker">Les mer</p>
          <ul className="mt-3 space-y-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={articlePath(item.slug)} className="font-serif text-xl hover:text-rust">
                  {item.title}
                </Link>
                <p className="mt-1 text-sm text-muted">{item.excerpt}</p>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}

      <div className="mx-auto max-w-2xl">
        <ArticleComments slug={article.slug} user={user} comments={comments} />
      </div>
    </PageShell>
  );
}
