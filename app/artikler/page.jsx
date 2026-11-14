import { ArticleIndex } from "@/components/article-index";
import { JsonLd } from "@/components/json-ld";
import { PageShell } from "@/components/page-shell";
import { getNews } from "@/lib/data";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

const FAQ = [
  {
    q: "Hva er artiklene på Min Arbeidsplass?",
    a: "Tekster om de vanligste søkene folk gjør når de tenker på jobb — ny jobb, arbeidsmiljø, lønn, søndagsangst — vinklet mot hvordan Min Arbeidsplass håper å løse problemet eller styrke gleden.",
  },
  {
    q: "Kan jeg kommentere?",
    a: "Ja, når du er logget inn. Artiklene er åpne for alle. Samtalen under krever konto, så den holder seg voksen.",
  },
];

export const metadata = pageMetadata({
  title: "Artikler om jobb, arbeidsmiljø og kåringen",
  description:
    "100 artikler om det folk faktisk søker på: ny jobb, bytte jobb, dårlig arbeidsmiljø, lønn og Norges beste arbeidsplass. Kommenter innlogget.",
  path: "/artikler",
});

export default async function ArticlesPage() {
  const articles = await getNews(200);

  return (
    <PageShell>
      <JsonLd data={faqJsonLd(FAQ)} />
      <p className="kicker">Redaksjonen</p>
      <h1 className="mt-2 font-serif text-4xl">Artikler</h1>
      <p className="mt-3 max-w-2xl text-muted">
        De vanligste søkene om jobb, hver med en ærlig setning og en tekst om hvordan Min
        Arbeidsplass håper å løse det som gjør vondt — eller styrke det som er glede. Nyheter
        ligger i samme liste.
      </p>
      <ArticleIndex articles={articles} />
    </PageShell>
  );
}
