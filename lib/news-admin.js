export function slugify(title) {
  return String(title ?? "")
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function toDatetimeLocal(iso) {
  if (!iso) return "";
  const formatted = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
  return formatted.replace(" ", "T");
}

export function fromDatetimeLocal(value) {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function validateArticle(body) {
  const title = String(body.title ?? "").trim();
  const slug = slugify(body.slug || title);
  const excerpt = String(body.excerpt ?? "").trim();
  const text = String(body.body ?? "").trim();
  const published_at = fromDatetimeLocal(body.published_at);

  if (title.length < 3) return { error: "Tittelen må ha minst tre tegn." };
  if (!slug) return { error: "Slug mangler. Bruk bare små bokstaver, tall og bindestrek." };
  if (excerpt.length < 3) return { error: "Ingressen må ha minst tre tegn." };
  if (text.length < 10) return { error: "Saken må ha mer innhold." };
  if (!published_at) return { error: "Ugyldig publiseringstid." };

  return { article: { title, slug, excerpt, body: text, published_at } };
}
