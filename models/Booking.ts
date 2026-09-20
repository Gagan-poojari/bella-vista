import mongoose, { Schema, models, Document } from 'mongoose';

export interface IBooking extends Document {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  guests: number;
  room: mongoose.Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  totalAmount: number;
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  bookingStatus: 'Upcoming' | 'Completed' | 'Cancelled';
}

const BookingSchema = new Schema<IBooking>({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  guests: { type: Number, required: true, default: 1 },
  room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed'], 
    default: 'Pending' 
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  bookingStatus: { 
    type: String, 
    enum: ['Upcoming', 'Completed', 'Cancelled'], 
    default: 'Upcoming' 
  }
}, { timestamps: true });

export default models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
