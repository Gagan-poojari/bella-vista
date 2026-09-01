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
      <h1>
        <span className={`bv-h1-word${anim(80).className}`} style={anim(80).style}>
          Wander Into
        </span>{" "}
        <span
          className={`bv-h1-word bv-h1-accent${anim(260).className}`}
          style={anim(260).style}
        >
          the Mist
        </span>
      </h1>
      <p className={`bv-tagline${anim(440).className}`} style={anim(440).style}>
        Experience the soul of Chikkamagaluru at Bella Vista Homestay. A
        luxury retreat in the heart of coffee country.
      </p>
      <div className={`bv-offer${anim(620).className}`} style={anim(620).style}>
        <span className="bv-offer-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M12 3c3.4 2 5.5 5.1 5.5 8.7 0 4-2.6 7.1-5.5 9.3-2.9-2.2-5.5-5.3-5.5-9.3C6.5 8.1 8.6 5 12 3z" />
            <path d="M12 6.5V21" />
            <path d="M12 10.5c-1.6-.3-2.8-1.2-3.5-2.6M12 15c-1.9-.2-3.4-1.3-4.2-3M12 10.5c1.6-.3 2.8-1.2 3.5-2.6M12 15c1.9-.2 3.4-1.3 4.2-3" />
          </svg>
        </span>
        <span className="bv-offer-text">
          <span className="bv-offer-kicker">Weekday special</span>
          <span className="bv-offer-value">10% off your stay</span>
        </span>
      </div>
    </>
  );
}

// Shared visual language between the animated hero and the static
// (reduced-motion) fallback, so the two never drift apart visually.
const SHARED_STYLES = `
  .bv-bg {
    position: fixed; inset: 0; z-index: 0;
    background-image: url('/hero-bg.png');
    background-size: cover;
    background-position: center;
  }
  .bv-bg::after {
    content: "";
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.62), rgba(0,0,0,0.4) 42%, rgba(0,0,0,0.82));
  }
  .bv-content h1, .bv-static-content h1 {
    font-family: var(--font-display); font-weight: 600;
    font-size: clamp(40px, 6.4vw, 96px); line-height: 1.06;
    margin: 0; letter-spacing: -0.01em; text-wrap: balance;
  }
  .bv-h1-word {
    color: var(--color-mist, #f2ede1);
    text-shadow: 0 2px 28px rgba(0,0,0,0.35);
  }
  .bv-h1-accent {
    font-style: italic; font-weight: 500;
    background: linear-gradient(100deg, #ecd39d 0%, #cfa863 45%, #a8793e 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    text-shadow: 0 4px 40px rgba(207,168,99,0.32);
    letter-spacing: 0.004em;
  }
  .bv-tagline {
    margin: 26px 0 0; max-width: 46ch; font-family: var(--font-body);
    font-size: clamp(14px, 1.5vw, 18px); line-height: 1.6;
    color: rgba(242,237,225,0.82); font-weight: 400;
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

  /* Offer chip: a quiet bordered tag rather than a flashy shimmering pill -
     static hairline, glass fill, no motion. */
  .bv-offer {
    position: relative; isolation: isolate;
    margin-top: 34px; display: inline-flex; align-items: center; gap: 16px;
    padding: 10px 26px 10px 10px; border-radius: 999px;
    border: 1px solid rgba(207,168,99,0.4);
    background: linear-gradient(180deg, rgba(20,26,19,0.55), rgba(20,26,19,0.32));
    backdrop-filter: blur(10px);
  }
  .bv-offer-icon {
    width: 38px; height: 38px; flex-shrink: 0; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(207,168,99,0.55); background: rgba(20,26,19,0.6);
    color: var(--color-husk, #cfa863);
  }
  .bv-offer-icon svg { width: 17px; height: 17px; }
  .bv-offer-text { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2; }
  .bv-offer-kicker {
    font-family: var(--font-body); font-size: 12px; font-weight: 500;
    letter-spacing: 0.03em; color: rgba(242,237,225,0.72);
  }
  .bv-offer-value {
    font-family: var(--font-display); font-weight: 600; font-style: italic;
    font-size: clamp(16px, 1.7vw, 19px); color: var(--color-husk, #cfa863); letter-spacing: 0.01em;
  }

  /* Scroll cue: quiet invitation to keep going, not a decorative flourish -
     it fades out the moment the person actually starts scrolling. */
  .bv-scroll-cue {
    position: absolute; left: 50%; bottom: calc(clamp(96px, 22vh, 260px) + 22px);
    transform: translateX(-50%); z-index: 12;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    background: none; border: none; padding: 6px; cursor: pointer;
    font-family: var(--font-body); color: rgba(242,237,225,0.75);
  }
  .bv-scroll-cue-text {
    font-size: 11px; letter-spacing: 0.14em; white-space: nowrap;
  }
  .bv-scroll-cue-rail {
    position: relative; width: 1px; height: 30px;
    background: rgba(242,237,225,0.28); overflow: hidden; border-radius: 1px;
  }
  .bv-scroll-cue-dot {
    position: absolute; left: -1.5px; top: 0; width: 4px; height: 4px;
    border-radius: 50%; background: var(--color-husk, #cfa863);
    animation: bv-scroll-dot 1.9s cubic-bezier(.65,0,.35,1) infinite;
  }
  @keyframes bv-scroll-dot {
    0% { transform: translateY(-6px); opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translateY(30px); opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .bv-scroll-cue-dot { animation: none; top: 40%; opacity: 0.8; }
  }
`;

export default function HeroSection() {
  const pinWrapRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ringWrapRef = useRef<HTMLDivElement>(null);
  const ringRimRef = useRef<SVGSVGElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ringSizeRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  const railRef = useRef<HTMLUListElement>(null);
  const railItemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [railActive, setRailActive] = useState(0);
  const mobileBgRef = useRef<HTMLDivElement>(null);

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

  // The 380vh scroll-jacked ring is a desktop interaction, full stop - on
  // touch devices it's not just cramped, it's actively unreliable: mobile
  // browsers resize window.innerHeight mid-scroll as the address bar
  // hides/shows, which breaks the manual pin math frame-to-frame, and
  // toggling position:fixed by hand (rather than via native `sticky`) is a
  // known stutter source on iOS Safari specifically. Below this width we
  // swap to a purpose-built mobile hero instead of squeezing the desktop
  // one down. Same null-until-known pattern as reducedMotion, so nothing
  // flashes the wrong layout before we know.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 780px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const onRailScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    const scrollLeft = rail.scrollLeft;
    const firstCard = rail.querySelector<HTMLElement>(".bv-rail-card");
    const cardWidth = firstCard ? firstCard.offsetWidth + 12 : 240;
    const activeIdx = Math.round(scrollLeft / cardWidth);
    setRailActive(Math.min(Math.max(0, activeIdx), STAY_INFO.length - 1));
  };

  const scrollToCard = (i: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = railItemRefs.current[i];
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    }
  };

  // A light, cheap scroll parallax for the mobile hero image - genuinely
  // responds to the person's own scrolling rather than looping on its own,
  // and is nowhere near the desktop rig's complexity (one passive listener,
  // one direct transform write, no layout reads to force a reflow).
  useEffect(() => {
    if (!isMobile || reducedMotion) return;
    const bg = mobileBgRef.current;
    if (!bg) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY * 0.12, 60);
        bg.style.transform = `translateY(${y}px) scale(1.06)`;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile, reducedMotion]);

  useEffect(() => {
    if (reducedMotion !== false || isMobile !== false) return; // only run the scroll rig for desktop, motion-ok users

    let ticking = false;
    let lastActive = -1;

    const measureRing = () => {
      if (ringWrapRef.current) ringSizeRef.current = ringWrapRef.current.offsetWidth;
    };
    measureRing();

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

      // t: 0 = ring fully hidden, copy centered at full width. 1 = ring at
      // its half-revealed rest position, copy has glided left and
      // condensed to stay clear of it.
      const t = smoothstep(0, REVEAL_END, progress);

      // ringSize is measured once (on mount and on resize only, never inside
      // this loop) - reading offsetWidth here every frame would force a
      // synchronous layout reflow right after the position writes above,
      // which is a classic cause of scroll jank.
      const ringSize = ringSizeRef.current;

      // offsetPx = how far the ring's right edge sits beyond the viewport
      // edge. At t=0 that's the full width (0% visible - not shown at all).
      // At t=1 it's half the width (50% visible, cropped by the edge).
      const offsetPx = ringSize * (1 - 0.5 * t);
      ringWrap.style.transform = `translate(${offsetPx}px, -50%)`;
      ringWrap.style.opacity = String(smoothstep(0, 0.4, t));

      // The copy block is centered and at its widest when the ring is
      // hidden. As the ring reveals, its box narrows by exactly the ring's
      // visible footprint, and its center point drifts left by half that
      // amount - the combination holds the block's LEFT edge roughly still
      // while its right edge recedes from the ring, which reads as the
      // whole block gliding left rather than just shrinking in place.
      const ringVisible = Math.max(0, ringSize - offsetPx);
      const sidePadding = window.innerWidth * 0.06;
      const fullWidth = window.innerWidth - sidePadding * 2;
      const contentMaxW = clamp(fullWidth - ringVisible, 320, fullWidth);
      content.style.maxWidth = `${contentMaxW}px`;
      content.style.transform = `translateX(${-ringVisible / 2}px)`;

      // Caption sits just clear of the ring's visible edge, computed from
      // the ring's actual measured size rather than a guessed vh value - so
      // it can never overlap the ring at any viewport size.
      caption.style.right = `${ringSize / 2 + Math.max(28, ringSize * 0.05)}px`;

      // The cue's only job is to invite the first scroll - once that's
      // happened, it steps out of the way rather than lingering.
      const scrollCue = scrollCueRef.current;
      if (scrollCue) {
        const cueOpacity = 1 - smoothstep(0, 0.05, progress);
        scrollCue.style.opacity = String(cueOpacity);
        scrollCue.style.pointerEvents = cueOpacity < 0.05 ? "none" : "auto";
      }

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

    const onResize = () => {
      measureRing();
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [reducedMotion, isMobile]);

  // Avoid rendering any version until we know both flags, so nobody ever
  // sees a flash of the wrong layout (scroll-jacked on a phone, or the
  // cramped desktop-shrunk one before we know better).
  if (reducedMotion === null || isMobile === null) {
    return <section aria-hidden="true" style={{ height: "100dvh" }} />;
  }

  if (reducedMotion || isMobile) {
    return (
      <section className="bv-static-hero">
        <style>{`
          ${SHARED_STYLES}
          .bv-hero-frame {
            position: relative;
            height: 100dvh;
            min-height: 520px;
            overflow: hidden;
          }
          .bv-static-hero .bv-bg {
            will-change: transform;
            position: absolute;
          }
          .bv-static-content {
            position: absolute; inset: 0; z-index: 10;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            text-align: center;
            padding: 20px 20px calc(clamp(16px, 3.5vh, 28px) + 76px);
          }

          .bv-static-hero .bv-scroll-cue {
            bottom: calc(clamp(16px, 3.5vh, 28px) + 78px);
            z-index: 15;
          }
          @media (max-height: 640px) {
            .bv-static-hero .bv-scroll-cue { display: none; }
          }

          .bv-static-list {
            position: relative; z-index: 10;
            list-style: none; margin: 0; padding: 48px 24px;
            display: grid; gap: 16px;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            background: #141c13;
            border-top: 1px solid rgba(201,160,92,0.15);
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

          /* Mobile: Stay details rail placed cleanly in document flow below hero */
          .bv-rail-wrap {
            position: relative; z-index: 10;
            background: #141c13;
            border-top: 1px solid rgba(201,160,92,0.18);
            border-bottom: 1px solid rgba(201,160,92,0.1);
            padding: 28px 0 24px;
          }
          .bv-rail-header {
            padding: 0 20px 12px;
          }
          .bv-rail-eyebrow {
            font-family: var(--font-body);
            font-size: 10.5px; font-weight: 600; letter-spacing: 0.18em;
            text-transform: uppercase; color: var(--color-husk);
            display: block;
          }
          .bv-rail-title {
            font-family: var(--font-display);
            font-size: 19px; color: var(--color-mist);
            margin: 3px 0 0; font-weight: 500;
          }
          .bv-rail {
            display: flex; gap: 12px; margin: 0; padding: 4px 20px 6px;
            list-style: none; overflow-x: auto; overscroll-behavior-x: contain;
            scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .bv-rail::-webkit-scrollbar { display: none; }
          .bv-rail-card {
            scroll-snap-align: start; flex: 0 0 auto; width: min(74vw, 250px);
            display: flex; align-items: center; gap: 14px;
            padding: 14px 16px; border-radius: 16px;
            background: rgba(239,237,228,0.05); border: 1px solid rgba(201,160,92,0.22);
            transition: border-color .25s, background .25s;
          }
          .bv-rail-card.is-active {
            border-color: rgba(201,160,92,0.55);
            background: rgba(201,160,92,0.1);
          }
          .bv-rail-icon {
            width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            border: 1px solid rgba(201,160,92,0.45); color: var(--color-husk);
            background: rgba(0,0,0,0.2);
          }
          .bv-rail-icon svg { width: 17px; height: 17px; }
          .bv-rail-label {
            display: block; font-family: var(--font-body); font-weight: 600;
            font-size: 13.5px; color: var(--color-mist);
          }
          .bv-rail-detail {
            display: block; font-family: var(--font-body); font-size: 11.5px;
            color: rgba(242,237,228,0.72); margin-top: 2px;
          }
          .bv-rail-dots {
            display: flex; justify-content: center; align-items: center;
            gap: 6px; margin-top: 14px;
          }
          .bv-rail-dot {
            width: 6px; height: 6px; border-radius: 999px;
            background: rgba(239,237,228,0.22); border: none; padding: 0;
            cursor: pointer; transition: width .3s, background .3s;
          }
          .bv-rail-dot.is-active {
            width: 18px; background: var(--color-husk);
          }

          /* Phones scale tuning */
          @media (max-width: 640px) {
            .bv-static-content { padding-left: 20px; padding-right: 20px; }
            .bv-static-content h1 { font-size: clamp(34px, 10.5vw, 48px); }
            .bv-static-content .bv-tagline { font-size: 14px; max-width: 30ch; margin-top: 18px; }
            .bv-offer { margin-top: 20px; padding: 8px 18px 8px 8px; gap: 12px; }
            .bv-offer-icon { width: 32px; height: 32px; }
            .bv-offer-icon svg { width: 15px; height: 15px; }
            .bv-offer-value { font-size: 15.5px; }
          }
        `}</style>

        <div className="bv-hero-frame">
          <div className="bv-bg" ref={mobileBgRef}>
            <div className="bv-static-content">
              <HeroCopy animated={!reducedMotion} />
            </div>
            <span className="bv-scroll-cue" aria-hidden="true">
              <span className="bv-scroll-cue-text">Scroll to explore</span>
              <span className="bv-scroll-cue-rail">
                <span className="bv-scroll-cue-dot" />
              </span>
            </span>
          </div>

          <BookingBar />
        </div>

        {isMobile ? (
          <div className="bv-rail-wrap">
            <div className="bv-rail-header">
              <span className="bv-rail-eyebrow">Stay details</span>
              <p className="bv-rail-title">Everything you need to know</p>
            </div>
            <ul className="bv-rail" ref={railRef} onScroll={onRailScroll}>
              {STAY_INFO.map((item, i) => (
                <li
                  key={item.label}
                  ref={(el) => {
                    railItemRefs.current[i] = el;
                  }}
                  className={`bv-rail-card${i === railActive ? " is-active" : ""}`}
                >
                  <span className="bv-rail-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>
                    <span className="bv-rail-label">{item.label}</span>
                    <span className="bv-rail-detail">{item.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="bv-rail-dots" aria-hidden="true">
              {STAY_INFO.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to stay detail ${i + 1}`}
                  onClick={() => scrollToCard(i)}
                  className={`bv-rail-dot${i === railActive ? " is-active" : ""}`}
                />
              ))}
            </div>
          </div>
        ) : (
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
        )}
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
          text-align: left; padding-bottom: clamp(96px, 22vh, 260px);
          width: fit-content; max-width: min(980px, 90vw); margin: 0 auto; will-change: transform;
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

        /* Short viewports (small laptops, landscape phones) - shrink
           everything vertically so the headline and ring both still fit. */
        @media (max-height: 560px) {
          .bv-content { padding-bottom: 24px; }
          .bv-content h1 { font-size: clamp(28px, 5vw, 48px); }
          .bv-tagline { display: none; }
          .bv-offer { margin-top: 16px; }
        }
      `}</style>

      <div className="bv-pin-inner" ref={innerRef}>
        <div className="bv-bg" />

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

        <button
          type="button"
          className="bv-scroll-cue"
          ref={scrollCueRef}
          onClick={() =>
            window.scrollTo({ top: window.innerHeight * 0.92, behavior: "smooth" })
          }
        >
          <span className="bv-scroll-cue-text">Scroll to explore</span>
          <span className="bv-scroll-cue-rail" aria-hidden="true">
            <span className="bv-scroll-cue-dot" />
          </span>
        </button>

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