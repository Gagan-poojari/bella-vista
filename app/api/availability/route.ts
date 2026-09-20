import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Room from '@/models/Room';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const checkInDateStr = searchParams.get('checkIn');
    const checkOutDateStr = searchParams.get('checkOut');

    const rooms = await Room.find({});

    if (!checkInDateStr || !checkOutDateStr) {
      return NextResponse.json(rooms.map(room => ({ room, isAvailable: true })), { status: 200 });
    }

    const checkIn = new Date(checkInDateStr);
    const checkOut = new Date(checkOutDateStr);

    const availability = rooms.map(room => {
      // Check if any of the blocked dates fall between checkIn and checkOut
      const isBlocked = room.blockedDates.some((date: Date) => {
        return date >= checkIn && date < checkOut;
      });

      return {
        room,
        isAvailable: !isBlocked
      };
    });

    return NextResponse.json(availability, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
