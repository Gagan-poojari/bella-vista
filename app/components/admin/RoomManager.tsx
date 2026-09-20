"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/app/components/ui/Spinner";
import ImageUploader from "./ImageUploader";

export default function RoomManager({ room }: { room: any }) {
  const [basePrice, setBasePrice] = useState(room.basePrice);
  const [blockedDate, setBlockedDate] = useState("");
  const [dynamicDate, setDynamicDate] = useState("");
  const [dynamicPrice, setDynamicPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [blockedDatesList, setBlockedDatesList] = useState<Date[]>(
    room.blockedDates.map((d: string) => new Date(d))
  );
  const [dynamicPricingList, setDynamicPricingList] = useState<any[]>(room.dynamicPricing);

  const saveRoomData = async (updates: any) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/rooms/${room._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update room");
      toast.success("Room updated successfully!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBasePrice = () => {
    saveRoomData({ basePrice });
  };

  const handleAddBlockedDate = () => {
    if (!blockedDate) return;
    const newDates = [...blockedDatesList, new Date(blockedDate)];
    setBlockedDatesList(newDates);
    saveRoomData({ blockedDates: newDates });
    setBlockedDate("");
  };

  const handleRemoveBlockedDate = (index: number) => {
    const newDates = blockedDatesList.filter((_, i) => i !== index);
    setBlockedDatesList(newDates);
    saveRoomData({ blockedDates: newDates });
  };

  const handleAddDynamicPricing = () => {
    if (!dynamicDate || !dynamicPrice) return;
    const newPricing = [...dynamicPricingList, { date: new Date(dynamicDate), price: Number(dynamicPrice) }];
    setDynamicPricingList(newPricing);
    saveRoomData({ dynamicPricing: newPricing });
    setDynamicDate("");
    setDynamicPrice("");
  };

  const handleRemoveDynamicPricing = (index: number) => {
    const newPricing = dynamicPricingList.filter((_, i) => i !== index);
    setDynamicPricingList(newPricing);
    saveRoomData({ dynamicPricing: newPricing });
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(30,42,29,0.05)] border border-bark/10 space-y-8">
      <div className="flex justify-between items-center border-b border-bark/10 pb-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">{room.name}</h2>
          <p className="text-ink/60 text-sm mt-1">Max Guests: {room.maxGuests}</p>
        </div>
        {isSaving && <Spinner className="text-ink w-5 h-5" />}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          {/* Base Price */}
          <div>
            <h3 className="font-semibold text-ink text-sm uppercase tracking-wider mb-3">Base Price</h3>
            <div className="flex gap-3">
              <input 
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="flex-1 rounded-xl border border-bark/20 px-4 py-2 font-body text-sm bg-transparent outline-none focus:border-husk"
              />
              <button 
                onClick={handleUpdateBasePrice}
                disabled={isSaving}
                className="bg-ink text-white px-4 py-2 rounded-xl text-sm hover:-translate-y-0.5 transition-all"
              >
                Save
              </button>
            </div>
          </div>

          {/* Blocked Dates */}
          <div>
            <h3 className="font-semibold text-ink text-sm uppercase tracking-wider mb-3">Block Dates</h3>
            <div className="flex gap-3 mb-3">
              <input 
                type="date"
                value={blockedDate}
                onChange={(e) => setBlockedDate(e.target.value)}
                className="flex-1 rounded-xl border border-bark/20 px-4 py-2 font-body text-sm bg-transparent outline-none focus:border-husk"
              />
              <button 
                onClick={handleAddBlockedDate}
                disabled={isSaving || !blockedDate}
                className="bg-ink text-white px-4 py-2 rounded-xl text-sm hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                Block Date
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {blockedDatesList.map((d, i) => (
                <span key={i} className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-[12px] font-medium border border-red-100">
                  {d.toLocaleDateString()}
                  <button onClick={() => handleRemoveBlockedDate(i)} className="hover:text-red-900">&times;</button>
                </span>
              ))}
              {blockedDatesList.length === 0 && <span className="text-[12px] text-ink/40">No blocked dates.</span>}
            </div>
          </div>

          {/* Dynamic Pricing */}
          <div>
            <h3 className="font-semibold text-ink text-sm uppercase tracking-wider mb-3">Dynamic Pricing</h3>
            <div className="flex gap-3 mb-3">
              <input 
                type="date"
                value={dynamicDate}
                onChange={(e) => setDynamicDate(e.target.value)}
                className="flex-1 rounded-xl border border-bark/20 px-4 py-2 font-body text-sm bg-transparent outline-none focus:border-husk"
              />
              <input 
                type="number"
                placeholder="Price"
                value={dynamicPrice}
                onChange={(e) => setDynamicPrice(e.target.value)}
                className="flex-1 rounded-xl border border-bark/20 px-4 py-2 font-body text-sm bg-transparent outline-none focus:border-husk"
              />
              <button 
                onClick={handleAddDynamicPricing}
                disabled={isSaving || !dynamicDate || !dynamicPrice}
                className="bg-ink text-white px-4 py-2 rounded-xl text-sm hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                Add Rule
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {dynamicPricingList.map((dp, i) => (
                <span key={i} className="flex items-center gap-2 bg-sage/10 text-sage px-3 py-1 rounded-full text-[12px] font-medium border border-sage/20">
                  {new Date(dp.date).toLocaleDateString()} - ₹{dp.price}
                  <button onClick={() => handleRemoveDynamicPricing(i)} className="hover:text-ink/80">&times;</button>
                </span>
              ))}
              {dynamicPricingList.length === 0 && <span className="text-[12px] text-ink/40">No dynamic pricing rules.</span>}
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div>
          <h3 className="font-semibold text-ink text-sm uppercase tracking-wider mb-3">Image Gallery</h3>
          <div className="bg-mist p-6 rounded-2xl border border-bark/10">
            <p className="text-[12px] text-ink/60 mb-4">{room.images?.length || 0} images uploaded</p>
            <ImageUploader roomId={room._id.toString()} />
          </div>
        </div>
      </div>
    </div>
  );
}
