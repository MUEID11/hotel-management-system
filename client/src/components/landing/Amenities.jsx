import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Sparkles, Wifi, Coffee, Car, Dumbbell } from 'lucide-react';
import Button from '../common/Button.jsx';

const AMENITIES = [
  { icon: Wifi, title: 'Complimentary Wi-Fi', description: 'High-speed fiber internet throughout the property.' },
  { icon: Coffee, title: 'Restaurant & Room Service', description: 'Gourmet dining delivered to your door, 24/7.' },
  { icon: Car, title: 'Valet Parking', description: 'Secure, climate-controlled parking with concierge valet.' },
  { icon: Dumbbell, title: 'Wellness & Fitness', description: 'Modern gym, spa, and rooftop infinity pool.' },
];

export default function Amenities() {
  const navigate = useNavigate();

  return (
    <section id="amenities" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 scroll-mt-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">The Grand Experience</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
            Thoughtful hospitality, down to every last detail
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600">
            From the moment you arrive, every service is orchestrated to make your stay effortless.
            Book online in seconds, enjoy personalized room service, and check out without a line.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {AMENITIES.map((amenity) => (
              <div key={amenity.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <amenity.icon className="h-6 w-6 text-amber-500" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{amenity.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{amenity.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Button variant="dark" size="lg" onClick={() => navigate('/booking')}>
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              Reserve your room
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop"
              alt="Grand Horizon hotel lobby lounge with warm lighting"
              className="h-[420px] w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-slate-900 px-6 py-5 shadow-xl sm:block">
            <p className="font-serif text-3xl font-semibold text-amber-400">4.9</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-300">
              <Sparkles className="h-4 w-4 text-amber-400" aria-hidden="true" />
              2,300+ five-star reviews
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}