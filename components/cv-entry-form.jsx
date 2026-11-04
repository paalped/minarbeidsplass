"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompanySearch } from "@/components/company-search";
import { DateMenu } from "@/components/date-menu";
import { companyFromEntry, dateToIso } from "@/lib/cv";

export function CvEntryForm({ mode = "previous", entry, onCancel }) {
  const router = useRouter();
  const editing = Boolean(entry);
  const isCurrent = mode === "current" || entry?.is_current;
  const [company, setCompany] = useState(editing ? companyFromEntry(entry) : null);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [startedOn, setStartedOn] = useState(dateToIso(entry?.started_on));
  const [endedOn, setEndedOn] = useState(dateToIso(entry?.ended_on));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (!company?.orgnr) {
      setError("Velg en bedrift først.");
      return;
    }
    if (!startedOn) {
      setError("Velg startdato.");
      return;
    }
    if (!isCurrent && !endedOn) {
      setError("Velg sluttdato.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(editing ? `/api/cv/${entry.id}` : "/api/cv", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_orgnr: company.orgnr,
          title,
          started_on: startedOn,
          ended_on: isCurrent ? null : endedOn,
          is_current: isCurrent,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke lagre.");
      router.refresh();
      onCancel?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSaving(false);
    }
  }

  const field = "mt-1 h-11 w-full border border-line bg-white px-3";

  return (
    <form onSubmit={onSubmit} className="paper-card mt-4 grid gap-4 p-5">
      {company ? (
        <div className="flex items-baseline justify-between gap-3">
          <p>
            <span className="font-medium">{company.name}</span>
            {company.municipality ? (
              <span className="ml-2 text-sm text-muted">{company.municipality}</span>
            ) : null}
          </p>
          {!editing ? (
            <button type="button" className="text-sm text-rust underline" onClick={() => setCompany(null)}>
              Bytt
            </button>
          ) : null}
        </div>
      ) : (
        <CompanySearch
          size="md"
          onPick={setCompany}
          inputId={isCurrent ? "cv-current-search" : "cv-previous-search"}
          label="Finn arbeidsplassen"
        />
      )}
      <div>
        <label htmlFor="cv-title" className="text-sm font-medium">
          Stilling (valgfritt)
        </label>
        <input
          id="cv-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="F.eks. rådgiver"
          className={field}
        />
      </div>
      <div className={`grid gap-4 ${isCurrent ? "" : "sm:grid-cols-2"}`}>
        <div>
          <span id="cv-start-label" className="text-sm font-medium">
            Startet
          </span>
          <DateMenu id="cv-start" label="Startet" value={startedOn} onChange={setStartedOn} />
        </div>
        {isCurrent ? null : (
          <div>
            <span id="cv-end-label" className="text-sm font-medium">
              Sluttet
            </span>
            <DateMenu id="cv-end" label="Sluttet" value={endedOn} onChange={setEndedOn} />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-11 bg-rust px-5 text-paper hover:bg-rust-dark disabled:opacity-60"
        >
          {saving ? "Lagrer…" : editing ? "Oppdater" : isCurrent ? "Lagre nåværende jobb" : "Legg til i CV"}
        </button>
        {onCancel ? (
          <button type="button" className="h-11 px-3 text-sm underline" onClick={onCancel}>
            Avbryt
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-rust">{error}</p> : null}
    </form>
  );
}
