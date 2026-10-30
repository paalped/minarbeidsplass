export function formatScore(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "–";
  return value.toFixed(1).replace(".", ",");
}

export function formatOrgnr(orgnr) {
  if (/^\d{9}$/.test(orgnr)) {
    return `${orgnr.slice(0, 3)} ${orgnr.slice(3, 6)} ${orgnr.slice(6)}`;
  }
  return orgnr;
}

export function formatNumber(value) {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat("nb-NO").format(value);
}

export function formatDate(iso, options) {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(new Date(iso));
}

export function formatDateTime(iso) {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function isBrregOrgnr(value) {
  return /^\d{9}$/.test(value.trim());
}
