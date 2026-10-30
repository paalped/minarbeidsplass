import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 bg-pine text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl">Min Arbeidsplass</p>
          <p className="mt-3 max-w-xs text-sm text-paper-2">{site.tagline}</p>
        </div>
        <div className="text-sm">
          <p className="kicker text-paper-2">Sider</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/karing" className="hover:underline">
                Norges beste arbeidsplass
              </Link>
            </li>
            <li>
              <Link href="/undersokelse" className="hover:underline">
                Ta undersøkelsen
              </Link>
            </li>
            <li>
              <Link href="/nyheter" className="hover:underline">
                Nyheter
              </Link>
            </li>
            <li>
              <Link href="/chat" className="hover:underline">
                Sladderrommet
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm text-paper-2">
          <p className="kicker">Om kåringen</p>
          <p className="mt-3 leading-relaxed">
            Snitt av undersøkelsessvar i syv kategorier. En bedrift kommer på listen når minst
            tre personer har svart. Firmasøk går mot Enhetsregisteret.
          </p>
        </div>
      </div>
      <div className="border-t border-pine-soft px-4 py-4 text-center text-xs text-paper-2">
        © {new Date().getFullYear()} Min Arbeidsplass
      </div>
    </footer>
  );
}
