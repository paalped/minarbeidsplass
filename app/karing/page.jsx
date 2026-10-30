import { PageShell } from "@/components/page-shell";
import { RankingList } from "@/components/ranking-list";
import { getRankings } from "@/lib/data";
import { MIN_RANKING_RESPONSES } from "@/lib/site";

export const metadata = { title: "Norges beste arbeidsplass" };

export default async function RankingPage() {
  const rankings = await getRankings(50);
  const leader = rankings[0];

  return (
    <PageShell>
      <p className="kicker">Siste kåring</p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Norges beste arbeidsplass</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Rangert etter snittet av arbeidsplassundersøkelsen. En bedrift kommer på listen når minst{" "}
        {MIN_RANKING_RESPONSES} personer har svart. Tallene flytter seg når nye svar kommer inn.
      </p>

      {leader ? (
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
        <RankingList rankings={rankings} />
      </div>
    </PageShell>
  );
}
