'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Slot = {
  id: string;
  slot_date: string;
  slot_time: string;
  session_type: string;
  duration_minutes: number;
  price: number;
};

type Props = {
  slot: Slot;
  onClose: () => void;
  onSuccess: () => void;
};

type Step = 'details' | 'payment' | 'success';

export default function BookingModal({ slot, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('details');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [payment, setPayment] = useState({ method: 'vodafone_cash', reference: '' });
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateDetails() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email = 'Valid email required';
    if (!form.phone.match(/^[0-9+\s-]{10,15}$/)) e.phone = 'Valid phone number required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validateDetails()) return;
    setStep('payment');
  }

  async function handlePayment() {
    if (!payment.reference.trim()) {
      setErrors({ reference: 'Please enter your payment reference number' });
      return;
    }
    setLoading(true);
    setErrors({});
    const supabase = createClient();

    // Mark slot unavailable
    await supabase.from('slots').update({ is_available: false }).eq('id', slot.id);

    // Create booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        slot_id: slot.id,
        patient_name: form.name,
        patient_email: form.email,
        patient_phone: form.phone,
        payment_method: payment.method,
        payment_reference: payment.reference,
        status: 'pending',
      })
      .select()
      .single();

    if (error || !booking) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
      setLoading(false);
      return;
    }

    // Create payment record
    await supabase.from('payments').insert({
      booking_id: booking.id,
      amount: slot.price,
      payment_method: payment.method,
      transaction_reference: payment.reference,
      status: 'pending',
    });

    setBookingId(booking.id);
    setLoading(false);
    setStep('success');
  }

  const slotLabel = `${new Date(slot.slot_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} at ${slot.slot_time}`;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {step === 'details' && 'Your Details'}
              {step === 'payment' && 'Payment'}
              {step === 'success' && 'Booking Confirmed!'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{slotLabel} · {slot.session_type}</p>
          </div>
          {step !== 'success' && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          )}
        </div>

        <div className="p-6">
          {/* Step 1: Patient Details */}
          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  placeholder="Your full name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  placeholder="01xxxxxxxxx"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div className="bg-teal-50 rounded-xl p-4 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Session</span>
                  <span className="font-medium text-gray-900">{slot.session_type}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-900">{slot.duration_minutes} min</span>
                </div>
                <div className="flex justify-between text-sm mt-1 pt-2 border-t border-teal-100">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-teal-700 text-lg">{slot.price} EGP</span>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'vodafone_cash', label: '📱 Vodafone Cash' },
                    { value: 'instapay', label: '💳 InstaPay' },
                  ].map(m => (
                    <button
                      key={m.value}
                      onClick={() => setPayment({...payment, method: m.value})}
                      className={`border-2 rounded-xl p-4 text-sm font-medium transition-all ${
                        payment.method === m.value
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-600 hover:border-teal-300'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                {payment.method === 'vodafone_cash' ? (
                  <>
                    <p className="font-semibold text-amber-800 mb-1">📱 Vodafone Cash Instructions</p>
                    <p className="text-amber-700">Send <strong>{slot.price} EGP</strong> to:</p>
                    <p className="font-mono font-bold text-amber-900 text-lg mt-1">010-XXXX-XXXX</p>
                    <p className="text-amber-600 text-xs mt-2">(Dr. Saad will update this with his real number)</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-amber-800 mb-1">💳 InstaPay Instructions</p>
                    <p className="text-amber-700">Transfer <strong>{slot.price} EGP</strong> to:</p>
                    <p className="font-mono font-bold text-amber-900 text-lg mt-1">dr.saad@instapay</p>
                    <p className="text-amber-600 text-xs mt-2">(Dr. Saad will update this with his real address)</p>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference Number</label>
                <input
                  type="text"
                  value={payment.reference}
                  onChange={e => setPayment({...payment, reference: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  placeholder="Enter the transaction reference"
                />
                {errors.reference && <p className="text-red-500 text-xs mt-1">{errors.reference}</p>}
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{errors.submit}</div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('details')} className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {loading ? 'Submitting…' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Submitted!</h3>
              <p className="text-gray-600 mb-4">
                Thank you, <strong>{form.name}</strong>! Dr. Saad will review your booking and confirm your session.
              </p>
              <div className="bg-teal-50 rounded-xl p-4 text-sm text-left mb-6 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Session</span>
                  <span className="font-medium">{slotLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium">{slot.session_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium capitalize">{payment.method.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-mono text-xs">{payment.reference}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">You'll receive a Zoom meeting link at <strong>{form.email}</strong> once confirmed.</p>
              <button
                onClick={onSuccess}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
