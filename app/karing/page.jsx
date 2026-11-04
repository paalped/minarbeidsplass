import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageShell } from "@/components/page-shell";
import { RankingList } from "@/components/ranking-list";
import { getRankingBoard } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { itemListJsonLd, pageMetadata } from "@/lib/seo";
import { MIN_RANKING_RESPONSES, RANKING_PAGE_SIZE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Norges beste arbeidsplass 2026",
  description:
    "Rangering av norske arbeidsplasser etter ledelse, arbeidsmiljø, lønn, balanse og kultur. Basert på arbeidsplassundersøkelsen — for deg som ser etter ny jobb eller lurer på arbeidsplassen din.",
  path: "/karing",
});

function karingHref({ q, page }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/karing?${query}` : "/karing";
}

export default async function RankingPage({ searchParams }) {
  const params = await searchParams;
  const q = String(params.q ?? "").trim();
  const requestedPage = Number.parseInt(String(params.page ?? "1"), 10);
  const board = await getRankingBoard({
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
    pageSize: RANKING_PAGE_SIZE,
    q,
  });
  const { rows, unranked, total, rankedTotal, page, pageCount, leader, top } = board;
  const searching = Boolean(q);
  const from = total === 0 ? 0 : (page - 1) * board.pageSize + 1;
  const to = Math.min(page * board.pageSize, total);

  return (
    <PageShell>
      <JsonLd data={itemListJsonLd(top)} />
      <p className="kicker">Siste kåring</p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Norges beste arbeidsplass</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Rangert etter snittet av arbeidsplassundersøkelsen: ledelse, arbeidsmiljø, lønn og goder,
        balanse, faglig utvikling, kultur og anbefaling. En bedrift kommer på listen når minst{" "}
        {MIN_RANKING_RESPONSES} personer har svart. {formatNumber(rankedTotal)} bedrifter er på
        listen nå.
      </p>

      <form action="/karing" method="get" className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="ranking-q">
          Søk etter bedrift
        </label>
        <input
          id="ranking-q"
          name="q"
          defaultValue={q}
          placeholder="Søk på navn eller org.nr"
          className="h-12 flex-1 border border-line bg-white px-3"
        />
        <button type="submit" className="h-12 bg-pine px-5 text-paper hover:bg-pine-soft">
          Finn plass
        </button>
      </form>
      <p className="mt-2 text-sm text-muted">
        Søket viser hvilken plass bedriften har på kåringen, også om den ligger langt nede på listen.
      </p>

      {leader && !searching ? (
        <div className="mt-8 bg-pine px-6 py-8 text-paper">
          <p className="kicker text-paper-2">I tet akkurat nå</p>
          <p className="mt-2 font-serif text-4xl">{leader.name}</p>
          <p className="mt-2 text-paper-2">
            {leader.overall_score.toFixed(1).replace(".", ",")} / 5 · {leader.response_count} svar
            {leader.municipality ? ` · ${leader.municipality}` : ""}
          </p>
        </div>
      ) : null}

      <div className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-2xl">
            {searching ? `Treff for «${q}»` : "Hele listen"}
          </h2>
          {searching ? (
            <Link href="/karing" className="text-sm text-rust underline underline-offset-4">
              Vis hele listen
            </Link>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted">
          {searching
            ? total
              ? `${formatNumber(total)} på kåringen. Plasseringen er rangeringen i hele listen.`
              : "Ingen treff på kåringen."
            : total
              ? `Viser ${formatNumber(from)}–${formatNumber(to)} av ${formatNumber(total)}.`
              : "Ingen bedrifter har nok svar ennå."}
        </p>
        <RankingList
          rankings={rows}
          empty={
            searching
              ? "Ingen bedrifter på kåringen matcher søket."
              : "Kåringen er tom inntil minst tre undersøkelsessvar er samlet inn for en bedrift."
          }
        />
        <Pagination q={q} page={page} pageCount={pageCount} />
      </div>

      {searching && unranked.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-serif text-2xl">Ikke på kåringen ennå</h2>
          <p className="mt-1 text-sm text-muted">
            Funnet i basen, men under {MIN_RANKING_RESPONSES} svar i arbeidsplassundersøkelsen.
          </p>
          <RankingList rankings={unranked} />
        </section>
      ) : null}
    </PageShell>
  );
}

function Pagination({ q, page, pageCount }) {
  if (pageCount <= 1) return null;

  const pages = visiblePages(page, pageCount);

  return (
    <nav className="mt-8 flex flex-wrap items-center gap-2" aria-label="Sider i kåringen">
      {page > 1 ? (
        <Link
          href={karingHref({ q, page: page - 1 })}
          className="border border-line px-3 py-2 text-sm hover:bg-paper-2"
        >
          Forrige
        </Link>
      ) : (
        <span className="border border-transparent px-3 py-2 text-sm text-muted">Forrige</span>
      )}
      {pages.map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={karingHref({ q, page: item })}
            aria-current={item === page ? "page" : undefined}
            className={
              item === page
                ? "bg-pine px-3 py-2 text-sm text-paper"
                : "border border-line px-3 py-2 text-sm hover:bg-paper-2"
            }
          >
            {item}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link
          href={karingHref({ q, page: page + 1 })}
          className="border border-line px-3 py-2 text-sm hover:bg-paper-2"
        >
          Neste
        </Link>
      ) : (
        <span className="border border-transparent px-3 py-2 text-sm text-muted">Neste</span>
      )}
    </nav>
  );
}

function visiblePages(page, pageCount) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }
  const items = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) items.push("…");
  for (let n = start; n <= end; n += 1) items.push(n);
  if (end < pageCount - 1) items.push("…");
  items.push(pageCount);
  return items;
}
