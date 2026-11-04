import { ScoreBar } from "@/components/score-badge";
import { FIT_DIMENSIONS } from "@/lib/fit";
import { formatNumber, formatScore } from "@/lib/format";
import { OCAI_POLES } from "@/lib/b2b";
import { CATEGORIES } from "@/lib/site";

export function InsightsBoard({ insights, companyName }) {
  return (
    <div className="mt-8 grid gap-8">
      <section className="paper-card p-6">
        <p className="kicker">Kategoriinnsikt</p>
        <h2 className="mt-2 font-serif text-2xl">{companyName}</h2>
        <p className="mt-2 text-muted">
          Snitt av {formatNumber(insights.respondent_count)} forsinkede, anonyme svar. Nye svar
          vises først etter 48–96 timer. Uker, ikke klokkeslett.
        </p>
        <p className="mt-6 font-serif text-5xl text-pine">{formatScore(insights.overall)}</p>
        <ul className="mt-6 space-y-4">
          {CATEGORIES.map((category) => {
            const value = insights.categories?.[category.key];
            return (
              <li key={category.key}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{category.label}</span>
                  <span className="tabular-nums">{formatScore(value)}</span>
                </div>
                <ScoreBar value={value} />
              </li>
            );
          })}
        </ul>
      </section>

      {insights.benchmark ? (
        <section className="paper-card p-6">
          <p className="kicker">Bransjebenchmark</p>
          <h2 className="mt-2 font-serif text-2xl">
            {insights.benchmark.nace_text ?? insights.benchmark.nace_code}
          </h2>
          <p className="mt-2 text-muted">
            Snitt av {formatNumber(insights.benchmark.company_count)} andre bedrifter
            {insights.benchmark.grain === "2" ? " med samme tosifrede næringskode" : " med samme næringskode"}.
          </p>
          <p className="mt-4 text-lg">
            Dere: {formatScore(insights.overall)} · Bransjen: {formatScore(insights.benchmark.overall)}
          </p>
        </section>
      ) : (
        <section className="paper-card p-6">
          <p className="kicker">Bransjebenchmark</p>
          <p className="mt-3 text-muted">For få sammenlignbare bedrifter med minst fem svar.</p>
        </section>
      )}

      <section className="paper-card p-6">
        <p className="kicker">Tidsserie</p>
        <h2 className="mt-2 font-serif text-2xl">Utvikling per kvartal</h2>
        {insights.series?.length ? (
          <ul className="mt-4 space-y-3">
            {insights.series.map((row) => (
              <li key={row.period} className="flex items-baseline justify-between border-t border-line pt-3">
                <span>{row.period}</span>
                <span className="tabular-nums">
                  {formatScore(row.overall)} · {formatNumber(row.count)} svar
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-muted">Ingen kvartal har minst fem forsinkede svar ennå.</p>
        )}
      </section>

      <section className="paper-card p-6">
        <p className="kicker">Kulturell fit-profil</p>
        {insights.culture?.ocai ? (
          <>
            <ul className="mt-4 space-y-4">
              {OCAI_POLES.map((pole) => (
                <li key={pole.key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>
                      {pole.label}
                      <span className="ml-2 text-muted">{pole.hint}</span>
                    </span>
                    <span className="tabular-nums">{insights.culture.ocai[pole.key]} %</span>
                  </div>
                  <div className="score-track">
                    <div className="score-fill" style={{ width: `${insights.culture.ocai[pole.key]}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {FIT_DIMENSIONS.map((dimension) => (
                <div key={dimension.key} className="border-t border-line pt-3">
                  <dt className="text-sm font-medium">{dimension.label}</dt>
                  <dd className="mt-1 text-sm text-muted">{formatScore(insights.culture[dimension.key])}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="mt-3 text-muted">
            Kulturprofil vises når minst fem forsinkede kultursvar er inne.
          </p>
        )}
      </section>
    </div>
  );
}

export function InsightsBlank({ reason }) {
  if (reason === "plan") {
    return (
      <p className="mt-8 max-w-2xl text-muted">
        Insights er en betalt plan. Basic gir dere verifisert eierskap, profil og offisielle svar.
        Plattformadmin kan åpne dashbordet når lisensen er aktiv.
      </p>
    );
  }
  return (
    <p className="mt-8 max-w-2xl text-muted">
      Ingen innsikt ennå. Vi viser ikke snitt, grafer eller antall før minst fem unike svar er
      registrert — og først 48–96 timer etter innsending. Kåringen på den åpne siden er uendret.
    </p>
  );
}
