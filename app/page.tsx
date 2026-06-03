'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import SlotCalendar from '@/components/SlotCalendar';
import BookingModal from '@/components/BookingModal';

type Slot = {
  id: string;
  slot_date: string;
  slot_time: string;
  session_type: string;
  duration_minutes: number;
  price: number;
  is_available: boolean;
};

export default function Home() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    setLoading(true);
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('slots')
      .select('*')
      .eq('is_available', true)
      .gte('slot_date', today)
      .order('slot_date', { ascending: true })
      .order('slot_time', { ascending: true });
    setSlots((data as Slot[]) || []);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-teal-700 to-teal-600 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Dr. Saad Therapy</h1>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto">
            Professional online therapy sessions. Book a slot, pay securely, and join your session from anywhere.
          </p>
          <a href="#slots" className="mt-8 inline-block bg-white text-teal-700 font-semibold px-8 py-3 rounded-full hover:bg-teal-50 transition-colors">
            Book a Session
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '📅', title: 'Choose Your Time', desc: 'Browse available slots and pick what works for you' },
            { icon: '💳', title: 'Pay Securely', desc: 'Pay via Vodafone Cash or InstaPay — quick and easy' },
            { icon: '🎥', title: 'Join Online', desc: 'Receive a Zoom link after Dr. Saad confirms your session' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Slots */}
      <section id="slots" className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Available Sessions</h2>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-10 w-10 border-4 border-teal-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <SlotCalendar slots={slots} onSelectSlot={setSelectedSlot} />
        )}
      </section>

      {selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onSuccess={() => { setSelectedSlot(null); fetchSlots(); }}
        />
      )}
    </main>
  );
}
