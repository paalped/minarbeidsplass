"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { formatDateTime } from "@/lib/format";

export function ArticleComments({ slug, user, comments }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/artikler/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke kommentere.");
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSending(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Slette kommentaren?")) return;
    setError(null);
    const res = await fetch(`/api/artikler/${encodeURIComponent(slug)}/comments/${id}`, {
      method: "DELETE",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Kunne ikke slette.");
      return;
    }
    router.refresh();
  }

  return (
    <section id="kommentarer" className="mt-16 border-t border-line pt-10">
      <p className="kicker">Samtalen</p>
      <h2 className="mt-2 font-serif text-3xl">Kommentarer</h2>
      <p className="mt-3 max-w-xl text-muted">
        Si hvordan det kjennes, eller hvordan Min Arbeidsplass kan treffe bedre. Innlogging kreves,
        så rommet holder seg voksen.
      </p>

      {comments.length ? (
        <ul className="mt-8 space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="paper-card p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium">{comment.display_name}</p>
                <p className="text-xs text-muted">{formatDateTime(comment.created_at)}</p>
              </div>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed">{comment.body}</p>
              {user?.id === comment.user_id ? (
                <button
                  type="button"
                  onClick={() => void onDelete(comment.id)}
                  className="mt-3 text-sm text-rust underline"
                >
                  Slett
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-muted">Ingen kommentarer ennå. Vær den første.</p>
      )}

      <div className="mt-8">
        {user ? (
          <form onSubmit={onSubmit} className="paper-card grid gap-3 p-5">
            <label htmlFor="article-comment" className="text-sm font-medium">
              Kommenter som {user.displayName}
            </label>
            <textarea
              id="article-comment"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              required
              minLength={3}
              maxLength={2000}
              rows={5}
              placeholder="Hva kjenner du på — og hva skulle du ønske arbeidsplassen visste?"
              className="border border-line bg-white px-3 py-2"
            />
            <button
              type="submit"
              disabled={sending}
              className="h-12 bg-rust text-paper hover:bg-rust-dark disabled:opacity-60"
            >
              {sending ? "Sender…" : "Publiser kommentar"}
            </button>
            {error ? <p className="text-sm text-rust">{error}</p> : null}
          </form>
        ) : (
          <div>
            <p className="mb-4 text-muted">Logg inn for å kommentere.</p>
            <LoginForm nextPath={`/artikler/${slug}#kommentarer`} />
            {error ? <p className="mt-3 text-sm text-rust">{error}</p> : null}
          </div>
        )}
      </div>
    </section>
  );
}
