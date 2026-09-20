import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import Booking from "@/models/Booking";
import AdminCalendarClient from "./AdminCalendarClient";

export default async function AdminCalendarPage() {
  await dbConnect();
  
  const rooms = await Room.find().lean();
  
  const bookings = await Booking.find({
    bookingStatus: { $ne: 'Cancelled' }
  }).lean();

  const serialize = (list: any[]) => JSON.parse(JSON.stringify(list));

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-4xl font-semibold text-ink">Calendar Availability</h1>
        <p className="text-ink/60 mt-1">Manage blocked dates and view daily capacity.</p>
      </header>

      <AdminCalendarClient rooms={serialize(rooms)} bookings={serialize(bookings)} />
    </div>
  );
}
