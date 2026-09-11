import BookingBar from './BookingBar.jsx';

// Full-width luxury hero with the availability booking bar overlaid.
export default function Hero() {
  return (
    <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2000&auto=format&fit=crop"
        alt="Grand Horizon hotel exterior at dusk"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/80" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-24 pb-10 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          Grand Horizon Hotel &amp; Suites
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
          Timeless elegance, <span className="text-gradient-gold">effortless stays</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
          Book world-class suites in minutes, enjoy personalized room service, and let our team
          craft a stay you will never forget.
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-10 sm:px-6">
        <BookingBar />
      </div>
    </section>
  );
}