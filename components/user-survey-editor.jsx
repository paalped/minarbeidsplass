"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  blankQuestion,
  questionsForEditor,
  userSurveySharePath,
  userSurveyStatusLabel,
} from "@/lib/user-surveys";

const TYPES = [
  { value: "likert", label: "Enig / uenig (1–5)" },
  { value: "text", label: "Fritekst" },
  { value: "single", label: "Ett valg" },
];

export function UserSurveyEditor({ survey, responseCount = 0 }) {
  const router = useRouter();
  const [title, setTitle] = useState(survey.title === "Uten tittel" ? "" : survey.title);
  const [description, setDescription] = useState(survey.description ?? "");
  const [questions, setQuestions] = useState(questionsForEditor(survey.survey_questions));
  const [status, setStatus] = useState(survey.status);
  const [token, setToken] = useState(survey.share_token);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const shareUrl = token && origin ? `${origin}${userSurveySharePath(token)}` : "";
  const published = status === "published";

  function updateQuestion(id, patch) {
    setQuestions((prev) => prev.map((question) => (question.id === id ? { ...question, ...patch } : question)));
  }

  function moveQuestion(id, delta) {
    setQuestions((prev) => {
      const index = prev.findIndex((question) => question.id === id);
      const next = index + delta;
      if (index < 0 || next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      return copy;
    });
  }

  async function save(nextStatus) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/mine-undersokelser/${survey.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          questions,
          status: nextStatus ?? status,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke lagre.");
      setStatus(json.survey.status);
      setToken(json.survey.share_token);
      setQuestions(questionsForEditor(json.survey.survey_questions));
      if (title.trim()) setTitle(json.survey.title);
      router.refresh();
      return json.survey;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!window.confirm("Slette undersøkelsen? Svarene forsvinner også.")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/mine-undersokelser/${survey.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke slette.");
      router.push("/mine-undersokelser");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
      setSaving(false);
    }
  }

  async function copyLink() {
    if (!shareUrl || !published) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Kunne ikke kopiere lenken.");
    }
  }

  const field = "mt-1 w-full border border-line bg-white px-3 py-2";

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
        className="grid gap-5"
      >
        <div className="paper-card p-6">
          <label htmlFor="user-survey-title" className="text-sm font-medium">
            Tittel
          </label>
          <input
            id="user-survey-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Hvordan er onboarding hos dere?"
            className={field}
            maxLength={140}
            required
          />
          <label htmlFor="user-survey-description" className="mt-5 block text-sm font-medium">
            Ingress
          </label>
          <textarea
            id="user-survey-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Fortell kort hva du vil vite. Teller ikke i kåringen."
            className={field}
          />
        </div>

        <div className="grid gap-4">
          {questions.map((question, index) => (
            <div key={question.id} className="paper-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="kicker">Spørsmål {index + 1}</p>
                <div className="flex gap-3 text-sm">
                  <button type="button" className="underline disabled:opacity-30" disabled={index === 0} onClick={() => moveQuestion(question.id, -1)}>
                    Opp
                  </button>
                  <button
                    type="button"
                    className="underline disabled:opacity-30"
                    disabled={index === questions.length - 1}
                    onClick={() => moveQuestion(question.id, 1)}
                  >
                    Ned
                  </button>
                  <button
                    type="button"
                    className="text-rust underline"
                    onClick={() => setQuestions((prev) => prev.filter((item) => item.id !== question.id))}
                  >
                    Fjern
                  </button>
                </div>
              </div>
              <input
                value={question.prompt}
                onChange={(e) => updateQuestion(question.id, { prompt: e.target.value })}
                placeholder="Spørsmålet"
                className={`mt-3 ${field}`}
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  Type
                  <select
                    value={question.question_type}
                    onChange={(e) => updateQuestion(question.id, { question_type: e.target.value })}
                    className={field}
                  >
                    {TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Gruppe
                  <input
                    value={question.category}
                    onChange={(e) => updateQuestion(question.id, { category: e.target.value })}
                    className={field}
                    maxLength={40}
                  />
                </label>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                />
                Påkrevd
              </label>
              {question.question_type === "likert" ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    value={question.poles.low}
                    onChange={(e) => updateQuestion(question.id, { poles: { ...question.poles, low: e.target.value } })}
                    placeholder="Venstre (f.eks. Svært uenig)"
                    className={field}
                  />
                  <input
                    value={question.poles.high}
                    onChange={(e) => updateQuestion(question.id, { poles: { ...question.poles, high: e.target.value } })}
                    placeholder="Høyre (f.eks. Svært enig)"
                    className={field}
                  />
                </div>
              ) : null}
              {question.question_type === "single" ? (
                <div className="mt-3 grid gap-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={`${question.id}-opt-${optionIndex}`} className="flex gap-2">
                      <input
                        value={option}
                        onChange={(e) => {
                          const options = [...question.options];
                          options[optionIndex] = e.target.value;
                          updateQuestion(question.id, { options });
                        }}
                        placeholder={`Valg ${optionIndex + 1}`}
                        className={field}
                      />
                      <button
                        type="button"
                        className="text-sm underline"
                        onClick={() =>
                          updateQuestion(question.id, {
                            options: question.options.filter((_, i) => i !== optionIndex),
                          })
                        }
                      >
                        Fjern
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="justify-self-start text-sm text-rust underline"
                    onClick={() => updateQuestion(question.id, { options: [...question.options, ""] })}
                  >
                    Legg til valg
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setQuestions((prev) => [...prev, blankQuestion(type.value)])}
              className="h-11 border border-pine px-4 text-sm text-pine hover:bg-paper-2"
            >
              + {type.label}
            </button>
          ))}
        </div>

        {error ? <p className="text-sm text-rust">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="h-12 bg-pine px-5 text-paper hover:bg-pine-soft disabled:opacity-50"
          >
            {saving ? "Lagrer…" : "Lagre kladd"}
          </button>
          {published ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => void save("draft")}
              className="h-12 border border-pine px-5 text-pine hover:bg-paper-2 disabled:opacity-50"
            >
              Avpubliser
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => void save("published")}
              className="h-12 bg-rust px-5 text-paper hover:bg-rust-dark disabled:opacity-50"
            >
              Publiser
            </button>
          )}
          <button type="button" disabled={saving} onClick={() => void onDelete()} className="h-12 px-4 text-sm text-muted underline">
            Slett
          </button>
        </div>
      </form>

      <aside className="grid h-fit gap-5">
        <div className="paper-card p-6">
          <p className="kicker">Status</p>
          <p className="mt-2 font-serif text-3xl">{userSurveyStatusLabel(status)}</p>
          <p className="mt-3 text-muted">
            Kladden er bare synlig for deg. Publisert får du en lenke andre kan åpne. De må logge inn
            for å svare, og det teller ikke i kåringen.
          </p>
        </div>
        <div className="paper-card p-6">
          <p className="kicker">Svar</p>
          <p className="mt-2 font-serif text-4xl tabular-nums">{responseCount}</p>
          <p className="mt-3 text-muted">
            Bare antallet. Ingen navn, e-post eller enkelt svar.
          </p>
        </div>
        <div className="paper-card p-6">
          <p className="kicker">Delbar lenke</p>
          {published && shareUrl ? (
            <>
              <p className="mt-3 break-all text-sm">{shareUrl}</p>
              <button
                type="button"
                onClick={() => void copyLink()}
                className="mt-4 h-11 bg-rust px-4 text-paper hover:bg-rust-dark"
              >
                {copied ? "Kopiert" : "Kopier lenke"}
              </button>
            </>
          ) : (
            <p className="mt-3 text-muted">Lenken aktiveres når du publiserer.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

export function CreateSurveyButton() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function create() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/mine-undersokelser", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kunne ikke opprette.");
      router.push(`/mine-undersokelser/${json.survey.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
      setSaving(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void create()}
        disabled={saving}
        className="inline-flex h-12 items-center justify-center bg-rust px-5 text-paper hover:bg-rust-dark disabled:opacity-50"
      >
        {saving ? "Oppretter…" : "Ny undersøkelse"}
      </button>
      {error ? <p className="mt-2 text-sm text-rust">{error}</p> : null}
    </div>
  );
}
