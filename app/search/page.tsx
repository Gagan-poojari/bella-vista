"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NavBar from "../components/hero/NavBar";
import Footer from "../components/layout/Footer";
import SafeImage from "../components/shared/SafeImage";
import { ROOM_TYPES } from "../lib/rooms";
import Link from "next/link";

type AvailabilityData = {
  room: {
    _id: string;
    name: string;
    maxGuests: number;
    basePrice: number;
  };
  isAvailable: boolean;
};

const DB_TO_SLUG_MAP: Record<string, string> = {
  "1 BHK Cottage": "1bhk-cottage",
  "2 BHK Villa": "2bhk-villa",
  "Premium Dormitory": "dormitory",
};

function SearchResults() {
  const searchParams = useSearchParams();
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const adults = parseInt(searchParams.get("adults") || "2", 10);
  const children = parseInt(searchParams.get("children") || "0", 10);

  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);

  const totalGuests = adults + children;

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      try {
        let url = "/api/availability";
        if (checkIn && checkOut) {
          url += `?checkIn=${checkIn}&checkOut=${checkOut}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setAvailability(data);
        }
      } catch (error) {
        console.error("Failed to fetch availability:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAvailability();
  }, [checkIn, checkOut]);

  function formatDate(isoStr: string | null) {
    if (!isoStr) return "";
    return new Date(isoStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  return (
    <div className="min-h-screen bg-mist flex flex-col">
      <NavBar />
      
      <main className="flex-1 pt-32 pb-24 px-6 max-w-5xl mx-auto w-full">
        <h1 className="font-display text-4xl font-semibold text-ink mb-2">
          Search Results
        </h1>
        {checkIn && checkOut ? (
          <p className="font-body text-ink/70 mb-10">
            Availability for {totalGuests} guest{totalGuests !== 1 ? 's' : ''} from <strong className="text-ink" suppressHydrationWarning>{formatDate(checkIn)}</strong> to <strong className="text-ink" suppressHydrationWarning>{formatDate(checkOut)}</strong>
          </p>
        ) : (
          <p className="font-body text-ink/70 mb-10">
            Showing all rooms. Please select dates to check availability.
          </p>
        )}

        {loading ? (
          <div className="grid gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-bark/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-8">
            {availability.map(({ room, isAvailable }) => {
              const slug = DB_TO_SLUG_MAP[room.name];
              const roomDetails = ROOM_TYPES.find(r => r.slug === slug);
              if (!roomDetails) return null;

              const capacityExceeded = totalGuests > room.maxGuests;
              const disabled = !isAvailable || capacityExceeded;

              return (
                <div 
                  key={room._id} 
                  className={`relative flex flex-col md:flex-row gap-6 p-4 md:p-6 rounded-3xl border border-bark/15 bg-white/60 backdrop-blur-sm transition-all duration-300 ${
                    disabled ? "opacity-60 grayscale-[40%]" : "hover:shadow-lg hover:border-husk/50"
                  }`}
                >
                  <div className="relative w-full md:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden shrink-0">
                    <SafeImage 
                      src={`/rooms/${roomDetails.slug}/cover.png`} 
                      alt={roomDetails.name}
                      fill
                      className="object-cover"
                      fallbackLabel={roomDetails.comingSoon ? "Photos coming soon" : undefined}
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-body text-[11px] font-semibold tracking-widest uppercase text-husk">
                          {roomDetails.tag}
                        </span>
                        <h2 className="font-display text-2xl font-semibold text-ink mt-1">
                          {roomDetails.name}
                        </h2>
                      </div>
                      
                      {disabled && (
                        <div className="px-3 py-1 bg-ink/10 text-ink/70 rounded-full font-body text-xs font-semibold uppercase tracking-wider">
                          {!isAvailable ? "Sold Out" : "Capacity Exceeded"}
                        </div>
                      )}
                    </div>

                    <p className="font-body text-[14px] text-ink/70 line-clamp-2 mt-2">
                      {roomDetails.summary}
                    </p>

                    <div className="mt-4 flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-ink/70">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span className="font-body text-[13px]">Up to {room.maxGuests} guests</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="font-display text-2xl font-semibold text-ink">
                          ₹{room.basePrice.toLocaleString("en-IN")}
                        </span>
                        <span className="font-body text-[13px] text-ink/60 ml-1">
                          {roomDetails.unit}
                        </span>
                      </div>
                      
                      <Link 
                        href={`/rooms/${roomDetails.slug}`}
                        className={`px-8 py-3 rounded-full font-body text-[14px] font-semibold transition-colors ${
                          disabled 
                            ? "bg-bark/10 text-ink/40 pointer-events-none" 
                            : "bg-ink text-mist hover:bg-[#8d6700] hover:text-white"
                        }`}
                        tabIndex={disabled ? -1 : 0}
                      >
                        {disabled ? "Unavailable" : "View & Book"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mist flex items-center justify-center font-body">Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
