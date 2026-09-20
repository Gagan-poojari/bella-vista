import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET as string;
    
    if (!secret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not defined');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Process the event
    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      await dbConnect();
      
      // Update the Booking that corresponds to this Razorpay Order ID
      const booking = await Booking.findOneAndUpdate(
        { razorpayOrderId: orderId },
        { 
          paymentStatus: 'Completed',
          razorpayPaymentId: paymentId
        },
        { new: true }
      );

      if (!booking) {
        console.error(`Booking with orderId ${orderId} not found.`);
        // Note: Depending on your architecture, returning 404 here might cause Razorpay to retry the webhook.
        // It's often better to return 200 so they stop retrying, but log the error.
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
