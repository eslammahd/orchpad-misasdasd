'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';

type Slot = {
  id: string;
  slot_date: string;
  slot_time: string;
  session_type: string;
  duration_minutes: number;
  price: number;
  is_available: boolean;
};

export default function SlotsPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    slot_date: '',
    slot_time: '09:00',
    session_type: 'Individual Therapy',
    duration_minutes: 50,
    price: 500,
  });

  useEffect(() => { checkAuth(); fetchSlots(); }, []);

  async function checkAuth() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) router.push('/admin/login');
  }

  async function fetchSlots() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('slots')
      .select('*')
      .gte('slot_date', new Date().toISOString().split('T')[0])
      .order('slot_date', { ascending: true })
      .order('slot_time', { ascending: true });
    setSlots((data as Slot[]) || []);
    setLoading(false);
  }

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase.from('slots').insert({
      ...form,
      is_available: true,
    });
    setSaving(false);
    setShowForm(false);
    setForm({ slot_date: '', slot_time: '09:00', session_type: 'Individual Therapy', duration_minutes: 50, price: 500 });
    fetchSlots();
  }

  async function toggleAvailability(slot: Slot) {
    const supabase = createClient();
    await supabase.from('slots').update({ is_available: !slot.is_available }).eq('id', slot.id);
    fetchSlots();
  }

  async function deleteSlot(id: string) {
    if (!confirm('Delete this slot?')) return;
    const supabase = createClient();
    await supabase.from('slots').delete().eq('id', id);
    fetchSlots();
  }

  const timeOptions = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Manage Slots</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            + Add Slot
          </button>
        </div>

        {showForm && (
          <form onSubmit={addSlot} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">New Time Slot</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={form.slot_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({...form, slot_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select
                  value={form.slot_time}
                  onChange={e => setForm({...form, slot_time: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                <select
                  value={form.session_type}
                  onChange={e => setForm({...form, session_type: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option>Individual Therapy</option>
                  <option>Couples Therapy</option>
                  <option>Family Therapy</option>
                  <option>Consultation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <select
                  value={form.duration_minutes}
                  onChange={e => setForm({...form, duration_minutes: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value={30}>30 min</option>
                  <option value={50}>50 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (EGP)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm({...form, price: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min={0}
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">
                {saving ? 'Saving…' : 'Save Slot'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-700 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full" />
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No upcoming slots. Add one above.</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Duration</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {slots.map(slot => (
                  <tr key={slot.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {new Date(slot.slot_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{slot.slot_time}</td>
                    <td className="px-4 py-3 text-gray-700">{slot.session_type}</td>
                    <td className="px-4 py-3 text-gray-700">{slot.duration_minutes} min</td>
                    <td className="px-4 py-3 text-gray-700">{slot.price} EGP</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        slot.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {slot.is_available ? 'Available' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleAvailability(slot)}
                          className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                        >
                          {slot.is_available ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => deleteSlot(slot.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
