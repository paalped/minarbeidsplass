"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BrandingForm({ orgnr, initial }) {
  const router = useRouter();
  const [form, setForm] = useState({
    intro: initial?.intro ?? "",
    values_text: initial?.values_text ?? "",
    logo_url: initial?.logo_url ?? "",
    banner_url: initial?.banner_url ?? "",
    career_url: initial?.career_url ?? "",
  });
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/b2b/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgnr, ...form }),
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
    <form onSubmit={onSubmit} className="mt-6 grid max-w-2xl gap-4">
      <Field label="Introduksjon">
        <textarea
          value={form.intro}
          onChange={(e) => setField("intro", e.target.value)}
          maxLength={2000}
          rows={5}
          className="mt-1 w-full border border-line bg-white px-3 py-2"
        />
      </Field>
      <Field label="Kjerneverdier">
        <textarea
          value={form.values_text}
          onChange={(e) => setField("values_text", e.target.value)}
          maxLength={1000}
          rows={3}
          className="mt-1 w-full border border-line bg-white px-3 py-2"
        />
      </Field>
      <Field label="Logo (https-lenke)">
        <input
          value={form.logo_url}
          onChange={(e) => setField("logo_url", e.target.value)}
          className="mt-1 h-11 w-full border border-line bg-white px-3"
        />
      </Field>
      <Field label="Banner (https-lenke)">
        <input
          value={form.banner_url}
          onChange={(e) => setField("banner_url", e.target.value)}
          className="mt-1 h-11 w-full border border-line bg-white px-3"
        />
      </Field>
      <Field label="Karriereside (https-lenke)">
        <input
          value={form.career_url}
          onChange={(e) => setField("career_url", e.target.value)}
          className="mt-1 h-11 w-full border border-line bg-white px-3"
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className="h-12 bg-pine px-5 text-paper hover:bg-pine-soft disabled:opacity-60">
          {saving ? "Lagrer…" : "Lagre profil"}
        </button>
        {saved ? <p className="text-sm text-good">Lagret. Synlig på den offentlige bedriftssiden.</p> : null}
      </div>
      {error ? <p className="text-sm text-rust">{error}</p> : null}
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
