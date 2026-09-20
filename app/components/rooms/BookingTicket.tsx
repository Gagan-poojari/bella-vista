"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { Spinner } from "@/app/components/ui/Spinner";

type TicketRoom = {
  id: string;
  name: string;
  maxGuests: number;
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
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const bookingSchema = z.object({
    customerName: z.string().min(2, "Name is required"),
    customerEmail: z.string().email("Invalid email address"),
    customerPhone: z.string().min(10, "Valid phone required"),
    checkInDate: z.string().nonempty("Check-in required"),
    checkOutDate: z.string().nonempty("Check-out required"),
    guests: z
      .number()
      .min(1, "At least 1 guest")
      .max(room.maxGuests, `Max ${room.maxGuests} guests allowed`),
  }).refine((data) => new Date(data.checkInDate) < new Date(data.checkOutDate), {
    message: "Check-out must be after check-in",
    path: ["checkOutDate"],
  });

  type BookingFormValues = z.infer<typeof bookingSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guests: 2,
    },
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    
    // Load Razorpay Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      mq.removeEventListener("change", onChange);
    };
  }, []);

  const targetPrice = room.weekendPrice;
  const displayPrice = useCountUp(targetPrice, 500, !reduceMotion);

  const onSubmit = async (data: BookingFormValues) => {
    if (!room.id) {
      toast.error("Room database ID is missing. Cannot book.");
      return;
    }
    
    setIsLoading(true);
    try {
      // 1. Create Booking & Razorpay Order
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          room: room.id,
        }),
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Failed to create booking");
      }

      const { booking, orderId } = result;

      // 2. Open Razorpay Popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: booking.totalAmount * 100,
        currency: "INR",
        name: "Bella Vista Homestay",
        description: `Booking for ${room.name}`,
        order_id: orderId,
        handler: async function (response: any) {
          toast.success("Payment Successful! Booking Confirmed.");
          setIsConfirmed(true);
          
          try {
            await fetch('/api/bookings/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                orderId: orderId, 
                paymentId: response.razorpay_payment_id 
              })
            });
          } catch (err) {
            console.error("Failed to confirm booking", err);
          }

          setTimeout(() => {
            setIsConfirmed(false);
            reset();
          }, 3000);
          
          try {
            await sendBookingConfirmationEmail({
              customerName: data.customerName,
              customerEmail: data.customerEmail,
              roomType: room.name,
              checkInDate: data.checkInDate,
              checkOutDate: data.checkOutDate,
              totalAmount: booking.totalAmount,
            });
          } catch (e) {
            console.error("EmailJS error", e);
          }
        },
        prefill: {
          name: data.customerName,
          email: data.customerEmail,
          contact: data.customerPhone,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment Failed. Please try again.");
      });

      rzp.open();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
        </div>
      </div>

      <div className="bt-perforation px-7">
        <div className="border-t border-dashed border-bark/25" />
      </div>

      {isConfirmed ? (
        <div className="p-7 pt-10 pb-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-display text-2xl font-semibold text-ink mb-2">Booking Confirmed!</h3>
          <p className="font-body text-[13px] text-ink/70 leading-relaxed">
            Your stay is sealed. We&apos;ve sent a confirmation email with all the details.
          </p>
        </div>
      ) : (
      <form onSubmit={handleSubmit(onSubmit)} className="p-7 pt-6">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <label className="block">
            <span className="font-body text-[11px] font-medium uppercase tracking-[0.08em] text-ink/50">
              Check-in
            </span>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              {...register("checkInDate")}
              className="mt-1 block w-full border-b border-bark/20 pb-2 font-body text-[13px] text-ink/70 bg-transparent outline-none focus:border-husk"
            />
            {errors.checkInDate && <p className="text-red-500 text-[10px] mt-1">{errors.checkInDate.message}</p>}
          </label>
          <label className="block">
            <span className="font-body text-[11px] font-medium uppercase tracking-[0.08em] text-ink/50">
              Check-out
            </span>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              {...register("checkOutDate")}
              className="mt-1 block w-full border-b border-bark/20 pb-2 font-body text-[13px] text-ink/70 bg-transparent outline-none focus:border-husk"
            />
            {errors.checkOutDate && <p className="text-red-500 text-[10px] mt-1">{errors.checkOutDate.message}</p>}
          </label>
        </div>

        {/* Guests */}
        <label className="block mb-4">
          <span className="font-body text-[11px] font-medium uppercase tracking-[0.08em] text-ink/50">
            Guests (Max {room.maxGuests})
          </span>
          <input
            type="number"
            {...register("guests", { valueAsNumber: true })}
            className="mt-1 block w-full border-b border-bark/20 pb-2 font-body text-[13px] text-ink/70 bg-transparent outline-none focus:border-husk"
          />
          {errors.guests && <p className="text-red-500 text-[10px] mt-1">{errors.guests.message}</p>}
        </label>

        {/* Customer Details */}
        <div className="space-y-4 mb-6">
          <label className="block">
            <span className="font-body text-[11px] font-medium uppercase tracking-[0.08em] text-ink/50">
              Full Name
            </span>
            <input
              type="text"
              placeholder="John Doe"
              {...register("customerName")}
              className="mt-1 block w-full border-b border-bark/20 pb-2 font-body text-[13px] text-ink/70 bg-transparent outline-none focus:border-husk"
            />
            {errors.customerName && <p className="text-red-500 text-[10px] mt-1">{errors.customerName.message}</p>}
          </label>
          
          <label className="block">
            <span className="font-body text-[11px] font-medium uppercase tracking-[0.08em] text-ink/50">
              Email Address
            </span>
            <input
              type="email"
              placeholder="john@example.com"
              {...register("customerEmail")}
              className="mt-1 block w-full border-b border-bark/20 pb-2 font-body text-[13px] text-ink/70 bg-transparent outline-none focus:border-husk"
            />
            {errors.customerEmail && <p className="text-red-500 text-[10px] mt-1">{errors.customerEmail.message}</p>}
          </label>

          <label className="block">
            <span className="font-body text-[11px] font-medium uppercase tracking-[0.08em] text-ink/50">
              Phone Number
            </span>
            <input
              type="tel"
              placeholder="+91 9876543210"
              {...register("customerPhone")}
              className="mt-1 block w-full border-b border-bark/20 pb-2 font-body text-[13px] text-ink/70 bg-transparent outline-none focus:border-husk"
            />
            {errors.customerPhone && <p className="text-red-500 text-[10px] mt-1">{errors.customerPhone.message}</p>}
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 font-body text-[13.5px] font-semibold text-mist transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(201,160,92,0.4)] disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {isLoading ? (
            <>
              <Spinner className="w-4 h-4 text-mist" /> Processing...
            </>
          ) : (
            "Check Availability & Book"
          )}
        </button>
        <p className="mt-3 text-center font-body text-[11.5px] text-ink/45">You won&apos;t be charged yet</p>

        <div className="mt-6 space-y-2 border-t border-bark/10 pt-5 font-body text-[12.5px] text-ink/60">
          <p>Check-in from 12:00 PM · Check-out by 11:00 AM</p>
        </div>
      </form>
      )}
    </div>
  );
}