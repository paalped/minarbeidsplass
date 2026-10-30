"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ nextPath = "/" }) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase er ikke konfigurert.");
      return;
    }
    setSending(true);
    setError(null);
    const origin = window.location.origin;
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: displayName.trim() ? { display_name: displayName.trim() } : undefined,
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    setSending(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="paper-card p-6">
        <p className="kicker">Sjekk innboksen</p>
        <h2 className="mt-2 font-serif text-2xl">Vi har sendt en innloggingslenke</h2>
        <p className="mt-3 text-muted">
          Åpne e-posten fra {email} og klikk lenken. Den tar deg tilbake hit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="paper-card grid gap-4 p-6">
      <div>
        <label htmlFor="display-name" className="text-sm font-medium">
          Kallenavn (valgfritt)
        </label>
        <input
          id="display-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="F.eks. Gangen ved kaffemaskinen"
          className="mt-1 h-11 w-full border border-line bg-white px-3"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          E-post
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deg@epost.no"
          className="mt-1 h-11 w-full border border-line bg-white px-3"
        />
      </div>
      <button
        type="submit"
        disabled={sending}
        className="h-12 bg-rust text-paper hover:bg-rust-dark disabled:opacity-60"
      >
        {sending ? "Sender…" : "Send magisk lenke"}
      </button>
      {error ? <p className="text-sm text-rust">{error}</p> : null}
    </form>
  );
}
