import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Field from '../common/Field.jsx';
import Button from '../common/Button.jsx';
import { todayInput, addDaysToInput } from '../../utils/format.js';

// Public availability search bar rendered above the fold on the landing page.
export default function BookingBar() {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(todayInput());
  const [checkOut, setCheckOut] = useState(addDaysToInput(todayInput(), 2));
  const [capacity, setCapacity] = useState(2);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({ checkIn, checkOut, capacity });
    navigate(`/booking?${params.toString()}`);
  };

  return (
    <form
      id="availability-bar"
      onSubmit={handleSearch}
      className="glassmorphism mx-auto grid w-full max-w-4xl gap-4 rounded-2xl p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
    >
      <Field
        label="Check-in"
        name="checkIn"
        type="date"
        min={todayInput()}
        value={checkIn}
        onChange={(event) => {
          setCheckIn(event.target.value);
          const next = new Date(`${event.target.value}T00:00:00`);
          if (!checkOut || next >= new Date(`${checkOut}T00:00:00`)) {
            setCheckOut(addDaysToInput(event.target.value, 1));
          }
        }}
        required
      />
      <Field
        label="Check-out"
        name="checkOut"
        type="date"
        min={checkIn ? addDaysToInput(checkIn, 1) : todayInput()}
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
      >
        {[1, 2, 3, 4].map((count) => (
          <option key={count} value={count}>
            {count} {count === 1 ? 'Guest' : 'Guests'}
          </option>
        ))}
      </Field>
      <div className="flex items-end">
        <Button type="submit" size="lg" className="w-full">
          <Search className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">Check availability</span>
        </Button>
      </div>
    </form>
  );
}