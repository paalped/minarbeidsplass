"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProfileNameForm({ displayName }) {
  const router = useRouter();
  const [value, setValue] = useState(displayName ?? "");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: value }),
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
    <form onSubmit={onSubmit} className="mt-4 flex max-w-md flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="profile-name" className="text-sm font-medium">
          Kallenavn
        </label>
        <input
          id="profile-name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          minLength={2}
          className="mt-1 h-11 w-full border border-line bg-white px-3"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="h-11 bg-pine px-4 text-paper hover:bg-pine-soft disabled:opacity-60"
      >
        {saving ? "Lagrer…" : "Lagre"}
      </button>
      {error ? <p className="text-sm text-rust sm:col-span-2">{error}</p> : null}
      {saved ? <p className="text-sm text-good">Lagret.</p> : null}
    </form>
  );
}
