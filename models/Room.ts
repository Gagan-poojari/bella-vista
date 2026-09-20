import mongoose, { Schema, models, Document } from 'mongoose';

export interface IRoom extends Document {
  name: string; // 1BHK, 2BHK, Dormitory
  maxGuests: number; // 2, 6, 8
  basePrice: number;
  images: string[];
  blockedDates: Date[];
  partialBlocks: { date: Date; blockedBeds: number }[];
  dynamicPricing: { date: Date; price: number }[];
}

const RoomSchema = new Schema<IRoom>({
  name: { type: String, required: true },
  maxGuests: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  images: { type: [String], default: [] },
  blockedDates: { type: [Date], default: [] },
  partialBlocks: [
    {
      date: { type: Date, required: true },
      blockedBeds: { type: Number, required: true }
    }
  ],
  dynamicPricing: [
    {
      date: { type: Date, required: true },
      price: { type: Number, required: true }
    }
  ]
}, { timestamps: true });

// Prevent Mongoose from caching the old schema in Next.js dev mode
if (mongoose.models.Room) {
  delete mongoose.models.Room;
}

export default mongoose.model<IRoom>('Room', RoomSchema);
