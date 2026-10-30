import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SetupBanner } from "@/components/setup-banner";
import { getSessionUser } from "@/lib/data";
import { site } from "@/lib/site";
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
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
};

export default async function RootLayout({ children }) {
  const user = await getSessionUser();

  return (
    <html lang="nb">
      <body className={`${fraunces.variable} ${sourceSans.variable} min-h-screen antialiased`}>
        <SetupBanner />
        <Header user={user} />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
