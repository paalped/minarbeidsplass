import Link from "next/link";

const items = [
  { href: "/admin", label: "Oversikt" },
  { href: "/admin/nyheter", label: "Nyheter" },
];

export function AdminNav({ current }) {
  return (
    <nav className="mt-6 flex flex-wrap gap-3 text-sm">
      {items.map((item) => {
        const active = current === item.href || (item.href !== "/admin" && current?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "bg-pine px-3 py-1.5 text-paper"
                : "border border-line px-3 py-1.5 hover:border-pine"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
