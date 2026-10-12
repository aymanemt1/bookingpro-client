import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from './MyBookings';

const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

const emptyForm = {
  name: '',
  description: '',
  duration_minutes: 60,
  price: '',
  image_url: '',
  is_active: true,
};

export default function Admin() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?.is_admin) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAll = async () => {
    try {
      const dash = await api.get('/admin/dashboard');
      setDashboard(dash.data);
    } catch {
      /* ignore */
    }
    try {
      const bk = await api.get('/admin/bookings');
      setBookings(bk.data.data);
    } catch {
      /* ignore */
    }
    try {
      const sv = await api.get('/services');
      setServices(sv.data.data);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (user?.is_admin) {
      api
        .get('/admin/bookings', dateFilter ? { params: { date: dateFilter } } : {})
        .then(({ data }) => setBookings(data.data))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16">Loading…</div>;
  if (!user?.is_admin) return <Navigate to="/" replace />;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description || '',
      duration_minutes: s.duration_minutes,
      price: s.price,
      image_url: s.image_url || '',
      is_active: s.is_active,
    });
    setErrors({});
    setShowForm(true);
  };

  const submitService = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      if (editing) {
        await api.patch(`/services/${editing.id}`, {
          ...form,
          image_url: form.image_url || null,
        });
      } else {
        await api.post('/services', { ...form, image_url: form.image_url || null });
      }
      setShowForm(false);
      const { data } = await api.get('/services');
      setServices(data.data);
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    }
  };

  const removeService = async (id) => {
    if (!confirm('Delete this service?')) return;
    await api.delete(`/services/${id}`);
    const { data } = await api.get('/services');
    setServices(data.data);
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/bookings/${id}/status`, { status });
    const { data } = await api.get(
      '/admin/bookings',
      dateFilter ? { params: { date: dateFilter } } : {}
    );
    setBookings(data.data);
    const dash = await api.get('/admin/dashboard');
    setDashboard(dash.data);
  };

  const inputCls =
    'mt-1 w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500';

  const bookingRow = (b) => (
    <div
      key={b.id}
      className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-wrap items-center justify-between gap-3"
    >
      <div>
        <p className="font-bold">
          {b.start_time}–{b.end_time} · {b.service?.name}
        </p>
        <p className="text-sm text-stone-500">
          {b.customer_name} · {b.customer_phone} · {b.date} ·{' '}
          <span className="font-mono">#{b.booking_number}</span>
        </p>
        {b.notes && <p className="text-sm text-stone-400 italic mt-1">"{b.notes}"</p>}
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={b.status} />
        <select
          value={b.status}
          onChange={(e) => updateStatus(b.id, e.target.value)}
          className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold">👮 Admin dashboard</h1>

      <div className="mt-4 flex gap-2">
        {['dashboard', 'bookings', 'services'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-semibold capitalize ${
              tab === t ? 'bg-amber-600 text-white' : 'bg-white border border-stone-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && dashboard && (
        <div className="mt-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Today's bookings", value: dashboard.today_count },
              { label: 'Pending', value: dashboard.pending_count },
              { label: 'Total', value: dashboard.total_count },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-stone-200 p-5">
                <p className="text-3xl font-extrabold">{s.value}</p>
                <p className="text-sm text-stone-500">{s.label}</p>
              </div>
            ))}
          </div>
          <h2 className="mt-8 font-extrabold text-lg">Today's agenda — {dashboard.date}</h2>
          <div className="mt-3 space-y-3">
            {dashboard.today.length === 0 && (
              <p className="text-stone-400 bg-white rounded-2xl border border-stone-200 p-8 text-center">
                Nothing scheduled today.
              </p>
            )}
            {dashboard.today.map(bookingRow)}
          </div>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold">Filter by date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-stone-200"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-sm text-amber-700 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {bookings.length === 0 && (
              <p className="text-stone-400 bg-white rounded-2xl border border-stone-200 p-8 text-center">
                No bookings found.
              </p>
            )}
            {bookings.map(bookingRow)}
          </div>
        </div>
      )}

      {tab === 'services' && (
        <div className="mt-6">
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700"
          >
            + New service
          </button>
          <div className="mt-4 bg-white rounded-2xl border border-stone-200 overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-stone-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-t border-stone-100">
                    <td className="px-4 py-3 font-semibold">{s.name}</td>
                    <td className="px-4 py-3">{s.duration_label}</td>
                    <td className="px-4 py-3">${Number(s.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-500'}`}
                      >
                        {s.is_active ? 'active' : 'hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openEdit(s)} className="text-amber-700 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => removeService(s.id)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={submitService}
            className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4"
          >
            <h2 className="text-xl font-extrabold">{editing ? 'Edit service' : 'New service'}</h2>
            <div>
              <label className="text-sm font-semibold">Name</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
              {errors.name && <p className="text-sm text-red-600">{errors.name[0]}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold">Description</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Duration (minutes)</label>
                <input type="number" min="15" step="15" value={form.duration_minutes} onChange={(e) => set('duration_minutes', e.target.value)} className={inputCls} />
                {errors.duration_minutes && <p className="text-sm text-red-600">{errors.duration_minutes[0]}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold">Price ($)</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} className={inputCls} />
                {errors.price && <p className="text-sm text-red-600">{errors.price[0]}</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold">Image URL (optional)</label>
              <input value={form.image_url} onChange={(e) => set('image_url', e.target.value)} className={inputCls} placeholder="https://…" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 accent-amber-600" />
              Active (visible on site)
            </label>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700">
                {editing ? 'Save changes' : 'Create service'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-stone-200 font-semibold hover:bg-stone-100">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
