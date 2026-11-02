"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const env = getSupabaseEnv();
  if (!env) return null;
  try {
    return createBrowserClient(env.url, env.anonKey);
  } catch {
    return null;
  }
}
