"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GossipForm({ orgnr, defaultNickname }) {
  const router = useRouter();
  const [nickname, setNickname] = useState(defaultNickname ?? "Anonym");
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_orgnr: orgnr, nickname, body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke legge ut innlegget.");
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="paper-card p-4">
      <p className="kicker">Si det som det er</p>
      <div className="mt-3 grid gap-3">
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={40}
          placeholder="Kallenavn"
          className="h-11 border border-line bg-white px-3"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={3}
          maxLength={2000}
          rows={4}
          placeholder="Sladder, ros, advarsler — hold det sant."
          className="border border-line bg-white px-3 py-2"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted">Ingen innlogging kreves. Ikke del personopplysninger.</p>
          <button
            type="submit"
            disabled={sending}
            className="bg-rust px-4 py-2 text-sm text-paper hover:bg-rust-dark disabled:opacity-60"
          >
            {sending ? "Sender…" : "Publiser"}
          </button>
        </div>
        {error ? <p className="text-sm text-rust">{error}</p> : null}
      </div>
    </form>
  );
}
