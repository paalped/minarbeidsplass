"use client";

import { useMemo, useState } from "react";
import { NewsCard } from "@/components/news-card";
import { ARTICLE_TOPICS } from "@/lib/job-articles";

const filters = [{ key: "alle", label: "Alle" }, { key: "sak", label: "Saker" }, ...ARTICLE_TOPICS];

export function ArticleIndex({ articles }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("alle");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return articles.filter((article) => {
      if (topic === "sak" && article.kind !== "sak") return false;
      if (topic !== "alle" && topic !== "sak" && article.topic !== topic) return false;
      if (!needle) return true;
      const hay = [article.title, article.excerpt, article.search_query]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [articles, query, topic]);

  return (
    <div className="mt-8">
      <label htmlFor="article-search" className="text-sm font-medium">
        Søk i artiklene
      </label>
      <input
        id="article-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Ny jobb, søndagsangst, lønn…"
        className="mt-1 h-12 w-full max-w-xl border border-line bg-white px-3"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setTopic(filter.key)}
            className={`h-9 px-3 text-sm ${
              topic === filter.key ? "bg-pine text-paper" : "border border-line bg-white hover:bg-paper-2"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">{visible.length} artikler</p>
      {visible.length ? (
        <div className="mt-2">
          {visible.map((article) => (
            <NewsCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-muted">Ingen artikler traff søket.</p>
      )}
    </div>
  );
}
