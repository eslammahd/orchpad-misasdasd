export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6 text-4xl">
          🧠
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          Dr. Saad<br />
          <span className="text-blue-200">Online Therapy Sessions</span>
        </h1>
        <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
          A safe, private, and professional space for your mental health journey.
          Book a session, pay online, and join your call — all in one place.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
            <span>✅</span> Private & Confidential
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
            <span>💳</span> Pay via Vodafone Cash or InstaPay
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
            <span>🎥</span> Online via Zoom
          </div>
        </div>
        <a href="#book" className="inline-block mt-10 bg-white text-blue-900 font-semibold px-8 py-3 rounded-full text-lg hover:bg-blue-50 transition">
          Book Your Session
        </a>
      </div>
    </section>
  );
}
