"use client";

import { useState } from "react";

export default function BookingsTable({ data, emptyMessage }: { data: any[], emptyMessage: string }) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-body text-sm">
          <thead>
            <tr className="border-b border-bark/10 text-ink/50 uppercase tracking-wider text-[11px]">
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Room</th>
              <th className="pb-3 font-medium">Dates</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bark/5">
            {data.map((booking: any) => (
              <tr key={booking._id.toString()}>
                <td className="py-4">
                  <p className="font-medium text-ink">{booking.customerName}</p>
                  <p className="text-ink/50 text-[12px]">{booking.customerEmail}</p>
                  <p className="text-ink/50 text-[12px]">{booking.customerPhone}</p>
                </td>
                <td className="py-4 text-ink/80">{booking.room?.name || "Unknown"}</td>
                <td className="py-4 text-ink/80">
                  {new Date(booking.checkInDate).toLocaleDateString('en-GB')} - 
                  {new Date(booking.checkOutDate).toLocaleDateString('en-GB')}
                </td>
                <td className="py-4 font-medium">₹{booking.totalAmount?.toLocaleString() ?? "N/A"}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                    booking.paymentStatus === 'Completed' 
                      ? 'bg-sage/10 text-sage' 
                      : 'bg-husk/10 text-husk'
                  }`}>
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="py-4">
                  <button 
                    onClick={() => setSelectedBooking(booking)}
                    className="p-1.5 text-ink/50 hover:text-ink hover:bg-bark/5 rounded-md transition-colors"
                    title="View Details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-ink/50">{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 p-2 text-ink/50 hover:text-ink hover:bg-bark/5 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
            
            <h2 className="font-display text-2xl font-semibold text-ink mb-6">Booking Details</h2>
            
            <div className="space-y-5 font-body text-sm text-ink/80">
              <div className="grid grid-cols-2 gap-4 border-b border-bark/10 pb-5">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink/50 font-medium mb-1">Customer</p>
                  <p className="font-medium text-ink">{selectedBooking.customerName}</p>
                  <p>{selectedBooking.customerEmail}</p>
                  <p>{selectedBooking.customerPhone}</p>
                  <p className="mt-2 text-ink/70"><strong>Guests:</strong> {selectedBooking.guests || 1}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink/50 font-medium mb-1">Room</p>
                  <p className="font-medium text-ink">{selectedBooking.room?.name || "Unknown"}</p>
                  <p className="capitalize">Status: {selectedBooking.bookingStatus}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-bark/10 pb-5">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink/50 font-medium mb-1">Check-in</p>
                  <p className="font-medium">{new Date(selectedBooking.checkInDate).toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink/50 font-medium mb-1">Check-out</p>
                  <p className="font-medium">{new Date(selectedBooking.checkOutDate).toLocaleDateString('en-GB')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink/50 font-medium mb-1">Payment Status</p>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium inline-block mt-1 ${
                    selectedBooking.paymentStatus === 'Completed' 
                      ? 'bg-sage/10 text-sage' 
                      : 'bg-husk/10 text-husk'
                  }`}>
                    {selectedBooking.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink/50 font-medium mb-1">Total Amount</p>
                  <p className="font-medium text-lg text-ink">₹{selectedBooking.totalAmount?.toLocaleString() ?? "N/A"}</p>
                </div>
              </div>
              
              {(selectedBooking.razorpayOrderId || selectedBooking.razorpayPaymentId) && (
                <div className="pt-4 mt-2 border-t border-bark/10">
                  <p className="text-[11px] uppercase tracking-wider text-ink/50 font-medium mb-2">Transaction Details</p>
                  {selectedBooking.razorpayOrderId && (
                    <p className="text-xs font-mono mb-1"><span className="text-ink/50 mr-2">Order ID:</span> {selectedBooking.razorpayOrderId}</p>
                  )}
                  {selectedBooking.razorpayPaymentId && (
                    <p className="text-xs font-mono"><span className="text-ink/50 mr-2">Payment ID:</span> {selectedBooking.razorpayPaymentId}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
