import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Room from '@/models/Room';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { roomId, datesToBlock, datesToUnblock, partialBlockDate, blockedBeds } = await req.json();

    if (!roomId) {
      return NextResponse.json({ error: 'Missing room ID' }, { status: 400 });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Convert existing blocked dates to strings for easy manipulation
    let currentBlocked = room.blockedDates.map((d: Date) => d.toISOString().split('T')[0]);

    // Handle Unblocking
    if (datesToUnblock && Array.isArray(datesToUnblock)) {
      currentBlocked = currentBlocked.filter((d: string) => !datesToUnblock.includes(d));
    }

    // Handle Blocking
    if (datesToBlock && Array.isArray(datesToBlock)) {
      datesToBlock.forEach((d: string) => {
        if (!currentBlocked.includes(d)) {
          currentBlocked.push(d);
        }
      });
    }

    // Handle Partial Blocking (for Dormitories)
    if (partialBlockDate && typeof blockedBeds === 'number') {
      const existingBlocks = room.partialBlocks || [];
      const filtered = existingBlocks.filter((pb: any) => 
        pb.date.toISOString().split('T')[0] !== partialBlockDate
      );
      
      if (blockedBeds > 0) {
        filtered.push({ date: new Date(partialBlockDate), blockedBeds });
      }
      
      room.partialBlocks = filtered;
      room.markModified('partialBlocks');
    }

    // Map back to Date objects for full blocks
    room.blockedDates = currentBlocked.map((d: string) => new Date(d));
    await room.save();

    return NextResponse.json({ success: true, room }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
