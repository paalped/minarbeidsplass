import { site } from "./site";
import { getSiteUrl } from "./supabase/env";

export function siteOrigin() {
  return getSiteUrl().replace(/\/$/, "");
}

export function pageUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin()}${normalized}`;
}

export function pageMetadata({
  title,
  description,
  path = "/",
  index = true,
  type = "website",
  publishedTime,
} = {}) {
  const resolvedTitle = title ?? site.seoTitle;
  const resolvedDescription = description ?? site.description;
  const url = pageUrl(path);

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: { canonical: path },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type,
      locale: "nb_NO",
      siteName: site.name,
      title: resolvedTitle,
      description: resolvedDescription,
      url,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
    },
  };
}

export function websiteJsonLd() {
  const origin = siteOrigin();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: origin,
        name: site.name,
        description: site.description,
        inLanguage: "nb-NO",
        publisher: { "@id": `${origin}/#org` },
      },
      {
        "@type": "Organization",
        "@id": `${origin}/#org`,
        name: site.name,
        url: origin,
        description: site.description,
      },
    ],
  };
}

export function faqJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function articleJsonLd(article) {
  const origin = siteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.published_at,
    dateModified: article.published_at,
    inLanguage: "nb-NO",
    mainEntityOfPage: pageUrl(`/nyheter/${article.slug}`),
    publisher: { "@id": `${origin}/#org` },
    author: { "@type": "Organization", name: site.name, url: origin },
  };
}

export function companyJsonLd(company, stats) {
  const origin = siteOrigin();
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: pageUrl(`/bedrifter/${company.orgnr}`),
    identifier: company.orgnr,
    description: `Hvordan er det å jobbe i ${company.name}? Score, arbeidsmiljø og sladder fra ansatte.`,
  };
  if (company.municipality) {
    data.address = {
      "@type": "PostalAddress",
      addressLocality: company.municipality,
      addressCountry: "NO",
    };
  }
  if (stats?.overall_score && stats.response_count >= 3) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(stats.overall_score.toFixed(1)),
      bestRating: 5,
      worstRating: 1,
      ratingCount: stats.response_count,
    };
  }
  data.publisher = { "@id": `${origin}/#org` };
  return data;
}

export function itemListJsonLd(rankings) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Norges beste arbeidsplass",
    itemListElement: rankings.slice(0, 25).map((row, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: pageUrl(`/bedrifter/${row.orgnr}`),
      name: row.name,
    })),
  };
}

export const HOME_FAQ = [
  {
    q: "Hvordan finner jeg ut hvordan det er å jobbe i en bedrift?",
    a: "Søk opp arbeidsplassen i Enhetsregisteret. Du får score fra arbeidsplassundersøkelsen når minst tre har svart, og kan lese anonym sladder fra folk som jobber der.",
  },
  {
    q: "Hva er arbeidsplassundersøkelsen?",
    a: "En undersøkelse om ledelse, arbeidsmiljø, lønn og goder, balanse, faglig utvikling, kultur og om du ville anbefalt stedet. Svarene kårer Norges beste arbeidsplass.",
  },
  {
    q: "Kan jeg bruke siden når jeg ser etter ny jobb?",
    a: "Ja. Finn bedriften du vurderer, les hvordan det faktisk er å jobbe der, se om kulturen matcher arbeidstilen din, og sammenlign med kåringen før du søker eller takker ja.",
  },
  {
    q: "Hvordan ser jeg om en arbeidsplass passer meg?",
    a: "Ta en treminutters arbeidstil-test på profilen. På bedriftssiden viser vi en personlig match mot autonomi, tempo, samarbeid og balanse — ikke bare et generelt terningkast. Match teller ikke i kåringen.",
  },
  {
    q: "Må jeg logge inn?",
    a: "Ikke for å lese eller sladre. Undersøkelsen og chatten krever magisk lenke på e-post, slik at kåringen ikke kan fylles av samme person om og om igjen.",
  },
  {
    q: "Kan bedriften svare på omtaler?",
    a: "Ja, etter at eierskap er verifisert mot Enhetsregisteret. Arbeidsgiveren kan publisere ett offisielt svar per omtale, men ikke slette eller skjule negative tilbakemeldinger. Innsikt vises først ved minst fem anonyme svar, med tidsforsinkelse.",
  },
];
