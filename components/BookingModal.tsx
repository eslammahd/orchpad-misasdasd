'use client';

import { useState } from 'react';
import { supabase, type Slot } from '@/lib/supabase';
import PaymentForm from '@/components/PaymentForm';

interface Props {
  slot: Slot;
  onClose: () => void;
  onBooked: () => void;
}

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

type Step = 'details' | 'payment' | 'confirmation';

export default function BookingModal({ slot, onClose, onBooked }: Props) {
  const [step, setStep] = useState<Step>('details');
  const [bookingId, setBookingId] = useState<string>('');
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.full_name.trim()) errs.full_name = 'Name is required';
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.phone.trim() || !/^[0-9+\-\s]{10,15}$/.test(form.phone)) errs.phone = 'Valid phone required';
    return errs;
  }

  async function handleSubmitDetails(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);

    // Create patient
    const { data: patient, error: pErr } = await supabase
      .from('patients')
      .insert({ full_name: form.full_name, email: form.email, phone: form.phone, notes: form.notes || null })
      .select()
      .single();

    if (pErr || !patient) { setSubmitting(false); setErrors({ submit: 'Something went wrong. Please try again.' }); return; }

    // Create booking
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .insert({ patient_id: patient.id, slot_id: slot.id, status: 'pending' })
      .select()
      .single();

    if (bErr || !booking) { setSubmitting(false); setErrors({ submit: 'This slot may have just been taken. Please go back and choose another.' }); return; }

    // Mark slot unavailable
    await supabase.from('slots').update({ is_available: false }).eq('id', slot.id);

    setBookingId(booking.id);
    setSubmitting(false);
    setStep('payment');
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white px-6 py-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-blue-200 text-sm font-medium mb-1">Booking Session with Dr. Saad</div>
              <div className="text-xl font-bold">{formatDate(slot.slot_date)}</div>
              <div className="text-blue-100 mt-1">{formatTime(slot.slot_time)} · {slot.duration_minutes} min · {slot.price_egp} EGP</div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
          </div>
          {/* Steps */}
          <div className="flex items-center gap-2 mt-4 text-xs">
            {(['details', 'payment', 'confirmation'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step === s ? 'bg-white text-blue-800' : i < (['details','payment','confirmation'] as Step[]).indexOf(step) ? 'bg-blue-400 text-white' : 'bg-white/20 text-white/60'}`}>{i+1}</div>
                <span className={step === s ? 'text-white' : 'text-white/60'}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                {i < 2 && <span className="text-white/30">›</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-6">
          {step === 'details' && (
            <form onSubmit={handleSubmitDetails} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input type="text" value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} placeholder="Your full name" className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.full_name ? 'border-red-400' : 'border-slate-200'}`} />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="you@example.com" className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-400' : 'border-slate-200'}`} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="01xxxxxxxxx" className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-400' : 'border-slate-200'}`} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Any specific concerns or notes for Dr. Saad..." rows={3} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              {errors.submit && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{errors.submit}</p>}
              <button type="submit" disabled={submitting} className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition">
                {submitting ? 'Saving...' : 'Continue to Payment →'}
              </button>
            </form>
          )}

          {step === 'payment' && (
            <PaymentForm
              bookingId={bookingId}
              amount={slot.price_egp}
              onPaid={() => setStep('confirmation')}
            />
          )}

          {step === 'confirmation' && (
            <div className="text-center py-6">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Booking Received!</h3>
              <p className="text-slate-500 mb-4">Thank you, <strong>{form.full_name}</strong>. Your booking is pending confirmation from Dr. Saad.</p>
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 mb-6">
                <p>📧 You will receive an email at <strong>{form.email}</strong> once Dr. Saad confirms your session.</p>
                <p className="mt-2">Your Zoom meeting link will be included in the confirmation email.</p>
              </div>
              <button onClick={() => { onBooked(); }} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
