import Link from "next/link";
import { computeFitMatch, cultureScores, FIT_DIMENSIONS, MIN_FIT_RESPONSES } from "@/lib/fit";
import { formatNumber, formatScore } from "@/lib/format";

export function FitMatchCard({ companyName, workStyle, culture, loggedIn }) {
  const scores = cultureScores(culture);
  const match = computeFitMatch(workStyle, scores);

  return (
    <section className="mt-10 paper-card p-6">
      <p className="kicker">Din match</p>
      <h2 className="mt-2 font-serif text-2xl">Passer {companyName} for deg?</h2>

      {!loggedIn ? (
        <p className="mt-4 text-muted">
          Logg inn og ta en treminutters test av arbeidstilen din. Da viser vi hvor godt stedet
          matcher deg — ikke bare et generelt terningkast.
        </p>
      ) : !workStyle ? (
        <>
          <p className="mt-4 text-muted">
            En arbeidsplass er sjelden universelt god. Ta testen, så ser du om kulturen her treffer
            deg.
          </p>
          <Link
            href="/profil#arbeidsstil"
            className="mt-5 inline-flex h-11 items-center bg-rust px-4 text-paper hover:bg-rust-dark"
          >
            Ta arbeidstil-testen
          </Link>
        </>
      ) : !scores ? (
        <p className="mt-4 text-muted">
          For få kultursvar ennå. Match vises når minst {MIN_FIT_RESPONSES} personer har svart på
          hvordan det faktisk er å jobbe her. Kåringen er uendret.
        </p>
      ) : !match ? (
        <p className="mt-4 text-muted">Vi får ikke beregnet match ennå.</p>
      ) : (
        <>
          <p className="mt-4 font-serif text-5xl text-pine">{match.percent} %</p>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed">{match.summary}</p>
          {match.notes.length ? (
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
              {match.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {FIT_DIMENSIONS.map((dimension) => {
              const row = match.rows.find((item) => item.key === dimension.key);
              return (
                <div key={dimension.key} className="border-t border-line pt-3">
                  <dt className="text-sm font-medium">{dimension.label}</dt>
                  <dd className="mt-1 text-sm text-muted">
                    Du: {row.user} · Stedet: {formatScore(row.company)}
                  </dd>
                </div>
              );
            })}
          </dl>
          <p className="mt-4 text-xs text-muted">
            {culture.is_seeded
              ? "Foreløpig kulturprofil til vi har nok svar fra folk som har jobbet her."
              : `Basert på ${formatNumber(culture.response_count)} svar om hvordan det er å jobbe her.`}{" "}
            Teller ikke i kåringen.
          </p>
          <Link href="/profil#arbeidsstil" className="mt-3 inline-block text-sm text-rust underline">
            Oppdater arbeidstilen
          </Link>
        </>
      )}
    </section>
  );
}
