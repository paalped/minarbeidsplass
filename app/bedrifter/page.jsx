import Link from "next/link";
import { CompanySearch } from "@/components/company-search";
import { PageShell } from "@/components/page-shell";
import { getRecentCompanies } from "@/lib/data";
import { formatOrgnr } from "@/lib/format";

export const metadata = { title: "Bedrifter" };

export default async function CompaniesPage() {
  const companies = await getRecentCompanies();

  return (
    <PageShell>
      <p className="kicker">Registeret</p>
      <h1 className="mt-2 font-serif text-4xl">Finn arbeidsplassen</h1>
      <p className="mt-3 max-w-xl text-muted">
        Søk i Enhetsregisteret. Når du velger en bedrift, lagrer vi den slik at sladder og
        undersøkelser treffer riktig organisasjonsnummer.
      </p>
      <div className="mt-8 max-w-xl">
        <CompanySearch />
      </div>

      {companies.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-serif text-2xl">Nylig lagt til</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {companies.map((company) => (
              <li key={company.orgnr}>
                <Link
                  href={`/bedrifter/${company.orgnr}`}
                  className="flex items-baseline justify-between gap-4 py-3 hover:bg-paper-2/60"
                >
                  <span>
                    <span className="font-medium">{company.name}</span>
                    <span className="ml-2 text-sm text-muted">
                      {company.municipality ?? formatOrgnr(company.orgnr)}
                    </span>
                  </span>
                  {company.is_verified ? (
                    <span className="text-xs text-good">Brreg</span>
                  ) : (
                    <span className="text-xs text-muted">Manuell</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageShell>
  );
}
