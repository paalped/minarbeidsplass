"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COMPANY_ROLES, companyRoleLabel } from "@/lib/b2b";

export function InviteForm({ orgnr }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("responder");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/b2b/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgnr, email, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke invitere.");
      setEmail("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex-1">
        <span className="text-sm font-medium">E-post</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 h-11 w-full border border-line bg-white px-3"
        />
      </label>
      <label>
        <span className="text-sm font-medium">Rolle</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 h-11 border border-line bg-white px-3"
        >
          {COMPANY_ROLES.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={saving} className="h-11 bg-pine px-4 text-paper hover:bg-pine-soft disabled:opacity-60">
        {saving ? "Sender…" : "Inviter"}
      </button>
      {error ? <p className="text-sm text-rust sm:col-span-2">{error}</p> : null}
    </form>
  );
}

export function MemberActions({ orgnr, member, currentUserId }) {
  const router = useRouter();
  const [error, setError] = useState(null);
  if (member.user_id === currentUserId) return null;

  async function patch(payload) {
    setError(null);
    const res = await fetch("/api/b2b/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgnr, user_id: member.user_id, ...payload }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Kunne ikke oppdatere.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted">{companyRoleLabel(member.role)}</span>
      {member.status === "active" ? (
        <>
          <button type="button" className="underline" onClick={() => patch({ role: member.role === "admin" ? "responder" : "admin" })}>
            {member.role === "admin" ? "Gjør til svarer" : "Gjør til admin"}
          </button>
          <button type="button" className="underline text-rust" onClick={() => patch({ status: "revoked" })}>
            Trekk tilbake
          </button>
        </>
      ) : (
        <button type="button" className="underline" onClick={() => patch({ status: "active" })}>
          Aktiver
        </button>
      )}
      {error ? <p className="w-full text-rust">{error}</p> : null}
    </div>
  );
}

export function InviteDelete({ orgnr, id }) {
  const router = useRouter();
  async function onClick() {
    await fetch(`/api/b2b/invites?id=${encodeURIComponent(id)}&orgnr=${encodeURIComponent(orgnr)}`, {
      method: "DELETE",
    });
    router.refresh();
  }
  return (
    <button type="button" className="text-sm underline" onClick={onClick}>
      Slett
    </button>
  );
}
