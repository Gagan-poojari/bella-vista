import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function POST(req: Request) {
  try {
    const { orderId, paymentId } = await req.json();
    
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    await dbConnect();
    
    const booking = await Booking.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { 
        paymentStatus: 'Completed',
        razorpayPaymentId: paymentId
      },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
