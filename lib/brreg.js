import { isBrregOrgnr } from "./format";

const BRREG_BASE = "https://data.brreg.no/enhetsregisteret/api";

function headers() {
  return {
    Accept: "application/json",
  };
}

function isActive(enhet) {
  return (
    !enhet.konkurs &&
    !enhet.underAvvikling &&
    !enhet.underTvangsavviklingEllerTvangsopplosning
  );
}

export function mapBrregEnhet(enhet) {
  if (!enhet.organisasjonsnummer || !enhet.navn) return null;
  const address = enhet.forretningsadresse ?? enhet.postadresse;
  const orgForm = [enhet.organisasjonsform?.kode, enhet.organisasjonsform?.beskrivelse]
    .filter(Boolean)
    .join(" · ");

  return {
    orgnr: enhet.organisasjonsnummer,
    name: enhet.navn,
    org_form: orgForm || null,
    nace_code: enhet.naeringskode1?.kode ?? null,
    nace_text: enhet.naeringskode1?.beskrivelse ?? null,
    municipality: address?.kommune ?? address?.poststed ?? null,
    employee_count: typeof enhet.antallAnsatte === "number" ? enhet.antallAnsatte : null,
    is_verified: true,
    brreg_fetched_at: new Date().toISOString(),
  };
}

export async function searchEnheter(query) {
  const q = query.trim();
  if (q.length < 2) return [];

  if (isBrregOrgnr(q)) {
    const one = await getEnhet(q);
    return one ? [one] : [];
  }

  const url = new URL(`${BRREG_BASE}/enheter`);
  url.searchParams.set("navn", q);
  url.searchParams.set("size", "8");

  const res = await fetch(url, { headers: headers(), next: { revalidate: 60 } });
  if (!res.ok) return [];

  const json = await res.json();
  const enheter = json._embedded?.enheter ?? [];
  return enheter.filter(isActive).map(mapBrregEnhet).filter(Boolean);
}

export async function getEnhet(orgnr) {
  const clean = orgnr.trim();
  if (!isBrregOrgnr(clean)) return null;

  const res = await fetch(`${BRREG_BASE}/enheter/${clean}`, {
    headers: headers(),
    next: { revalidate: 3600 },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;

  const json = await res.json();
  if (!isActive(json)) return null;
  return mapBrregEnhet(json);
}

export async function getEnhetRoller(orgnr) {
  const clean = orgnr.trim();
  if (!isBrregOrgnr(clean)) return [];

  const res = await fetch(`${BRREG_BASE}/enheter/${clean}/roller`, {
    headers: headers(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];

  const json = await res.json();
  const groups = json._embedded?.rollegrupper ?? [];
  const roles = [];
  for (const group of groups) {
    for (const role of group.roller ?? []) {
      const person = role.person?.navn;
      const name = [person?.fornavn, person?.mellomnavn, person?.etternavn].filter(Boolean).join(" ");
      const orgName = role.enhet?.navn ?? role.fullmektig?.navn;
      roles.push({
        type: role.type?.beskrivelse ?? group.type?.beskrivelse ?? "Rolle",
        name: name || orgName || null,
      });
    }
  }
  return roles;
}
