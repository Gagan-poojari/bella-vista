"use client"; 

import Image from "next/image";
import Link from "next/link";
import { ROOM_TYPES } from "../../lib/rooms";

const EXPLORE_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Things to Do", href: "/things-to-do" },
  { label: "Chikkamagaluru Travel Guide", href: "/travel-guide" },
  { label: "Local Flavors", href: "/local-flavors" },
];

const LEGAL_LINKS = [
  { label: "Contact Us", href: "/contact" },
  { label: "Booking Policy", href: "/booking-policy" },
  { label: "Privacy Policy", href: "/privacy" },
];

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
} as const;

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center font-body text-[13.5px] text-mist/65 transition-colors duration-200 hover:text-husk"
    >
      <span className="mr-0 h-px w-0 bg-husk transition-all duration-300 group-hover:mr-2 group-hover:w-3" />
      {label}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden bg-ink">
      {/* distant ridge line, catching a last bit of dusk-gold — echoes the
          Western Ghats skyline the hero photo was shot against */}
      <svg
        aria-hidden
        viewBox="0 0 1440 110"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 h-16 w-full sm:h-24"
      >
        <path
          d="M0,70 C180,20 320,95 480,55 C640,15 780,85 960,45 C1120,10 1260,75 1440,35 L1440,0 L0,0 Z"
          fill="var(--color-husk)"
          opacity="0.07"
        />
        <path
          d="M0,90 C160,55 340,105 520,70 C700,35 860,100 1040,65 C1220,32 1320,80 1440,60 L1440,0 L0,0 Z"
          fill="var(--color-bark)"
          opacity="0.5"
        />
      </svg>

      {/* fine paper-grain texture across the whole footer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, var(--color-mist) 0px, var(--color-mist) 1px, transparent 1px, transparent 15px)",
        }}
      />

      {/* golden hairline seam along the very top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-husk/60 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-16 sm:px-8 sm:pt-20">
        {/* Brand + newsletter */}
        <div className="flex flex-col gap-10 border-b border-mist/10 pb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-husk/40">
                <Image src="/bv-logo.png" alt="" width={40} height={40} className="h-full w-full object-cover" />
              </span>
              <p className="font-display text-2xl italic text-mist">Bella Vista</p>
            </div>
            <p className="mt-4 font-body text-[14px] leading-relaxed text-mist/60">
              A retreat woven into a working coffee estate above Chikkamagaluru
              &mdash; where the mist rolls in most mornings and the coffee never
              travels far to reach your cup.
            </p>
          </div>

          <form className="w-full max-w-sm">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.24em] text-husk">
              The Estate Journal
            </p>
            <p className="mt-2 font-body text-[13px] leading-relaxed text-mist/55">
              Seasonal notes on coffee, weather, and what&apos;s blooming
              &mdash; a few times a year, never more.
            </p>
            <div className="mt-4 flex items-center gap-1.5 rounded-full border border-mist/15 bg-mist/[0.04] p-1.5 transition-colors focus-within:border-husk/60">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="you@example.com"
                className="w-full min-w-0 bg-transparent px-3 py-2 font-body text-[13px] text-mist placeholder:text-mist/35 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-husk px-4 py-2 font-body text-[12.5px] font-semibold text-ink transition-colors hover:bg-mist"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>

        {/* Link columns */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-husk">
              Explore
            </p>
            <ul className="mt-5 space-y-3">
              {EXPLORE_LINKS.map((l) => (
                <li key={l.href}>
                  <FooterLink {...l} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-husk">
              Stay
            </p>
            <ul className="mt-5 space-y-3">
              {ROOM_TYPES.map((room) => (
                <li key={room.slug}>
                  <FooterLink href={`/rooms/${room.slug}`} label={room.name} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-husk">
              Contact
            </p>
            <ul className="mt-5 space-y-4">
              <li className="flex gap-3">
                <svg {...ICON_PROPS} className="mt-0.5 h-4 w-4 shrink-0 text-husk">
                  <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
                  <circle cx="12" cy="10" r="2.4" />
                </svg>
                <span className="font-body text-[13.5px] leading-relaxed text-mist/65">
                  MP Nagar, Shiragunda, Mugthihalli Post
                  <br />
                  Chikkamagaluru, Karnataka &ndash; 577133
                  <br />
                  <span className="text-mist/45">Landmark: NH173, near Serai Resort</span>
                </span>
              </li>
              <li className="flex gap-3">
                <svg {...ICON_PROPS} className="mt-0.5 h-4 w-4 shrink-0 text-husk">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.6 21 3 12.4 3 2.7c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z" />
                </svg>
                <a
                  href="tel:+917899474595"
                  className="font-body text-[13.5px] text-mist/65 transition-colors hover:text-husk"
                >
                  +91 78994 74595
                </a>
              </li>
              <li className="flex gap-3">
                <svg {...ICON_PROPS} className="mt-0.5 h-4 w-4 shrink-0 text-husk">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3.2 2" />
                </svg>
                <span className="font-body text-[13.5px] leading-relaxed text-mist/65">
                  Check-in 12:00 PM
                  <br />
                  Check-out 11:00 AM
                </span>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-husk">
              Legal
            </p>
            <ul className="mt-5 space-y-3">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <FooterLink {...l} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-4 border-t border-mist/10 pt-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="font-body text-[12px] text-mist/45">
            © {new Date().getFullYear()} Bella Vista Homestay. Nestled in the
            heart of Chikkamagaluru.
          </p>
          <button
            type="button"
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className="group flex items-center gap-2 rounded-full border border-mist/15 px-4 py-2 font-body text-[12px] text-mist/60 transition-colors hover:border-husk/50 hover:text-husk"
          >
            Back to top
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5">
              <path
                d="M8 12.5V3.5M4 7l4-4 4 4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}