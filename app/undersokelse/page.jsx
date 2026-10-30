import { CompanySearch } from "@/components/company-search";
import { PageShell } from "@/components/page-shell";

export const metadata = { title: "Undersøkelse" };

export default function SurveyIndexPage() {
  return (
    <PageShell>
      <p className="kicker">Arbeidsplassundersøkelsen</p>
      <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-tight">
        Først bedriften. Så 23 spørsmål om hvordan det egentlig er.
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Søk i Brreg eller skriv inn navnet selv. Du må logge inn med e-post før svarene lagres — så
        kåringen ikke drukner i dubletter.
      </p>
      <div className="mt-8 max-w-xl">
        <CompanySearch intent="survey" autoFocus />
      </div>
    </PageShell>
  );
}
