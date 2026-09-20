"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/app/components/ui/Spinner";

export default function AdminCalendarClient({ rooms, bookings }: { rooms: any[], bookings: any[] }) {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?._id || "");
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [isUpdating, setIsUpdating] = useState(false);

  const [localRooms, setLocalRooms] = useState(rooms);

  const selectedRoom = localRooms.find(r => r._id === selectedRoomId);
  const isDormitory = selectedRoom?.name.toLowerCase().includes('dormitory');

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handleToggleBlock = async (dateStr: string, status?: any) => {
    if (!selectedRoomId) return;
    
    // Disable past dates
    const today = new Date();
    today.setHours(0,0,0,0);
    if (new Date(dateStr) < today) {
      toast.error("Cannot modify past dates.");
      return;
    }

    setIsUpdating(true);

    const isBlocked = selectedRoom.blockedDates.some((d: string) => d.startsWith(dateStr));
    let payload: any;

    if (isDormitory) {
      const currentPartial = (selectedRoom.partialBlocks || []).find((pb: any) => pb.date.startsWith(dateStr));
      const currentVal = currentPartial ? currentPartial.blockedBeds : 0;
      
      const actualBooked = status ? (status.bookedGuests - status.partialBlockedBeds) : 0;
      
      const res = prompt(
        `Enter number of beds to manually block on ${dateStr}.\n\n` +
        `Already booked by users: ${actualBooked}\n` +
        `Total Capacity: ${selectedRoom.maxGuests}`, 
        currentVal.toString()
      );
      if (res === null) {
        setIsUpdating(false);
        return;
      }
      
      const blockedBeds = parseInt(res, 10);
      if (isNaN(blockedBeds) || blockedBeds < 0 || blockedBeds > selectedRoom.maxGuests) {
        toast.error("Invalid number of beds.");
        setIsUpdating(false);
        return;
      }
      
      payload = { roomId: selectedRoomId, partialBlockDate: dateStr, blockedBeds };
    } else {
      payload = isBlocked
        ? { roomId: selectedRoomId, datesToUnblock: [dateStr] }
        : { roomId: selectedRoomId, datesToBlock: [dateStr] };
    }

    try {
      const res = await fetch('/api/admin/rooms/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const { room } = await res.json();
        setLocalRooms(prev => prev.map(r => r._id === room._id ? room : r));
        toast.success(isBlocked ? "Date unblocked" : "Date blocked");
      } else {
        toast.error("Failed to update date");
      }
    } catch (e) {
      toast.error("Error updating date");
    } finally {
      setIsUpdating(false);
    }
  };

  const getDayStatus = (day: number) => {
    if (!selectedRoom) return null;
    
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Pad to local date string correctly
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    
    const isManualBlock = selectedRoom.blockedDates.some((d: string) => {
      // The DB returns ISO strings like 2026-09-21T00:00:00.000Z
      return d.startsWith(dateStr);
    });
    
    let bookedGuests = 0;
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

    for (const b of bookings) {
      if (b.room === selectedRoomId || b.room?._id === selectedRoomId) {
        const checkIn = new Date(b.checkInDate);
        const checkOut = new Date(b.checkOutDate);
        checkIn.setHours(0,0,0,0);
        checkOut.setHours(0,0,0,0);
        
        if (date >= checkIn && date < checkOut) {
          const isHolding = b.paymentStatus === 'Completed' || (b.paymentStatus === 'Pending' && new Date(b.createdAt) > fifteenMinsAgo);
          if (isHolding) {
            bookedGuests += (b.guests || 1);
          }
        }
      }
    }

    let partialBlockedBeds = 0;
    if (isDormitory) {
      const pb = (selectedRoom.partialBlocks || []).find((p: any) => p.date.startsWith(dateStr));
      if (pb) {
        partialBlockedBeds = pb.blockedBeds;
        bookedGuests += pb.blockedBeds;
      }
    }

    let isFullyBooked = false;
    if (isDormitory) {
      isFullyBooked = bookedGuests >= selectedRoom.maxGuests;
    } else {
      isFullyBooked = bookedGuests > 0;
    }

    return { dateStr, isManualBlock, isFullyBooked, bookedGuests, isPast: date < new Date(new Date().setHours(0,0,0,0)), partialBlockedBeds };
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(30,42,29,0.05)] border border-bark/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <select 
            value={selectedRoomId} 
            onChange={e => setSelectedRoomId(e.target.value)}
            className="p-2 border border-bark/20 rounded-xl font-body text-sm outline-none focus:border-ink"
            disabled={isUpdating}
          >
            {localRooms.map(r => (
              <option key={r._id} value={r._id}>{r.name} (Max: {r.maxGuests})</option>
            ))}
          </select>
          {isUpdating && <Spinner className="w-5 h-5 text-ink/50" />}
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-bark/10 rounded-full transition-colors">
            &larr;
          </button>
          <h2 className="font-display font-semibold text-xl min-w-[150px] text-center">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-bark/10 rounded-full transition-colors">
            &rarr;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center font-body text-xs font-semibold uppercase tracking-wider text-ink/50 py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="p-4" />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const status = getDayStatus(day);
          
          if (!status) return null;

          let bgClass = "bg-bark/5 hover:bg-bark/10";
          let borderClass = "border-transparent";
          let textClass = "text-ink";

          if (status.isPast) {
            bgClass = "bg-bark/5 opacity-50 cursor-not-allowed";
          } else if (status.isManualBlock) {
            bgClass = "bg-red-500/10 hover:bg-red-500/20";
            textClass = "text-red-700";
            borderClass = "border-red-500/20";
          } else if (status.isFullyBooked) {
            bgClass = "bg-ink/5 hover:bg-ink/10";
            textClass = "text-ink/40 line-through";
          } else if (isDormitory && status.bookedGuests > 0) {
            bgClass = "bg-orange-500/10 hover:bg-orange-500/20";
            textClass = "text-orange-700";
            borderClass = "border-orange-500/20";
          }

          return (
            <button
              key={day}
              disabled={isUpdating || status.isPast}
              onClick={() => handleToggleBlock(status.dateStr, status)}
              className={`min-h-[80px] p-2 flex flex-col rounded-xl border ${bgClass} ${borderClass} transition-all relative overflow-hidden group text-left`}
            >
              <span className={`font-display text-lg font-medium ${textClass}`}>
                {day}
              </span>
              
              <div className="mt-auto">
                {status.isManualBlock && !isDormitory && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                    Blocked
                  </span>
                )}
                {status.isFullyBooked && (!status.isManualBlock || isDormitory) && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink/50 block">
                    Booked
                  </span>
                )}
                {isDormitory && !status.isFullyBooked && status.bookedGuests > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block">
                    {status.bookedGuests} / {selectedRoom?.maxGuests}
                    {status.partialBlockedBeds > 0 && ` (${status.partialBlockedBeds} blk)`}
                  </span>
                )}
              </div>

              {/* Hover overlay for action indication */}
              {!status.isPast && (
                <div className="absolute inset-0 bg-ink/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="bg-white/90 text-ink text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shadow-sm backdrop-blur-sm">
                    {isDormitory ? 'Edit Beds' : (status.isManualBlock ? 'Unblock' : 'Block')}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-8 flex flex-wrap gap-4 font-body text-xs text-ink/60">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/20"></div> Manually Blocked</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-ink/10"></div> Fully Booked</div>
        {isDormitory && (
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500/20 border border-orange-500/20"></div> Partially Booked (Dormitory)</div>
        )}
      </div>
    </div>
  );
}
