"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SafeImage from "../shared/SafeImage";

type Stop = {
  time: number; // minutes from the homestay
  name: string;
  distance: string;
  description: string;
  image: string;
};

const STOPS: Stop[] = [
  {
    time: 0,
    name: "Right Here",
    distance: "On the estate",
    description: "Coffee walks and the view from your own deck.",
    image: "/beyond/estate.jpg",
  },
  {
    time: 10,
    name: "Hirekolale Lake",
    distance: "3.5 km away",
    description: "Sunset views where the water mirrors the sky.",
    image: "/beyond/hirekolale.jpg",
  },
  {
    time: 25,
    name: "Jhari Waterfalls",
    distance: "12 km away",
    description: "Cascades reached by a short jeep ride through the estates.",
    image: "/beyond/jhari.jpg",
  },
  {
    time: 45,
    name: "Belur & Halebidu",
    distance: "45 min drive",
    description: "Hoysala temple carvings, centuries deep.",
    image: "/beyond/belur.jpg",
  },
  {
    time: 90,
    name: "Mullayanagiri Peak",
    distance: "90 min drive",
    description: "Karnataka's highest point, above the clouds.",
    image: "/beyond/mullayanagiri.jpg",
  },
];

const MAX_MIN = 90;

function moodFor(value: number) {
  if (value <= 5) return "Just wander the grounds.";
  if (value <= 20) return "A quick detour, back by lunch.";
  if (value <= 50) return "Worth the drive.";
  return "Make a full day of it.";
}

export default function BeyondEstate() {
  const [value, setValue] = useState(30);
  const trackPct = (value / MAX_MIN) * 100;

  const ticks = useMemo(
    () => STOPS.map((s) => ({ ...s, pct: (s.time / MAX_MIN) * 100 })),
    []
  );

  return (
    <section id="beyond" className="relative bg-mist py-24 sm:py-32">
      <style>{`
        .be-range {
          -webkit-appearance: none; appearance: none; width: 100%; height: 2px;
          background: transparent; position: relative; z-index: 10;
        }
        .be-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 22px; height: 22px; border-radius: 9999px;
          background: #c9a05c; border: 4px solid #f2ede1;
          box-shadow: 0 3px 10px rgba(30,42,29,0.35);
          cursor: grab; margin-top: -10px;
        }
        .be-range::-webkit-slider-thumb:active { cursor: grabbing; }
        .be-range::-moz-range-thumb {
          width: 22px; height: 22px; border-radius: 9999px;
          background: #c9a05c; border: 4px solid #f2ede1;
          box-shadow: 0 3px 10px rgba(30,42,29,0.35); cursor: grab;
        }
        .be-range::-webkit-slider-runnable-track { background: transparent; }
        .be-range::-moz-range-track { background: transparent; }

        .be-stop { transition: opacity .45s ease, filter .45s ease, transform .45s cubic-bezier(.19,.75,.24,1); }
        .be-stop[data-locked="true"] { opacity: 0.4; filter: grayscale(0.85); }
        .be-stop[data-locked="false"] { opacity: 1; filter: grayscale(0); }
        @media (prefers-reduced-motion: reduce) { .be-stop { transition: none; } }

        .be-scroller::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-lg">
            <span
              className="mb-3 inline-block font-display text-[13px] italic text-husk"
              style={{ transform: "rotate(-3deg)" }}
            >
              how far do you want to wander?
            </span>
            <h2 className="font-display text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl">
              Beyond the estate
            </h2>
          </div>
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2.5 font-body text-[13px] font-semibold text-ink transition-colors hover:border-husk hover:text-husk"
          >
            Explore full guide
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
              <path d="M4 12 12 4M6 4h6v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Time-budget slider */}
        <div className="mt-16 rounded-3xl border border-bark/10 bg-white/60 p-6 sm:p-8">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-lg font-semibold text-ink">
              Up to {value} minute{value === 1 ? "" : "s"} away
            </p>
            <p className="font-body text-[13px] text-sage">{moodFor(value)}</p>
          </div>

          <div className="relative mt-8">
            <div className="relative h-[2px] w-full rounded-full bg-bark/15">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-husk"
                style={{ width: `${trackPct}%` }}
              />
              {ticks.map((t) => (
                <span
                  key={t.name}
                  className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-mist"
                  style={{ left: `${t.pct}%`, background: t.time <= value ? "#c9a05c" : "rgba(30,42,29,0.25)" }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <input
              type="range"
              min={0}
              max={MAX_MIN}
              step={1}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="be-range absolute inset-x-0 -top-2.5"
              aria-label="Maximum travel time"
            />
          </div>

          <div className="mt-2 flex justify-between font-body text-[11px] text-ink/40">
            <span>Right here</span>
            <span>90 min drive</span>
          </div>
        </div>

        {/* Reachable stops */}
        <div className="be-scroller mt-10 flex gap-5 overflow-x-auto pb-2">
          {STOPS.map((stop) => {
            const locked = stop.time > value;
            return (
              <div
                key={stop.name}
                data-locked={locked}
                className="be-stop relative w-[240px] flex-shrink-0 overflow-hidden rounded-2xl bg-bark"
                style={{ aspectRatio: "4 / 5" }}
              >
                <SafeImage
                  src={stop.image}
                  alt={stop.name}
                  fill
                  sizes="240px"
                  className="h-full w-full object-cover"
                  fallbackLabel=""
                />
                <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-body text-[10.5px] font-medium uppercase tracking-[0.12em] text-mist/70">
                    {stop.distance}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-mist">{stop.name}</h3>
                  <p className="mt-1 font-body text-[12px] leading-relaxed text-mist/75">
                    {stop.description}
                  </p>
                </div>

                {locked && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-ink/70 px-2.5 py-1 backdrop-blur-sm">
                    <svg viewBox="0 0 24 24" className="h-3 w-3 text-mist" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="11" width="14" height="9" rx="1.5" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    <span className="font-body text-[10px] font-medium text-mist">{stop.time} min</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}