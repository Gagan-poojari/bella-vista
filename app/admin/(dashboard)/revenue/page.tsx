import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Room from "@/models/Room";

export default async function RevenuePage() {
  await dbConnect();
  
  // Fetch only completed bookings
  const bookings = await Booking.find({ paymentStatus: "Completed" })
    .populate("room")
    .sort({ createdAt: -1 })
    .lean();
    
  const rooms = await Room.find().lean();

  // Aggregate Total Revenue
  const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

  // Revenue by Room
  const revenueByRoom = rooms.map((room: any) => {
    const roomBookings = bookings.filter((b: any) => b.room?._id?.toString() === room._id.toString());
    const sum = roomBookings.reduce((s: number, b: any) => s + (b.totalAmount || 0), 0);
    return { name: room.name, revenue: sum, bookingsCount: roomBookings.length };
  }).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-4xl font-semibold text-ink">Revenue & Analytics</h1>
        <p className="text-ink/60 mt-1">Overview of all successful transactions.</p>
      </header>

      {/* Top Metric */}
      <section className="bg-ink rounded-3xl p-10 text-mist shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-mist/70 text-sm uppercase tracking-wider font-medium mb-2">Total Earnings</p>
          <h2 className="font-display text-5xl font-bold">₹{totalRevenue.toLocaleString("en-IN")}</h2>
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10">
        
        {/* Revenue By Room */}
        <section className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(30,42,29,0.05)] border border-bark/10 h-fit">
          <h3 className="font-display text-xl font-semibold text-ink mb-6">Earnings by Room</h3>
          <div className="space-y-4">
            {revenueByRoom.map((r, i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-mist border border-bark/10">
                <div>
                  <p className="font-medium text-ink text-sm">{r.name}</p>
                  <p className="text-[12px] text-ink/50">{r.bookingsCount} Bookings</p>
                </div>
                <p className="font-semibold text-ink">₹{r.revenue.toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(30,42,29,0.05)] border border-bark/10">
          <h3 className="font-display text-xl font-semibold text-ink mb-6">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead>
                <tr className="border-b border-bark/10 text-ink/50 uppercase tracking-wider text-[11px]">
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Room</th>
                  <th className="pb-3 font-medium">Date Paid</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bark/5">
                {bookings.slice(0, 10).map((booking: any) => (
                  <tr key={booking._id.toString()}>
                    <td className="py-4">
                      <p className="font-medium text-ink">{booking.customerName}</p>
                    </td>
                    <td className="py-4 text-ink/80">{booking.room?.name || "Unknown"}</td>
                    <td className="py-4 text-ink/80">
                      {new Date(booking.updatedAt || booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 font-medium text-right text-sage">
                      +₹{booking.totalAmount?.toLocaleString("en-IN") ?? 0}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-ink/50">No transactions yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
