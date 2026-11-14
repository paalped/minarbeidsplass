"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ImportJobArticlesButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  async function onClick() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/news/import-guides", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke importere.");
      setMessage(`${json.count} jobbartikler er på plass.`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={busy}
        className="inline-flex h-12 items-center border border-line px-4 hover:bg-paper-2 disabled:opacity-60"
      >
        {busy ? "Importerer…" : "Importer 100 jobbartikler"}
      </button>
      {message ? <p className="mt-2 text-sm text-muted">{message}</p> : null}
    </div>
  );
}
