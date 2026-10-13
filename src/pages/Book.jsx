import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

function nextDays(n = 14) {
  const days = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const dt = new Date(d);
    dt.setDate(d.getDate() + i);
    days.push(dt);
  }
  return days;
}

// Local calendar date. toISOString() is UTC, so evening in the Americas
// (and early morning ahead of UTC) would book the neighboring day.
const toISODate = (d) => {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Book() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [date, setDate] = useState(toISODate(new Date()));
  const [slots, setSlots] = useState([]);
  const [open, setOpen] = useState(true);
  const [slot, setSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);

  const days = useMemo(() => nextDays(14), []);

  useEffect(() => {
    api
      .get(`/services/${slug}`)
      .then(({ data }) => {
        setService(data.data);
        if (user) setForm((f) => ({ ...f, customer_name: user.name }));
      })
      .catch(() => navigate('/', { replace: true }));
  }, [slug, navigate, user]);

  useEffect(() => {
    if (!service) return;
    setLoadingSlots(true);
    setSlot(null);
    api
      .get(`/services/${service.id}/availability`, { params: { date } })
      .then(({ data }) => {
        setSlots(data.slots);
        setOpen(data.open);
      })
      .finally(() => setLoadingSlots(false));
  }, [service, date]);

  const submit = async (e) => {
    e.preventDefault();
    if (!slot) return;
    setBooking(true);
    setErrors({});
    setError('');
    try {
      const { data } = await api.post('/bookings', {
        service_id: service.id,
        date,
        start_time: slot.start,
        ...form,
      });
      navigate(`/booking-success/${data.data.booking_number}`);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        if (err.response.data.message) setError(err.response.data.message);
      } else {
        setError('Booking failed. Please try again.');
      }
    } finally {
      setBooking(false);
    }
  };

  if (!service) return <div className="max-w-5xl mx-auto px-4 py-16">Loading…</div>;

  const field = (key, label, props = {}) => (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="mt-1 w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
        {...props}
      />
      {errors[key] && <p className="mt-1 text-sm text-red-600">{errors[key][0]}</p>}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-amber-700 hover:underline">
        ← All services
      </Link>

      <div className="mt-4 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">{service.name}</h1>
            <p className="mt-1 text-stone-500">{service.description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold">${Number(service.price).toFixed(2)}</p>
            <p className="text-sm text-stone-500">⏱ {service.duration_label}</p>
          </div>
        </div>

        {/* Step 1: date */}
        <h2 className="mt-8 font-extrabold text-lg">
          <span className="inline-flex w-7 h-7 rounded-full bg-amber-600 text-white text-sm items-center justify-center mr-2">1</span>
          Pick a day
        </h2>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {days.map((d) => {
            const iso = toISODate(d);
            const active = iso === date;
            const isSunday = d.getDay() === 0;
            return (
              <button
                key={iso}
                onClick={() => setDate(iso)}
                className={`shrink-0 w-16 py-2.5 rounded-xl border-2 text-center transition ${
                  active
                    ? 'border-amber-600 bg-amber-50'
                    : 'border-stone-200 hover:border-amber-300'
                } ${isSunday ? 'opacity-40' : ''}`}
              >
                <p className="text-xs font-semibold text-stone-500">{DAY_NAMES[d.getDay()]}</p>
                <p className="text-lg font-extrabold">{d.getDate()}</p>
                <p className="text-xs text-stone-400">{MONTHS[d.getMonth()]}</p>
              </button>
            );
          })}
        </div>

        {/* Step 2: slot */}
        <h2 className="mt-8 font-extrabold text-lg">
          <span className="inline-flex w-7 h-7 rounded-full bg-amber-600 text-white text-sm items-center justify-center mr-2">2</span>
          Pick a time
        </h2>
        {loadingSlots ? (
          <p className="mt-3 text-stone-500">Loading slots…</p>
        ) : !open ? (
          <p className="mt-3 text-stone-500 bg-stone-100 rounded-xl p-4">
            We're closed on Sundays — please pick another day.
          </p>
        ) : slots.filter((s) => s.available).length === 0 ? (
          <p className="mt-3 text-stone-500 bg-stone-100 rounded-xl p-4">
            Fully booked on this day — try another date.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {slots.map((s) => (
              <button
                key={s.start}
                disabled={!s.available}
                onClick={() => setSlot(s)}
                className={`py-2.5 rounded-xl border-2 text-sm font-bold transition ${
                  !s.available
                    ? 'border-stone-100 text-stone-300 line-through cursor-not-allowed'
                    : slot?.start === s.start
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-stone-200 hover:border-amber-400'
                }`}
              >
                {s.start}
              </button>
            ))}
          </div>
        )}

        {/* Step 3: details */}
        {slot && (
          <form onSubmit={submit} className="mt-8">
            <h2 className="font-extrabold text-lg">
              <span className="inline-flex w-7 h-7 rounded-full bg-amber-600 text-white text-sm items-center justify-center mr-2">3</span>
              Your details
            </h2>
            {error && <p className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            <div className="mt-3 grid sm:grid-cols-2 gap-4">
              {field('customer_name', 'Full name', { placeholder: 'Aymane Moutoute' })}
              {field('customer_phone', 'Phone', { placeholder: '+212 6 00 00 00 00' })}
            </div>
            <div className="mt-4">
              <label className="text-sm font-semibold">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Anything we should know?"
                className="mt-1 w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={booking}
              className="mt-6 w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 disabled:opacity-40"
            >
              {booking ? 'Booking…' : `Confirm booking · ${slot.start}–${slot.end}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
