"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const publicLinks = [
  { href: "/bedrifter", label: "Bedrifter" },
  { href: "/karing", label: "Kåring" },
  { href: "/undersokelse", label: "Undersøkelser" },
  { href: "/nyheter", label: "Nyheter" },
  { href: "/bedrift", label: "For bedrifter" },
];

const memberLinks = [
  { href: "/profil", label: "Profil" },
  { href: "/mine-undersokelser", label: "Mine undersøkelser" },
  { href: "/chat", label: "Chat" },
];

export function Header({ user }) {
  const [open, setOpen] = useState(false);
  const nav = [
    ...publicLinks,
    ...(user ? memberLinks : []),
    ...(user?.isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-pine text-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="inline-block h-2.5 w-2.5 bg-rust" aria-hidden />
          <span className="font-serif text-lg tracking-tight sm:text-xl">Min Arbeidsplass</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/profil" className="max-w-36 truncate text-sm text-paper-2 hover:text-paper">
              {user.displayName}
            </Link>
          ) : (
            <Link
              href="/logg-inn"
              className="border border-paper/40 px-3 py-1.5 text-sm hover:bg-pine-soft"
            >
              Logg inn
            </Link>
          )}
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 border border-paper/40 px-3 text-sm hover:bg-pine-soft"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Lukk meny" : "Meny"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
              {open ? (
                <path d="M1 1.5 L15 10.5 M15 1.5 L1 10.5" stroke="currentColor" strokeWidth="1.6" />
              ) : (
                <path d="M0 1.25 H16 M0 6 H16 M0 10.75 H16" stroke="currentColor" strokeWidth="1.6" />
              )}
            </svg>
            {open ? "Lukk" : "Meny"}
          </button>
        </div>
      </div>

      {open ? (
        <div id="site-menu" className="border-t border-pine-soft">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {nav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-1 py-2 hover:text-paper-2"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <form action="/auth/sign-out" method="post" className="px-1 py-2">
                <button type="submit" className="underline decoration-rust underline-offset-4">
                  Logg ut
                </button>
              </form>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
