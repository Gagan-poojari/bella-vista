"use client";

import { useEffect, useRef, useState } from "react";
import BookingBar from "./BookingBar";

// Scroll progress (0-1) at which the glide-in (text left, ring fading/sliding
// in to its half-revealed rest position) finishes. Rotation only starts here.
const REVEAL_END = 0.22;

// The ring completes exactly one full turn (360deg) across the remaining
// scroll budget after REVEAL_END, so all 7 items get an even dwell time and
// the rotation always finishes precisely as the pinned section runs out of
// scroll room - nothing gets cut short.
const TOTAL_ROTATION = 360;

type StayInfo = { label: string; detail: string; icon: React.ReactNode };

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
} as const;

const STAY_INFO: StayInfo[] = [
  {
    label: "10% off weekdays",
    detail: "Book Monday through Thursday and save.",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="7" cy="7" r="2.2" />
        <circle cx="17" cy="17" r="2.2" />
        <path d="M17 7L7 17" />
      </svg>
    ),
  },
  {
    label: "Weekend pricing",
    detail: "Friday to Sunday rates apply.",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </svg>
    ),
  },
  {
    label: "1BHK Cottage",
    detail: "\u20B91,999 per night.",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M4 11l8-7 8 7" />
        <path d="M6 10v9h12v-9" />
      </svg>
    ),
  },
  {
    label: "2BHK Villa",
    detail: "\u20B93,999 per night.",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <rect x="10" y="14" width="4" height="6" />
      </svg>
    ),
  },
  {
    label: "Dormitory",
    detail: "\u20B9899 per head.",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9.5" r="2.3" />
        <path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
        <path d="M15 20c.3-2.7 2-4.6 4.5-5" />
      </svg>
    ),
  },
  {
    label: "Check-out",
    detail: "11:00 AM.",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    label: "Check-in",
    detail: "12:00 PM.",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l-3.5 2" />
      </svg>
    ),
  },
];

const ITEM_ANGLE_STEP = 360 / STAY_INFO.length;

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

function norm360(a: number) {
  const m = a % 360;
  return m < 0 ? m + 360 : m;
}

// `animated` drives a one-time, staggered "clearing mist" entrance (blur +
// rise + fade) on mount. The reduced-motion fallback renders this with
// `animated={false}` so it appears instantly, with no motion at all.
function HeroCopy({ animated = false }: { animated?: boolean }) {
  const anim = (ms: number) =>
    animated ? { className: " bv-anim", style: { animationDelay: `${ms}ms` } } : { className: "" };

  return (
    <>
      <p className={`bv-eyebrow${anim(60).className}`} style={anim(60).style}>
        Bella Vista <span>&middot;</span> Chikkamagaluru
      </p>
      <h1>
        <span className={`bv-h1-line${anim(200).className}`} style={anim(200).style}>
          Wander Into
        </span>
        <span
          className={`bv-h1-line bv-h1-accent${anim(380).className}`}
          style={anim(380).style}
        >
          the Mist
        </span>
      </h1>
      <p className={`bv-tagline${anim(560).className}`} style={anim(560).style}>
        Experience the soul of Chikkamagaluru at Bella Vista Homestay. A
        luxury retreat in the heart of coffee country.
      </p>
      <div className={`bv-offer${anim(740).className}`} style={anim(740).style}>
        <span className="bv-offer-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M12 2 2 12l10 10 10-10z" />
            <circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <span className="bv-offer-text">
          <span className="bv-offer-kicker">Weekday Special</span>
          <span className="bv-offer-value">10% Off</span>
        </span>
      </div>
    </>
  );
}

// Shared visual language between the animated hero and the static
// (reduced-motion) fallback, so the two never drift apart visually.
const SHARED_STYLES = `
  .bv-bg {
    position: absolute; inset: 0;
    background-image: url('/hero-bg.png');
    background-size: cover;
    background-position: center;
  }
  .bv-bg::after {
    content: "";
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.62), rgba(0,0,0,0.4) 42%, rgba(0,0,0,0.82));
  }
  .bv-eyebrow {
    margin: 0 0 18px; font-family: var(--font-body);
    font-size: clamp(11px, 1.1vw, 13px); font-weight: 600;
    letter-spacing: 0.34em; text-transform: uppercase;
    color: rgba(239,237,228,0.72);
  }
  .bv-eyebrow span { color: var(--color-husk); margin: 0 4px; letter-spacing: 0; }
  .bv-content h1 {
    display: flex; flex-direction: column; align-items: center;
    font-family: var(--font-display); font-weight: 600;
    font-size: clamp(38px, 7vw, 92px); line-height: 1.04;
    color: var(--color-mist); margin: 0; letter-spacing: -0.01em;
  }
  .bv-h1-line { display: block; text-wrap: balance; }
  .bv-h1-accent {
    font-style: italic; color: var(--color-husk);
    text-shadow: 0 0 54px rgba(201,160,92,0.4), 0 0 12px rgba(201,160,92,0.25);
  }
  .bv-tagline {
    margin: 24px 0 0; max-width: min(560px, 86vw); font-family: var(--font-body);
    font-size: clamp(14px, 1.6vw, 18px); line-height: 1.6;
    color: rgba(239,237,228,0.88); font-weight: 400; text-wrap: balance;
  }

  /* Staggered "mist clearing" entrance - blur/rise/fade, one time on mount. */
  .bv-anim { opacity: 0; animation: bv-mist-in 1.1s cubic-bezier(.19,.75,.24,1) forwards; }
  @keyframes bv-mist-in {
    from { opacity: 0; filter: blur(10px); transform: translateY(18px); }
    to { opacity: 1; filter: blur(0); transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .bv-anim { animation: none; opacity: 1; filter: none; transform: none; }
  }

  /* Offer chip: gradient hairline border (mask trick), soft glass fill, and
     a slow diagonal shimmer sweep - a proper "premium hotel offer" chip
     instead of a flat pill. */
  .bv-offer {
    position: relative; isolation: isolate; overflow: hidden;
    margin-top: 32px; display: inline-flex; align-items: center; gap: 14px;
    padding: 9px 24px 9px 9px; border-radius: 999px;
    background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
    backdrop-filter: blur(8px);
  }
  .bv-offer::before {
    content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px;
    background: linear-gradient(120deg, rgba(201,160,92,0.95), rgba(239,213,150,0.35), rgba(201,160,92,0.95));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none;
  }
  .bv-offer::after {
    content: ""; position: absolute; top: -60%; left: -60%; width: 35%; height: 220%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent);
    transform: rotate(18deg); animation: bv-shimmer 4.2s ease-in-out infinite; pointer-events: none;
  }
  @keyframes bv-shimmer { 0% { left: -60%; } 55%, 100% { left: 130%; } }
  @media (prefers-reduced-motion: reduce) {
    .bv-offer::after { animation: none; display: none; }
  }
  .bv-offer-icon {
    width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(201,160,92,0.5); background: rgba(30,42,29,0.55);
    color: var(--color-husk);
  }
  .bv-offer-icon svg { width: 16px; height: 16px; }
  .bv-offer-text { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.15; }
  .bv-offer-kicker {
    font-family: var(--font-body); font-size: 10px; font-weight: 600;
    letter-spacing: 0.16em; text-transform: uppercase; color: rgba(239,237,228,0.7);
  }
  .bv-offer-value {
    font-family: var(--font-display); font-weight: 600; font-style: italic;
    font-size: clamp(15px, 1.6vw, 18px); color: var(--color-husk); letter-spacing: 0.01em;
  }
`;

export default function HeroSection() {
  const pinWrapRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ringWrapRef = useRef<HTMLDivElement>(null);
  const ringRimRef = useRef<SVGSVGElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  // Detect reduced-motion preference once on mount, and keep it in sync if
  // the user changes it mid-session. Starts as `null` (not "false") so the
  // scroll-jacked version never flashes for someone who has motion reduced.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion !== false) return; // only run the scroll rig for motion-ok users

    let ticking = false;
    let lastActive = -1;

    const update = () => {
      ticking = false;
      const pinWrap = pinWrapRef.current;
      const inner = innerRef.current;
      const content = contentRef.current;
      const ringWrap = ringWrapRef.current;
      const ringRim = ringRimRef.current;
      const caption = captionRef.current;
      if (!pinWrap || !inner || !content || !ringWrap || !ringRim || !caption)
        return;

      const rect = pinWrap.getBoundingClientRect();
      const scrollable = pinWrap.offsetHeight - window.innerHeight;
      const progress = scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) : 0;

      // Manual pin: position:sticky silently breaks the moment ANY ancestor
      // (layout wrapper, body, etc.) has overflow != visible or a transform.
      // Driving fixed/absolute ourselves off rect.top is immune to that -
      // the only thing that can still break position:fixed is a `transform`,
      // `filter`, or `will-change: transform` on an ANCESTOR of this section.
      if (rect.top > 0) {
        inner.style.position = "relative";
        inner.style.top = "";
        inner.style.left = "";
        inner.style.width = "";
      } else if (scrollable > 0 && -rect.top < scrollable) {
        inner.style.position = "fixed";
        inner.style.top = "0px";
        inner.style.left = "0px";
        inner.style.width = "100%";
      } else {
        inner.style.position = "absolute";
        inner.style.top = `${Math.max(scrollable, 0)}px`;
        inner.style.left = "0px";
        inner.style.width = "100%";
      }

      // t: 0 = ring fully hidden, text centered. 1 = text has finished
      // gliding left, ring sits at its half-revealed rest position.
      const t = smoothstep(0, REVEAL_END, progress);

      // -20vw scales proportionally with viewport width on its own (vw is a
      // relative unit), so there's no separate mobile/desktop branch needed.
      content.style.transform = `translateX(${t * -20}vw)`;

      // ringSize is read live from the element every frame so positioning
      // stays correct continuously across every viewport size - no
      // breakpoint snap between "mobile" and "desktop" numbers.
      const ringSize = ringWrap.offsetWidth;

      // offsetPx = how far the ring's right edge sits beyond the viewport
      // edge. At t=0 that's the full width (0% visible - not shown at all).
      // At t=1 it's half the width (50% visible, cropped by the edge).
      const offsetPx = ringSize * (1 - 0.5 * t);
      ringWrap.style.transform = `translate(${offsetPx}px, -50%)`;
      ringWrap.style.opacity = String(smoothstep(0, 0.4, t));

      // Caption sits just clear of the ring's visible edge, computed from
      // the ring's actual measured size rather than a guessed vh value - so
      // it can never overlap the ring at any viewport size.
      caption.style.right = `${ringSize / 2 + Math.max(28, ringSize * 0.05)}px`;

      // Rotation only begins once the glide-in is fully done, and is a
      // straight linear function of the remaining scroll budget - so every
      // item gets the same amount of scroll distance, and scrolling back up
      // unwinds it exactly rather than skipping around.
      const rotProgress =
        scrollable > 0
          ? clamp((progress - REVEAL_END) / (1 - REVEAL_END), 0, 1)
          : 0;
      const rotation = rotProgress * TOTAL_ROTATION;
      ringRim.style.transform = `rotate(${rotation}deg)`;

      caption.style.opacity = String(smoothstep(0, 0.05, rotProgress));

      // Item orbit radius and box size both scale directly off the measured
      // ring size, so the whole arrangement is fluid rather than snapping
      // between fixed pixel values at a breakpoint.
      const R = ringSize * 0.275;

      let bestFacing = -1;
      let bestI = 0;

      itemRefs.current.forEach((item, i) => {
        if (!item) return;
        const baseAngle = -90 + i * ITEM_ANGLE_STEP;
        const eff = norm360(baseAngle + rotation);
        let diff = Math.abs(eff - 180);
        diff = Math.min(diff, 360 - diff);
        const facing = 1 - diff / 180;
        const rad = (eff * Math.PI) / 180;
        const x = R * Math.cos(rad);
        const y = R * Math.sin(rad);
        const scale = 0.6 + 0.5 * facing;
        const opacity = 0.25 + 0.75 * facing;
        item.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        item.style.opacity = String(opacity);
        item.style.zIndex = String(Math.round(facing * 100));
        if (facing > bestFacing) {
          bestFacing = facing;
          bestI = i;
        }
      });

      if (bestI !== lastActive) {
        lastActive = bestI;
        setActiveIndex(bestI);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reducedMotion]);

  // Avoid rendering either version until we know the motion preference, so
  // reduced-motion users never see a flash of the scroll-jacked layout.
  if (reducedMotion === null) {
    return <section aria-hidden="true" style={{ height: "100dvh" }} />;
  }

  if (reducedMotion) {
    return (
      <section className="bv-static-hero">
        <style>{`
          ${SHARED_STYLES}
          .bv-static-hero { position: relative; }
          .bv-static-hero .bv-bg { position: relative; height: 100dvh; }
          .bv-static-content {
            position: absolute; inset: 0; z-index: 10;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            text-align: center; padding: 24px;
          }
          .bv-static-list {
            list-style: none; margin: 0; padding: 48px 24px;
            display: grid; gap: 16px;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            background: #1a251c;
          }
          .bv-static-list li {
            display: flex; align-items: center; gap: 12px;
            padding: 16px; border-radius: 10px;
            background: rgba(239,237,228,0.05); border: 1px solid rgba(201,160,92,0.25);
          }
          .bv-static-list .bv-icon {
            width: 38px; height: 38px; flex-shrink: 0; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            border: 1px solid rgba(201,160,92,0.4); color: var(--color-husk);
          }
          .bv-static-list .bv-icon svg { width: 18px; height: 18px; }
          .bv-static-list .bv-text-label {
            display: block; font-family: var(--font-body); font-weight: 600;
            font-size: 14px; color: var(--color-mist);
          }
          .bv-static-list .bv-text-detail {
            display: block; font-family: var(--font-body); font-size: 12.5px;
            color: rgba(239,237,228,0.72); margin-top: 2px;
          }
        `}</style>

        <div className="bv-bg">
          <div className="bv-static-content">
            <HeroCopy />
          </div>
        </div>

        <ul className="bv-static-list">
          {STAY_INFO.map((item) => (
            <li key={item.label}>
              <span className="bv-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>
                <span className="bv-text-label">{item.label}</span>
                <span className="bv-text-detail">{item.detail}</span>
              </span>
            </li>
          ))}
        </ul>

        <BookingBar />
      </section>
    );
  }

  const active = STAY_INFO[activeIndex];

  return (
    <section ref={pinWrapRef} data-hero-pin className="bv-pin-wrap">
      <style>{`
        ${SHARED_STYLES}
        .bv-pin-wrap { position: relative; height: 380vh; }
        .bv-pin-inner { height: 100vh; height: 100dvh; overflow: hidden; }
        .bv-content {
          position: relative; z-index: 10; height: 100%;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: 0 5vw clamp(96px, 22vh, 260px); will-change: transform;
        }
        .bv-ring-wrap {
          position: absolute; top: 50%; right: 0;
          width: min(88vh, 820px, 96vw); height: min(88vh, 820px, 96vw);
          z-index: 6; will-change: transform, opacity;
          border-radius: 50%;
          background: radial-gradient(circle at 50% 50%, rgba(239,237,228,0.09) 0%, rgba(239,237,228,0.03) 55%, rgba(239,237,228,0) 72%);
        }
        .bv-ring-rim { position: absolute; inset: 0; width: 100%; height: 100%; }
        .bv-hub {
          position: absolute; left: 50%; top: 50%; width: 15%; height: 15%;
          min-width: 46px; min-height: 46px;
          transform: translate(-50%, -50%);
          border-radius: 50%; border: 1px solid rgba(201,160,92,0.45);
          background: rgba(30,42,29,0.5); display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-weight: 600; font-style: italic;
          font-size: clamp(11px, 1.3vw, 13px);
          letter-spacing: 0.06em; color: var(--color-husk);
        }
        .bv-item {
          position: absolute; left: 50%; top: 50%;
          width: clamp(80px, 12vw, 130px);
          margin-left: calc(clamp(80px, 12vw, 130px) / -2);
          margin-top: calc(clamp(80px, 12vw, 130px) / -2);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; gap: clamp(4px, 0.8vw, 8px); padding: 6px;
          will-change: transform, opacity;
        }
        .bv-item .bv-icon {
          width: clamp(32px, 4.2vw, 46px); height: clamp(32px, 4.2vw, 46px);
          border-radius: 50%; border: 1px solid rgba(239,237,228,0.28);
          display: flex; align-items: center; justify-content: center;
          background: rgba(30,42,29,0.4); color: var(--color-mist);
          transition: border-color .2s, color .2s, background .2s;
        }
        .bv-item.is-active .bv-icon {
          border-color: var(--color-husk); color: var(--color-husk); background: rgba(201,160,92,0.16);
        }
        .bv-item .bv-icon svg { width: 58%; height: 58%; }
        .bv-item-label {
          font-family: var(--font-body); font-size: clamp(9.5px, 1vw, 11px);
          color: rgba(239,237,228,0.8); line-height: 1.25; transition: color .2s;
        }
        .bv-item.is-active .bv-item-label { color: var(--color-mist); font-weight: 500; }
        .bv-caption {
          position: absolute; top: 50%; transform: translateY(-50%);
          z-index: 8; max-width: min(240px, 40vw); text-align: right; will-change: opacity, right;
          font-family: var(--font-body);
        }
        .bv-caption .bv-cap-eyebrow {
          font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--color-husk); margin: 0 0 8px;
        }
        .bv-caption h3 {
          font-family: var(--font-display); font-weight: 600;
          font-size: clamp(18px, 2.2vw, 27px);
          color: var(--color-mist); margin: 0 0 8px;
        }
        .bv-caption p { margin: 0; font-size: 13px; line-height: 1.55; color: rgba(239,237,228,0.82); }

        /* Below this, the caption panel competes with the ring for very
           little horizontal room - the item labels on the ring itself
           already carry the same information, so the panel steps aside
           rather than being squeezed unreadably small. */
        @media (max-width: 640px) {
          .bv-caption { display: none; }
        }

        @media (max-width: 860px) {
          .bv-bg { background-attachment: scroll; }
        }

        /* Short viewports (small laptops, landscape phones) - shrink
           everything vertically so the headline and ring both still fit. */
        @media (max-height: 560px) {
          .bv-content { padding-bottom: 24px; }
          .bv-eyebrow { margin-bottom: 10px; }
          .bv-content h1 { font-size: clamp(28px, 5vw, 48px); }
          .bv-tagline { display: none; }
          .bv-offer { margin-top: 16px; }
        }
      `}</style>

      <div className="bv-pin-inner" ref={innerRef}>
        <div className="bv-bg" style={{ position: "absolute" }} />

        <div className="bv-content" ref={contentRef}>
          <HeroCopy animated />
        </div>

        <div className="bv-ring-wrap" ref={ringWrapRef} aria-hidden="true">
          <svg className="bv-ring-rim" ref={ringRimRef} viewBox="0 0 600 600">
            <circle cx="300" cy="300" r="295" fill="none" stroke="#c9a05c" strokeWidth="1.5" opacity="0.9" />
            <circle cx="300" cy="300" r="270" fill="none" stroke="#c9a05c" strokeWidth="2" strokeDasharray="3 10" />
            <circle cx="300" cy="300" r="180" fill="none" stroke="#c9a05c" strokeWidth="1" strokeDasharray="2 8" opacity="0.6" />
          </svg>

          <div className="bv-hub">
            <span>Stay</span>
          </div>

          {STAY_INFO.map((item, i) => (
            <div
              key={item.label}
              className={`bv-item${i === activeIndex ? " is-active" : ""}`}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
            >
              <div className="bv-icon">{item.icon}</div>
              <div className="bv-item-label">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="bv-caption" ref={captionRef}>
          <p className="bv-cap-eyebrow">Stay details</p>
          <h3>{active.label}</h3>
          <p>{active.detail}</p>
        </div>

        {/* Screen-reader-only: the ring is aria-hidden since it's a slow,
            scroll-driven decorative reveal - this gives the same content
            immediately and in reading order instead. */}
        <ul
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          {STAY_INFO.map((item) => (
            <li key={item.label}>
              {item.label} - {item.detail}
            </li>
          ))}
        </ul>

        <BookingBar />
      </div>
    </section>
  );
}