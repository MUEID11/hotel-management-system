import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Amara Okafor',
    trip: 'Executive Suite · 4 nights',
    quote:
      'Booked online in under a minute, and the front desk greeted me by name. Room service arrived in 20 minutes — flawless.',
  },
  {
    name: 'Daniel Whitmore',
    trip: 'Deluxe King · 2 nights',
    quote:
      'The digital check-in made our city break effortless. Panoramic views and a bed that made us want to stay all day.',
  },
  {
    name: 'Sofia Marchetti',
    trip: 'Presidential Suite · 1 week',
    quote:
      'Impeccable service across the board. Every request — from extra pillows to car service — was handled with a smile.',
  },
];

export default function Testimonials() {
  return (
    <section id="reviews" className="bg-slate-950 py-20 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Guest Stories</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">
            Loved by travelers worldwide
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <Quote className="h-8 w-8 text-amber-500/60" aria-hidden="true" />
              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-slate-300">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">
                  {testimonial.name.split(' ').map((part) => part[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                  <p className="text-xs text-slate-400">{testimonial.trip}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}