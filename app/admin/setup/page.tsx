'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SetupPage() {
  const [email, setEmail] = useState('dr.saad@therapy.com');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setMessage('Passwords do not match.'); setStatus('error'); return; }
    if (password.length < 8) { setMessage('Password must be at least 8 characters.'); setStatus('error'); return; }
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
      setStatus('error');
    } else {
      setMessage('Account created! You can now sign in at /admin/login.');
      setStatus('success');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">First-Time Setup</h1>
        <p className="text-gray-500 text-sm mb-6">Create Dr. Saad's admin account. This page should be used once only.</p>

        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500" required minLength={8} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500" required minLength={8} />
          </div>

          {message && (
            <div className={`rounded-xl px-4 py-3 text-sm ${
              status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>{message}</div>
          )}

          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
