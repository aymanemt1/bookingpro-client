import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-stone-200 text-stone-500',
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_COLORS[status] || 'bg-stone-100'}`}
    >
      {status}
    </span>
  );
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = () => {
    api.get('/my-bookings').then(({ data }) => {
      setBookings(data.data);
      setLoading(false);
    });
  };

  useEffect(fetchAll, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    await api.post(`/bookings/${id}/cancel`);
    fetchAll();
  };

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-16">Loading…</div>;

  const upcoming = bookings.filter((b) => ['pending', 'confirmed'].includes(b.status));
  const past = bookings.filter((b) => !['pending', 'confirmed'].includes(b.status));

  const card = (b) => (
    <div key={b.id} className="bg-white rounded-2xl border border-stone-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-extrabold text-lg">{b.service?.name}</p>
          <p className="text-sm text-stone-500 font-mono">#{b.booking_number}</p>
          <p className="mt-1 text-stone-600">
            📅 {b.date} · 🕐 {b.start_time} – {b.end_time}
          </p>
        </div>
        <StatusBadge status={b.status} />
      </div>
      {b.is_cancellable && (
        <button
          onClick={() => cancel(b.id)}
          className="mt-3 text-sm font-semibold text-red-600 hover:underline"
        >
          Cancel booking
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold">My bookings</h1>

      {bookings.length === 0 ? (
        <div className="mt-6 bg-white rounded-2xl border border-stone-200 p-16 text-center text-stone-500">
          No bookings yet.{' '}
          <Link to="/" className="text-amber-700 font-semibold hover:underline">
            Book a service
          </Link>
        </div>
      ) : (
        <>
          <h2 className="mt-8 font-bold text-stone-500 uppercase text-sm tracking-wide">Upcoming</h2>
          <div className="mt-3 space-y-3">
            {upcoming.length === 0 && <p className="text-stone-400 text-sm">Nothing upcoming.</p>}
            {upcoming.map(card)}
          </div>
          {past.length > 0 && (
            <>
              <h2 className="mt-8 font-bold text-stone-500 uppercase text-sm tracking-wide">Past</h2>
              <div className="mt-3 space-y-3 opacity-75">{past.map(card)}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}
