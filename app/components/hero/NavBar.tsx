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

  const headerRef = useRef<HTMLElement>(null);
  const standAnchorRef = useRef<HTMLDivElement>(null);
  const navAnchorRef = useRef<HTMLDivElement>(null);
  const logoClusterRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLSpanElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
    // BUG FIX: hero images/webfonts can still be loading on first paint, so
    // the initial hero.getBoundingClientRect() read can be stale. Re-run
    // once everything (images, fonts) has actually settled.
    window.addEventListener("load", onScroll);
    document.fonts?.ready.then(onScroll).catch(() => {});
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("load", onScroll);
    };
  }, []);

  // Mobile menu: lock scroll, close on Escape, close on outside click, and
  // return focus to the trigger on close. None of this existed before.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    document.body.style.touchAction = open ? "none" : "";
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || menuButtonRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open]);

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-[1000]">
      {/* Invisible anchors purely for measuring where the logo starts (over
          the hero) and ends (inside the pill). Never rendered visibly. */}
      <div
        ref={standAnchorRef}
        className="fixed left-4 top-4 h-9 w-9 sm:left-6 sm:top-5 sm:h-10 sm:w-10 invisible"
      />

      {/* Golden ring wrapper. The ring is a spinning conic-gradient layer
          clipped to a halo just outside the pill's edge - the opaque pill
          painted on top hides everything but that thin brass line, like
          light catching a brass rail at dawn. */}
      <div
        className="relative mx-auto w-fit max-w-[94vw] rounded-full"
        style={{ marginTop: "calc(1rem + env(safe-area-inset-top))" }}
      >
        <div
          aria-hidden
          className={[
            "pointer-events-none absolute -inset-[1.5px] rounded-full overflow-hidden transition-opacity duration-500",
            scrolled ? "opacity-100" : "opacity-80",
          ].join(" ")}
        >
          <div
            className="absolute inset-[-120%] motion-safe:animate-[spin_8s_linear_infinite] motion-reduce:hidden"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(244,227,171,0.95) 18deg, rgba(196,155,74,0.95) 42deg, transparent 78deg, transparent 360deg)",
            }}
          />
          {/* static fallback ring so reduced-motion users still see the gold edge */}
          <div
            className="absolute inset-0 hidden rounded-full motion-reduce:block"
            style={{
              background:
                "linear-gradient(135deg, rgba(244,227,171,0.9), rgba(196,155,74,0.9))",
            }}
          />
        </div>
        <div
          aria-hidden
          className={[
            "pointer-events-none absolute -inset-2 rounded-full blur-md transition-opacity duration-500 motion-safe:animate-[pulse_5s_ease-in-out_infinite]",
            scrolled ? "opacity-40" : "opacity-25",
          ].join(" ")}
          style={{ background: "radial-gradient(closest-side, rgba(212,175,110,0.55), transparent 70%)" }}
        />

        <nav
          className={[
            "relative z-[1] flex items-center rounded-full border px-4 py-2 pl-4 sm:pl-6 transition-colors duration-300",
            scrolled
              ? "border-bark/10 bg-mist/95 shadow-[0_10px_34px_rgba(30,42,29,0.22)]"
              : "border-mist/30 bg-mist/90 shadow-[0_8px_28px_rgba(30,42,29,0.16)]",
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

          <div className="flex items-center gap-4 sm:gap-6 md:gap-10">
            <ul className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group relative font-body text-[13.5px] font-medium text-bark/90 transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline-none"
                  >
                    {link.label}
                    <span
                      className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
                      style={{ background: "linear-gradient(90deg, #c49b4a, #f4e3ab)" }}
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="cursor-pointer group/cta relative hidden shrink-0 overflow-hidden rounded-full bg-ink px-6 py-2.5 font-body text-[13px] font-semibold tracking-[0.02em] text-mist shadow-[0_1px_0_rgba(244,227,171,0.25)_inset,0_8px_18px_rgba(20,26,18,0.35)] transition-all duration-300 hover:shadow-[0_1px_0_rgba(244,227,171,0.35)_inset,0_10px_26px_rgba(196,155,74,0.5)] hover:ring-[#e9cd8a]/70 active:translate-y-0 active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c49b4a] md:inline-flex md:items-center md:gap-2"
            >
              {/* brass foil sweep - one clean pass on hover, not a looping effect */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[110%] group-hover/cta:opacity-100"
                style={{ background: "linear-gradient(90deg, transparent, rgba(244,227,171,0.55), transparent)" }}
              />
              <span className="relative">Book Now</span>
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                fill="none"
                className="relative h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover/cta:translate-x-0.5"
              >
                <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" stroke="#f4e3ab" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              ref={menuButtonRef}
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-bark/20 bg-mist/60 transition-colors hover:bg-mist active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c49b4a] md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav-panel"
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
      </div>

      {/* The one real, always-mounted logo cluster - fixed, and moved purely
          via transform between the two anchors above. Scale eases from
          larger (out over the hero) down to 1x as it docks into the pill. */}
      <div
        ref={logoClusterRef}
        className="pointer-events-none fixed left-4 top-0 z-[1001] flex items-center gap-2.5 will-change-transform"
      >
        <div className="pointer-events-auto flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-1 ring-[#c49b4a]/50 sm:h-10 sm:w-10">
          <Image src="/bv-logo.png" alt="Bella Vista" width={40} height={40} priority className="h-full w-full object-cover" />
        </div>
        <span
          ref={wordmarkRef}
          className="pointer-events-auto hidden whitespace-nowrap font-display text-[17px] italic text-ink drop-shadow-sm sm:inline"
        >
          Bella Vista
        </span>
      </div>

      {/* Backdrop dims the page behind the mobile menu so it reads as a
          real overlay rather than content floating on top of content. */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[1001] bg-ink/30 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        id="mobile-nav-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        style={{ top: "calc(76px + env(safe-area-inset-top))" }}
        className={`fixed left-1/2 z-[1002] w-[min(90vw,320px)] -translate-x-1/2 rounded-3xl border border-bark/10 bg-mist/95 p-3 shadow-[0_20px_50px_rgba(30,42,29,0.3)] backdrop-blur-xl transition-all duration-300 md:hidden ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        {NAV_LINKS.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
            className={`block rounded-xl px-3 py-3 font-body text-[15px] text-bark/90 transition-all duration-300 hover:bg-[#c49b4a]/10 hover:text-ink ${
              open ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
            }`}
          >
            {link.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{ transitionDelay: open ? `${NAV_LINKS.length * 40}ms` : "0ms" }}
          className={`mt-1 w-full rounded-xl bg-ink px-3 py-3 font-body text-[14px] font-semibold text-mist transition-all duration-300 active:scale-[0.98] ${
            open ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
          }`}
        >
          Book Now
        </button>
      </div>
    </header>
  );
}