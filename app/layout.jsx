import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { SetupBanner } from "@/components/setup-banner";
import { getSessionUser } from "@/lib/data";
import { site } from "@/lib/site";
import { siteOrigin, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: site.seoTitle,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "ny jobb",
    "bytte jobb",
    "jobbsøk",
    "karriere",
    "arbeidsplassundersøkelse",
    "arbeidsmiljø",
    "hvordan er det å jobbe",
    "Norges beste arbeidsplass",
    "bedriftskultur",
    "lønn og goder",
  ],
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "nb_NO",
    siteName: site.name,
    title: site.seoTitle,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.seoTitle,
    description: site.description,
  },
  robots: { index: true, follow: true },
  verification: {
    google: "H0ar7eqiiXdlCBxBIcYc3n7QATs_xZqicpl4rfbS82A",
  },
};

export default async function RootLayout({ children }) {
  const user = await getSessionUser();

  return (
    <html lang="nb">
      <body className={`${fraunces.variable} ${sourceSans.variable} min-h-screen antialiased`}>
        <JsonLd data={websiteJsonLd()} />
        <SetupBanner />
        <Header user={user} />
        <main className="min-h-[70vh]">{children}</main>
        <Footer user={user} />
      </body>
    </html>
  );
}
