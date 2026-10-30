"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatOrgnr } from "@/lib/format";

export function CompanySearch({ intent = "view", size = "lg", autoFocus = false }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manual, setManual] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPlace, setManualPlace] = useState("");
  const [error, setError] = useState(null);
  const boxRef = useRef(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const handle = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/brreg/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setResults(json.companies ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function onClick(event) {
      if (!boxRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function goToCompany(company) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });
      const json = await res.json();
      if (!res.ok || !json.company) {
        if (company.source === "brreg") {
          router.push(
            intent === "survey" ? `/undersokelse/${company.orgnr}` : `/bedrifter/${company.orgnr}`,
          );
          return;
        }
        throw new Error(json.error ?? "Kunne ikke lagre bedriften.");
      }
      const path =
        intent === "survey"
          ? `/undersokelse/${json.company.orgnr}`
          : `/bedrifter/${json.company.orgnr}`;
      router.push(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSaving(false);
    }
  }

  async function submitManual(event) {
    event.preventDefault();
    if (manualName.trim().length < 2) return;
    await goToCompany({
      orgnr: "",
      source: "manual",
      name: manualName.trim(),
      municipality: manualPlace.trim() || undefined,
    });
  }

  const inputClass =
    size === "lg"
      ? "h-14 w-full border border-pine bg-white px-4 text-lg outline-none focus:ring-2 focus:ring-rust"
      : "h-11 w-full border border-pine bg-white px-3 outline-none focus:ring-2 focus:ring-rust";

  return (
    <div ref={boxRef} className="w-full">
      <label className="kicker" htmlFor="company-search">
        Søk i Enhetsregisteret
      </label>
      <div className="relative mt-2">
        <input
          id="company-search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Firmanavn eller organisasjonsnummer"
          className={inputClass}
          autoComplete="off"
        />
        {loading ? (
          <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-muted">Søker…</span>
        ) : null}
        {open && results.length > 0 ? (
          <ul className="paper-card absolute z-20 mt-1 max-h-80 w-full overflow-auto shadow-lg">
            {results.map((company) => (
              <li key={company.orgnr}>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => goToCompany({ orgnr: company.orgnr, source: "brreg" })}
                  className="flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left hover:bg-paper-2"
                >
                  <span className="font-medium">{company.name}</span>
                  <span className="text-xs text-muted">
                    {formatOrgnr(company.orgnr)}
                    {company.municipality ? ` · ${company.municipality}` : ""}
                    {company.org_form ? ` · ${company.org_form}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          className="text-rust underline underline-offset-4"
          onClick={() => setManual((v) => !v)}
        >
          Finner du ikke bedriften? Legg inn manuelt
        </button>
        {saving ? <span className="text-muted">Lagrer…</span> : null}
      </div>
      {manual ? (
        <form onSubmit={submitManual} className="paper-card mt-3 grid gap-3 p-4 sm:grid-cols-2">
          <input
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="Firmanavn"
            required
            className="h-11 border border-line bg-white px-3"
          />
          <input
            value={manualPlace}
            onChange={(e) => setManualPlace(e.target.value)}
            placeholder="Kommune (valgfritt)"
            className="h-11 border border-line bg-white px-3"
          />
          <button
            type="submit"
            disabled={saving}
            className="h-11 bg-pine px-4 text-paper sm:col-span-2 hover:bg-pine-soft"
          >
            Fortsett uten Brreg
          </button>
        </form>
      ) : null}
      {error ? <p className="mt-2 text-sm text-rust">{error}</p> : null}
    </div>
  );
}
