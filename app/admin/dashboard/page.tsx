'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import BookingCard from '@/components/admin/BookingCard';

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

export default function Dashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('pending');
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, total: 0 });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  async function checkAuth() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) router.push('/admin/login');
  }

  async function fetchBookings() {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from('bookings')
      .select(`*, slots(slot_date, slot_time, session_type, duration_minutes, price)`)
      .order('created_at', { ascending: false });

    if (filter !== 'all') query = query.eq('status', filter);

    const { data } = await query;
    setBookings((data as Booking[]) || []);

    // Fetch stats
    const { data: all } = await supabase.from('bookings').select('status');
    if (all) {
      setStats({
        pending: all.filter(b => b.status === 'pending').length,
        confirmed: all.filter(b => b.status === 'confirmed').length,
        total: all.length,
      });
    }
    setLoading(false);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-sm text-amber-600 font-medium">Pending</p>
            <p className="text-3xl font-bold text-amber-700 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <p className="text-sm text-green-600 font-medium">Confirmed</p>
            <p className="text-3xl font-bold text-green-700 mt-1">{stats.confirmed}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <p className="text-sm text-slate-600 font-medium">Total</p>
            <p className="text-3xl font-bold text-slate-700 mt-1">{stats.total}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['pending','confirmed','all','cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Bookings */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No bookings found.</div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} onUpdate={fetchBookings} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
