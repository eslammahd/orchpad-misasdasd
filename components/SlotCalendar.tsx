'use client';

import { useEffect, useState } from 'react';
import { supabase, type Slot } from '@/lib/supabase';
import BookingModal from '@/components/BookingModal';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

export default function SlotCalendar() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [groupedSlots, setGroupedSlots] = useState<Record<string, Slot[]>>({});

  useEffect(() => {
    async function fetchSlots() {
      const { data, error } = await supabase
        .from('slots')
        .select('*')
        .eq('is_available', true)
        .gte('slot_date', new Date().toISOString().split('T')[0])
        .order('slot_date', { ascending: true })
        .order('slot_time', { ascending: true });

      if (!error && data) {
        setSlots(data);
        const grouped: Record<string, Slot[]> = {};
        data.forEach((slot) => {
          if (!grouped[slot.slot_date]) grouped[slot.slot_date] = [];
          grouped[slot.slot_date].push(slot);
        });
        setGroupedSlots(grouped);
      }
      setLoading(false);
    }
    fetchSlots();
  }, []);

  return (
    <section id="book" className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Available Sessions</h2>
        <p className="text-slate-500 text-lg">Pick a time that works for you. Sessions are 60 minutes via Zoom.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : Object.keys(groupedSlots).length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-xl">No available slots at the moment.</p>
          <p className="mt-2">Please check back soon.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSlots).map(([date, daySlots]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
                {formatDate(date)}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {daySlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className="bg-white border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-50 rounded-xl p-4 text-center transition group"
                  >
                    <div className="text-blue-700 font-bold text-lg group-hover:text-blue-900">{formatTime(slot.slot_time)}</div>
                    <div className="text-slate-400 text-xs mt-1">{slot.duration_minutes} min</div>
                    <div className="text-green-600 font-semibold text-sm mt-2">{slot.price_egp} EGP</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onBooked={() => {
            setSelectedSlot(null);
            setSlots((prev) => prev.filter((s) => s.id !== selectedSlot.id));
            setGroupedSlots((prev) => {
              const updated = { ...prev };
              const date = selectedSlot.slot_date;
              if (updated[date]) {
                updated[date] = updated[date].filter((s) => s.id !== selectedSlot.id);
                if (updated[date].length === 0) delete updated[date];
              }
              return updated;
            });
          }}
        />
      )}
    </section>
  );
}
