import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-amber-400">
                GH
              </span>
              <span className="font-serif text-lg font-semibold text-white">Grand Horizon</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Where timeless elegance meets modern comfort. Reserve the perfect room, enjoy
              personalized service, and trust our team to make every stay effortless.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/70 text-slate-400 transition-colors hover:bg-amber-500 hover:text-white"
                  aria-label="Social media link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Explore</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/" className="transition-colors hover:text-amber-400">Home</Link></li>
              <li><Link to="/booking" className="transition-colors hover:text-amber-400">Book a Stay</Link></li>
              <li><Link to="/my-bookings" className="transition-colors hover:text-amber-400">My Bookings</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                1 Grand Horizon Boulevard, City Center
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-amber-400" />
                +1 (555) 010-2020
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-amber-400" />
                reservations@grandhorizon.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800/80 pt-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Grand Horizon Hotel &amp; Suites. All rights reserved.
        </div>
      </div>
    </footer>
  );
}