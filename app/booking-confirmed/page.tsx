export default function BookingConfirmedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Booking Received</h1>
        <p className="text-slate-500 mb-6">Your booking is pending confirmation from Dr. Saad. You will receive an email with your Zoom meeting link once confirmed.</p>
        <a href="/" className="inline-block bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-800 transition">Back to Home</a>
      </div>
    </main>
  );
}
