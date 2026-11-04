import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PageShell } from "@/components/page-shell";
import { getNewsBySlug } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { articleJsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return { title: "Nyhet" };
  return pageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/nyheter/${article.slug}`,
    type: "article",
    publishedTime: article.published_at,
  });
}

export default async function NewsArticlePage({ params }) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const paragraphs = article.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <PageShell>
      <JsonLd data={articleJsonLd(article)} />
      <article className="mx-auto max-w-2xl">
        <p className="kicker">{formatDate(article.published_at)}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight">{article.title}</h1>
        <p className="mt-4 text-lg text-muted">{article.excerpt}</p>
        <div className="mt-10 space-y-5 text-lg leading-relaxed">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </article>
    </PageShell>
  );
}
