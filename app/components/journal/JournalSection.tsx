"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import SafeImage from "../shared/SafeImage";

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
};

const ARTICLES: Article[] = [
  {
    slug: "ultimate-chikkamagaluru-travel-guide-2026",
    title: "The Ultimate Chikkamagaluru Travel Guide 2026",
    excerpt: "Everything you need to plan the perfect itinerary in the coffee land of...",
    image: "/journal/travel-guide.jpg",
  },
  {
    slug: "why-mp-nagar-is-the-strategic-base",
    title: "Why MP Nagar Is the Strategic Base for Heritage Lovers",
    excerpt: "Avoid the city traffic and stay connected to major highways leading to Belur and...",
    image: "/journal/mp-nagar.jpg",
  },
  {
    slug: "bean-to-cup-slow-travel-guide",
    title: "Bean-to-Cup: The Slow Travel Guide",
    excerpt: "Immerse yourself in the rich history and process of coffee cultivation right from our...",
    image: "/journal/bean-to-cup.jpg",
  },
];

const PANEL_W = 260;
const PANEL_H = 180;

export default function JournalSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, PANEL_W / 2 + 8), rect.width - PANEL_W / 2 - 8);
    const y = Math.max(e.clientY - rect.top, PANEL_H + 24);
    setPos({ x, y });
  }

  return (
    <section id="journal" className="relative bg-white py-24 sm:py-32">
      <style>{`
        .jr-panel { transition: opacity .2s ease, transform .2s ease; }
        @media (prefers-reduced-motion: reduce) { .jr-panel { transition: none; } }
      `}</style>

      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        <div className="text-center">
          <span
            className="mb-3 inline-block font-display text-[13px] italic text-husk"
            style={{ transform: "rotate(-2deg)" }}
          >
            for the slow travellers
          </span>
          <h2 className="font-display text-4xl font-semibold text-ink sm:text-5xl">From our journal</h2>
        </div>

        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setActiveIndex(null)}
          className="relative mt-14 border-t border-bark/10"
        >
          {/* Floating preview - desktop only, follows the cursor while a
              headline is hovered. */}
          <div
            className="jr-panel pointer-events-none absolute z-20 hidden overflow-hidden rounded-xl shadow-[0_24px_48px_rgba(30,42,29,0.3)] sm:block"
            style={{
              width: PANEL_W,
              height: PANEL_H,
              left: pos.x,
              top: pos.y,
              transform: `translate(-50%, -100%) scale(${activeIndex !== null ? 1 : 0.94})`,
              opacity: activeIndex !== null ? 1 : 0,
            }}
          >
            {activeIndex !== null && (
              <SafeImage
                src={ARTICLES[activeIndex].image}
                alt=""
                fill
                sizes={`${PANEL_W}px`}
                className="h-full w-full object-cover"
                fallbackLabel=""
              />
            )}
          </div>

          {ARTICLES.map((article, i) => (
            <div
              key={article.slug}
              onMouseEnter={() => setActiveIndex(i)}
              className="group flex flex-col gap-4 border-b border-bark/10 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="flex items-start gap-4 sm:items-baseline sm:gap-5">
                <span className="mt-1 font-display text-[13px] text-ink/30 sm:mt-0">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-bark sm:hidden"
                  aria-hidden="true"
                >
                  <SafeImage src={article.image} alt="" fill sizes="56px" className="h-full w-full object-cover" fallbackLabel="" />
                </div>

                <div>
                  <h3 className="font-display text-xl font-semibold text-ink transition-colors sm:text-2xl group-hover:text-husk">
                    {article.title}
                  </h3>
                  <p className="mt-1.5 max-w-md font-body text-[13px] leading-relaxed text-ink/55">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <Link
                href={`/journal/${article.slug}`}
                className="flex shrink-0 items-center gap-1.5 pl-9 font-body text-[13px] font-semibold text-ink/70 transition-colors hover:text-husk sm:pl-0"
              >
                Read article
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
          ))}
        </div>
      </div>
    </section>
  );
}