"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "Rooms", href: "/rooms" },
  { label: "Amenities", href: "/amenities" },
  { label: "Things to Do", href: "/things-to-do" },
];

// The reserved anchor's fully-docked size (icon + gap + wordmark), and the
// gap-10 spacing that normally sits between it and the rest of the nav.
const ANCHOR_W_MOBILE = 36; // h-9 w-9
const ANCHOR_W_DESKTOP = 142; // sm:h-10 sm:w-[142px]
const ANCHOR_GAP = 40; // gap-10 = 2.5rem

// How much bigger the logo cluster gets while it's still parked over the
// hero (glide = 0), tapering back to 1x once it's docked in the pill.
const LOGO_SCALE_OUT = 1.32;

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

// Descending smoothstep: t=0 while x is at/above e0, t=1 once x has fallen to
// e1 or below, eased in between. Used to turn "hero's bottom edge distance
// from the viewport bottom" into a 0->1 glide progress.
function smoothstepDown(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const standAnchorRef = useRef<HTMLDivElement>(null);
  const navAnchorRef = useRef<HTMLDivElement>(null);
  const logoClusterRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      setScrolled(window.scrollY > 24);

      const standAnchor = standAnchorRef.current?.getBoundingClientRect();
      const navAnchor = navAnchorRef.current;
      const navAnchorRect = navAnchor?.getBoundingClientRect();
      const cluster = logoClusterRef.current;
      const wordmark = wordmarkRef.current;
      if (!standAnchor || !navAnchor || !navAnchorRect || !cluster || !wordmark) return;

      // Find the pinned hero (if this page has one) to know when it has
      // fully scrolled past - that's the cue for the logo to glide home.
      const hero = document.querySelector("[data-hero-pin]");
      let glide = 1;
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const vh = window.innerHeight;
        const TRANSITION = 240; // px of scroll over which the glide plays out
        glide = smoothstepDown(vh, vh - TRANSITION, rect.bottom);
      }

      // Collapse the reserved slot (and the gap in front of it) to nothing
      // while the logo is still out over the hero, so there's no dead space
      // sitting in the pill - then let it grow back in step with the glide.
      const isDesktop = window.innerWidth >= 640;
      const anchorFullWidth = isDesktop ? ANCHOR_W_DESKTOP : ANCHOR_W_MOBILE;
      navAnchor.style.width = `${anchorFullWidth * glide}px`;
      navAnchor.style.marginRight = `${ANCHOR_GAP * glide}px`;

      // Logo runs a little larger out on the hero and eases down to its
      // true size as it docks into the pill.
      const scale = LOGO_SCALE_OUT + (1 - LOGO_SCALE_OUT) * glide;

      const left = standAnchor.left + (navAnchorRect.left - standAnchor.left) * glide;
      const top = standAnchor.top + (navAnchorRect.top - standAnchor.top) * glide;
      cluster.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
      const wordOpacity = clamp((glide - 0.5) / 0.5, 0, 1);
      wordmark.style.opacity = String(wordOpacity);
      wordmark.style.transform = `translateX(${(1 - wordOpacity) * -6}px)`;
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
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-[1000]">
      {/* Invisible anchors purely for measuring where the logo starts (over
          the hero) and ends (inside the pill). Never rendered visibly. */}
      <div
        ref={standAnchorRef}
        className="fixed left-4 top-4 h-9 w-9 sm:left-6 sm:top-5 sm:h-10 sm:w-10 invisible"
      />

      <nav
        className={[
          "mx-auto mt-4 flex w-fit max-w-[92vw] items-center rounded-full border px-3 py-2 pl-6 transition-all duration-300",
          scrolled
            ? "border-bark/10 bg-mist/95 shadow-[0_10px_34px_rgba(30,42,29,0.18)]"
            : "border-mist/25 bg-mist/75 shadow-[0_8px_28px_rgba(30,42,29,0.12)]",
          "backdrop-blur-xl",
        ].join(" ")}
      >
        {/* Reserved, invisible slot the logo cluster glides into. Its width
            and trailing margin are driven from JS (0 while off in the hero,
            full size once docked) so no empty gap sits in the pill early on. */}
        <div
          ref={navAnchorRef}
          className="invisible flex h-9 shrink-0 items-center gap-2 overflow-hidden sm:h-10"
          style={{ width: 0, marginRight: 0 }}
        />

        <div className="flex items-center gap-10">
          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group relative font-body text-[13.5px] font-medium text-bark/75 transition-colors hover:text-ink focus-visible:text-ink"
                >
                  {link.label}
                  <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-husk transition-transform duration-200 group-hover:scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="hidden shrink-0 rounded-full bg-ink px-6 py-2.5 font-body text-[13px] font-semibold text-mist transition-transform duration-200 hover:-translate-y-0.5 hover:bg-bark focus-visible:outline focus-visible:outline-2 focus-visible:outline-husk md:block"
          >
            Book Now
          </button>

          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-bark/15 bg-mist/40 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-[1.5px] w-4 bg-bark">
              <span
                className={`absolute left-0 h-[1.5px] w-4 bg-bark transition-transform duration-200 ${
                  open ? "top-0 rotate-45" : "-top-[5px]"
                }`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-4 bg-bark transition-transform duration-200 ${
                  open ? "top-0 -rotate-45" : "top-[5px]"
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* The one real, always-mounted logo cluster - fixed, and moved purely
          via transform between the two anchors above. Scale eases from
          larger (out over the hero) down to 1x as it docks into the pill. */}
      <div
        ref={logoClusterRef}
        className="pointer-events-none fixed left-4 top-0 z-[1001] flex items-center gap-2.5 will-change-transform"
      >
        <div className="pointer-events-auto flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-1 ring-mist/40 sm:h-10 sm:w-10">
          <Image src="/bv-logo.png" alt="Bella Vista" width={40} height={40} priority className="h-full w-full object-cover" />
        </div>
        <span
          ref={wordmarkRef}
          className="pointer-events-auto hidden whitespace-nowrap font-display text-[17px] italic text-ink sm:inline"
        >
          Bella Vista
        </span>
      </div>

      <div
        className={`fixed left-1/2 top-[76px] w-[min(88vw,320px)] -translate-x-1/2 rounded-3xl border border-bark/10 bg-mist/95 p-3 backdrop-blur-xl transition-all duration-200 md:hidden ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-3 font-body text-[15px] text-bark/85 transition-colors hover:bg-husk/10 hover:text-ink"
          >
            {link.label}
          </Link>
        ))}
        <button
          type="button"
          className="mt-1 w-full rounded-xl bg-ink px-3 py-3 font-body text-[14px] font-semibold text-mist"
          onClick={() => setOpen(false)}
        >
          Book Now
        </button>
      </div>
    </header>
  );
}