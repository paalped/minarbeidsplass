"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/format";

export function EmployerReplyList({ orgnr, posts }) {
  if (!posts.length) {
    return <p className="mt-6 text-muted">Ingen omtaler å svare på ennå.</p>;
  }

  return (
    <ul className="mt-6 space-y-4">
      {posts.map((post) => (
        <li key={post.id} className="paper-card p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-medium">{post.nickname || "Anonym"}</p>
            <time className="text-xs text-muted">{formatDateTime(post.created_at)}</time>
          </div>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed">{post.body}</p>
          <ReplyForm orgnr={orgnr} post={post} />
        </li>
      ))}
    </ul>
  );
}

function ReplyForm({ orgnr, post }) {
  const router = useRouter();
  const existing = post.reply?.body ?? "";
  const [body, setBody] = useState(existing);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/b2b/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgnr, post_id: post.id, body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke lagre svaret.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 border-t border-line pt-4">
      <p className="kicker">Verifisert arbeidsgiver</p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={2000}
        required
        className="mt-2 w-full border border-line bg-white px-3 py-2"
        placeholder="Ett offisielt svar. Dere kan ikke fjerne innlegget."
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className="h-11 bg-pine px-4 text-paper hover:bg-pine-soft disabled:opacity-60">
          {saving ? "Lagrer…" : existing ? "Oppdater svar" : "Publiser svar"}
        </button>
        {error ? <p className="text-sm text-rust">{error}</p> : null}
      </div>
    </form>
  );
}
