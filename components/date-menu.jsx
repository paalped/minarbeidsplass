"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const WEEKDAYS = ["ma", "ti", "on", "to", "fr", "lø", "sø"];
const MONTHS = [
  "Januar",
  "Februar",
  "Mars",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function pad(value) {
  return String(value).padStart(2, "0");
}

function toIso(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function parseIso(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? "").slice(0, 10));
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return null;
  return { year, monthIndex, day };
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function startWeekday(year, monthIndex) {
  return (new Date(year, monthIndex, 1).getDay() + 6) % 7;
}

function formatDisplay(value) {
  const parsed = parseIso(value);
  if (!parsed) return "";
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function thisYear() {
  return new Date().getFullYear();
}

export function DateMenu({ id, value, onChange, minYear = 1960, label }) {
  const boxRef = useRef(null);
  const [open, setOpen] = useState(false);
  const selected = parseIso(value);
  const initial = selected ?? { year: thisYear(), monthIndex: new Date().getMonth(), day: 1 };
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.monthIndex);

  const years = useMemo(() => {
    const max = thisYear() + 1;
    const list = [];
    for (let year = max; year >= minYear; year -= 1) list.push(year);
    return list;
  }, [minYear]);

  const cells = useMemo(() => {
    const leading = startWeekday(viewYear, viewMonth);
    const count = daysInMonth(viewYear, viewMonth);
    const items = Array.from({ length: leading }, () => null);
    for (let day = 1; day <= count; day += 1) items.push(day);
    while (items.length % 7 !== 0) items.push(null);
    return items;
  }, [viewYear, viewMonth]);

  useEffect(() => {
    if (!open || !selected) return;
    setViewYear(selected.year);
    setViewMonth(selected.monthIndex);
  }, [open, selected?.year, selected?.monthIndex]);

  useEffect(() => {
    function onClick(event) {
      if (!boxRef.current?.contains(event.target)) setOpen(false);
    }
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function shiftMonth(delta) {
    const date = new Date(viewYear, viewMonth + delta, 1);
    const maxYear = thisYear() + 1;
    const year = Math.min(maxYear, Math.max(minYear, date.getFullYear()));
    setViewYear(year);
    setViewMonth(year === date.getFullYear() ? date.getMonth() : year === maxYear ? 11 : 0);
  }

  function pickDay(day) {
    onChange(toIso(viewYear, viewMonth, day));
    setOpen(false);
  }

  const shown = formatDisplay(value);

  return (
    <div ref={boxRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="mt-1 flex h-11 w-full items-center justify-between border border-line bg-white px-3 text-left"
      >
        <span className={shown ? "" : "text-muted"}>{shown || "Velg dato"}</span>
        <span aria-hidden className="text-muted">
          ▾
        </span>
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label={label ?? "Velg dato"}
          className="paper-card absolute z-30 mt-1 w-[min(100%,20rem)] p-4 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-10 w-10 shrink-0 border border-line hover:bg-paper-2"
              aria-label="Forrige måned"
              onClick={() => shiftMonth(-1)}
            >
              ‹
            </button>
            <select
              aria-label="Måned"
              className="h-10 min-w-0 flex-1 border border-line bg-white px-2"
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
            >
              {MONTHS.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>
            <select
              aria-label="År"
              className="h-10 w-[5.5rem] border border-line bg-white px-2"
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="h-10 w-10 shrink-0 border border-line hover:bg-paper-2"
              aria-label="Neste måned"
              onClick={() => shiftMonth(1)}
            >
              ›
            </button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1 uppercase">
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (!day) return <span key={`e-${index}`} />;
              const iso = toIso(viewYear, viewMonth, day);
              const active = iso === value;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => pickDay(day)}
                  className={
                    active
                      ? "h-9 bg-pine text-paper"
                      : "h-9 hover:bg-paper-2"
                  }
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
