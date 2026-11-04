import Link from "next/link";
import { hasInsights, isCompanyAdminRole } from "@/lib/b2b";

export function B2bNav({ current, orgnr, role, plan }) {
  const q = orgnr ? `?orgnr=${encodeURIComponent(orgnr)}` : "";
  const items = [
    { href: `/bedrift${q}`, label: "Oversikt", match: "/bedrift" },
    { href: `/bedrift/svar${q}`, label: "Svar på omtaler" },
    { href: `/bedrift/innsikt${q}`, label: "Innsikt", hide: !hasInsights(plan) },
    { href: `/bedrift/profil${q}`, label: "Profil", hide: !isCompanyAdminRole(role) },
    { href: `/bedrift/brukere${q}`, label: "Tilganger", hide: !isCompanyAdminRole(role) },
  ].filter((item) => !item.hide);

  return (
    <nav className="mt-6 flex flex-wrap gap-3 text-sm">
      {items.map((item) => {
        const path = item.href.split("?")[0];
        const active =
          item.match === "/bedrift"
            ? current === "/bedrift"
            : current?.startsWith(path);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active ? "bg-pine px-3 py-1.5 text-paper" : "border border-line px-3 py-1.5 hover:border-pine"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
