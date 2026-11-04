import Link from "next/link";
import { CompanySearch } from "@/components/company-search";
import { JsonLd } from "@/components/json-ld";
import { NewsCard } from "@/components/news-card";
import { RankingList } from "@/components/ranking-list";
import { getNews, getRankings, getSurveys } from "@/lib/data";
import { faqJsonLd, HOME_FAQ, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { surveyCountsTowardRanking } from "@/lib/survey";

export const metadata = {
  ...pageMetadata({ title: site.seoTitle, path: "/" }),
  title: { absolute: site.seoTitle },
};

const defaultSurveyCards = [
  {
    slug: "arbeidsplass-2026",
    title: "Arbeidsplassundersøkelsen",
    teaser: "Ledelse, miljø, lønn, balanse, utvikling, kultur og anbefaling.",
    counts_toward_ranking: true,
  },
  {
    slug: "verktoy-2026",
    title: "Verktøy og systemer",
    teaser: "Timesystem, GIS, CAD, kjernesystem, hyllevare vs egenutvikling.",
    counts_toward_ranking: false,
  },
];

export default async function HomePage() {
  const [rankings, news, surveys] = await Promise.all([getRankings(5), getNews(4), getSurveys()]);
  const today = new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="pb-16">
      <JsonLd data={faqJsonLd(HOME_FAQ)} />
      <header className="masthead-rule mx-auto mt-8 max-w-6xl px-4 py-6 text-center">
        <p className="kicker">{today}</p>
        <h1 className="mt-2 font-serif text-4xl leading-[0.95] tracking-tight sm:text-6xl">
          {site.name}
        </h1>
        <p className="mt-3 text-lg text-muted">{site.tagline}</p>
      </header>

      <section className="mx-auto mt-10 grid max-w-6xl gap-10 px-4 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
            Kom innom. Si hvordan det faktisk er å jobbe der du jobber.
          </h2>
          <p className="mt-4 max-w-xl text-muted">
            Bytter du jobb, eller lurer du på arbeidsmiljøet? Vi slår opp bedriften i
            Brønnøysundregistrene. Les sladder, se scoren, og ta arbeidsplassundersøkelsen.
            Kåringen av Norges beste arbeidsplass styres av svarene.
          </p>
        </div>
        <CompanySearch />
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <p className="kicker">For jobbsøkere og ansatte</p>
        <h2 className="mt-2 max-w-2xl font-serif text-3xl">
          Før du søker ny stilling, les hvordan det faktisk er.
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Link href="/bedrifter" className="paper-card p-5 hover:bg-white">
            <p className="kicker">1</p>
            <h3 className="mt-2 font-serif text-2xl">Søk opp arbeidsplassen</h3>
            <p className="mt-3 text-muted">
              Finn bedriften i Enhetsregisteret. Se organisasjonsnummer, sted og hva andre har
              skrevet om å jobbe der.
            </p>
          </Link>
          <Link href="/undersokelse" className="paper-card p-5 hover:bg-white">
            <p className="kicker">2</p>
            <h3 className="mt-2 font-serif text-2xl">Ta undersøkelsen</h3>
            <p className="mt-3 text-muted">
              Ledelse, arbeidsmiljø, lønn, balanse, utvikling og kultur. Ett spørsmålssett styrer
              kåringen. Verktøyundersøkelsen kartlegger systemene.
            </p>
          </Link>
          <Link href="/karing" className="paper-card p-5 hover:bg-white">
            <p className="kicker">3</p>
            <h3 className="mt-2 font-serif text-2xl">Se kåringen</h3>
            <p className="mt-3 text-muted">
              Norges beste arbeidsplass, rangert etter ærlige svar — ikke en jury og ikke en
              HR-kampanje.
            </p>
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl gap-12 px-4 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl">Siste kåring</h2>
            <Link href="/karing" className="text-sm text-rust underline underline-offset-4">
              Hele listen
            </Link>
          </div>
          <p className="mt-1 text-sm text-muted">
            Norges beste arbeidsplass, så langt — etter arbeidsmiljø, ledelse og resten av
            undersøkelsen.
          </p>
          <RankingList rankings={rankings} />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl">Nyheter</h2>
            <Link href="/nyheter" className="text-sm text-rust underline underline-offset-4">
              Alle saker
            </Link>
          </div>
          {news.length ? (
            <div className="mt-4">
              {news.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-muted">Ingen nyheter ennå. Kjør SQL-migrasjonen for å se saker.</p>
          )}
        </div>
      </section>

      <section className="mt-16 bg-pine py-12 text-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-10">
          <p className="kicker text-paper-2">Undersøkelser</p>
          <h2 className="mt-2 max-w-2xl font-serif text-3xl sm:text-4xl">
            Si hvordan det er å jobbe der — og i hvilke systemer.
          </h2>
          <p className="mt-4 max-w-xl text-paper-2">
            Arbeidsplassundersøkelsen avgjør kåringen. Verktøyundersøkelsen kartlegger timesystem,
            GIS, CAD og kjernesystemet, uten å røre plasseringen.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {(surveys.length > 0 ? surveys : defaultSurveyCards).map((survey) => (
              <Link
                key={survey.slug}
                href={`/undersokelse/${survey.slug}`}
                className="border border-paper/30 p-5 hover:bg-pine-soft"
              >
                <p className="text-xs uppercase tracking-wide text-paper-2">
                  {surveyCountsTowardRanking(survey) ? "Teller i kåringen" : "Teller ikke i kåringen"}
                </p>
                <p className="mt-2 font-serif text-2xl">{survey.title}</p>
                <p className="mt-2 text-sm text-paper-2">{survey.teaser ?? survey.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <p className="kicker">Spørsmål</p>
        <h2 className="mt-2 font-serif text-3xl">Ofte spurt av folk som ser etter ny jobb</h2>
        <dl className="mt-8 divide-y divide-line border-y border-line">
          {HOME_FAQ.map((item) => (
            <div key={item.q} className="py-5">
              <dt className="font-serif text-xl">{item.q}</dt>
              <dd className="mt-2 max-w-3xl text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
