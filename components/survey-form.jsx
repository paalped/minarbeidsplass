"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LIKERT_LABELS, categoryLabel } from "@/lib/site";
import {
  isQuestionComplete,
  isQuestionVisible,
  otherKey,
  questionsByCategory,
  surveyCountsTowardRanking,
} from "@/lib/survey";

export function SurveyForm({ company, survey, existing }) {
  const router = useRouter();
  const questions = survey.survey_questions ?? [];
  const groups = useMemo(() => questionsByCategory(questions), [questions]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(existing?.answers ?? {});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const visibleGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          questions: group.questions.filter((q) => isQuestionVisible(q, questions, answers)),
        }))
        .filter((group) => group.questions.length > 0),
    [groups, questions, answers],
  );

  useEffect(() => {
    if (step >= visibleGroups.length) setStep(Math.max(0, visibleGroups.length - 1));
  }, [step, visibleGroups.length]);

  const current = visibleGroups[Math.min(step, Math.max(0, visibleGroups.length - 1))];
  const isLast = step >= visibleGroups.length - 1;
  const counts = surveyCountsTowardRanking(survey);

  function setValue(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function canProceed() {
    if (!current) return false;
    return current.questions.every((q) => isQuestionComplete(q, questions, answers));
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
          {counts
            ? `De teller i kåringen av ${company.name}. Du kan oppdatere dem senere ved å ta undersøkelsen på nytt.`
            : `De bygger verktøykartet for ${company.name}, og teller ikke i kåringen. Du kan oppdatere dem senere.`}
        </p>
        <a href={`/bedrifter/${company.orgnr}`} className="mt-6 inline-block bg-pine px-5 py-2 text-paper">
          Tilbake til bedriften
        </a>
      </div>
    );
  }

  if (!current) return null;

  const heading = categoryLabel(current.key);

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
          Steg {step + 1} av {visibleGroups.length}
        </span>
        <span>{heading}</span>
      </div>
      <div className="mt-3 h-1.5 bg-line">
        <div
          className="h-full bg-rust"
          style={{ width: `${((step + 1) / visibleGroups.length) * 100}%` }}
        />
      </div>

      <h2 className="mt-6 font-serif text-3xl">{heading}</h2>
      <div className="mt-8 space-y-10">
        {current.questions.map((question) => (
          <QuestionField
            key={question.id}
            question={question}
            answers={answers}
            onChange={setValue}
          />
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

function QuestionField({ question, answers, onChange }) {
  const options = question.settings?.options ?? [];
  const extra = answers[otherKey(question.id)] ?? "";
  const showOther =
    question.settings?.allow_other &&
    (question.question_type === "single"
      ? answers[question.id] === "annet"
      : Array.isArray(answers[question.id]) && answers[question.id].includes("annet"));

  return (
    <fieldset>
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
                  onClick={() => onChange(question.id, n)}
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
          <div className="mt-2 flex justify-between gap-4 text-xs text-muted">
            <span>{question.settings?.poles?.low ?? LIKERT_LABELS[0]}</span>
            <span className="text-right">{question.settings?.poles?.high ?? LIKERT_LABELS[4]}</span>
          </div>
        </div>
      ) : question.question_type === "single" ? (
        <div className="mt-4 grid gap-2">
          {options.map((option) => {
            const selected = answers[question.id] === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(question.id, option.value)}
                className={`border px-4 py-3 text-left ${
                  selected ? "border-pine bg-pine text-paper" : "border-line bg-white hover:border-pine"
                }`}
                aria-pressed={selected}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : question.question_type === "multi" ? (
        <div className="mt-4 grid gap-2">
          {options.map((option) => {
            const selected = Array.isArray(answers[question.id])
              ? answers[question.id].includes(option.value)
              : false;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const current = Array.isArray(answers[question.id]) ? answers[question.id] : [];
                  const next = selected
                    ? current.filter((v) => v !== option.value)
                    : [...current, option.value];
                  onChange(question.id, next);
                }}
                className={`border px-4 py-3 text-left ${
                  selected ? "border-pine bg-pine text-paper" : "border-line bg-white hover:border-pine"
                }`}
                aria-pressed={selected}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : (
        <textarea
          value={typeof answers[question.id] === "string" ? answers[question.id] : ""}
          onChange={(e) => onChange(question.id, e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder={question.required ? "Skriv her" : "Valgfritt"}
          className="mt-4 w-full border border-line bg-white px-3 py-2"
        />
      )}
      {showOther ? (
        <input
          value={typeof extra === "string" ? extra : ""}
          onChange={(e) => onChange(otherKey(question.id), e.target.value)}
          placeholder="Hva heter det?"
          maxLength={120}
          className="mt-3 h-11 w-full border border-line bg-white px-3"
        />
      ) : null}
    </fieldset>
  );
}
