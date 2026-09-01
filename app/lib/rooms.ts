// Single source of truth for every room type. The overview section and each
// /rooms/<slug> detail page both read from here, so pricing/copy only ever
// needs to change in one place.
//
// Photos: drop files into /public/rooms/<slug>/ as:
//   cover.jpg        - used on the overview card
//   1.jpg, 2.jpg, ... - used on the detail page gallery (count = galleryCount)
// Until a photo exists at a given path, SafeImage renders a branded
// placeholder instead of a broken image.

export type AmenityIcon =
  | "wifi"
  | "coffee"
  | "view"
  | "tv"
  | "kitchen"
  | "parking"
  | "locker"
  | "group"
  | "shower";

export type Amenity = { label: string; icon: AmenityIcon };

export type RoomType = {
  slug: string;
  name: string;
  tag: string;
  unit: "/night" | "/head";
  /** Standard rate - applies Friday–Sunday. */
  weekendPrice: number;
  /** % off the weekend rate, Monday–Thursday. */
  weekdayDiscountPct: number;
  /** Short blurb for the overview card. */
  summary: string;
  /** Longer copy for the detail page. */
  description: string;
  amenities: Amenity[];
  /** How many numbered gallery photos to expect in /public/rooms/<slug>/. */
  galleryCount: number;
  /** True while no real photos exist yet for this room. */
  comingSoon?: boolean;
};

export const ROOM_TYPES: RoomType[] = [
  {
    slug: "1bhk-cottage",
    name: "1 BHK Cottage",
    tag: "Couples' Retreat",
    unit: "/night",
    weekendPrice: 1999,
    weekdayDiscountPct: 10,
    summary:
      "Intimate and secluded, perfect for couples seeking a quiet escape into nature.",
    description:
      "A secluded retreat designed for couples, offering panoramic views of the verdant valleys and coffee estates. Experience premium stillness in our signature cottage.",
    amenities: [
      { label: "High-Speed WiFi", icon: "wifi" },
      { label: "Estate-Fresh Coffee", icon: "coffee" },
      { label: "Scenic Valley Views", icon: "view" },
      { label: "Smart Entertainment", icon: "tv" },
    ],
    galleryCount: 5,
  },
  {
    slug: "2bhk-villa",
    name: "2 BHK Villa",
    tag: "Family Haven",
    unit: "/night",
    weekendPrice: 3999,
    weekdayDiscountPct: 10,
    summary:
      "Spacious living for families, featuring a private deck overlooking the valley.",
    description:
      "A spacious family haven designed for serene mountain living, featuring panoramic valley views and luxurious privacy.",
    amenities: [
      { label: "Full Kitchen", icon: "kitchen" },
      { label: "Free On-site Parking", icon: "parking" },
      { label: "High-Speed WiFi", icon: "wifi" },
      { label: "Scenic Valley Views", icon: "view" },
    ],
    galleryCount: 5,
  },
  {
    slug: "dormitory",
    name: "Premium Dormitory",
    tag: "Group Escape",
    unit: "/head",
    weekendPrice: 899,
    weekdayDiscountPct: 10,
    summary:
      "Comfortable bunk beds with personal lockers, ideal for trekking groups and solo travelers alike.",
    description:
      "Bright, budget-friendly bunks with personal lockers and a shared lounge - built for trekking groups, backpackers, and anyone happy to trade a private room for a few new travel stories.",
    amenities: [
      { label: "Personal Lockers", icon: "locker" },
      { label: "Shared Common Lounge", icon: "group" },
      { label: "High-Speed WiFi", icon: "wifi" },
      { label: "Hot Showers", icon: "shower" },
    ],
    galleryCount: 3,
    comingSoon: true,
  },
];

export function getRoomBySlug(slug: string) {
  return ROOM_TYPES.find((r) => r.slug === slug);
}

export function weekdayPrice(room: RoomType) {
  return Math.round(room.weekendPrice * (1 - room.weekdayDiscountPct / 100));
}