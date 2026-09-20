import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

// Load .env explicitly for standalone execution
dotenv.config({ path: '.env' });

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  maxGuests: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  images: { type: [String], default: [] },
  blockedDates: { type: [Date], default: [] },
  dynamicPricing: { type: Array, default: [] }
}, { timestamps: true });

// Avoid OverwriteModelError
const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);

const roomsToSeed = [
  {
    name: "1 BHK Cottage",
    maxGuests: 2,
    basePrice: 1999,
  },
  {
    name: "2 BHK Villa",
    maxGuests: 6,
    basePrice: 3999,
  },
  {
    name: "Premium Dormitory",
    maxGuests: 8,
    basePrice: 899,
  }
];

async function seedRooms() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in .env');
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    for (const roomData of roomsToSeed) {
      const existingRoom = await Room.findOne({ name: roomData.name });
      if (existingRoom) {
        console.log(`Room '${roomData.name}' already exists.`);
      } else {
        await Room.create(roomData);
        console.log(`Successfully seeded room: '${roomData.name}'`);
      }
    }

    console.log('Finished seeding rooms.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding rooms:', error);
    process.exit(1);
  }
}

seedRooms();
