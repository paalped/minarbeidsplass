import { isSupabaseConfigured } from "@/lib/supabase/env";

export function SetupBanner() {
  if (isSupabaseConfigured()) return null;

  return (
    <div className="bg-rust px-4 py-2 text-center text-sm text-paper">
      Supabase er ikke konfigurert ennå. Firmasøk mot Brreg virker, men kåring, nyheter, chat og
      lagring krever nøkler i <code className="font-mono">.env.local</code>.
    </div>
  );
}
