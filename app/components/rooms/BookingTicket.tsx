"use client";

import { useEffect, useRef, useState } from "react";

type TicketRoom = {
  weekendPrice: number;
  weekdayPrice: number;
  weekdayDiscountPct: number;
  unit: "/night" | "/head";
};

function useCountUp(value: number, durationMs: number, enabled: boolean) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }
    const from = fromRef.current;
    if (from === value) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs, enabled]);

  return display;
}

export default function BookingTicket({ room }: { room: TicketRoom }) {
  const [rateMode, setRateMode] = useState<"weekend" | "weekday">("weekend");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const targetPrice = rateMode === "weekend" ? room.weekendPrice : room.weekdayPrice;
  const displayPrice = useCountUp(targetPrice, 500, !reduceMotion);

  return (
    <div className="relative rounded-3xl bg-white shadow-[0_20px_50px_rgba(30,42,29,0.14)]">
      <style>{`
        .bt-perforation { position: relative; }
        .bt-perforation::before,
        .bt-perforation::after {
          content: ""; position: absolute; top: 50%; width: 22px; height: 22px;
          border-radius: 9999px; background: var(--bt-notch-bg, #f2ede1);
          transform: translateY(-50%);
        }
        .bt-perforation::before { left: -11px; }
        .bt-perforation::after { right: -11px; }
        .bt-toggle-thumb { transition: transform .35s cubic-bezier(.19,.75,.24,1); }
      `}</style>

      <div className="p-7 pb-6">
        <span
          className="mb-2 inline-block font-display text-[12px] italic text-husk"
          style={{ transform: "rotate(-3deg)" }}
        >
          your stay, sealed
        </span>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="font-display text-2xl font-semibold text-ink">
            ₹{displayPrice.toLocaleString("en-IN")}
            <span className="ml-1 font-body text-[13px] font-normal text-ink/50">{room.unit}</span>
          </p>

          <div className="relative flex rounded-full border border-bark/15 bg-bark/4 p-0.5">
            <span
              className="bt-toggle-thumb absolute inset-y-0.5 w-16 rounded-full bg-white shadow-sm"
              style={{ transform: rateMode === "weekend" ? "translateX(0)" : "translateX(64px)" }}
            />
            {(["weekend", "weekday"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setRateMode(mode)}
                className="relative z-10 w-16 rounded-full py-1.5 font-body text-[11px] font-medium capitalize text-ink/70"
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {rateMode === "weekday" ? (
          <p className="mt-1.5 font-body text-[12px] text-sage">
            {room.weekdayDiscountPct}% off, Monday–Thursday.
          </p>
        ) : (
          <p className="mt-1.5 font-body text-[12px] text-ink/45">Standard rate, Friday–Sunday.</p>
        )}
      </div>

      {/* Perforated tear between the price and the trip details, like a
          ticket stub - the notches punch through to the page background. */}
      <div className="bt-perforation px-7">
        <div className="border-t border-dashed border-bark/25" />
      </div>

      <div className="p-7 pt-6">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="font-body text-[11px] font-medium uppercase tracking-[0.08em] text-ink/50">
              Check-in
            </span>
            <span className="mt-1 flex items-center justify-between border-b border-bark/20 pb-2 font-body text-[13px] text-ink/70">
              Select date
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-ink/40">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </label>
          <label className="block">
            <span className="font-body text-[11px] font-medium uppercase tracking-[0.08em] text-ink/50">
              Check-out
            </span>
            <span className="mt-1 flex items-center justify-between border-b border-bark/20 pb-2 font-body text-[13px] text-ink/70">
              Select date
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-ink/40">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="font-body text-[11px] font-medium uppercase tracking-[0.08em] text-ink/50">
            Guests
          </span>
          <span className="mt-1 flex items-center justify-between border-b border-bark/20 pb-2 font-body text-[13px] text-ink/70">
            2 Guests
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-ink/40">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </label>

        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-ink py-3.5 font-body text-[13.5px] font-semibold text-mist transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(201,160,92,0.4)]"
        >
          Check Availability
        </button>
        <p className="mt-3 text-center font-body text-[11.5px] text-ink/45">You won&apos;t be charged yet</p>

        <div className="mt-6 space-y-2 border-t border-bark/10 pt-5 font-body text-[12.5px] text-ink/60">
          <p>Check-in from 12:00 PM · Check-out by 11:00 AM</p>
          <p>Weekend rate applies Friday–Sunday</p>
        </div>
      </div>
    </div>
  );
}