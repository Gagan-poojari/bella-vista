import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Room from '@/models/Room';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const bookings = await Booking.find().populate('room');
    
    return NextResponse.json(bookings, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      guests = 1,
      room: roomId, 
      checkInDate, 
      checkOutDate 
    } = body;

    // Validate inputs
    if (!customerName || !customerEmail || !roomId || !checkInDate || !checkOutDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Fetch the room to calculate price and verify availability
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check availability (Manual Admin Blocks)
    const isBlocked = room.blockedDates.some((date: Date) => {
      return date >= checkIn && date < checkOut;
    });

    if (isBlocked) {
      return NextResponse.json({ error: 'Room is blocked for the selected dates' }, { status: 400 });
    }

    // Check concurrency and existing bookings
    // A booking holds the slot if it is Completed OR if it's Pending and created less than 15 mins ago
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const overlappingBookings = await Booking.find({
      room: roomId,
      bookingStatus: { $ne: 'Cancelled' },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
      $or: [
        { paymentStatus: 'Completed' },
        { paymentStatus: 'Pending', createdAt: { $gt: fifteenMinsAgo } }
      ]
    });

    const isDormitory = room.name.toLowerCase().includes('dormitory');

    if (isDormitory) {
      // For Dormitory, check bed availability day by day
      let currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        // Count guests for this specific day
        let bookedGuestsOnThisDay = 0;
        for (const b of overlappingBookings) {
          if (b.checkInDate <= currentDate && b.checkOutDate > currentDate) {
            bookedGuestsOnThisDay += (b.guests || 1);
          }
        }
        
        // Add manually blocked beds
        const dateStr = currentDate.toISOString().split('T')[0];
        const partialBlock = (room.partialBlocks || []).find((pb: any) => 
          pb.date.toISOString().split('T')[0] === dateStr
        );
        if (partialBlock) {
          bookedGuestsOnThisDay += partialBlock.blockedBeds;
        }

        if (bookedGuestsOnThisDay + guests > room.maxGuests) {
          return NextResponse.json({ 
            error: `Not enough beds available on ${currentDate.toDateString()}. Available: ${Math.max(0, room.maxGuests - bookedGuestsOnThisDay)}` 
          }, { status: 400 });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      // For Private Rooms, any overlap means it's fully booked
      if (overlappingBookings.length > 0) {
        return NextResponse.json({ error: 'Room is already booked for the selected dates' }, { status: 400 });
      }
    }

    // Calculate total amount
    let totalAmount = 0;
    let currentDate = new Date(checkIn);
    
    while (currentDate < checkOut) {
      const override = room.dynamicPricing.find((dp: any) => 
        new Date(dp.date).toDateString() === currentDate.toDateString()
      );
      
      if (override) {
        totalAmount += override.price;
      } else {
        totalAmount += room.basePrice;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create Razorpay Order
    const options = {
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    // Create the booking
    const booking = await Booking.create({
      customerName,
      customerEmail,
      customerPhone,
      guests,
      room: roomId,
      checkInDate,
      checkOutDate,
      totalAmount,
      paymentStatus: 'Pending',
      bookingStatus: 'Upcoming',
      razorpayOrderId: order.id
    });

    return NextResponse.json({ booking, orderId: order.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
