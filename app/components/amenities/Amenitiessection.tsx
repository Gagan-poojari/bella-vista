"use client";

import { useEffect, useRef, useState } from "react";

type AmenityIcon = "wifi" | "coffee" | "view" | "tv" | "kitchen" | "parking";

type AmenityItem = {
  icon: AmenityIcon;
  title: string;
  description: string;
};

// Same six comforts as before, now framed as signs you'd pass walking the
// grounds rather than a features grid.
const AMENITIES: AmenityItem[] = [
  {
    icon: "wifi",
    title: "High-Speed WiFi",
    description: "Stay connected amidst nature with premium high-speed internet.",
  },
  {
    icon: "coffee",
    title: "Estate-Fresh Coffee",
    description:
      "Wake up to the aroma of authentic Chikkamagaluru coffee, sourced directly from our plantation.",
  },
  {
    icon: "view",
    title: "Scenic Valley Views",
    description: "Every room offers uninterrupted views of the misty Western Ghats.",
  },
  {
    icon: "tv",
    title: "Smart Entertainment",
    description: "Enjoy your favorite shows on our premium Smart TVs available in all cottages.",
  },
  {
    icon: "kitchen",
    title: "Full Kitchen",
    description: "Equipped with modern appliances for your culinary experiments.",
  },
  {
    icon: "parking",
    title: "Free On-site Parking",
    description: "Secure and spacious parking for all guest vehicles.",
  },
];

// Small hand-set stagger so the row reads like real signs planted at
// slightly different times, not a manufactured grid. Index-matched to
// AMENITIES above.
const OFFSET_Y = [-10, 9, -5, 6, -9, 4];
const ROTATE = [-1.6, 1.1, -1, 1.6, -0.9, 1.3];

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
} as const;

const ICONS: Record<AmenityIcon, React.ReactNode> = {
  wifi: (
    <svg {...ICON_PROPS}>
      <path d="M4 9.5c4.8-4.4 11.2-4.4 16 0" />
      <path d="M7 13c3-2.6 7-2.6 10 0" />
      <path d="M10.2 16.4c1-.9 2.6-.9 3.6 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  coffee: (
    <svg {...ICON_PROPS}>
      <path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z" />
      <path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 6.2c-.6-.7-.6-1.4 0-2.2M11.3 6.2c-.6-.7-.6-1.4 0-2.2" />
    </svg>
  ),
  view: (
    <svg {...ICON_PROPS}>
      <circle cx="7.5" cy="8" r="2" />
      <path d="M3 18l5.5-6.5L12 15l3-4 6 7H3Z" />
    </svg>
  ),
  tv: (
    <svg {...ICON_PROPS}>
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
      <path d="M8 20.5h8M12 18v2.5" />
    </svg>
  ),
  kitchen: (
    <svg {...ICON_PROPS}>
      <path d="M6 3v7a3 3 0 0 0 6 0V3M9 10v11" />
      <path d="M16 3v6.5a2 2 0 0 0 2 2v9" />
    </svg>
  ),
  parking: (
    <svg {...ICON_PROPS}>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="M9.5 16V8h3a2.5 2.5 0 0 1 0 5h-3" />
    </svg>
  ),
};

export default function AmenitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const target = el.querySelector<HTMLElement>("[data-reveal]");
    if (!target) return;
    if (reduceMotion) {
      target.classList.add("am-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            target.classList.add("am-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [reduceMotion]);

  return (
    <section id="amenities" ref={sectionRef} className="relative overflow-hidden bg-mist py-24 sm:py-32">
      {/* ----------------- DISTINCT ESTATE PLANTATION & FOOTPATH PATTERN ----------------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Layer 1: Fine estate plantation grid with surveyor crosshairs */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #4a3728 1px, transparent 1px), linear-gradient(to bottom, #4a3728 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Layer 2: Subtle botanical woven linen grain */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #1e2a1d 0px, #1e2a1d 1px, transparent 1px, transparent 12px), repeating-linear-gradient(-45deg, #c9a05c 0px, #c9a05c 1px, transparent 1px, transparent 12px)",
          }}
        />

        {/* Layer 3: Ambient sun-dappled estate canopy illumination */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 85% 15%, rgba(201,160,92,0.18), transparent 65%), radial-gradient(ellipse 70% 50% at 15% 90%, rgba(124,139,111,0.18), transparent 70%)",
          }}
        />

        {/* Layer 4: Coffee plantation branch & leaf botanical vector watermark */}
        <svg
          className="absolute -left-12 -top-12 h-96 w-96 text-ink/5"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
        >
          <path d="M20 180 Q80 120 140 40 M140 40 Q180 20 190 10" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M60 140 C50 110 80 100 100 110 C90 135 70 145 60 140 Z" fill="currentColor" strokeWidth="1" />
          <path d="M100 100 C110 70 140 65 150 85 C135 105 115 105 100 100 Z" fill="currentColor" strokeWidth="1" />
          <path d="M85 125 C105 120 120 135 115 150 C95 155 80 140 85 125 Z" fill="currentColor" strokeWidth="1" />
          <circle cx="82" cy="118" r="4" fill="var(--color-husk)" opacity="0.6" />
          <circle cx="90" cy="112" r="3.5" fill="var(--color-rust)" opacity="0.6" />
          <circle cx="120" cy="80" r="4" fill="var(--color-husk)" opacity="0.6" />
        </svg>

        <svg
          className="absolute -bottom-16 -right-12 h-96 w-96 text-ink/5"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
        >
          <path d="M180 20 Q120 80 60 160 M60 160 Q20 180 10 190" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M140 60 C150 90 120 100 100 90 C110 65 130 55 140 60 Z" fill="currentColor" strokeWidth="1" />
          <path d="M100 100 C90 130 60 135 50 115 C65 95 85 95 100 100 Z" fill="currentColor" strokeWidth="1" />
          <circle cx="118" cy="82" r="4" fill="var(--color-rust)" opacity="0.6" />
          <circle cx="110" cy="88" r="3.5" fill="var(--color-husk)" opacity="0.6" />
        </svg>
      </div>

      <style>{`
        [data-reveal] { opacity: 0; transform: translateY(24px); filter: blur(5px); }
        [data-reveal].am-in { animation: am-rise 1s cubic-bezier(.19,.75,.24,1) forwards; }
        @keyframes am-rise { to { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal] { opacity: 1; transform: none; filter: none; }
        }

        .am-trail { stroke-dasharray: 1 9; stroke-linecap: round; animation: am-trail-march 30s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .am-trail { animation: none; } }
        @keyframes am-trail-march { to { stroke-dashoffset: -240; } }

        .am-sign {
          transition: transform .45s cubic-bezier(.19,.75,.24,1), box-shadow .45s ease, border-color .3s ease;
        }
        .am-sign:hover {
          transform: translateY(-6px) rotate(0deg) !important;
          box-shadow: 0 26px 46px rgba(30,42,29,0.16);
          border-color: rgba(201,160,92,0.5);
        }
        .am-sign:hover .am-icon { animation: am-icon-nudge .5s cubic-bezier(.34,1.56,.64,1); }
        @keyframes am-icon-nudge {
          0% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
          100% { transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .am-sign, .am-sign:hover { transition: none; }
          .am-sign:hover .am-icon { animation: none; }
        }
      `}</style>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
        <div className="max-w-xl">
          <span
            className="mb-3 inline-block font-display text-[13px] italic text-husk"
            style={{ transform: "rotate(-3deg)" }}
          >
            packed into every stay
          </span>
          <h2 className="font-display text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl">
            Everything the estate
            <br />
            <span className="font-normal text-ink/55">already has waiting for you.</span>
          </h2>
        </div>

        <div data-reveal className="relative mt-20 sm:mt-24">
          {/* Winding trail behind the signs - same dashed language as the
              room map, carried through as if it's the same footpath. */}
          <svg
            className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-24 w-full -translate-y-1/2 md:block"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              className="am-trail"
              d="M0,55 C120,20 220,85 340,50 C460,15 560,80 680,48 C800,16 880,78 1000,45"
              fill="none"
              stroke="#8a6d3a"
              strokeWidth="1.4"
              opacity="0.4"
            />
          </svg>

          <div className="relative grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
            {AMENITIES.map((item, i) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center"
                style={{ transform: `translateY(${OFFSET_Y[i]}px)` }}
              >
                <div
                  className="am-sign relative w-full max-w-70 rounded-2xl border border-bark/10 bg-white px-6 pb-7 pt-8 shadow-[0_14px_32px_rgba(30,42,29,0.09)]"
                  style={{ transform: `rotate(${ROTATE[i]}deg)` }}
                >
                  <span className="am-icon inline-flex text-husk [&_svg]:h-9 [&_svg]:w-9">
                    {ICONS[item.icon]}
                  </span>
                  <span className="mx-auto mt-4 block h-px w-10 bg-husk/40" />
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 font-body text-[13px] leading-relaxed text-ink/60">
                    {item.description}
                  </p>
                </div>
                <span className="mt-2 h-4 w-px bg-bark/20" aria-hidden="true" />
                <span className="h-1.5 w-1.5 rounded-full bg-husk/50" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}