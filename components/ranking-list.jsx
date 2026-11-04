import Link from "next/link";
import { ScoreBadge, ScoreBar } from "@/components/score-badge";
import { formatNumber } from "@/lib/format";
import { MIN_RANKING_RESPONSES } from "@/lib/site";

export function RankingList({ rankings, empty }) {
  const rows = rankings ?? [];

  if (rows.length === 0) {
    return (
      <p className="text-muted">
        {empty ??
          "Kåringen er tom inntil minst tre undersøkelsessvar er samlet inn for en bedrift."}
      </p>
    );
  }

  return (
    <ol className="divide-y divide-line">
      {rows.map((company, index) => {
        const place = company.rank ?? index + 1;
        const ranked = typeof company.rank === "number";
        const responses = company.response_count ?? 0;

        return (
          <li key={company.orgnr}>
            <Link
              href={`/bedrifter/${company.orgnr}`}
              className="flex items-center gap-4 py-4 hover:bg-paper-2/60"
            >
              <span className="w-10 shrink-0 font-serif text-2xl text-rust">
                {ranked ? place : "–"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{company.name}</p>
                <p className="text-xs text-muted">
                  {ranked
                    ? [
                        company.municipality,
                        company.nace_text,
                        `${formatNumber(responses)} svar`,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : [
                        company.municipality,
                        responses > 0
                          ? `${formatNumber(responses)} av ${MIN_RANKING_RESPONSES} svar`
                          : "Ingen svar ennå",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                </p>
                {ranked ? (
                  <div className="mt-2 max-w-xs">
                    <ScoreBar value={company.overall_score} />
                  </div>
                ) : null}
              </div>
              {ranked ? <ScoreBadge score={company.overall_score} size="sm" /> : null}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
