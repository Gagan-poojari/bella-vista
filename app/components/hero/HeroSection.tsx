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

export default function HeroSection() {
  const pinWrapRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ringWrapRef = useRef<HTMLDivElement>(null);
  const ringRimRef = useRef<SVGSVGElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const itemAngleStep = 360 / STAY_INFO.length;

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let ticking = false;
    let lastActive = -1;

    const isMobile = () => window.innerWidth <= 860;

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
      let progress = scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) : 0;
      if (reduceMotion) progress = 0.6;

      // Manual pin: position:sticky silently breaks the moment ANY ancestor
      // (layout wrapper, body, etc.) has overflow != visible or a transform -
      // very easy to hit here since translateX/translate are used throughout.
      // Driving fixed/absolute ourselves off rect.top is immune to that.
      if (rect.top > 0) {
        // Not reached yet - sits in normal flow at the top of the 380vh wrap.
        inner.style.position = "relative";
        inner.style.top = "";
        inner.style.left = "";
        inner.style.width = "";
      } else if (scrollable > 0 && -rect.top < scrollable) {
        // Actively pinned.
        inner.style.position = "fixed";
        inner.style.top = "0px";
        inner.style.left = "0px";
        inner.style.width = "100%";
      } else {
        // Scrolled past - release, flush with the bottom of the wrap.
        inner.style.position = "absolute";
        inner.style.top = `${Math.max(scrollable, 0)}px`;
        inner.style.left = "0px";
        inner.style.width = "100%";
      }

      // t: 0 = ring fully hidden, text centered. 1 = text has finished
      // gliding left, ring sits at its half-revealed rest position.
      const t = smoothstep(0, REVEAL_END, progress);

      const textShiftVW = isMobile() ? -8 : -22;
      content.style.transform = `translateX(${t * textShiftVW}vw)`;

      // ringSize is read live from the element so this stays correct across
      // breakpoints without duplicating the CSS width formula in JS.
      const ringSize = ringWrap.offsetWidth;
      // offsetPx = how far the ring's right edge sits beyond the viewport
      // edge. At t=0 that's the full width (0% visible, i.e. not shown at
      // all). At t=1 it's half the width (50% visible, cropped by the edge).
      const offsetPx = ringSize * (1 - 0.5 * t);
      ringWrap.style.transform = `translate(${offsetPx}px, -50%)`;
      ringWrap.style.opacity = String(smoothstep(0, 0.4, t));

      // Rotation only begins once the glide-in is fully done, and is a
      // straight linear function of the remaining scroll budget - so every
      // item gets the same amount of scroll distance, and scrolling back up
      // unwinds it exactly rather than skipping around.
      const rotProgress =
        scrollable > 0 ? clamp((progress - REVEAL_END) / (1 - REVEAL_END), 0, 1) : 0;
      const rotation = rotProgress * TOTAL_ROTATION;
      ringRim.style.transform = `rotate(${rotation}deg)`;

      caption.style.opacity = String(smoothstep(0, 0.05, rotProgress));

      let bestFacing = -1;
      let bestI = 0;

      itemRefs.current.forEach((item, i) => {
        if (!item) return;
        const baseAngle = -90 + i * itemAngleStep;
        const eff = norm360(baseAngle + rotation);
        let diff = Math.abs(eff - 180);
        diff = Math.min(diff, 360 - diff);
        const facing = 1 - diff / 180;
        const R = isMobile() ? 130 : 220;
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
  }, [itemAngleStep]);

  const active = STAY_INFO[activeIndex];

  return (
    <section ref={pinWrapRef} data-hero-pin className="bv-pin-wrap">
      <style>{`
        .bv-pin-wrap { position: relative; height: 380vh; }
        /* position (relative/fixed/absolute) is set imperatively in JS - see
           the manual-pin block in the scroll handler. Sticky is not used. */
        .bv-pin-inner { height: 100vh; overflow: hidden; }
        .bv-bg {
          position: absolute; inset: 0;
          background-image: url('/hero-bg.png');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
        .bv-bg::after {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.62), rgba(0,0,0,0.4) 42%, rgba(0,0,0,0.82));
        }
        .bv-content {
          position: relative; z-index: 10; height: 100%;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: 0 24px 96px; will-change: transform;
        }
        .bv-content h1 {
          font-family: var(--font-display); font-weight: 600; font-style: italic;
          font-size: clamp(42px, 6.5vw, 88px); line-height: 1.05;
          color: var(--color-mist); margin: 0; letter-spacing: -0.01em;
        }
        .bv-tagline {
          margin: 22px 0 0; max-width: 560px; font-family: var(--font-body);
          font-size: 18px; line-height: 1.6; color: rgba(239,237,228,0.88); font-weight: 400;
        }
        .bv-badge {
          margin-top: 30px; display: inline-flex; align-items: center; gap: 9px;
          background: rgba(239,237,228,0.1); border: 1px solid rgba(201,160,92,0.4);
          color: var(--color-mist); padding: 10px 22px;
          border-radius: 999px; font-family: var(--font-body); font-size: 12.5px;
          font-weight: 600; letter-spacing: 0.02em; backdrop-filter: blur(6px);
        }
        .bv-badge svg { width: 14px; height: 14px; color: var(--color-husk); }
        .bv-ring-wrap {
          position: absolute; top: 50%; right: 0;
          width: min(88vh, 820px); height: min(88vh, 820px);
          z-index: 6; will-change: transform, opacity;
          border-radius: 50%;
          background: radial-gradient(circle at 50% 50%, rgba(239,237,228,0.09) 0%, rgba(239,237,228,0.03) 55%, rgba(239,237,228,0) 72%);
        }
        .bv-ring-rim { position: absolute; inset: 0; width: 100%; height: 100%; }
        .bv-hub {
          position: absolute; left: 50%; top: 50%; width: 15%; height: 15%;
          transform: translate(-50%, -50%);
          border-radius: 50%; border: 1px solid rgba(201,160,92,0.45);
          background: rgba(30,42,29,0.5); display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-weight: 600; font-style: italic; font-size: 13px;
          letter-spacing: 0.06em; color: var(--color-husk);
        }
        .bv-item {
          position: absolute; left: 50%; top: 50%; width: 130px; margin-left: -65px; margin-top: -65px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; gap: 8px; padding: 10px 6px; will-change: transform, opacity;
        }
        .bv-item .bv-icon {
          width: 46px; height: 46px; border-radius: 50%; border: 1px solid rgba(239,237,228,0.28);
          display: flex; align-items: center; justify-content: center;
          background: rgba(30,42,29,0.4); color: var(--color-mist);
          transition: border-color .2s, color .2s, background .2s;
        }
        .bv-item.is-active .bv-icon {
          border-color: var(--color-husk); color: var(--color-husk); background: rgba(201,160,92,0.16);
        }
        .bv-item .bv-icon svg { width: 20px; height: 20px; }
        .bv-item-label {
          font-family: var(--font-body); font-size: 11px; color: rgba(239,237,228,0.8);
          line-height: 1.25; transition: color .2s;
        }
        .bv-item.is-active .bv-item-label { color: var(--color-mist); font-weight: 500; }
        .bv-caption {
          position: absolute; top: 50%; right: min(46vh, 440px); transform: translateY(-50%);
          z-index: 8; max-width: 240px; text-align: right; will-change: opacity;
          font-family: var(--font-body);
        }
        .bv-caption .bv-cap-eyebrow {
          font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--color-husk); margin: 0 0 8px;
        }
        .bv-caption h3 {
          font-family: var(--font-display); font-weight: 600; font-size: 27px;
          color: var(--color-mist); margin: 0 0 8px;
        }
        .bv-caption p { margin: 0; font-size: 14px; line-height: 1.55; color: rgba(239,237,228,0.82); }
        @media (max-width: 860px) {
          .bv-bg { background-attachment: scroll; }
          .bv-ring-wrap { width: min(70vh, 420px); height: min(70vh, 420px); }
          .bv-item { width: 96px; margin-left: -48px; margin-top: -48px; padding: 4px; gap: 5px; }
          .bv-item .bv-icon { width: 36px; height: 36px; }
          .bv-item .bv-icon svg { width: 16px; height: 16px; }
          .bv-item-label { font-size: 9.5px; }
          .bv-caption { right: 16px; max-width: 150px; }
          .bv-caption h3 { font-size: 19px; }
          .bv-content { padding-bottom: 230px; }
          .bv-content h1 { font-size: clamp(34px, 9vw, 56px); }
          .bv-tagline { font-size: 15px; }
        }
      `}</style>

      <div className="bv-pin-inner" ref={innerRef}>
        <div className="bv-bg" />

        <div className="bv-content" ref={contentRef}>
          <h1>Wander Into the Mist</h1>
          <p className="bv-tagline">
            Experience the soul of Chikkamagaluru at Bella Vista Homestay. A
            luxury retreat in the heart of coffee country.
          </p>
          <span className="bv-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2 2 12l10 10 10-10z" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none" />
            </svg>
            Weekday Special - 10% Off
          </span>
        </div>

        <div className="bv-ring-wrap" ref={ringWrapRef}>
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

        <BookingBar />
      </div>
    </section>
  );
}