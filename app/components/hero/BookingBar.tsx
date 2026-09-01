"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function toISO(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}
function addDaysISO(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISO(d.getFullYear(), d.getMonth(), d.getDate());
}
function addMonths(base: Date, n: number) {
  return new Date(base.getFullYear(), base.getMonth() + n, 1);
}
function nightsBetween(inISO: string, outISO: string) {
  if (!inISO || !outISO) return 0;
  const ms = new Date(`${outISO}T00:00:00`).getTime() - new Date(`${inISO}T00:00:00`).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}
function formatShort(iso: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function monthLabel(base: Date) {
  return base.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
function nextWeekday(fromISO: string, targetDow: number) {
  const d = new Date(`${fromISO}T00:00:00`);
  const cur = d.getDay();
  let diff = (targetDow - cur + 7) % 7;
  if (diff === 0) diff = 7;
  d.setDate(d.getDate() + diff);
  return toISO(d.getFullYear(), d.getMonth(), d.getDate());
}

const WEEKDAY_LABELS = (() => {
  const base = new Date(2023, 0, 1); // a Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d.toLocaleDateString(undefined, { weekday: "narrow" });
  });
})();

export default function BookingBar() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);
  const datesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!guestsOpen && !datesOpen) return;
    const onClick = (e: MouseEvent) => {
      if (guestsOpen && guestsRef.current && !guestsRef.current.contains(e.target as Node)) setGuestsOpen(false);
      if (datesOpen && datesRef.current && !datesRef.current.contains(e.target as Node)) setDatesOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setGuestsOpen(false);
        setDatesOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [guestsOpen, datesOpen]);

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
        : "";

  // Mirrors the pick() logic inside DatesPanel so the trigger that will
  // respond to the next click is highlighted while the panel is open.
  const activeField: "in" | "out" | null = !datesOpen ? null : !checkIn || (checkIn && checkOut) ? "in" : "out";

  function onPickCheckIn(iso: string) {
    setCheckIn(iso);
    setCheckOut("");
  }
  function onPickCheckOut(iso: string) {
    setCheckOut(iso);
    window.setTimeout(() => setDatesOpen(false), 260);
  }

  const canSearch = Boolean(checkIn && checkOut);
  const noDatesYet = !checkIn && !checkOut;

  return (
    <>
      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          .bv-fade-in { animation: bv-fade-in 0.18s ease-out; }
          .bv-pop { animation: bv-pop 0.24s cubic-bezier(0.34, 1.56, 0.64, 1); }
          .bv-breathe { animation: bv-breathe 3.2s ease-in-out infinite; }
        }
        @keyframes bv-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bv-pop {
          0% { opacity: 0.4; transform: scale(0.82); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes bv-breathe {
          0%, 100% { box-shadow: 0 20px 50px rgba(30,42,29,0.35), 0 0 0 0 rgba(201,164,92,0); }
          50% { box-shadow: 0 20px 50px rgba(30,42,29,0.35), 0 0 0 6px rgba(201,164,92,0.18); }
        }
      `}</style>

      {/* ---------- Desktop / tablet bar ---------- */}
      <div className="absolute bottom-[clamp(20px,4vh,48px)] left-1/2 z-20 hidden w-[min(94vw,940px)] -translate-x-1/2 sm:block">
        <div
          className={`grid grid-cols-[2.2fr_1fr_auto] gap-0 rounded-[10px] border border-husk/35 bg-mist/95 p-2 shadow-[0_24px_60px_rgba(30,42,29,0.35)] backdrop-blur-2xl transition-shadow duration-300 hover:shadow-[0_28px_70px_rgba(30,42,29,0.4)] ${noDatesYet && !datesOpen && !guestsOpen ? "bv-breathe" : ""
            }`}
        >
          <div className="relative grid grid-cols-2" ref={datesRef}>
            <DateTrigger
              label="Check-in"
              iso={checkIn}
              placeholder="Select date"
              active={activeField === "in"}
              onOpen={() => {
                setDatesOpen((v) => !v);
                setGuestsOpen(false);
              }}
            />
            <DateTrigger
              label="Check-out"
              iso={checkOut}
              placeholder={checkIn ? "Select date" : "Pick check-in first"}
              active={activeField === "out"}
              onOpen={() => {
                setDatesOpen((v) => !v);
                setGuestsOpen(false);
              }}
            />

            <div
              className={`absolute bottom-[calc(100%+12px)] left-0 z-20 w-[560px] max-w-[90vw] rounded-2xl border border-husk/30 bg-mist p-5 shadow-[0_20px_45px_rgba(30,42,29,0.28)] transition-all duration-200 ease-out ${datesOpen
                  ? "scale-100 translate-y-0 opacity-100"
                  : "pointer-events-none scale-95 translate-y-1.5 opacity-0"
                }`}
            >
              <DatesPanel
                checkIn={checkIn}
                checkOut={checkOut}
                onSelectCheckIn={onPickCheckIn}
                onSelectCheckOut={onPickCheckOut}
                monthsToShow={2}
              />
            </div>
          </div>

          <div className="relative" ref={guestsRef}>
            <button
              type="button"
              aria-expanded={guestsOpen}
              onClick={() => {
                setGuestsOpen((v) => !v);
                setDatesOpen(false);
              }}
              className={`group flex w-full flex-col gap-1 border-r border-bark/10 px-5 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-husk focus-visible:ring-inset ${guestsOpen ? "bg-husk/10" : "hover:bg-husk/[0.08]"
                }`}
            >
              <span className="font-body text-[10.5px] font-semibold uppercase tracking-[0.1em] text-husk">
                Guests
              </span>
              <span className="flex items-center justify-between font-body text-[14.5px] font-medium text-ink">
                {guestLabel}
                <svg
                  viewBox="0 0 12 8"
                  className={`h-2.5 w-2.5 shrink-0 text-husk transition-transform duration-200 ${guestsOpen ? "rotate-180" : ""
                    }`}
                  fill="none"
                >
                  <path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            <div
              className={`absolute bottom-[calc(100%+12px)] left-0 w-[280px] origin-bottom-left rounded-2xl border border-husk/30 bg-mist p-4 shadow-[0_20px_45px_rgba(30,42,29,0.28)] transition-all duration-200 ease-out ${guestsOpen
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

          <SearchButton disabled={!canSearch} className="rounded-[4px]" />
        </div>

        {checkIn ? (
          <p key={summaryLabel} className="bv-pop mt-2 text-center font-body text-[12px] text-mist/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">
            {summaryLabel}
          </p>
        ) : (
          !datesOpen && (
            <p className="mt-2 text-center font-body text-[12px] text-mist/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">
              Tap Check-in to see available dates
            </p>
          )
        )}
      </div>

      {/* ---------- Mobile trigger ---------- */}
      <div className="absolute bottom-[clamp(16px,3.5vh,28px)] left-1/2 z-20 w-[92vw] -translate-x-1/2 sm:hidden">
        <button
          type="button"
          onClick={() => setMobileSheetOpen(true)}
          className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-husk/35 bg-mist/95 px-5 py-4 text-left backdrop-blur-2xl active:scale-[0.99] transition-transform ${noDatesYet ? "bv-breathe" : "shadow-[0_20px_50px_rgba(30,42,29,0.35)]"
            }`}
        >
          <span className="min-w-0">
            <span className="block font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-husk">
              {checkIn ? summaryLabel : "Add dates"}
            </span>
            <span className="block truncate font-body text-[14.5px] font-medium text-ink">
              {guestLabel}
            </span>
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-mist">
            <CalendarGlyph className="h-4.5 w-4.5" />
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
          className={`absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-300 ${mobileSheetOpen ? "opacity-100" : "opacity-0"
            }`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-mist p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgba(30,42,29,0.4)] transition-transform duration-300 ease-out ${mobileSheetOpen ? "translate-y-0" : "translate-y-full"
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
              <div className="flex-1 overflow-hidden rounded-2xl border border-bark/10">
                <DateTrigger label="Check-in" iso={checkIn} placeholder="Select date" active={false} onOpen={() => { }} bare />
              </div>
              <div className="flex-1 overflow-hidden rounded-2xl border border-bark/10">
                <DateTrigger label="Check-out" iso={checkOut} placeholder="Select date" active={false} onOpen={() => { }} bare />
              </div>
            </div>

            <div className="rounded-2xl border border-bark/10 p-4">
              <DatesPanel
                checkIn={checkIn}
                checkOut={checkOut}
                onSelectCheckIn={onPickCheckIn}
                onSelectCheckOut={setCheckOut}
                monthsToShow={1}
              />
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

function DatesPanel({
  checkIn,
  checkOut,
  onSelectCheckIn,
  onSelectCheckOut,
  monthsToShow,
}: {
  checkIn: string;
  checkOut: string;
  onSelectCheckIn: (iso: string) => void;
  onSelectCheckOut: (iso: string) => void;
  monthsToShow: 1 | 2;
}) {
  const min = todayISO();
  const [base, setBase] = useState(() => {
    const d = new Date(`${checkIn || min}T00:00:00`);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [hoverISO, setHoverISO] = useState("");

  function pick(iso: string) {
    if (!checkIn || (checkIn && checkOut)) {
      onSelectCheckIn(iso);
    } else if (iso <= checkIn) {
      onSelectCheckIn(iso);
    } else {
      onSelectCheckOut(iso);
    }
  }

  function applyQuickRange(startISO: string, nights: number) {
    onSelectCheckIn(startISO);
    onSelectCheckOut(addDaysISO(startISO, nights));
    const d = new Date(`${startISO}T00:00:00`);
    setBase(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  const minMonth = new Date(new Date(`${min}T00:00:00`).getFullYear(), new Date(`${min}T00:00:00`).getMonth(), 1);
  const canGoBack = addMonths(base, -1) >= minMonth;

  return (
    <div className="w-full">
      {!checkIn && (
        <p className="mb-3 font-body text-[12px] text-bark/50">Pick a check-in date to begin</p>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {[
          { label: "Tonight", iso: min, nights: 1 },
          { label: "This weekend", iso: nextWeekday(min, 6), nights: 2 },
          { label: "Next week", iso: addDaysISO(min, 7), nights: 3 },
        ].map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => applyQuickRange(q.iso, q.nights)}
            className="rounded-full border border-husk/40 px-3 py-1 font-body text-[11.5px] font-medium text-bark/70 transition-colors hover:border-husk hover:bg-husk/10 hover:text-ink"
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          aria-label="Previous month"
          disabled={!canGoBack}
          onClick={() => setBase((b) => addMonths(b, -1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-bark/50 transition-colors hover:bg-bark/5 disabled:opacity-20"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setBase((b) => addMonths(b, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-bark/50 transition-colors hover:bg-bark/5"
        >
          ›
        </button>
      </div>

      <div className="flex gap-6 overflow-hidden px-1 pt-1">
        <MonthGrid base={base} checkIn={checkIn} checkOut={checkOut} hoverISO={hoverISO} minISO={min} onHover={setHoverISO} onPick={pick} />
        {monthsToShow === 2 && (
          <MonthGrid base={addMonths(base, 1)} checkIn={checkIn} checkOut={checkOut} hoverISO={hoverISO} minISO={min} onHover={setHoverISO} onPick={pick} />
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t border-bark/10 px-1 pt-3">
        <span className="h-[5px] w-[5px] rounded-full bg-husk" />
        <span className="font-body text-[11px] text-bark/50">Mon–Thu nights include the weekday special</span>
      </div>
    </div>
  );
}

function MonthGrid({
  base,
  checkIn,
  checkOut,
  hoverISO,
  minISO,
  onHover,
  onPick,
}: {
  base: Date;
  checkIn: string;
  checkOut: string;
  hoverISO: string;
  minISO: string;
  onHover: (iso: string) => void;
  onPick: (iso: string) => void;
}) {
  const year = base.getFullYear();
  const month = base.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const cells: (string | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISO(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const rangeEnd = checkOut || hoverISO;

  return (
    <div key={`${year}-${month}`} className="bv-fade-in w-full min-w-[248px]">
      <p className="mb-3 text-center font-body text-[13px] font-semibold text-ink">{monthLabel(base)}</p>
      <div className="mb-1.5 grid grid-cols-7 gap-y-1">
        {WEEKDAY_LABELS.map((w, i) => (
          <span key={i} className="text-center font-body text-[10px] font-semibold text-bark/40">
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} />;
          const disabled = iso < minISO;
          const isStart = iso === checkIn;
          const isEnd = iso === checkOut;
          const inRange = Boolean(checkIn && rangeEnd && iso > checkIn && iso < rangeEnd);
          const isWeekdaySpecial = [1, 2, 3, 4].includes(new Date(`${iso}T00:00:00`).getDay());
          const day = Number(iso.slice(-2));

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              aria-label={new Date(`${iso}T00:00:00`).toDateString()}
              aria-pressed={isStart || isEnd}
              onMouseEnter={() => onHover(iso)}
              onClick={() => onPick(iso)}
              className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-full font-body text-[12.5px] transition-all duration-150 disabled:cursor-not-allowed disabled:text-bark/20
                ${isStart || isEnd ? "z-10 bg-ink font-semibold text-mist" : "text-ink"}
                ${inRange ? "bg-husk/15" : ""}
                ${!disabled && !isStart && !isEnd ? "hover:bg-husk/25" : ""}
              `}
            >
              {day}
              {isWeekdaySpecial && !disabled && !isStart && !isEnd && (
                <span className="absolute bottom-0.5 h-[3px] w-[3px] rounded-full bg-husk" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalendarGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none">
      <rect x="1.5" y="3" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 1.5v3M11.5 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function DateTrigger({
  label,
  iso,
  placeholder,
  active,
  onOpen,
  bare,
}: {
  label: string;
  iso: string;
  placeholder: string;
  active: boolean;
  onOpen: () => void;
  bare?: boolean;
}) {
  const empty = !iso;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group flex w-full flex-col gap-1 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-husk focus-visible:ring-inset ${bare ? "px-4 py-3" : "border-r border-bark/10 px-5 py-3"
        } ${active ? "bg-husk/10" : "hover:bg-husk/[0.08]"}`}
    >
      <span className="flex items-center gap-1.5 font-body text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#8f5300]">
        <CalendarGlyph className="h-3 w-3 opacity-70" />
        {label}
      </span>
      <span className={`flex items-center justify-between font-body text-[14.5px] font-medium ${empty ? "text-bark/80" : "text-ink"}`}>
        {iso ? formatShort(iso) : placeholder}
        <svg
          viewBox="0 0 12 8"
          className={`h-2.5 w-2.5 shrink-0 text-[#8f5300] transition-transform duration-200 ${active ? "rotate-180" : ""}`}
          fill="none"
        >
          <path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
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
      className={`group relative col-span-1 flex items-center justify-center gap-2 overflow-hidden bg-ink px-8 py-3.5 font-body text-[14.5px] font-semibold text-mist transition-all duration-200 cursor-pointer hover:bg-[#8d6700] hover:shadow-[0_12px_28px_rgba(30,42,29,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-husk disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-mist/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative">Check Availability</span>
    </button>
  );
}

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
        <output className="flex w-5 justify-center overflow-hidden font-body text-[14px] tabular-nums text-ink">
          <span key={value} className="bv-pop inline-block">{value}</span>
        </output>
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