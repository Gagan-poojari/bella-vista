import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Room from '@/models/Room';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const checkInDateStr = searchParams.get('checkInDate');
    const checkOutDateStr = searchParams.get('checkOutDate');

    let query: any = {};

    // Filter by dates if provided
    if (checkInDateStr && checkOutDateStr) {
      const checkIn = new Date(checkInDateStr);
      const checkOut = new Date(checkOutDateStr);
      
      // We want to find rooms where none of the blockedDates fall between checkIn and checkOut.
      // (Assuming blockedDates represents exactly which days are unavailable).
      query = {
        blockedDates: {
          $not: {
            $elemMatch: {
              $gte: checkIn,
              $lt: checkOut
            }
          }
        }
      };
    }

    const rooms = await Room.find(query);

    return NextResponse.json(rooms, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Note: For actual admin creation, you'd want to check getServerSession(authOptions) here.
    // We will leave this basic for now to seed data if needed.
    await dbConnect();
    const body = await req.json();
    const room = await Room.create(body);
    return NextResponse.json(room, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
