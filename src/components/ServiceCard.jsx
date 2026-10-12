import { Link } from 'react-router-dom';

export default function ServiceCard({ service }) {
  return (
    <Link
      to={`/book/${service.slug}`}
      className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition"
    >
      <div className="aspect-[16/10] bg-stone-100 overflow-hidden">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">💈</div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-stone-900">{service.name}</h3>
        <p className="mt-1 text-sm text-stone-500 line-clamp-2">{service.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-extrabold text-lg">${Number(service.price).toFixed(2)}</span>
            <span className="text-stone-500">⏱ {service.duration_label}</span>
          </div>
          <span className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold group-hover:bg-amber-700">
            Book →
          </span>
        </div>
      </div>
    </Link>
  );
}
