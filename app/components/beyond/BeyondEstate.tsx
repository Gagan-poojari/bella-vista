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
  const [value, setValue] = useState(45);
  const trackPct = (value / MAX_MIN) * 100;

  const ticks = useMemo(
    () => STOPS.map((s) => ({ ...s, pct: (s.time / MAX_MIN) * 100 })),
    []
  );

  return (
    <section id="beyond" className="relative overflow-hidden bg-[#ebe6da] py-24 sm:py-32">
      {/* ----------------- DOPE CARTOGRAPHIC & TOPO PATTERN / TEXTURE ----------------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft atmospheric gradient glow across the terrain */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 85% 15%, rgba(201,160,92,0.18), transparent 70%), radial-gradient(ellipse 65% 50% at 10% 85%, rgba(124,139,111,0.22), transparent 70%), radial-gradient(circle at 50% 50%, rgba(239,237,228,0.5), transparent 85%)",
          }}
        />

        {/* Surveyor coordinate grid: crosshairs + subtle gridlines */}
        <div
          className="absolute inset-0 opacity-[0.065]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #1e2a1d 1px, transparent 1px), linear-gradient(to bottom, #1e2a1d 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Full vector topographic elevation map + distance radar rings */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.22]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 800"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="radarGlow" cx="15%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#c9a05c" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#7c8b6f" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#1e2a1d" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Radar survey distance rings radiating from estate epicenter */}
          <circle cx="210" cy="240" r="140" fill="none" stroke="#c9a05c" strokeWidth="1" strokeDasharray="3 7" />
          <circle cx="210" cy="240" r="280" fill="none" stroke="#c9a05c" strokeWidth="1.2" strokeDasharray="4 8" opacity="0.8" />
          <circle cx="210" cy="240" r="440" fill="none" stroke="#7c8b6f" strokeWidth="1.2" strokeDasharray="3 9" opacity="0.65" />
          <circle cx="210" cy="240" r="620" fill="none" stroke="#7c8b6f" strokeWidth="1.4" strokeDasharray="5 11" opacity="0.5" />
          <circle cx="210" cy="240" r="820" fill="none" stroke="#1e2a1d" strokeWidth="1.5" strokeDasharray="2 8" opacity="0.4" />

          {/* Radar sweep radial lines */}
          <line x1="210" y1="240" x2="900" y2="10" stroke="#c9a05c" strokeWidth="0.8" strokeDasharray="2 6" opacity="0.5" />
          <line x1="210" y1="240" x2="1100" y2="480" stroke="#c9a05c" strokeWidth="0.8" strokeDasharray="2 6" opacity="0.5" />
          <line x1="210" y1="240" x2="600" y2="790" stroke="#7c8b6f" strokeWidth="0.8" strokeDasharray="2 6" opacity="0.5" />

          {/* Organic Topographic Contour Isolines - Western Ghats elevation profile */}
          <g fill="none" stroke="#1e2a1d" strokeWidth="1.2" opacity="0.6">
            {/* 900m Valley Basin */}
            <path d="M-50,650 C240,620 480,720 720,670 C960,620 1200,710 1500,640" strokeDasharray="4 6" />
            
            {/* 1,100m Foothills */}
            <path d="M-80,480 C180,420 360,540 680,460 C980,380 1240,510 1520,430" />
            
            {/* 1,350m Middle Ridge */}
            <path d="M-60,320 C140,240 380,360 640,280 C910,190 1180,320 1510,230" strokeWidth="1.4" />
            
            {/* 1,600m High Ridge */}
            <path d="M-40,190 C220,110 440,230 760,140 C1040,60 1280,180 1530,90" />
            
            {/* 1,930m Mullayanagiri Summit Ridge */}
            <path d="M-20,90 C260,20 520,130 840,40 C1120,-40 1340,70 1550,-10" stroke="#c9a05c" strokeWidth="1.8" />
          </g>

          {/* Floating Elevation & Geographic Coordinates */}
          <text x="80" y="80" fill="#7c8b6f" fontSize="10" fontFamily="var(--font-mono-ui), monospace" letterSpacing="0.18em">
            13°19&apos;02&quot;N 75°46&apos;30&quot;E · CHIKKAMAGALURU WESTERN GHATS
          </text>
          <text x="740" y="130" fill="#c9a05c" fontSize="10.5" fontFamily="var(--font-mono-ui), monospace" fontWeight="600" letterSpacing="0.12em">
            ▲ MULLAYANAGIRI PEAK · 1,930M
          </text>
          <text x="1050" y="320" fill="#7c8b6f" fontSize="9.5" fontFamily="var(--font-mono-ui), monospace" letterSpacing="0.12em">
            ▲ BABA BUDANGIRI RANGE · 1,895M
          </text>
          <text x="320" y="580" fill="#7c8b6f" fontSize="9.5" fontFamily="var(--font-mono-ui), monospace" letterSpacing="0.12em">
            ▲ HIREKOLALE BASIN · 1,020M
          </text>
        </svg>

        {/* Vintage surveyor compass rose watermark in bottom right */}
        <svg
          className="absolute -bottom-16 -right-16 h-80 w-80 text-husk/15"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="100" cy="100" r="90" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="70" strokeWidth="0.8" />
          <circle cx="100" cy="100" r="3" fill="currentColor" />
          <path d="M100 10 L100 190 M10 100 L190 100" strokeWidth="1" strokeDasharray="4 6" />
          <polygon points="100,20 105,95 100,100 95,95" fill="currentColor" opacity="0.6" />
          <polygon points="100,180 105,105 100,100 95,105" fill="currentColor" opacity="0.3" />
          <polygon points="180,100 105,105 100,100 105,95" fill="currentColor" opacity="0.3" />
          <polygon points="20,100 95,105 100,100 95,95" fill="currentColor" opacity="0.3" />
          <text x="96" y="17" fill="currentColor" fontSize="8" fontWeight="bold" fontFamily="monospace">N</text>
          <text x="183" y="103" fill="currentColor" fontSize="8" fontWeight="bold" fontFamily="monospace">E</text>
          <text x="97" y="196" fill="currentColor" fontSize="8" fontWeight="bold" fontFamily="monospace">S</text>
          <text x="9" y="103" fill="currentColor" fontSize="8" fontWeight="bold" fontFamily="monospace">W</text>
        </svg>
      </div>

      <style>{`
        .be-range {
          -webkit-appearance: none; appearance: none; width: 100%; height: 2px;
          background: transparent; position: relative; z-index: 10;
        }
        .be-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 24px; height: 24px; border-radius: 9999px;
          background: #c9a05c; border: 4px solid #f2ede1;
          box-shadow: 0 4px 14px rgba(30,42,29,0.38), 0 0 0 2px rgba(201,160,92,0.4);
          cursor: grab; margin-top: -11px;
          transition: transform .15s ease;
        }
        .be-range::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(1.15); }
        .be-range::-moz-range-thumb {
          width: 24px; height: 24px; border-radius: 9999px;
          background: #c9a05c; border: 4px solid #f2ede1;
          box-shadow: 0 4px 14px rgba(30,42,29,0.38), 0 0 0 2px rgba(201,160,92,0.4);
          cursor: grab;
        }
        .be-range::-webkit-slider-runnable-track { background: transparent; }
        .be-range::-moz-range-track { background: transparent; }

        .be-stop {
          transition: opacity .45s ease, filter .45s ease, transform .45s cubic-bezier(.19,.75,.24,1), box-shadow .45s ease, border-color .45s ease;
        }
        .be-stop[data-locked="true"] { opacity: 0.42; filter: grayscale(0.85); transform: scale(0.97); }
        .be-stop[data-locked="false"] {
          opacity: 1; filter: grayscale(0); transform: scale(1);
          box-shadow: 0 16px 36px rgba(30,42,29,0.18), 0 0 0 1px rgba(201,160,92,0.35);
        }
        .be-stop[data-locked="false"]:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 24px 46px rgba(30,42,29,0.24), 0 0 0 1.5px rgba(201,160,92,0.7);
        }
        @media (prefers-reduced-motion: reduce) { .be-stop { transition: none; } }

        .be-scroller::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
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
            <p className="mt-3 font-body text-[14px] leading-relaxed text-ink/65">
              From mirror-calm lakes to Hoysala stone temples and Karnataka&apos;s tallest mountain summit.
            </p>
          </div>
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 rounded-full border border-bark/20 bg-white/50 px-5 py-2.5 font-body text-[13px] font-semibold text-ink shadow-xs backdrop-blur-sm transition-all hover:border-husk hover:bg-white hover:text-husk hover:shadow-md"
          >
            Explore full guide
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
              <path d="M4 12 12 4M6 4h6v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Time-budget interactive slider */}
        <div className="mt-14 rounded-3xl border border-bark/15 bg-white/75 p-6 shadow-[0_22px_50px_rgba(30,42,29,0.08)] backdrop-blur-md sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-husk">
                Travel Radius
              </span>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">
                Up to {value} minute{value === 1 ? "" : "s"} away
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-husk animate-pulse" />
              <p className="font-body text-[13.5px] font-medium text-sage">{moodFor(value)}</p>
            </div>
          </div>

          <div className="relative mt-8">
            <div className="relative h-1.5 w-full rounded-full bg-bark/15">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-husk to-[#b88c42]"
                style={{ width: `${trackPct}%` }}
              />
              {ticks.map((t) => (
                <span
                  key={t.name}
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-xs transition-colors"
                  style={{
                    left: `${t.pct}%`,
                    background: t.time <= value ? "#c9a05c" : "rgba(30,42,29,0.25)",
                    transform: `translate(-50%, -50%) scale(${t.time <= value ? 1.1 : 0.85})`,
                  }}
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
              className="be-range absolute inset-x-0 -top-2"
              aria-label="Maximum travel time"
            />
          </div>

          {/* Quick preset chips */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-bark/10 pt-4">
            <div className="flex flex-wrap gap-2">
              {[
                { label: "On Grounds", val: 0 },
                { label: "Quick Detour (≤25m)", val: 25 },
                { label: "Half Day (≤45m)", val: 45 },
                { label: "Peak & Temples (90m)", val: 90 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setValue(preset.val)}
                  className={`rounded-full px-3 py-1 font-body text-[11.5px] font-medium transition-all ${
                    value === preset.val
                      ? "bg-ink text-mist shadow-xs"
                      : "border border-bark/15 bg-bark/4 text-ink/70 hover:border-husk hover:text-ink"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="flex gap-4 font-body text-[11.5px] text-ink/45">
              <span>0 min (Homestay)</span>
              <span>90 min (Summit)</span>
            </div>
          </div>
        </div>

        {/* Reachable stops cards */}
        <div className="be-scroller mt-10 flex gap-5 overflow-x-auto pb-6 pt-2">
          {STOPS.map((stop) => {
            const locked = stop.time > value;
            return (
              <div
                key={stop.name}
                data-locked={locked}
                className="be-stop relative w-62.5 shrink-0 overflow-hidden rounded-2xl bg-bark"
                style={{ aspectRatio: "4 / 5" }}
              >
                <SafeImage
                  src={stop.image}
                  alt={stop.name}
                  fill
                  sizes="260px"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  fallbackLabel=""
                />
                <span className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-ink/95 via-ink/40 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <span className="inline-block rounded-full bg-husk/25 px-2.5 py-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-husk backdrop-blur-sm">
                    {stop.distance}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-semibold text-mist">{stop.name}</h3>
                  <p className="mt-1.5 font-body text-[12.5px] leading-relaxed text-mist/75">
                    {stop.description}
                  </p>
                </div>

                {/* Status indicator: Unlocked or Time Locked */}
                {locked ? (
                  <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-mist backdrop-blur-md">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="5" y="11" width="14" height="9" rx="1.5" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    <span className="font-body text-[10.5px] font-medium">{stop.time} min</span>
                  </div>
                ) : (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-husk/40 bg-ink/70 px-2.5 py-1 text-husk shadow-xs backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-husk animate-ping" />
                    <span className="font-body text-[10.5px] font-semibold">Reachable</span>
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