import { getSessionUser } from "./data";
import { createClient } from "./supabase/server";

const OSLO = "Europe/Oslo";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function osloDate(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: OSLO }).format(new Date(value));
}

export function countBuckets(timestamps) {
  const today = osloDate();
  const weekFrom = Date.now() - WEEK_MS;
  let week = 0;
  let day = 0;
  for (const stamp of timestamps) {
    if (!stamp) continue;
    const ms = new Date(stamp).getTime();
    if (Number.isNaN(ms)) continue;
    if (ms >= weekFrom) week += 1;
    if (osloDate(stamp) === today) day += 1;
  }
  return { total: timestamps.length, week, today: day };
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) return { user: null, supabase: null, ok: false };
  const supabase = await createClient();
  if (!supabase || !user.isAdmin) return { user, supabase, ok: false };
  return { user, supabase, ok: true };
}

export function csvEscape(value) {
  if (value == null) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(headers, rows) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((key) => csvEscape(row[key])).join(","));
  }
  return `\uFEFF${lines.join("\n")}`;
}

export async function fetchAll(queryFactory) {
  const pageSize = 1000;
  const rows = [];
  let from = 0;
  while (true) {
    const { data, error } = await queryFactory().range(from, from + pageSize - 1);
    if (error) throw error;
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}
