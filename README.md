# 📅 BookingPro — Client

Appointment booking frontend in **React + Vite + Tailwind CSS**, powered by the BookingPro API.

## ✨ Features

**Booking flow**
- 🏠 Service catalog with cards (price, duration, images)
- 📅 3-step booking: pick a day (14-day strip, Sundays marked closed) → pick a time (live slot grid, booked slots struck through) → your details
- 🎟️ Confirmation page with booking reference (`BK-…`)
- Guests can book — no account required

**Customer**
- 📋 My bookings — upcoming vs past, cancel with one click
- 🔐 Register / login / logout, one-click demo accounts

**Admin dashboard** (`/admin`)
- 📊 Stats (today / pending / total) + today's agenda timeline
- 📅 All bookings with date filter and inline status updates
- 💈 Service CRUD via modal form

## 🛠️ Stack

React 18 · Vite · React Router · Axios · Tailwind CSS v4

## 🚀 Quick start

```bash
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:8000/api
npm run dev            # http://localhost:5173
```

API must be running (`php artisan serve` in `bookingpro-api`).

Demo accounts: `admin@booking.test` / `customer@booking.test` (password: `password`)

## 📁 Structure

```
src/
├── api/client.js            # Axios + token interceptor
├── context/AuthContext.jsx  # Auth state
├── components/              # Navbar, ServiceCard
├── pages/
│   ├── Home.jsx             # Service catalog
│   ├── Book.jsx             # 3-step booking flow
│   ├── BookingSuccess.jsx   # Confirmation + reference
│   ├── MyBookings.jsx       # Upcoming/past + cancel
│   ├── Login.jsx / Register.jsx
│   └── Admin.jsx            # Dashboard + bookings + services
└── App.jsx                  # Routes
```

---

Built by [Aymane Moutoute](https://github.com/aymanemt1) · Full Stack Software Developer
