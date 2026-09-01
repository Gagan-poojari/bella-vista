"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Review = {
  quote: string;
  name: string;
  location: string;
};

const REVIEWS: Review[] = [
  {
    quote:
      "The perfect blend of luxury and nature. Waking up to the mist over the coffee plants was a dream come true.",
    name: "Ananya R.",
    location: "Bangalore",
  },
  {
    quote:
      "Impeccable service and stunning views. The 2 BHK cottage was spacious and beautifully designed. Highly recommend for families.",
    name: "Vikram S.",
    location: "Chennai",
  },
  {
    quote:
      "A peaceful retreat away from the city. The estate-fresh coffee and the sunset at Hirekolale Lake nearby made our trip unforgettable.",
    name: "Priya M.",
    location: "Mumbai",
  },
];

const AUTOPLAY_MS = 6500;

function Star({ i }: { i: number }) {
  return (
    <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor" aria-hidden="true">
      <path d="M10 1.6l2.47 5.24 5.78.62-4.3 3.94 1.19 5.7L10 14.1l-5.14 2.99 1.19-5.69-4.3-3.94 5.78-.62L10 1.6Z" />
    </svg>
  );
}

export default function GuestVoices() {
  const sectionRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [entering, setEntering] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const timerRef = useRef<number | null>(null);

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
      target.classList.add("gv-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            target.classList.add("gv-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [reduceMotion]);

  const goTo = useCallback((next: number) => {
    setEntering(false);
    window.setTimeout(() => {
      setIndex(next);
      setEntering(true);
    }, 260);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    timerRef.current = window.setTimeout(() => {
      goTo((index + 1) % REVIEWS.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, paused, reduceMotion, goTo]);

  const active = REVIEWS[index];

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#121911] py-28 sm:py-36"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ----------------- ARCHITECTURAL VERANDA ARCH & BOTANICAL VIGNETTE ----------------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top/bottom golden transition hairlines */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-husk/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-husk/30 to-transparent" />

        {/* Center glowing lantern aura behind the testimonial */}
        <div
          className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35"
          style={{
            background: "radial-gradient(circle, rgba(201,160,92,0.3) 0%, rgba(124,139,111,0.12) 50%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Concentric Architectural Acoustic / Voice Arcs in gold */}
        <svg
          className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 opacity-[0.15]"
          viewBox="0 0 400 400"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="200" cy="200" r="190" stroke="#c9a05c" strokeWidth="1" strokeDasharray="3 9" />
          <circle cx="200" cy="200" r="150" stroke="#c9a05c" strokeWidth="1.2" />
          <circle cx="200" cy="200" r="110" stroke="#7c8b6f" strokeWidth="1" strokeDasharray="2 6" />
          <circle cx="200" cy="200" r="70" stroke="#c9a05c" strokeWidth="1.2" strokeDasharray="4 8" />
          <line x1="200" y1="10" x2="200" y2="390" stroke="#c9a05c" strokeWidth="0.8" strokeDasharray="2 8" opacity="0.4" />
          <line x1="10" y1="200" x2="390" y2="200" stroke="#c9a05c" strokeWidth="0.8" strokeDasharray="2 8" opacity="0.4" />
        </svg>

        {/* Left Botanical Branch Line-Art */}
        <svg
          className="absolute -left-8 top-1/4 h-96 w-64 text-husk opacity-[0.08]"
          viewBox="0 0 160 320"
          fill="none"
          stroke="currentColor"
        >
          <path d="M10,320 Q60,200 80,80 Q90,30 110,0" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M40,240 C10,210 20,180 50,190 C65,220 55,235 40,240 Z" fill="currentColor" opacity="0.3" strokeWidth="1" />
          <path d="M70,150 C110,130 120,160 90,175 C70,170 65,160 70,150 Z" fill="currentColor" opacity="0.3" strokeWidth="1" />
          <path d="M75,90 C45,70 55,40 85,55 C95,75 85,85 75,90 Z" fill="currentColor" opacity="0.3" strokeWidth="1" />
          <circle cx="68" cy="155" r="4" fill="currentColor" />
          <circle cx="76" cy="148" r="3.5" fill="currentColor" />
        </svg>

        {/* Right Botanical Branch Line-Art */}
        <svg
          className="absolute -right-8 bottom-1/4 h-96 w-64 text-husk opacity-[0.08]"
          viewBox="0 0 160 320"
          fill="none"
          stroke="currentColor"
        >
          <path d="M150,0 Q100,120 80,240 Q70,290 50,320" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M120,80 C150,110 140,140 110,130 C95,100 105,85 120,80 Z" fill="currentColor" opacity="0.3" strokeWidth="1" />
          <path d="M90,170 C50,190 40,160 70,145 C90,150 95,160 90,170 Z" fill="currentColor" opacity="0.3" strokeWidth="1" />
          <circle cx="92" cy="165" r="4" fill="currentColor" />
          <circle cx="84" cy="172" r="3.5" fill="currentColor" />
        </svg>
      </div>

      <style>{`
        [data-reveal] { opacity: 0; transform: translateY(24px); filter: blur(5px); }
        [data-reveal].gv-in { animation: gv-rise 1s cubic-bezier(.19,.75,.24,1) forwards; }
        @keyframes gv-rise { to { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal] { opacity: 1; transform: none; filter: none; }
        }

        .gv-quote { transition: opacity .45s ease, transform .45s cubic-bezier(.19,.75,.24,1); }
        .gv-quote.is-out { opacity: 0; transform: translateY(8px); }
        .gv-quote.is-in { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) { .gv-quote { transition: opacity .2s ease; } }

        .gv-progress { animation: gv-fill linear forwards; animation-duration: ${AUTOPLAY_MS}ms; }
        @keyframes gv-fill { from { width: 0%; } to { width: 100%; } }
      `}</style>

      <div className="relative mx-auto max-w-4xl px-6 sm:px-8">
        <div className="text-center">
          <span
            className="mb-3 inline-block font-display text-[13px] italic text-husk"
            style={{ transform: "rotate(-2deg)" }}
          >
            in their own words
          </span>
          <h2 className="font-display text-4xl font-semibold leading-[1.08] text-mist sm:text-5xl">
            They came for the coffee,
            <br />
            <span className="font-normal text-mist/55">they left with stories.</span>
          </h2>
        </div>

        {/* Glassmorphic Storyteller Podium Frame */}
        <div
          data-reveal
          className="relative mt-14 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md sm:mt-16 sm:p-12"
        >
          {/* Decorative brass corner brackets */}
          <span className="absolute left-3 top-3 h-3 w-3 border-l border-t border-husk/50" aria-hidden="true" />
          <span className="absolute right-3 top-3 h-3 w-3 border-r border-t border-husk/50" aria-hidden="true" />
          <span className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-husk/50" aria-hidden="true" />
          <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-husk/50" aria-hidden="true" />

          {/* Large decorative quotation watermark */}
          <span
            className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 select-none font-display text-[140px] leading-none text-husk/[0.07] sm:text-[180px]"
            aria-hidden="true"
          >
            &rdquo;
          </span>

          <div className="relative min-h-[160px] text-center sm:min-h-[140px]">
            <div className={`gv-quote ${entering ? "is-in" : "is-out"}`}>
              {/* Star Rating */}
              <div className="flex justify-center gap-1.5 text-husk">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} i={s} />
                ))}
              </div>

              {/* Review Quote */}
              <blockquote className="mx-auto mt-6 max-w-2xl font-display text-2xl italic leading-relaxed text-mist sm:text-3xl">
                &ldquo;{active.quote}&rdquo;
              </blockquote>

              {/* Reviewer Details */}
              <div className="mt-6 flex items-center justify-center gap-2 font-body text-[13px] tracking-wide text-mist/60">
                <span className="font-medium text-mist/90">{active.name}</span>
                <span>·</span>
                <span className="text-husk/80">{active.location}</span>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="mt-10 flex items-center justify-center gap-6 sm:gap-10 border-t border-white/5 pt-8">
            {REVIEWS.map((r, i) => (
              <button
                key={r.name}
                onClick={() => goTo(i)}
                className="group flex flex-col items-center gap-2 outline-none"
                aria-label={`Show ${r.name}'s review`}
                aria-current={i === index}
              >
                <span
                  className="font-body text-[12.5px] font-medium tracking-wide transition-colors"
                  style={{ color: i === index ? "#f2ede1" : "rgba(242,237,225,0.4)" }}
                >
                  {r.name}
                </span>
                <span className="h-0.5 w-10 overflow-hidden rounded-full bg-mist/15">
                  {i === index && !paused && !reduceMotion && (
                    <span key={index} className="gv-progress block h-full bg-husk" />
                  )}
                  {i === index && (paused || reduceMotion) && (
                    <span className="block h-full w-full bg-husk" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}