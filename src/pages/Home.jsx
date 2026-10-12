import { useEffect, useState } from 'react';
import api from '../api/client';
import ServiceCard from '../components/ServiceCard';

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/services').then(({ data }) => {
      setServices(data.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 to-orange-500 text-white p-8 sm:p-12 mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Book your moment of care.
        </h1>
        <p className="mt-2 text-amber-100 max-w-xl">
          Choose a service, pick a time that suits you, and you're booked — no phone calls needed.
        </p>
        <div className="mt-4 flex gap-4 text-sm font-semibold">
          <span>✓ Real-time availability</span>
          <span>✓ Free cancellation</span>
        </div>
      </div>

      <h2 className="text-2xl font-extrabold mb-6">Our services</h2>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 h-72 animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center text-stone-500">
          No services available right now.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
    </div>
  );
}
