import Link from "next/link";
import { formatDate } from "@/lib/format";

export function NewsCard({ article }) {
  return (
    <article className="border-t border-line py-5">
      <p className="kicker">{formatDate(article.published_at)}</p>
      <h3 className="mt-2 font-serif text-xl leading-tight">
        <Link href={`/nyheter/${article.slug}`} className="hover:text-rust">
          {article.title}
        </Link>
      </h3>
      <p className="mt-3 text-muted">{article.excerpt}</p>
    </article>
  );
}
