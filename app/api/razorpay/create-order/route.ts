import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/mongodb';
import Room from '@/models/Room';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { roomId, checkInDate, checkOutDate } = body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Fetch the room to calculate price
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check availability
    const isBlocked = room.blockedDates.some((date: Date) => {
      return date >= checkIn && date < checkOut;
    });

    if (isBlocked) {
      return NextResponse.json({ error: 'Room is not available for the selected dates' }, { status: 400 });
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
    // amount is in smallest currency unit (paise for INR)
    const options = {
      amount: totalAmount * 100, 
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ 
      orderId: order.id, 
      amount: order.amount,
      currency: order.currency
    }, { status: 200 });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
