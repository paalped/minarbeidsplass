"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PLANS } from "@/lib/b2b";

export function ClaimActions({ claimId }) {
  const router = useRouter();
  const [error, setError] = useState(null);

  async function run(action) {
    setError(null);
    const res = await fetch("/api/admin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, claim_id: claimId }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Kunne ikke oppdatere.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="h-10 bg-pine px-3 text-paper" onClick={() => run("approve")}>
        Godkjenn
      </button>
      <button type="button" className="h-10 border border-line px-3" onClick={() => run("reject")}>
        Avvis
      </button>
      {error ? <p className="w-full text-sm text-rust">{error}</p> : null}
    </div>
  );
}

export function PlanSelect({ orgnr, plan }) {
  const router = useRouter();
  async function onChange(event) {
    await fetch("/api/admin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "plan", orgnr, plan: event.target.value }),
    });
    router.refresh();
  }
  return (
    <select defaultValue={plan ?? "basic"} onChange={onChange} className="h-10 border border-line bg-white px-2">
      {PLANS.map((item) => (
        <option key={item.key} value={item.key}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
