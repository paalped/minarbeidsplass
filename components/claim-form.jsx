"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompanySearch } from "@/components/company-search";
import { CLAIM_ROLES } from "@/lib/b2b";

export function ClaimForm() {
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [declaredRole, setDeclaredRole] = useState("daglig_leder");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (!company?.orgnr) {
      setError("Søk opp bedriften i Enhetsregisteret først.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/b2b/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgnr: company.orgnr, declared_role: declaredRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke sende krav.");
      router.push("/bedrift");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid max-w-xl gap-6">
      <CompanySearch
        allowManual={false}
        onPick={setCompany}
        label="Bedrift i Enhetsregisteret"
        inputId="claim-company"
      />
      {company ? (
        <p className="text-sm text-muted">
          Valgt: {company.name} · {company.orgnr}
        </p>
      ) : null}
      <div>
        <p className="text-sm font-medium">Din rolle</p>
        <div className="mt-2 grid gap-2">
          {CLAIM_ROLES.map((role) => (
            <label key={role.key} className="flex items-center gap-2 border border-line bg-white px-3 py-2">
              <input
                type="radio"
                name="declared_role"
                value={role.key}
                checked={declaredRole === role.key}
                onChange={() => setDeclaredRole(role.key)}
              />
              {role.label}
            </label>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="h-12 bg-rust px-5 text-paper hover:bg-rust-dark disabled:opacity-60"
      >
        {saving ? "Sender…" : "Send inn krav"}
      </button>
      {error ? <p className="text-sm text-rust">{error}</p> : null}
    </form>
  );
}
