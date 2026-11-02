function clean(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getSupabaseEnv() {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url || !anonKey) return null;
  if (url.includes("YOUR_PROJECT")) return null;
  if (!isHttpUrl(url)) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured() {
  return getSupabaseEnv() !== null;
}

export function getSiteUrl() {
  const fromEnv = clean(process.env.NEXT_PUBLIC_SITE_URL);
  if (isHttpUrl(fromEnv)) return fromEnv;
  return "http://localhost:3000";
}
