import Link from "next/link";
import { ScoreBadge, ScoreBar } from "@/components/score-badge";
import { formatNumber } from "@/lib/format";

export function RankingList({ rankings, limit }) {
  const rows = limit ? rankings.slice(0, limit) : rankings;

  if (rows.length === 0) {
    return (
      <p className="text-muted">
        Kåringen er tom inntil minst tre undersøkelsessvar er samlet inn for en bedrift. Kjør
        SQL-migrasjonen for å se demobedrifter.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-line">
      {rows.map((company, index) => (
        <li key={company.orgnr}>
          <Link
            href={`/bedrifter/${company.orgnr}`}
            className="flex items-center gap-4 py-4 hover:bg-paper-2/60"
          >
            <span className="w-8 font-serif text-2xl text-rust">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{company.name}</p>
              <p className="text-xs text-muted">
                {[company.municipality, company.nace_text, `${formatNumber(company.response_count)} svar`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="mt-2 max-w-xs">
                <ScoreBar value={company.overall_score} />
              </div>
            </div>
            <ScoreBadge score={company.overall_score} size="sm" />
          </Link>
        </li>
      ))}
    </ol>
  );
}
