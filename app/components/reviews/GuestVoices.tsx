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
      className="relative overflow-hidden bg-[#141c13] py-28 sm:py-36"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        [data-reveal] { opacity: 0; transform: translateY(24px); filter: blur(5px); }
        [data-reveal].gv-in { animation: gv-rise 1s cubic-bezier(.19,.75,.24,1) forwards; }
        @keyframes gv-rise { to { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal] { opacity: 1; transform: none; filter: none; }
        }

        .gv-blob { position: absolute; border-radius: 9999px; filter: blur(90px); }
        .gv-blob-1 { animation: gv-drift-1 46s ease-in-out infinite; }
        .gv-blob-2 { animation: gv-drift-2 58s ease-in-out infinite; }
        .gv-blob-3 { animation: gv-drift-3 64s ease-in-out infinite; }
        @keyframes gv-drift-1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(60px,-40px) scale(1.15); } }
        @keyframes gv-drift-2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-70px,30px) scale(1.1); } }
        @keyframes gv-drift-3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,50px) scale(0.92); } }
        @media (prefers-reduced-motion: reduce) {
          .gv-blob-1, .gv-blob-2, .gv-blob-3 { animation: none; }
        }

        .gv-quote { transition: opacity .5s ease, transform .5s cubic-bezier(.19,.75,.24,1); }
        .gv-quote.is-out { opacity: 0; transform: translateY(10px); }
        .gv-quote.is-in { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) { .gv-quote { transition: opacity .2s ease; } }

        .gv-progress { animation: gv-fill linear forwards; animation-duration: ${AUTOPLAY_MS}ms; }
        @keyframes gv-fill { from { width: 0%; } to { width: 100%; } }
      `}</style>

      {/* Slow-drifting colour blobs standing in for mist over the valley -
          soft, ambient, unlike the grain/lines used elsewhere on the page. */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="gv-blob gv-blob-1 -left-24 top-0 h-105 w-105 opacity-30"
          style={{ background: "radial-gradient(closest-side, rgba(201,160,92,0.45), transparent 72%)" }}
        />
        <div
          className="gv-blob gv-blob-2 right-[-10%] top-1/4 h-120 w-120 opacity-25"
          style={{ background: "radial-gradient(closest-side, rgba(122,150,110,0.4), transparent 72%)" }}
        />
        <div
          className="gv-blob gv-blob-3 left-1/3 bottom-[-15%] h-95 w-95 opacity-20"
          style={{ background: "radial-gradient(closest-side, rgba(242,237,225,0.3), transparent 72%)" }}
        />
      </div>

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

        <div data-reveal className="relative mt-16 sm:mt-20">
          <span
            className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 select-none font-display text-[220px] leading-none text-mist/6 sm:-top-20"
            aria-hidden="true"
          >
            &rdquo;
          </span>

          <div className="relative min-h-45 text-center sm:min-h-37.5">
            <div className={`gv-quote ${entering ? "is-in" : "is-out"}`}>
              <div className="flex justify-center gap-1 text-husk">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} i={s} />
                ))}
              </div>
              <blockquote className="mx-auto mt-6 max-w-2xl font-display text-2xl italic leading-relaxed text-mist sm:text-3xl">
                &ldquo;{active.quote}&rdquo;
              </blockquote>
              <p className="mt-6 font-body text-[13px] tracking-wide text-mist/55">
                {active.name} &nbsp;·&nbsp; {active.location}
              </p>
            </div>
          </div>

          {/* Name tabs double as navigation and a progress indicator for
              the currently-showing quote. */}
          <div className="mt-14 flex items-center justify-center gap-8 sm:gap-12">
            {REVIEWS.map((r, i) => (
              <button
                key={r.name}
                onClick={() => goTo(i)}
                className="group flex flex-col items-center gap-2.5"
                aria-label={`Show ${r.name}'s review`}
                aria-current={i === index}
              >
                <span
                  className="font-body text-[12px] tracking-wide transition-colors"
                  style={{ color: i === index ? "#f2ede1" : "rgba(242,237,225,0.4)" }}
                >
                  {r.name}
                </span>
                <span className="h-px w-12 overflow-hidden rounded-full bg-mist/15">
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