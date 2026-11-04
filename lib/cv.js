const MONTH = /^\d{4}-\d{2}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export function monthToDate(value) {
  const text = String(value ?? "").trim();
  if (MONTH.test(text)) return `${text}-01`;
  if (DAY.test(text)) return text;
  return null;
}

export function dateToMonth(value) {
  if (!value) return "";
  return String(value).slice(0, 7);
}

export function dateToIso(value) {
  const text = String(value ?? "").trim();
  if (DAY.test(text.slice(0, 10))) return text.slice(0, 10);
  if (MONTH.test(text.slice(0, 7))) return `${text.slice(0, 7)}-01`;
  return "";
}

function formatDateNb(value) {
  const iso = dateToIso(value);
  if (!iso) return "";
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

export function formatCvPeriod(entry) {
  const start = formatDateNb(entry?.started_on);
  if (!start) return "";
  if (entry?.is_current || !entry?.ended_on) return `${start} – nå`;
  return `${start} – ${formatDateNb(entry.ended_on)}`;
}

export function companyFromEntry(entry) {
  return (
    entry?.company ?? {
      orgnr: entry?.company_orgnr,
      name: entry?.company_orgnr ?? "Bedrift",
      municipality: null,
    }
  );
}

export function currentWorkplace(entries) {
  return (entries ?? []).find((entry) => entry.is_current) ?? null;
}

export function previousEntries(entries) {
  return (entries ?? []).filter((entry) => !entry.is_current);
}

export function previousWorkplaces(entries) {
  const seen = new Set();
  const list = [];
  for (const entry of previousEntries(entries)) {
    if (seen.has(entry.company_orgnr)) continue;
    seen.add(entry.company_orgnr);
    list.push(entry);
  }
  return list;
}

export function cvRelation(entries, orgnr) {
  const forCompany = (entries ?? []).filter((entry) => entry.company_orgnr === orgnr);
  if (forCompany.some((entry) => !entry.is_current && entry.ended_on)) return "previous";
  if (forCompany.some((entry) => entry.is_current)) return "current";
  return "none";
}

export function validateCvPayload(body) {
  const company_orgnr = String(body.company_orgnr ?? "").trim();
  const title = String(body.title ?? "").trim().slice(0, 120) || null;
  const is_current = Boolean(body.is_current);
  const started_on = monthToDate(body.started_on);
  const ended_on = is_current ? null : monthToDate(body.ended_on);

  if (!company_orgnr) return { error: "Velg en bedrift." };
  if (!started_on) return { error: "Oppgi når du startet." };
  if (!is_current && !ended_on) return { error: "Tidligere jobber må ha sluttdato." };
  if (!is_current && ended_on < started_on) {
    return { error: "Sluttdato kan ikke være før startdato." };
  }

  return {
    entry: {
      company_orgnr,
      title,
      started_on,
      ended_on,
      is_current,
    },
  };
}
