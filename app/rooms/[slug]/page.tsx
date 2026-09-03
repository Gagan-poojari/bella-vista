import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import NavBar from "../../components/hero/NavBar";
import Footer from "../../components/layout/Footer";
import RoomGallery from "../../components/rooms/RoomGallery";
import BookingTicket from "../../components/rooms/BookingTicket";
import { ROOM_TYPES, getRoomBySlug, weekdayPrice, type AmenityIcon } from "../../lib/rooms";

// Same invented place-names used as pins on the estate map in the Rooms
// section - repeating them here ties the detail page back to that map.
const PLACE_NAMES: Record<string, string> = {
  "1bhk-cottage": "North Ridge",
  "2bhk-villa": "The Hollow",
  dormitory: "Trail's End",
};

export function generateStaticParams() {
  return ROOM_TYPES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/rooms/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) return {};
  return {
    title: `${room.name} | Bella Vista Homestay`,
    description: room.description,
  };
}

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
} as const;

const ICONS: Record<AmenityIcon, ReactNode> = {
  wifi: (
    <svg {...ICON_PROPS}>
      <path d="M4 9c4.5-4 11.5-4 16 0" />
      <path d="M7 12.5c3-2.5 7-2.5 10 0" />
      <path d="M10 16c1.2-1 2.8-1 4 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  coffee: (
    <svg {...ICON_PROPS}>
      <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" />
      <path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17" />
      <path d="M8 4c-.6.6-.6 1.4 0 2M12 4c-.6.6-.6 1.4 0 2" />
    </svg>
  ),
  view: (
    <svg {...ICON_PROPS}>
      <path d="M3 18l6-7 4 4.5L19 8l2 2" />
      <path d="M3 18h18" />
    </svg>
  ),
  tv: (
    <svg {...ICON_PROPS}>
      <rect x="3" y="5" width="18" height="12" rx="1.5" />
      <path d="M8 20h8" />
    </svg>
  ),
  kitchen: (
    <svg {...ICON_PROPS}>
      <path d="M5 3v18M5 3c-1.2 0-2 1-2 2v3a2 2 0 0 0 2 2m0-7c1.2 0 2 1 2 2v3a2 2 0 0 1-2 2" />
      <path d="M12 3v18M12 3c2 0 3.5 1.6 3.5 4.5S14 12 12 12" />
      <path d="M18 3v18" />
    </svg>
  ),
  parking: (
    <svg {...ICON_PROPS}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M10 16V8h3.2a2.4 2.4 0 1 1 0 4.8H10" />
    </svg>
  ),
  locker: (
    <svg {...ICON_PROPS}>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M12 3v18M9 9h.01M9 15h.01" />
    </svg>
  ),
  group: (
    <svg {...ICON_PROPS}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9.5" r="2.3" />
      <path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
      <path d="M15 20c.3-2.7 2-4.6 4.5-5" />
    </svg>
  ),
  shower: (
    <svg {...ICON_PROPS}>
      <path d="M5 9h13a1 1 0 0 1 1 1v1H4v-1a1 1 0 0 1 1-1Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0" />
      <path d="M7 14v1M11 14v1M15 14v1M9 17v1M13 17v1" />
    </svg>
  ),
};

export default async function RoomDetailPage({ params }: PageProps<"/rooms/[slug]">) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) notFound();

  const placeName = PLACE_NAMES[room.slug];

  return (
    <>
      <NavBar />
      <main className="bg-mist pb-24 pt-28 sm:pt-32">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <Link
            href="/#rooms"
            className="inline-flex items-center gap-1.5 font-body text-[13px] font-medium text-ink/60 transition-colors hover:text-husk"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
              <path
                d="M13 8H3.5M7.5 3.5 3 8l4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to the map
          </Link>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
            {/* Gallery + description */}
            <div>
              {placeName && (
                <span
                  className="mb-2 inline-block font-display text-[13px] italic text-husk"
                  style={{ transform: "rotate(-3deg)" }}
                >
                  {placeName} on the estate map
                </span>
              )}
              <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">
                {room.name}
              </h1>
              <p className="mt-1 font-body text-[12.5px] font-medium text-husk">{room.tag}</p>

              <div className="mt-6">
                <RoomGallery images={room.gallery} name={room.name} comingSoon={room.comingSoon} />
              </div>

              <p className="mt-8 max-w-2xl font-body text-[15px] leading-relaxed text-ink/70">
                {room.description}
              </p>

              <h2 className="mt-12 font-display text-2xl font-semibold text-ink">
                What&apos;s here
              </h2>
              <div className="mt-2 max-w-lg divide-y divide-bark/10 border-t border-bark/10">
                {room.amenities.map((a) => (
                  <div key={a.label} className="flex items-center gap-4 py-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center text-husk [&_svg]:h-full [&_svg]:w-full">
                      {ICONS[a.icon]}
                    </span>
                    <span className="font-body text-[14px] text-ink/80">{a.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking panel */}
            <aside className="h-fit lg:sticky lg:top-28">
              <BookingTicket
                room={{
                  weekendPrice: room.weekendPrice,
                  weekdayPrice: weekdayPrice(room),
                  weekdayDiscountPct: room.weekdayDiscountPct,
                  unit: room.unit,
                }}
              />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}