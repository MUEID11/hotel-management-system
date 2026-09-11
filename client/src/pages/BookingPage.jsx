import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, Users, Search, Bell } from 'lucide-react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Field from '../components/common/Field.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Spinner from '../components/common/Spinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { fetchAvailableRooms } from '../services/roomService.js';
import { createReservation } from '../services/reservationService.js';
import { calculateNights, formatCurrency, addDaysToInput, todayInput } from '../utils/format.js';

export default function BookingPage() {
  const { isAuthenticated } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') ?? todayInput());
  const [checkOut, setCheckOut] = useState(
    searchParams.get('checkOut') ?? addDaysToInput(searchParams.get('checkIn') ?? todayInput(), 2)
  );
  const [capacity, setCapacity] = useState(Number(searchParams.get('capacity')) || 2);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  const nights = calculateNights(checkIn, checkOut);

  const runSearch = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchAvailableRooms(query, isAuthenticated);
      setRooms(results ?? []);
      setSearched(true);
    } catch (err) {
      setError(err.message ?? 'Unable to load available rooms.');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Run search on mount so available rooms are immediately visible
  useEffect(() => {
    runSearch({ checkIn, checkOut, capacity });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    runSearch({ checkIn, checkOut, capacity });
  };

  const handleBook = async (room) => {
    if (!isAuthenticated) {
      const params = new URLSearchParams({ checkIn, checkOut, capacity });
      navigate(`/login?redirect=${encodeURIComponent(`/booking?${params.toString()}`)}`);
      return;
    }
    try {
      await createReservation({
        roomId: room.room_id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
      });
      notify.success('Reservation request submitted! Awaiting Front Desk or Admin approval.');
      navigate('/my-bookings');
    } catch (err) {
      notify.error(err.message ?? 'Unable to create the reservation.');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">Reservations</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-slate-900 sm:text-4xl">
            Find your perfect room
          </h1>
          <p className="mt-2 text-slate-600">
            Enter your dates to see real-time availability across our suites.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              label="Check-in"
              name="checkIn"
              type="date"
              min={todayInput()}
              value={checkIn}
              onChange={(event) => {
                setCheckIn(event.target.value);
                if (checkOut <= event.target.value) {
                  setCheckOut(addDaysToInput(event.target.value, 1));
                }
              }}
              required
            />
            <Field
              label="Check-out"
              name="checkOut"
              type="date"
              min={addDaysToInput(checkIn, 1)}
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
              required
            />
            <Field
              label="Guests"
              name="capacity"
              as="select"
              value={capacity}
              onChange={(event) => setCapacity(Number(event.target.value))}
              options={[1, 2, 3, 4]}
            />
            <div className="flex items-end">
              <Button type="submit" loading={loading} className="w-full">
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </Button>
            </div>
          </div>
        </form>

        {error && (
          <p className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Bell className="h-4 w-4 shrink-0" aria-hidden="true" />
          {isAuthenticated ? (
            <span>You are signed in. Search above to book instantly.</span>
          ) : (
            <span>
              Sign in to search availability and book instantly.{' '}
              <Link to="/login" className="font-semibold underline">Log in</Link>{' '}
              or{' '}
              <Link to="/register" className="font-semibold underline">create an account</Link>.
            </span>
          )}
        </div>

        {loading && (
          <div className="mt-10 flex justify-center py-10">
            <Spinner label="Checking availability…" />
          </div>
        )}

        {searched && !loading && rooms.length === 0 && (
          <div className="mt-10">
            <EmptyState
              title="No rooms available"
              message="No rooms match your dates and party size. Try different dates or a smaller group."
            />
          </div>
        )}

        {searched && !loading && rooms.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
              </h2>
              <p className="text-sm text-slate-500">
                {nights} {nights === 1 ? 'night' : 'nights'}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <article
                  key={room.room_id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop"
                      alt={room.room_type_name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <Badge className="absolute left-3 top-3 border-0 bg-white/90 text-slate-800">
                      Room {room.room_number}
                    </Badge>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-semibold text-slate-900">{room.room_type_name}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-4 w-4" aria-hidden="true" />
                        Sleeps {room.capacity}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" aria-hidden="true" />
                        {nights} nights
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400">Total</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency((Number(room.price_per_night) || 0) * nights)}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleBook(room)}>
                        Book now
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}