import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import Button from '../common/Button.jsx';
import Badge from '../common/Badge.jsx';
import { formatCurrency, safeJsonParse } from '../../utils/format.js';

export default function RoomCard({ roomType }) {
  const navigate = useNavigate();

  const id = roomType?.id ?? roomType?.room_type_id;
  const name = roomType?.name ?? 'Deluxe Suite';
  const description = roomType?.description ?? '';
  const basePrice = roomType?.basePrice ?? roomType?.base_price ?? 0;
  const capacity = roomType?.capacity ?? 2;
  const image =
    roomType?.imageUrl ??
    roomType?.image_url ??
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop';

  const rawAmenities = roomType?.amenities;
  let amenitiesList = [];
  if (Array.isArray(rawAmenities)) {
    amenitiesList = rawAmenities;
  } else if (typeof rawAmenities === 'string' && rawAmenities.trim().startsWith('[')) {
    amenitiesList = safeJsonParse(rawAmenities, []);
  } else if (typeof rawAmenities === 'string') {
    amenitiesList = rawAmenities.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl">
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <Badge className="absolute left-4 top-4 border-0 bg-white/90 text-slate-800 shadow">
          From {formatCurrency(basePrice)} / night
        </Badge>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-serif text-lg font-semibold text-slate-900">{name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-amber-600">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
              Guest favourite
            </p>
          </div>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            Sleeps {capacity}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{description}</p>

        {amenitiesList?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {amenitiesList.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">From</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(basePrice)}</p>
          </div>
          <Button variant="dark" size="sm" onClick={() => navigate(`/booking?type=${id}`)}>
            Book now
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}