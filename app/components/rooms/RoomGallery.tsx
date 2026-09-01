"use client";

import { useState } from "react";
import SafeImage from "../../components/shared/SafeImage";

export default function RoomGallery({
  images,
  name,
  comingSoon,
}: {
  images: string[];
  name: string;
  comingSoon?: boolean;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <style>{`
        @keyframes rg-fade { from { opacity: 0; } to { opacity: 1; } }
        .rg-main { animation: rg-fade .45s ease; }
        @media (prefers-reduced-motion: reduce) { .rg-main { animation: none; } }
      `}</style>

      <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl bg-bark shadow-[0_20px_50px_rgba(30,42,29,0.18)]">
        <div key={active} className="rg-main absolute inset-0">
          <SafeImage
            src={images[active]}
            alt={`${name} photo ${active + 1}`}
            fill
            priority={active === 0}
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="h-full w-full object-cover"
            fallbackLabel={comingSoon ? "Photos coming soon" : undefined}
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className="relative aspect-square overflow-hidden rounded-xl bg-bark ring-2 transition-all"
              style={{
                ["--tw-ring-color" as string]: i === active ? "#c9a05c" : "transparent",
                opacity: i === active ? 1 : 0.7,
              }}
            >
              <SafeImage
                src={src}
                alt={`${name} thumbnail ${i + 1}`}
                fill
                sizes="140px"
                className="h-full w-full object-cover"
                fallbackLabel=""
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}