import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await register(form.name, form.email, form.password, form.password_confirmation);
      navigate('/');
    } catch (err) {
      setErrors(err.response?.data?.errors || { email: ['Registration failed.'] });
    } finally {
      setBusy(false);
    }
  };

  const field = (key, label, type = 'text') => (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        type={type}
        required
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        className="mt-1 w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      {errors[key] && <p className="mt-1 text-sm text-red-600">{errors[key][0]}</p>}
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-stone-200 p-8">
        <h1 className="text-2xl font-extrabold">Create your account</h1>
        <p className="mt-1 text-sm text-stone-500">
          Already have one?{' '}
          <Link to="/login" className="text-amber-700 font-semibold hover:underline">
            Log in
          </Link>
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {field('name', 'Full name')}
          {field('email', 'Email', 'email')}
          {field('password', 'Password (min 8 chars)', 'password')}
          {field('password_confirmation', 'Confirm password', 'password')}
          <button
            type="submit"
            disabled={busy}
            className="w-full px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-40"
          >
            {busy ? 'Creating…' : 'Sign up'}
          </button>
        </form>
      </div>
    </div>
  );
}
