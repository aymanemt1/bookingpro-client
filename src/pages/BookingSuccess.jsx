import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';

export default function BookingSuccess() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    api.get(`/bookings/reference/${id}`).then(({ data }) => setBooking(data.data)).catch(() => {});
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-4xl">
        ✓
      </div>
      <h1 className="mt-6 text-3xl font-extrabold">You're booked!</h1>
      {booking ? (
        <div className="mt-4 bg-white rounded-2xl border border-stone-200 p-6 text-left">
          <p className="font-mono font-bold text-amber-700">#{booking.booking_number}</p>
          <p className="mt-2 text-lg font-bold">{booking.service?.name}</p>
          <p className="text-stone-500">
            📅 {booking.date} · 🕐 {booking.start_time} – {booking.end_time}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {booking.customer_name} · {booking.customer_phone}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-stone-500">Booking #{id} confirmed.</p>
      )}
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          to="/my-bookings"
          className="px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700"
        >
          My bookings
        </Link>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl border border-stone-200 font-semibold hover:bg-stone-100"
        >
          Book another
        </Link>
      </div>
    </div>
  );
}
