import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import "@/models/Room";
import BookingsTable from "./BookingsTable";

export default async function BookingsPage() {
  await dbConnect();
  
  // Fetch all bookings
  const bookings = await Booking.find().populate("room").sort({ createdAt: -1 }).lean();

  const now = new Date();
  
  // Categorize bookings
  const upcomingBookings = bookings.filter((b: any) => new Date(b.checkOutDate) >= now);
  const finishedBookings = bookings.filter((b: any) => new Date(b.checkOutDate) < now);

  const safeUpcoming = JSON.parse(JSON.stringify(upcomingBookings));
  const safeFinished = JSON.parse(JSON.stringify(finishedBookings));

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-4xl font-semibold text-ink">Bookings</h1>
        <p className="text-ink/60 mt-1">Manage all upcoming and past reservations.</p>
      </header>

      <section className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(30,42,29,0.05)] border border-bark/10">
        <h2 className="font-display text-2xl font-semibold text-ink mb-6">Upcoming Bookings</h2>
        <BookingsTable data={safeUpcoming} emptyMessage="No upcoming bookings found." />
      </section>

      <section className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(30,42,29,0.05)] border border-bark/10 opacity-75">
        <h2 className="font-display text-2xl font-semibold text-ink mb-6">Finished Bookings</h2>
        <BookingsTable data={safeFinished} emptyMessage="No finished bookings found." />
      </section>
    </div>
  );
}
