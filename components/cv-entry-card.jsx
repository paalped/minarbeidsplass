"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CvEntryForm } from "@/components/cv-entry-form";
import { DateMenu } from "@/components/date-menu";
import { companyFromEntry, formatCvPeriod } from "@/lib/cv";

export function CvEntryCard({ entry }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [ending, setEnding] = useState(false);
  const [endedOn, setEndedOn] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const company = companyFromEntry(entry);

  async function onDelete() {
    if (!window.confirm("Fjerne denne jobben fra CV-en?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/cv/${entry.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke slette.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
      setBusy(false);
    }
  }

  async function onEnd(event) {
    event.preventDefault();
    if (!endedOn) {
      setError("Velg sluttdato.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/cv/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_orgnr: entry.company_orgnr,
          title: entry.title,
          started_on: entry.started_on,
          ended_on: endedOn,
          is_current: false,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke avslutte jobben.");
      setEnding(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <CvEntryForm
        mode={entry.is_current ? "current" : "previous"}
        entry={entry}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <article className="border-t border-line py-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="font-medium">
            <Link href={`/bedrifter/${company.orgnr}`} className="hover:text-rust">
              {company.name}
            </Link>
          </p>
          <p className="mt-1 text-sm text-muted">
            {[entry.title, formatCvPeriod(entry), company.municipality].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          {entry.is_current ? (
            <button type="button" className="text-rust underline" onClick={() => setEnding((v) => !v)}>
              Jeg har sluttet
            </button>
          ) : null}
          <button type="button" className="underline" onClick={() => setEditing(true)}>
            Rediger
          </button>
          <button type="button" className="text-muted underline" disabled={busy} onClick={() => void onDelete()}>
            Slett
          </button>
        </div>
      </div>
      {ending ? (
        <form onSubmit={onEnd} className="mt-3 flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <span className="text-sm font-medium">Sluttet</span>
            <DateMenu id={`end-${entry.id}`} label="Sluttet" value={endedOn} onChange={setEndedOn} />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="h-11 bg-pine px-4 text-paper hover:bg-pine-soft disabled:opacity-60"
          >
            Avslutt jobb
          </button>
        </form>
      ) : null}
      {error ? <p className="mt-2 text-sm text-rust">{error}</p> : null}
    </article>
  );
}
