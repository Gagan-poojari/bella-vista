import Link from "next/link";
import { ROOM_TYPES } from "../../lib/rooms";

export default function Footer() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-semibold text-mist">
              Bella Vista
            </p>
            <p className="mt-3 max-w-xs font-body text-[13.5px] leading-relaxed text-mist/60">
              Crafted for premium stillness in the heart of Chikkamagaluru.
            </p>
          </div>

          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-husk">
              Accommodations
            </p>
            <ul className="mt-4 space-y-2.5">
              {ROOM_TYPES.map((room) => (
                <li key={room.slug}>
                  <Link
                    href={`/rooms/${room.slug}`}
                    className="font-body text-[13.5px] text-mist/70 transition-colors hover:text-husk"
                  >
                    {room.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-husk">
              Discover
            </p>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: "Things to Do", href: "/things-to-do" },
                { label: "Contact Us", href: "/contact" },
                { label: "Privacy Policy", href: "/privacy" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-body text-[13.5px] text-mist/70 transition-colors hover:text-husk"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-mist/10 pt-6 font-body text-[12px] text-mist/45">
          © {new Date().getFullYear()} Bella Vista Homestay. Nestled in the
          heart of Chikkamagaluru.
        </div>
      </div>
    </footer>
  );
}