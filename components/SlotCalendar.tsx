'use client';

type Slot = {
  id: string;
  slot_date: string;
  slot_time: string;
  session_type: string;
  duration_minutes: number;
  price: number;
  is_available: boolean;
};

type Props = {
  slots: Slot[];
  onSelectSlot: (slot: Slot) => void;
};

export default function SlotCalendar({ slots, onSelectSlot }: Props) {
  if (slots.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-lg">No available slots right now. Check back soon.</p>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, Slot[]> = {};
  for (const slot of slots) {
    if (!grouped[slot.slot_date]) grouped[slot.slot_date] = [];
    grouped[slot.slot_date].push(slot);
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, daySlots]) => (
        <div key={date} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-teal-50 border-b border-teal-100 px-6 py-3">
            <h3 className="font-semibold text-teal-800">
              {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {daySlots.map(slot => (
              <button
                key={slot.id}
                onClick={() => onSelectSlot(slot)}
                className="border border-teal-200 hover:border-teal-500 hover:bg-teal-50 rounded-xl p-4 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-teal-700">{slot.slot_time}</span>
                  <span className="text-sm font-semibold text-gray-700">{slot.price} EGP</span>
                </div>
                <p className="text-sm text-gray-600">{slot.session_type}</p>
                <p className="text-xs text-gray-400 mt-1">{slot.duration_minutes} min</p>
                <div className="mt-3 text-xs font-medium text-teal-600 group-hover:text-teal-700">Tap to book →</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
