"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import SafeImage from "../shared/SafeImage";
import { ROOM_TYPES, weekdayPrice, type Amenity, type AmenityIcon } from "../../lib/rooms";

// Hand-placed on the map (percentages within the map frame) and paired with
// a little invented place-name + note - this is flavour text for the map
// concept, not room data, so it lives here rather than in lib/rooms.
const MAP_META: Record<string, { top: number; left: number; place: string; note: string }> = {
  "1bhk-cottage": {
    top: 22,
    left: 66,
    place: "North Ridge",
    note: "Furthest from the gate, closest to the clouds.",
  },
  "2bhk-villa": {
    top: 54,
    left: 32,
    place: "The Hollow",
    note: "Where the valley opens up right below the deck.",
  },
  dormitory: {
    top: 80,
    left: 70,
    place: "Trail's End",
    note: "Steps from the trekking path - bunks, lockers, and new friends.",
  },
};

const TRAIL_PATH =
  "M66,22 C55,32 45,39 32,54 C39,65 55,71 70,80";

function useCountUp(value: number, durationMs: number, enabled: boolean) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }
    const from = fromRef.current;
    if (from === value) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs, enabled]);

  return display;
}

const AMENITY_ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
} as const;

const AMENITY_ICONS: Record<AmenityIcon, React.ReactNode> = {
  wifi: (
    <svg {...AMENITY_ICON_PROPS}>
      <path d="M4 9.5c4.8-4.4 11.2-4.4 16 0" />
      <path d="M7 13c3-2.6 7-2.6 10 0" />
      <path d="M10.2 16.4c1-.9 2.6-.9 3.6 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  coffee: (
    <svg {...AMENITY_ICON_PROPS}>
      <path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z" />
      <path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 6.2c-.6-.7-.6-1.4 0-2.2M11.3 6.2c-.6-.7-.6-1.4 0-2.2" />
    </svg>
  ),
  view: (
    <svg {...AMENITY_ICON_PROPS}>
      <circle cx="7.5" cy="8" r="2" />
      <path d="M3 18l5.5-6.5L12 15l3-4 6 7H3Z" />
    </svg>
  ),
  tv: (
    <svg {...AMENITY_ICON_PROPS}>
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
      <path d="M8 20.5h8M12 18v2.5" />
    </svg>
  ),
  kitchen: (
    <svg {...AMENITY_ICON_PROPS}>
      <path d="M6 3v7a3 3 0 0 0 6 0V3M9 10v11" />
      <path d="M16 3v6.5a2 2 0 0 0 2 2v9" />
    </svg>
  ),
  parking: (
    <svg {...AMENITY_ICON_PROPS}>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="M9.5 16V8h3a2.5 2.5 0 0 1 0 5h-3" />
    </svg>
  ),
  locker: (
    <svg {...AMENITY_ICON_PROPS}>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M12 3v18" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  group: (
    <svg {...AMENITY_ICON_PROPS}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9.5" r="2.3" />
      <path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
      <path d="M15 20c.3-2.7 2-4.6 4.5-5" />
    </svg>
  ),
  shower: (
    <svg {...AMENITY_ICON_PROPS}>
      <path d="M6 8.5A6 6 0 0 1 17.8 6" />
      <path d="M4 10.5h16" />
      <path d="M7 14v1.5M11 14v1.5M15 14v1.5M9 17.5V19M13 17.5V19" />
    </svg>
  ),
};

function AmenityRow({ amenities }: { amenities: Amenity[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2.5">
      {amenities.map((a) => (
        <li key={a.label} className="flex items-center gap-2 text-ink/70">
          <span className="flex h-5 w-5 items-center justify-center text-husk [&_svg]:h-full [&_svg]:w-full">
            {AMENITY_ICONS[a.icon]}
          </span>
          <span className="font-body text-[12px]">{a.label}</span>
        </li>
      ))}
    </ul>
  );
}

export default function RoomsOverview() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardAnchorRef = useRef<HTMLSpanElement>(null);
  const pinRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [activeSlug, setActiveSlug] = useState(ROOM_TYPES[0].slug);
  const [rateMode, setRateMode] = useState<"weekend" | "weekday">("weekend");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [linePath, setLinePath] = useState("");
  const [lineVisible, setLineVisible] = useState(false);

  const activeRoom = ROOM_TYPES.find((r) => r.slug === activeSlug)!;
  const meta = MAP_META[activeSlug];

  const targetPrice =
    rateMode === "weekend" ? activeRoom.weekendPrice : weekdayPrice(activeRoom);
  const displayPrice = useCountUp(targetPrice, 550, !reduceMotion);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // One-time rise-in for the whole map block, mirroring the hero's mist
  // entrance - one orchestrated moment rather than a per-item stagger.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const target = el.querySelector<HTMLElement>("[data-reveal]");
    if (!target) return;
    if (reduceMotion) {
      target.classList.add("cs-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            target.classList.add("cs-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [reduceMotion]);

  // Draws the dashed line from the active pin to the field-note card.
  // Desktop only - on mobile the card sits directly under the map instead.
  const recomputeLine = useCallback(() => {
    if (!window.matchMedia("(min-width: 900px)").matches) {
      setLinePath("");
      return;
    }
    const gridEl = gridRef.current;
    const pinEl = pinRefs.current[activeSlug];
    const cardEl = cardAnchorRef.current;
    if (!gridEl || !pinEl || !cardEl) return;

    const gridRect = gridEl.getBoundingClientRect();
    const pinRect = pinEl.getBoundingClientRect();
    const cardRect = cardEl.getBoundingClientRect();

    const x1 = pinRect.left + pinRect.width / 2 - gridRect.left;
    const y1 = pinRect.top + pinRect.height / 2 - gridRect.top;
    const x2 = cardRect.left + cardRect.width / 2 - gridRect.left;
    const y2 = cardRect.top + cardRect.height / 2 - gridRect.top;
    const midX = x1 + (x2 - x1) * 0.55;

    setLinePath(`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`);
  }, [activeSlug]);

  useLayoutEffect(() => {
    setLineVisible(false);
    const t = window.setTimeout(() => {
      recomputeLine();
      setLineVisible(true);
    }, reduceMotion ? 0 : 90);
    return () => window.clearTimeout(t);
  }, [activeSlug, recomputeLine, reduceMotion]);

  useEffect(() => {
    const onResize = () => recomputeLine();
    window.addEventListener("resize", onResize);
    const ro = gridRef.current ? new ResizeObserver(onResize) : null;
    if (ro && gridRef.current) ro.observe(gridRef.current);
    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, [recomputeLine]);

  const savingsPct = activeRoom.weekdayDiscountPct;

  return (
    <section id="rooms" ref={sectionRef} className="relative overflow-hidden bg-mist py-24 sm:py-32">
      <style>{`
        [data-reveal] { opacity: 0; transform: translateY(28px); filter: blur(6px); }
        [data-reveal].cs-in { animation: rm-rise 1s cubic-bezier(.19,.75,.24,1) forwards; }
        @keyframes rm-rise { to { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal] { opacity: 1; transform: none; filter: none; }
        }

        /* Contour-line texture: two layers of the same tileable pattern
           drifting opposite directions at different speeds, like isolines
           on a survey map slowly settling. */
        .rm-contour-layer {
          position: absolute; inset: -10% -20%;
          background-repeat: repeat;
          background-size: 340px 340px;
          opacity: 0.05;
        }
        .rm-contour-a { animation: rm-drift-a 140s linear infinite; }
        .rm-contour-b {
          background-size: 480px 480px;
          opacity: 0.045;
          animation: rm-drift-b 190s linear infinite;
        }
        @keyframes rm-drift-a { from { transform: translate(0, 0); } to { transform: translate(-340px, 170px); } }
        @keyframes rm-drift-b { from { transform: translate(0, 0); } to { transform: translate(480px, -240px); } }
        @media (prefers-reduced-motion: reduce) {
          .rm-contour-a, .rm-contour-b { animation: none; }
        }

        .rm-trail { stroke-dasharray: 1 9; stroke-linecap: round; animation: rm-trail-march 26s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .rm-trail { animation: none; } }
        @keyframes rm-trail-march { to { stroke-dashoffset: -200; } }

        .rm-pin-ring { animation: rm-ping 2.4s cubic-bezier(.4,0,.3,1) infinite; }
        @media (prefers-reduced-motion: reduce) { .rm-pin-ring { animation: none; opacity: 0.35; } }
        @keyframes rm-ping {
          0% { transform: scale(0.9); opacity: 0.55; }
          75%, 100% { transform: scale(2.1); opacity: 0; }
        }

        .rm-connector { transition: opacity .35s ease; }
        .rm-toggle-thumb { transition: transform .35s cubic-bezier(.19,.75,.24,1); }

        .rm-tape {
          position: absolute; top: -10px; left: 50%; transform: translateX(-50%) rotate(-2deg);
          width: 72px; height: 22px; background: rgba(201,160,92,0.35);
          border: 1px solid rgba(201,160,92,0.4);
        }
      `}</style>

      {/* Contour texture - two drifting layers of the same tileable SVG tile. */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="rm-contour-layer rm-contour-a"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='340' height='340'%3E%3Cg fill='none' stroke='%233f4a3d' stroke-width='1.3'%3E%3Cpath d='M0,40 Q85,0 170,40 T340,40'/%3E%3Cpath d='M-20,120 Q65,80 150,120 T320,110'/%3E%3Cpath d='M10,210 Q95,170 180,210 T360,205'/%3E%3Cpath d='M-10,290 Q75,255 160,290 T330,280'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div
          className="rm-contour-layer rm-contour-b"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='340' height='340'%3E%3Cg fill='none' stroke='%23c9a05c' stroke-width='1.1'%3E%3Cpath d='M0,40 Q85,0 170,40 T340,40'/%3E%3Cpath d='M-20,120 Q65,80 150,120 T320,110'/%3E%3Cpath d='M10,210 Q95,170 180,210 T360,205'/%3E%3Cpath d='M-10,290 Q75,255 160,290 T330,280'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
        <div className="relative max-w-xl">
          <span
            className="mb-3 inline-block font-display text-[13px] italic text-husk"
            style={{ transform: "rotate(-3deg)" }}
          >
            a quick tour of the property
          </span>
          <h2 className="font-display text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl">
            Somewhere on the hillside,
            <br />
            <span className="font-normal text-ink/55">there&apos;s a room with your name on it.</span>
          </h2>
        </div>

        <div
          data-reveal
          ref={gridRef}
          className="relative mt-16 grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:gap-4"
        >
          {/* Pin-to-card connector, desktop only */}
          <svg
            className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full md:block"
            aria-hidden="true"
          >
            <path
              className="rm-connector"
              d={linePath}
              fill="none"
              stroke="#c9a05c"
              strokeWidth="1.5"
              strokeDasharray="1 7"
              strokeLinecap="round"
              style={{ opacity: lineVisible && linePath ? 0.8 : 0 }}
            />
          </svg>

          {/* The map */}
          <div className="relative aspect-[5/4] overflow-hidden rounded-[26px] border border-bark/10 bg-white/40 shadow-[0_20px_50px_rgba(30,42,29,0.1)] sm:aspect-[16/11]">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="rm-trail"
                d={TRAIL_PATH}
                fill="none"
                stroke="#8a6d3a"
                strokeWidth="0.5"
                opacity="0.55"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {ROOM_TYPES.map((room) => {
              const m = MAP_META[room.slug];
              const isActive = room.slug === activeSlug;
              return (
                <button
                  key={room.slug}
                  ref={(el) => {
                    pinRefs.current[room.slug] = el;
                  }}
                  onClick={() => setActiveSlug(room.slug)}
                  aria-pressed={isActive}
                  aria-label={`Show ${room.name}`}
                  className="group cursor-pointer absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
                  style={{ top: `${m.top}%`, left: `${m.left}%` }}
                >
                  <span className="relative flex h-4 w-4 items-center justify-center">
                    {isActive && (
                      <span className="rm-pin-ring absolute h-4 w-4 rounded-full bg-husk/60" />
                    )}
                    <span
                      className="relative h-2.5 w-2.5 rounded-full border transition-all duration-300"
                      style={{
                        background: isActive ? "#c9a05c" : "rgba(30,42,29,0.35)",
                        borderColor: isActive ? "#c9a05c" : "rgba(30,42,29,0.4)",
                        transform: isActive ? "scale(1.3)" : "scale(1)",
                      }}
                    />
                  </span>
                  <span
                    className="whitespace-nowrap rounded-full px-2 py-0.5 font-display text-[11px] font-medium transition-colors"
                    style={{
                      color: isActive ? "#1e2a1d" : "rgba(30,42,29,0.5)",
                      background: isActive ? "rgba(201,160,92,0.28)" : "transparent",
                    }}
                  >
                    {m.place}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Field note card */}
          <div className="relative z-10 flex flex-col rounded-[22px] border border-bark/10 bg-white/80 p-6 shadow-[0_20px_50px_rgba(30,42,29,0.1)] backdrop-blur-sm sm:p-7">
            <span ref={cardAnchorRef} className="absolute -left-1.5 top-8 h-3 w-3 rounded-full bg-husk" aria-hidden="true" />

            <p className="font-body text-[11px] text-ink/45">{activeRoom.tag}</p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-ink">{meta.place}</h3>
            <p className="font-body text-[13px] text-husk">{activeRoom.name}</p>

            <div
              className="relative mt-5 aspect-[4/3] w-[62%] self-start overflow-hidden rounded-lg shadow-[0_14px_30px_rgba(30,42,29,0.22)]"
              style={{ transform: "rotate(-1.5deg)" }}
            >
              <span className="rm-tape" aria-hidden="true" />
              <SafeImage
                src={`/rooms/${activeRoom.slug}/cover.png`}
                alt={activeRoom.name}
                fill
                sizes="260px"
                className="h-full w-full object-cover"
                fallbackLabel={activeRoom.comingSoon ? "Photos coming soon" : undefined}
              />
            </div>

            <p className="mt-5 font-display text-[14.5px] italic leading-relaxed text-ink/70">
              &ldquo;{meta.note}&rdquo;
            </p>

            <div className="mt-5">
              <AmenityRow amenities={activeRoom.amenities} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-bark/10 pt-5">
              <p className="font-display text-xl font-semibold text-ink">
                ₹{displayPrice.toLocaleString("en-IN")}
                <span className="ml-1 font-body text-[12px] font-normal text-ink/50">{activeRoom.unit}</span>
              </p>

              <div className="relative ml-auto flex rounded-full border border-bark/15 bg-bark/[0.04] p-0.5">
                <span
                  className="rm-toggle-thumb absolute inset-y-0.5 w-[58px] rounded-full bg-white shadow-sm"
                  style={{ transform: rateMode === "weekend" ? "translateX(0)" : "translateX(58px)" }}
                />
                {(["weekend", "weekday"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setRateMode(mode)}
                    className="relative z-10 w-[58px] rounded-full py-1.5 font-body text-[10.5px] font-medium capitalize text-ink/70"
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {rateMode === "weekday" && (
              <p className="mt-2 font-body text-[11.5px] text-sage">{savingsPct}% off, Monday–Thursday.</p>
            )}

            <Link
              href={`/rooms/${activeRoom.slug}`}
              className="mt-5 flex items-center gap-1.5 self-start font-body text-[13px] font-semibold text-ink transition-colors hover:text-husk"
            >
              View details
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                <path
                  d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}