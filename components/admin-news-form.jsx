"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify, toDatetimeLocal } from "@/lib/news-admin";

export function AdminNewsForm({ article }) {
  const router = useRouter();
  const editing = Boolean(article);
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(Boolean(article?.slug));
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [publishedAt, setPublishedAt] = useState(
    toDatetimeLocal(article?.published_at ?? new Date().toISOString()),
  );
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function onTitle(value) {
    setTitle(value);
    if (!slugLocked) setSlug(slugify(value));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(editing ? `/api/admin/news/${article.id}` : "/api/admin/news", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          body,
          published_at: publishedAt,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke lagre saken.");
      router.push("/admin/nyheter");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!editing) return;
    if (!window.confirm("Slette denne saken? Det kan ikke angres.")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/news/${article.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke slette saken.");
      router.push("/admin/nyheter");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
      setSaving(false);
    }
  }

  const field = "mt-1 w-full border border-line bg-white px-3 py-2";

  return (
    <form onSubmit={onSubmit} className="paper-card mt-8 grid gap-5 p-6">
      <div>
        <label htmlFor="news-title" className="text-sm font-medium">
          Tittel
        </label>
        <input
          id="news-title"
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          required
          className={`h-11 ${field}`}
        />
      </div>
      <div>
        <label htmlFor="news-slug" className="text-sm font-medium">
          Nettadresse
        </label>
        <input
          id="news-slug"
          value={slug}
          onChange={(e) => {
            setSlugLocked(true);
            setSlug(e.target.value);
          }}
          required
          className={`h-11 ${field}`}
        />
        <p className="mt-1 text-xs text-muted">/nyheter/{slug || "…"}</p>
      </div>
      <div>
        <label htmlFor="news-excerpt" className="text-sm font-medium">
          Ingress
        </label>
        <textarea
          id="news-excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          required
          rows={3}
          className={field}
        />
      </div>
      <div>
        <label htmlFor="news-body" className="text-sm font-medium">
          Brødtekst
        </label>
        <textarea
          id="news-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={12}
          className={field}
        />
        <p className="mt-1 text-xs text-muted">Tom linje mellom avsnitt.</p>
      </div>
      <div>
        <label htmlFor="news-published" className="text-sm font-medium">
          Publisert
        </label>
        <input
          id="news-published"
          type="datetime-local"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          required
          className={`h-11 ${field}`}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-12 bg-rust px-5 text-paper hover:bg-rust-dark disabled:opacity-60"
        >
          {saving ? "Lagrer…" : editing ? "Oppdater sak" : "Publiser sak"}
        </button>
        {editing ? (
          <button
            type="button"
            disabled={saving}
            onClick={() => void onDelete()}
            className="h-12 px-4 text-sm text-rust underline disabled:opacity-60"
          >
            Slett
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-rust">{error}</p> : null}
    </form>
  );
}
