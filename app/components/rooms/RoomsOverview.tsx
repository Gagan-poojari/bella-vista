"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import SafeImage from "../shared/SafeImage";
import { ROOM_TYPES, weekdayPrice } from "../../lib/rooms";

export default function RoomsOverview() {
  const sectionRef = useRef<HTMLElement>(null);

  // One-time staggered "rise into view" reveal as the cards enter the
  // viewport — same clearing-mist language as the hero, just triggered by
  // scroll position instead of mount since this section sits below the fold.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-reveal]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((c) => c.classList.add("cs-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("cs-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <section id="rooms" ref={sectionRef} className="relative bg-mist py-24 sm:py-32">
      <style>{`
        [data-reveal] { opacity: 0; transform: translateY(28px); filter: blur(6px); }
        [data-reveal].cs-in { animation: cs-rise .9s cubic-bezier(.19,.75,.24,1) forwards; }
        @keyframes cs-rise { to { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal] { opacity: 1; transform: none; filter: none; }
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.28em] text-husk">
            Our Spaces
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Curated <span className="italic text-husk">Sanctuaries</span>
          </h2>
          <p className="mt-4 font-body text-[15px] leading-relaxed text-ink/65">
            Thoughtfully designed spaces offering comfort and uninterrupted
            views of the surrounding wilderness.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {ROOM_TYPES.map((room, i) => (
            <article
              key={room.slug}
              data-reveal
              style={{ animationDelay: `${i * 120}ms` }}
              className="group flex flex-col overflow-hidden rounded-[22px] bg-white/70 shadow-[0_10px_30px_rgba(30,42,29,0.08)] ring-1 ring-bark/10 backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_54px_rgba(30,42,29,0.18)] hover:ring-husk/60"
            >
              <Link
                href={`/rooms/${room.slug}`}
                className="relative block aspect-[4/3] overflow-hidden bg-bark"
              >
                <SafeImage
                  src={`/rooms/${room.slug}/cover.jpg`}
                  alt={room.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                  fallbackLabel={room.comingSoon ? "Photos coming soon" : undefined}
                />
                <span className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink/40 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 font-body text-[11px] font-medium uppercase tracking-[0.1em] text-mist backdrop-blur-sm">
                  {room.tag}
                </span>
              </Link>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-semibold text-ink">
                  {room.name}
                </h3>
                <p className="mt-2 flex-1 font-body text-[13.5px] leading-relaxed text-ink/60">
                  {room.summary}
                </p>

                <div className="mt-5 flex items-end justify-between border-t border-bark/10 pt-4">
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">
                      ₹{room.weekendPrice.toLocaleString("en-IN")}
                      <span className="ml-1 font-body text-[12px] font-normal text-ink/50">
                        {room.unit}
                      </span>
                    </p>
                    <p className="mt-0.5 font-body text-[11px] text-sage">
                      from ₹{weekdayPrice(room).toLocaleString("en-IN")} on weekdays
                    </p>
                  </div>

                  <Link
                    href={`/rooms/${room.slug}`}
                    className="flex items-center gap-1.5 font-body text-[13px] font-semibold text-ink transition-colors hover:text-husk"
                  >
                    View Details
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                    >
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}