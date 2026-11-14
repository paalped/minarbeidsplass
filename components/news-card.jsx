import Link from "next/link";
import { formatDate } from "@/lib/format";
import { articlePath, articleTopicLabel } from "@/lib/job-articles";

export function NewsCard({ article }) {
  const kicker = article.search_query || articleTopicLabel(article.topic);
  return (
    <article className="border-t border-line py-5">
      <p className="kicker">
        {article.kind === "sak" ? formatDate(article.published_at) : kicker}
      </p>
      <h3 className="mt-2 font-serif text-xl leading-tight">
        <Link href={articlePath(article.slug)} className="hover:text-rust">
          {article.title}
        </Link>
      </h3>
      <p className="mt-3 text-muted">{article.excerpt}</p>
    </article>
  );
}
