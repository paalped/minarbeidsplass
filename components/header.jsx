"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/bedrifter", label: "Bedrifter" },
  { href: "/karing", label: "Kåring" },
  { href: "/nyheter", label: "Nyheter" },
  { href: "/chat", label: "Chat" },
  { href: "/undersokelse", label: "Undersøkelser" },
];

export function Header({ user }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-pine text-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="inline-block h-2.5 w-2.5 bg-rust" aria-hidden />
          <span className="font-serif text-lg tracking-tight sm:text-xl">Min Arbeidsplass</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-paper-2">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="max-w-36 truncate text-sm text-paper-2">{user.displayName}</span>
              <form action="/auth/sign-out" method="post">
                <button type="submit" className="text-sm underline decoration-rust underline-offset-4">
                  Logg ut
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/logg-inn"
              className="border border-paper/40 px-3 py-1.5 text-sm hover:bg-pine-soft"
            >
              Logg inn
            </Link>
          )}
        </div>

        <button
          type="button"
          className="md:hidden"
          aria-expanded={open}
          aria-label="Meny"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 w-6 bg-paper" />
          <span className="mt-1.5 block h-0.5 w-6 bg-paper" />
        </button>
      </div>

      {open ? (
        <div className="border-t border-pine-soft px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-base">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <form action="/auth/sign-out" method="post">
                <button type="submit" className="text-paper-2 underline decoration-rust">
                  Logg ut ({user.displayName})
                </button>
              </form>
            ) : (
              <Link href="/logg-inn" onClick={() => setOpen(false)}>
                Logg inn
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
