'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Booking = {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  status: string;
  payment_method: string;
  payment_reference: string;
  zoom_link: string | null;
  notes: string | null;
  created_at: string;
  slots: {
    slot_date: string;
    slot_time: string;
    session_type: string;
    duration_minutes: number;
    price: number;
  } | null;
};

export default function BookingCard({ booking, onUpdate }: { booking: Booking; onUpdate: () => void }) {
  const [zoomLink, setZoomLink] = useState(booking.zoom_link || '');
  const [showZoomInput, setShowZoomInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  async function updateStatus(status: string, zoom?: string) {
    setActionLoading(true);
    const supabase = createClient();
    const update: Record<string, string> = { status };
    if (zoom) update.zoom_link = zoom;
    await supabase.from('bookings').update(update).eq('id', booking.id);
    // Mark slot as unavailable if confirmed
    if (status === 'confirmed' && booking.slots) {
      await supabase.from('slots').update({ is_available: false }).eq('slot_date', booking.slots.slot_date).eq('slot_time', booking.slots.slot_time);
    }
    setActionLoading(false);
    setShowZoomInput(false);
    onUpdate();
  }

  async function handleConfirm() {
    if (!zoomLink) {
      setShowZoomInput(true);
      return;
    }
    await updateStatus('confirmed', zoomLink);
  }

  return (
    <div className={`bg-white border rounded-2xl p-6 ${
      booking.status === 'pending' ? 'border-amber-200' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-bold text-gray-900 text-lg">{booking.patient_name}</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${statusColors[booking.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
              {booking.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {booking.slots && (
              <>
                <div className="text-gray-500">Session</div>
                <div className="text-gray-900 font-medium">
                  {new Date(booking.slots.slot_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} at {booking.slots.slot_time}
                </div>
                <div className="text-gray-500">Type</div>
                <div className="text-gray-900">{booking.slots.session_type}</div>
                <div className="text-gray-500">Duration</div>
                <div className="text-gray-900">{booking.slots.duration_minutes} min</div>
                <div className="text-gray-500">Price</div>
                <div className="text-gray-900 font-medium">{booking.slots.price} EGP</div>
              </>
            )}
            <div className="text-gray-500">Email</div>
            <div className="text-gray-900">{booking.patient_email}</div>
            <div className="text-gray-500">Phone</div>
            <div className="text-gray-900">{booking.patient_phone}</div>
            <div className="text-gray-500">Payment</div>
            <div className="text-gray-900 capitalize">{booking.payment_method}</div>
            <div className="text-gray-500">Reference</div>
            <div className="text-gray-900 font-mono text-xs">{booking.payment_reference || '—'}</div>
            {booking.zoom_link && (
              <>
                <div className="text-gray-500">Zoom Link</div>
                <a href={booking.zoom_link} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline truncate">{booking.zoom_link}</a>
              </>
            )}
          </div>

          {showZoomInput && (
            <div className="mt-4 flex gap-2">
              <input
                type="url"
                value={zoomLink}
                onChange={e => setZoomLink(e.target.value)}
                placeholder="Paste Zoom meeting link…"
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={() => updateStatus('confirmed', zoomLink)}
                disabled={!zoomLink || actionLoading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Confirm
              </button>
            </div>
          )}
        </div>

        {booking.status === 'pending' && !showZoomInput && (
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={handleConfirm}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              ✓ Confirm
            </button>
            <button
              onClick={() => updateStatus('cancelled')}
              disabled={actionLoading}
              className="bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              ✕ Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
