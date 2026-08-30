"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function nightsBetween(inISO: string, outISO: string) {
  if (!inISO || !outISO) return 0;
  const ms = new Date(outISO).getTime() - new Date(inISO).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

function formatShort(iso: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function BookingBar() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!guestsOpen) return;
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setGuestsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGuestsOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [guestsOpen]);

  // lock body scroll while the mobile sheet is open
  useEffect(() => {
    if (!mobileSheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileSheetOpen]);

  const totalGuests = adults + children;
  const guestLabel = `${totalGuests} Guest${totalGuests === 1 ? "" : "s"}`;
  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);

  const summaryLabel =
    checkIn && checkOut
      ? `${formatShort(checkIn)} – ${formatShort(checkOut)} · ${nights} night${nights === 1 ? "" : "s"}`
      : checkIn
      ? `${formatShort(checkIn)} – Add dates`
      : "Add dates";

  function handleCheckInChange(v: string) {
    setCheckIn(v);
    if (checkOut && v && checkOut <= v) setCheckOut("");
    requestAnimationFrame(() => checkOutRef.current?.showPicker?.());
  }

  const canSearch = Boolean(checkIn && checkOut);

  return (
    <>
      {/* ---------- Desktop / tablet bar ---------- */}
      <div className="absolute bottom-[clamp(20px,4vh,48px)] left-1/2 z-20 hidden w-[min(94vw,940px)] -translate-x-1/2 sm:block">
        <div className="grid grid-cols-[1.1fr_1.1fr_1fr_auto] gap-0 rounded-[22px] border border-husk/35 bg-mist/95 p-2 shadow-[0_24px_60px_rgba(30,42,29,0.35)] backdrop-blur-2xl transition-shadow duration-300 hover:shadow-[0_28px_70px_rgba(30,42,29,0.4)]">
          <DateField
            label="Check-in"
            value={checkIn}
            min={todayISO()}
            onChange={handleCheckInChange}
          />
          <DateField
            ref={checkOutRef}
            label="Check-out"
            value={checkOut}
            min={checkIn || todayISO()}
            onChange={setCheckOut}
            disabled={!checkIn}
          />

          <div className="relative flex flex-col gap-1 border-r border-bark/10 px-5 py-3 text-left" ref={popoverRef}>
            <span className="font-body text-[10.5px] font-semibold uppercase tracking-[0.1em] text-husk">
              Guests
            </span>
            <button
              type="button"
              className="group flex w-full items-center justify-between rounded font-body text-[14.5px] font-medium text-ink outline-none focus-visible:ring-2 focus-visible:ring-husk"
              aria-expanded={guestsOpen}
              onClick={() => setGuestsOpen((v) => !v)}
            >
              <span>{guestLabel}</span>
              <svg
                viewBox="0 0 12 8"
                className={`h-2.5 w-2.5 shrink-0 text-husk transition-transform duration-200 ${
                  guestsOpen ? "rotate-180" : ""
                }`}
                fill="none"
              >
                <path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div
              className={`absolute bottom-[calc(100%+12px)] left-0 w-[280px] origin-bottom-left rounded-2xl border border-husk/30 bg-mist p-4 shadow-[0_20px_45px_rgba(30,42,29,0.28)] transition-all duration-200 ease-out ${
                guestsOpen
                  ? "scale-100 translate-y-0 opacity-100"
                  : "pointer-events-none scale-95 translate-y-1.5 opacity-0"
              }`}
            >
              <GuestRow
                label="Adults"
                hint="Age 13+"
                value={adults}
                min={1}
                onDecrease={() => setAdults((n) => Math.max(1, n - 1))}
                onIncrease={() => setAdults((n) => n + 1)}
              />
              <div className="my-1 h-px bg-bark/10" />
              <GuestRow
                label="Children"
                hint="Age 0–12"
                value={children}
                min={0}
                onDecrease={() => setChildren((n) => Math.max(0, n - 1))}
                onIncrease={() => setChildren((n) => n + 1)}
              />
              <button
                type="button"
                onClick={() => setGuestsOpen(false)}
                className="mt-2 w-full rounded-xl bg-ink py-2 font-body text-[13px] font-semibold text-mist transition-colors hover:bg-bark"
              >
                Done
              </button>
            </div>
          </div>

          <SearchButton disabled={!canSearch} className="rounded-[14px]" />
        </div>

        {(checkIn || checkOut) && (
          <p className="mt-2 text-center font-body text-[12px] text-mist/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">
            {summaryLabel}
          </p>
        )}
      </div>

      {/* ---------- Mobile trigger ---------- */}
      <div className="absolute bottom-[clamp(16px,3.5vh,28px)] left-1/2 z-20 w-[92vw] -translate-x-1/2 sm:hidden">
        <button
          type="button"
          onClick={() => setMobileSheetOpen(true)}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-husk/35 bg-mist/95 px-5 py-4 text-left shadow-[0_20px_50px_rgba(30,42,29,0.35)] backdrop-blur-2xl active:scale-[0.99] transition-transform"
        >
          <span className="min-w-0">
            <span className="block font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-husk">
              {summaryLabel}
            </span>
            <span className="block truncate font-body text-[14.5px] font-medium text-ink">
              {guestLabel}
            </span>
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-mist">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
              <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M14 14 18.5 18.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </div>

      {/* ---------- Mobile bottom sheet ---------- */}
      <div
        className={`fixed inset-0 z-30 sm:hidden ${mobileSheetOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!mobileSheetOpen}
      >
        <div
          onClick={() => setMobileSheetOpen(false)}
          className={`absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileSheetOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-mist p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgba(30,42,29,0.4)] transition-transform duration-300 ease-out ${
            mobileSheetOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-bark/20" />
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-body text-[16px] font-semibold text-ink">Check availability</h2>
            <button
              type="button"
              onClick={() => setMobileSheetOpen(false)}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-bark/60 hover:bg-bark/5"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                <path d="M2 2l12 12M14 2 2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex-1 rounded-2xl border border-bark/10 px-4 py-3">
                <DateField label="Check-in" value={checkIn} min={todayISO()} onChange={handleCheckInChange} bare />
              </div>
              <div className="flex-1 rounded-2xl border border-bark/10 px-4 py-3">
                <DateField
                  ref={checkOutRef}
                  label="Check-out"
                  value={checkOut}
                  min={checkIn || todayISO()}
                  onChange={setCheckOut}
                  disabled={!checkIn}
                  bare
                />
              </div>
            </div>

            <div className="rounded-2xl border border-bark/10 px-4 py-2">
              <GuestRow
                label="Adults"
                hint="Age 13+"
                value={adults}
                min={1}
                onDecrease={() => setAdults((n) => Math.max(1, n - 1))}
                onIncrease={() => setAdults((n) => n + 1)}
              />
              <div className="h-px bg-bark/10" />
              <GuestRow
                label="Children"
                hint="Age 0–12"
                value={children}
                min={0}
                onDecrease={() => setChildren((n) => Math.max(0, n - 1))}
                onIncrease={() => setChildren((n) => n + 1)}
              />
            </div>

            <SearchButton
              disabled={!canSearch}
              className="mt-1 w-full rounded-2xl py-4"
              onClick={() => setMobileSheetOpen(false)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function SearchButton({
  disabled,
  className = "",
  onClick,
}: {
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`col-span-1 flex items-center justify-center gap-2 bg-ink px-8 py-3.5 font-body text-[14.5px] font-semibold text-mist transition-all duration-200 hover:-translate-y-0.5 hover:bg-bark hover:shadow-[0_12px_28px_rgba(30,42,29,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-husk disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none ${className}`}
    >
      Check Availability
    </button>
  );
}

const DateField = forwardRef<
  HTMLInputElement,
  {
    label: string;
    value: string;
    min: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    bare?: boolean;
  }
>(function DateField({ label, value, min, onChange, disabled, bare }, ref) {
  const content = (
    <>
      <span className="font-body text-[10.5px] font-semibold uppercase tracking-[0.1em] text-husk">
        {label}
      </span>
      <input
        ref={ref}
        type="date"
        className="w-full bg-transparent font-body text-[14.5px] font-medium text-ink outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-husk disabled:cursor-not-allowed disabled:opacity-40"
        min={min}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </>
  );

  if (bare) return <label className="flex flex-col gap-1 text-left">{content}</label>;

  return (
    <label className="relative flex flex-col gap-1 border-r border-bark/10 px-5 py-3 text-left">
      {content}
    </label>
  );
});

function GuestRow({
  label,
  hint,
  value,
  min,
  onDecrease,
  onIncrease,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="font-body">
        <strong className="block text-[13.5px] font-medium text-ink">{label}</strong>
        <span className="text-[11.5px] text-bark/55">{hint}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={onDecrease}
          aria-label={`Fewer ${label.toLowerCase()}`}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-husk/50 text-husk transition-colors active:scale-95 hover:enabled:bg-husk/10 disabled:opacity-30"
        >
          −
        </button>
        <output className="w-5 text-center font-body text-[14px] tabular-nums text-ink">{value}</output>
        <button
          type="button"
          onClick={onIncrease}
          aria-label={`More ${label.toLowerCase()}`}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-husk/50 text-husk transition-colors active:scale-95 hover:bg-husk/10"
        >
          +
        </button>
      </div>
    </div>
  );
}