import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import RoomCard from './RoomCard.jsx';
import Skeleton from '../common/Skeleton.jsx';
import { fetchRoomTypes } from '../../services/roomService.js';

export default function RoomShowcase() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchRoomTypes()
      .then((data) => {
        if (!cancelled) setRoomTypes(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setRoomTypes([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="rooms" className="bg-slate-50 py-20 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">Suites &amp; Rooms</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-slate-900 sm:text-4xl">
              Accommodations for every journey
            </h2>
          </div>
          <Link
            to="/booking"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700"
          >
            Explore all rooms
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <Skeleton className="h-56 rounded-xl" />
                  <Skeleton className="mt-4 h-6 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-4/5" />
                </div>
              ))
            : roomTypes.slice(0, 6).map((roomType, index) => (
                <RoomCard key={roomType.id ?? roomType.room_type_id ?? index} roomType={roomType} />
              ))}
        </div>
      </div>
    </section>
  );
}