"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, LIKERT_LABELS } from "@/lib/site";
import { questionsByCategory } from "@/lib/survey";

export function SurveyForm({ company, survey, existing }) {
  const router = useRouter();
  const groups = useMemo(() => questionsByCategory(survey.survey_questions), [survey]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(existing?.answers ?? {});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const current = groups[step];
  const isLast = step === groups.length - 1;

  function setValue(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function canProceed() {
    return current.questions
      .filter((q) => q.required)
      .every((q) =>
        q.question_type === "likert"
          ? typeof answers[q.id] === "number"
          : String(answers[q.id] ?? "").length >= 0,
      );
  }

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey_id: survey.id,
          company_orgnr: company.orgnr,
          answers,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke lagre undersøkelsen.");
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="paper-card p-8 text-center">
        <p className="kicker">Takk</p>
        <h2 className="mt-2 font-serif text-3xl">Svarene dine er inne</h2>
        <p className="mt-3 text-muted">
          De teller i kåringen av {company.name}. Du kan oppdatere dem senere ved å ta undersøkelsen
          på nytt.
        </p>
        <a href={`/bedrifter/${company.orgnr}`} className="mt-6 inline-block bg-pine px-5 py-2 text-paper">
          Tilbake til bedriften
        </a>
      </div>
    );
  }

  const categoryLabel = CATEGORIES.find((c) => c.key === current.key)?.label ?? current.key;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (isLast) void submit();
        else if (canProceed()) setStep((s) => s + 1);
      }}
      className="paper-card p-5 sm:p-8"
    >
      <div className="flex items-center justify-between gap-3 text-sm text-muted">
        <span>
          Steg {step + 1} av {groups.length}
        </span>
        <span>{categoryLabel}</span>
      </div>
      <div className="mt-3 h-1.5 bg-line">
        <div
          className="h-full bg-rust"
          style={{ width: `${((step + 1) / groups.length) * 100}%` }}
        />
      </div>

      <h2 className="mt-6 font-serif text-3xl">{categoryLabel}</h2>
      <div className="mt-8 space-y-10">
        {current.questions.map((question) => (
          <fieldset key={question.id}>
            <legend className="text-lg leading-snug">{question.prompt}</legend>
            {question.question_type === "likert" ? (
              <div className="mt-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const selected = answers[question.id] === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setValue(question.id, n)}
                        className={`h-12 flex-1 border text-lg ${
                          selected
                            ? "border-pine bg-pine text-paper"
                            : "border-line bg-white hover:border-pine"
                        }`}
                        aria-pressed={selected}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted">
                  <span>{LIKERT_LABELS[0]}</span>
                  <span>{LIKERT_LABELS[4]}</span>
                </div>
              </div>
            ) : (
              <textarea
                value={typeof answers[question.id] === "string" ? String(answers[question.id]) : ""}
                onChange={(e) => setValue(question.id, e.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="Valgfritt"
                className="mt-4 w-full border border-line bg-white px-3 py-2"
              />
            )}
          </fieldset>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="px-4 py-2 text-sm underline disabled:opacity-30"
        >
          Tilbake
        </button>
        <button
          type="submit"
          disabled={!canProceed() || saving}
          className="bg-rust px-5 py-2.5 text-paper hover:bg-rust-dark disabled:opacity-50"
        >
          {isLast ? (saving ? "Lagrer…" : existing ? "Oppdater svar" : "Send inn") : "Neste"}
        </button>
      </div>
      {error ? <p className="mt-4 text-sm text-rust">{error}</p> : null}
    </form>
  );
}
