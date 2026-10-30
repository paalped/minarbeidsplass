import { formatNumber, formatScore } from "@/lib/format";

export function ScoreBadge({ score, count, size = "md" }) {
  const text = size === "lg" ? "text-4xl" : size === "sm" ? "text-xl" : "text-2xl";

  return (
    <div className="flex items-end gap-2">
      <span className={`font-serif ${text} leading-none text-pine`}>{formatScore(score)}</span>
      <span className="pb-0.5 text-sm text-muted">/ 5</span>
      {typeof count === "number" ? (
        <span className="pb-0.5 text-xs text-muted">{formatNumber(count)} svar</span>
      ) : null}
    </div>
  );
}

export function ScoreBar({ value }) {
  const pct = Math.max(0, Math.min(100, ((value ?? 0) / 5) * 100));
  return (
    <div className="score-track">
      <div className="score-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
