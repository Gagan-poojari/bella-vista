import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import RoomManager from "@/app/components/admin/RoomManager";

export default async function RoomsPage() {
  await dbConnect();
  
  // Fetch all rooms and serialize complex objects for Client Components
  const rooms = await Room.find().lean();
  
  const serializedRooms = rooms.map((room: any) => ({
    ...room,
    _id: room._id.toString(),
    createdAt: room.createdAt?.toISOString(),
    updatedAt: room.updatedAt?.toISOString(),
    blockedDates: room.blockedDates?.map((d: Date) => d.toISOString()) || [],
    dynamicPricing: room.dynamicPricing?.map((dp: any) => ({
      ...dp,
      date: new Date(dp.date).toISOString()
    })) || [],
    partialBlocks: room.partialBlocks?.map((pb: any) => ({
      ...pb,
      date: new Date(pb.date).toISOString(),
      _id: pb._id?.toString()
    })) || []
  }));

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-4xl font-semibold text-ink">Rooms & Pricing</h1>
        <p className="text-ink/60 mt-1">Manage base rates, dynamic pricing, and block unavailable dates.</p>
      </header>

      <div className="space-y-8">
        {serializedRooms.map((room: any) => (
          <RoomManager key={room._id} room={room} />
        ))}
      </div>
    </div>
  );
}
