"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FIT_DIMENSIONS } from "@/lib/fit";

export function WorkStyleForm({ initial }) {
  const router = useRouter();
  const [answers, setAnswers] = useState(initial ?? {});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const complete = FIT_DIMENSIONS.every((dimension) => typeof answers[dimension.key] === "number");

  async function onSubmit(event) {
    event.preventDefault();
    if (!complete) {
      setError("Svar på alle seks spørsmålene.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ work_style: answers }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke lagre.");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-8">
      {FIT_DIMENSIONS.map((dimension) => (
        <fieldset key={dimension.key}>
          <legend className="text-lg leading-snug">{dimension.userPrompt}</legend>
          <p className="mt-1 text-xs text-muted">{dimension.label}</p>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const selected = answers[dimension.key] === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [dimension.key]: n }))}
                  className={`h-12 flex-1 border text-lg ${
                    selected ? "border-pine bg-pine text-paper" : "border-line bg-white hover:border-pine"
                  }`}
                  aria-pressed={selected}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between gap-4 text-xs text-muted">
            <span>{dimension.low}</span>
            <span className="text-right">{dimension.high}</span>
          </div>
        </fieldset>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-12 bg-rust px-5 text-paper hover:bg-rust-dark disabled:opacity-60"
        >
          {saving ? "Lagrer…" : initial ? "Oppdater arbeidstil" : "Lagre arbeidstil"}
        </button>
        {saved ? <p className="text-sm text-good">Lagret. Match vises på bedriftssidene.</p> : null}
      </div>
      {error ? <p className="text-sm text-rust">{error}</p> : null}
    </form>
  );
}
