'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  bookingId: string;
  amount: number;
  onPaid: () => void;
}

type Method = 'vodafone_cash' | 'instapay';

const VODAFONE_NUMBER = '01xxxxxxxxx'; // Placeholder — to be set by Dr. Saad
const INSTAPAY_ADDRESS = 'drsaad@instapay'; // Placeholder — to be set by Dr. Saad

export default function PaymentForm({ bookingId, amount, onPaid }: Props) {
  const [method, setMethod] = useState<Method>('vodafone_cash');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reference.trim()) { setError('Please enter your payment reference number.'); return; }
    setSubmitting(true);
    setError('');

    const { error: err } = await supabase.from('payments').insert({
      booking_id: bookingId,
      method,
      amount_egp: amount,
      status: 'processing',
      reference_number: reference.trim(),
    });

    if (err) { setError('Could not save payment. Please try again.'); setSubmitting(false); return; }
    onPaid();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-medium text-slate-700 mb-3">Select Payment Method</p>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setMethod('vodafone_cash')} className={`border-2 rounded-xl p-4 text-center transition ${ method === 'vodafone_cash' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300' }`}>
            <div className="text-2xl mb-1">📱</div>
            <div className={`font-semibold text-sm ${ method === 'vodafone_cash' ? 'text-red-700' : 'text-slate-600' }`}>Vodafone Cash</div>
          </button>
          <button type="button" onClick={() => setMethod('instapay')} className={`border-2 rounded-xl p-4 text-center transition ${ method === 'instapay' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300' }`}>
            <div className="text-2xl mb-1">💳</div>
            <div className={`font-semibold text-sm ${ method === 'instapay' ? 'text-blue-700' : 'text-slate-600' }`}>InstaPay</div>
          </button>
        </div>
      </div>

      <div className={`rounded-xl p-4 text-sm ${ method === 'vodafone_cash' ? 'bg-red-50 border border-red-100' : 'bg-blue-50 border border-blue-100' }`}>
        {method === 'vodafone_cash' ? (
          <>
            <p className="font-semibold text-red-800 mb-2">📱 Vodafone Cash Instructions</p>
            <ol className="text-red-700 space-y-1 list-decimal list-inside">
              <li>Open your Vodafone Cash app</li>
              <li>Send <strong>{amount} EGP</strong> to number: <strong className="text-red-900">{VODAFONE_NUMBER}</strong></li>
              <li>Copy the transaction reference number</li>
              <li>Paste it below and submit</li>
            </ol>
          </>
        ) : (
          <>
            <p className="font-semibold text-blue-800 mb-2">💳 InstaPay Instructions</p>
            <ol className="text-blue-700 space-y-1 list-decimal list-inside">
              <li>Open your banking or InstaPay app</li>
              <li>Send <strong>{amount} EGP</strong> to: <strong className="text-blue-900">{INSTAPAY_ADDRESS}</strong></li>
              <li>Copy the transaction reference number</li>
              <li>Paste it below and submit</li>
            </ol>
          </>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Reference Number *</label>
        <input
          type="text"
          value={reference}
          onChange={e => setReference(e.target.value)}
          placeholder="e.g. VF-12345678 or IP-87654321"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-slate-400 mt-1">This is used to verify your payment before Dr. Saad confirms the session.</p>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{error}</p>}

      <button type="submit" disabled={submitting} className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition">
        {submitting ? 'Submitting...' : `Confirm Payment of ${amount} EGP →`}
      </button>
    </form>
  );
}
