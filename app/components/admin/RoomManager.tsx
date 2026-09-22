"use client";

import { useState, useEffect } from "react";
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
  const [imagesList, setImagesList] = useState<{url: string, fileId: string}[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  let folderName = `/rooms/${room._id}`;
  const lowerName = room.name?.toLowerCase() || '';
  if (lowerName.includes('1 bhk') || lowerName.includes('1bhk')) folderName = '/1bhk';
  else if (lowerName.includes('2 bhk') || lowerName.includes('2bhk')) folderName = '/2bhk';
  else if (lowerName.includes('dormitory')) folderName = '/Dormitory';

  useEffect(() => {
    fetch(`/api/imagekit/files?folder=${folderName}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setImagesList(data.map(f => ({ url: f.url, fileId: f.fileId })));
        }
        setIsLoadingImages(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoadingImages(false);
      });
  }, [folderName]);

  const handleUploadSuccess = () => {
    // Refetch to get the latest files with their IDs
    fetch(`/api/imagekit/files?folder=${folderName}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setImagesList(data.map(f => ({ url: f.url, fileId: f.fileId })));
        }
      });
  };

  const handleRemoveImage = async (fileId: string) => {
    const previousImages = [...imagesList];
    setImagesList(imagesList.filter(img => img.fileId !== fileId));
    
    try {
      const res = await fetch('/api/imagekit/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId })
      });
      if (!res.ok) throw new Error("Failed to delete from ImageKit");
      toast.success("Media deleted from ImageKit");
      
      // We also should update the db so it doesn't hold old references
      const newUrls = imagesList.filter(img => img.fileId !== fileId).map(img => img.url);
      await fetch(`/api/rooms/${room._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: newUrls }),
      });
    } catch(err: any) {
      toast.error(err.message);
      setImagesList(previousImages); // Revert on failure
    }
  };

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
          <h3 className="font-semibold text-ink text-sm uppercase tracking-wider mb-3">Media Gallery</h3>
          <div className="bg-mist p-6 rounded-2xl border border-bark/10 space-y-6">
            <div>
              {isLoadingImages ? (
                <p className="text-[12px] text-ink/60 mb-4">Loading media from ImageKit...</p>
              ) : (
                <p className="text-[12px] text-ink/60 mb-4">{imagesList.length} items found in folder {folderName}</p>
              )}
              
              {!isLoadingImages && imagesList.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {imagesList.map((media, i) => {
                    const isVideo = media.url.match(/\.(mp4|webm|ogg|mov)$/i);
                    return (
                      <div key={media.fileId} className="relative group aspect-square rounded-lg overflow-hidden bg-bark/10">
                        {isVideo ? (
                          <video src={media.url} className="w-full h-full object-cover" muted playsInline />
                        ) : (
                          <img src={media.url} alt={`Media ${i}`} className="w-full h-full object-cover" />
                        )}
                        <button 
                          onClick={() => handleRemoveImage(media.fileId)}
                          className="absolute inset-0 bg-ink/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="bg-white text-red-600 p-2 rounded-full shadow-sm hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="border-t border-bark/10 pt-6">
              <ImageUploader roomId={room._id.toString()} onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
