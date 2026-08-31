"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type SafeImageProps = ImageProps & {
  /** Text shown under the placeholder icon if the image 404s. Pass "" to omit the label entirely (e.g. small thumbnails). */
  fallbackLabel?: string;
};

// Drop-in replacement for next/image. Real estates rarely have every photo
// ready on day one — this renders a branded placeholder instead of a broken
// image icon whenever a src 404s, so the site never looks unfinished while
// photos are still being uploaded to /public/rooms/<slug>/.
export default function SafeImage({ fallbackLabel, alt, ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const label = fallbackLabel === "" ? null : fallbackLabel ?? "Photo coming soon";

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex h-full w-full items-center justify-center"
        style={{ background: "linear-gradient(160deg, var(--color-bark), var(--color-ink))" }}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            className="h-7 w-7 text-husk/70"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.6" />
            <path d="M21 16l-5.5-5-4 4-2-2L3 18" />
          </svg>
          {label && (
            <span className="font-body text-[10.5px] uppercase tracking-[0.14em] text-mist/70">
              {label}
            </span>
          )}
        </div>
      </div>
    );
  }

  return <Image {...props} alt={alt} onError={() => setFailed(true)} />;
}