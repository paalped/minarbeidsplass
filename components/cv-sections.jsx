"use client";

import { useState } from "react";
import { CvEntryCard } from "@/components/cv-entry-card";
import { CvEntryForm } from "@/components/cv-entry-form";

export function CurrentSection({ current }) {
  const [adding, setAdding] = useState(false);

  return (
    <section className="mt-12">
      <h2 className="font-serif text-2xl">Nåværende arbeidsplass</h2>
      {current ? (
        <div className="mt-4 border-y border-line">
          <CvEntryCard entry={current} />
        </div>
      ) : adding ? (
        <CvEntryForm mode="current" onCancel={() => setAdding(false)} />
      ) : (
        <>
          <p className="mt-3 max-w-xl text-muted">Ingen nåværende jobb lagt inn ennå.</p>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-4 h-11 bg-pine px-4 text-paper hover:bg-pine-soft"
          >
            Legg inn nåværende jobb
          </button>
        </>
      )}
    </section>
  );
}

export function PreviousSection({ previous }) {
  const [adding, setAdding] = useState(false);

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl">Tidligere arbeidsplasser</h2>
          <p className="mt-2 max-w-xl text-muted">
            Disse kan du ta undersøkelsen for. Ett svar per bedrift og undersøkelse.
          </p>
        </div>
        {adding ? null : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="h-11 border border-pine px-4 text-pine hover:bg-paper-2"
          >
            Legg til tidligere jobb
          </button>
        )}
      </div>
      {adding ? <CvEntryForm mode="previous" onCancel={() => setAdding(false)} /> : null}
      {previous.length ? (
        <div className="mt-6 border-b border-line">
          {previous.map((entry) => (
            <CvEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : adding ? null : (
        <p className="mt-6 text-muted">Ingen tidligere jobber i CV-en ennå.</p>
      )}
    </section>
  );
}
