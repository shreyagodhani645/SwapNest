# SwapNest

SwapNest is a premium marketplace app for swapping and trading items, built with React, Node.js, and **PostgreSQL (Supabase)**.

## 🌐 Live Demo

- **Frontend**: [https://swap-nest-weld.vercel.app](https://swap-nest-weld.vercel.app)
- **Backend API**: [https://swapnest-nwv9.onrender.com](https://swapnest-nwv9.onrender.com)

> Note: the backend is hosted on Render's free tier, which spins down after periods of inactivity. The first request after idle time may take 30–60 seconds to respond while the server wakes up.

## 🔐 Demo Login Credentials

### User Logins
You can log in with either username or email. Each demo user has its own password:

| Username | Email | Password |
| :--- | :--- | :--- |
| `alice_w` | alice@example.com | `alicePass123` |
| `bob_m` | bob@example.com | `bobPass123` |
| `charlie_d` | charlie@example.com | `charliePass123` |
| `diana_p` | diana@example.com | `dianaPass123` |
| `emma_r` | emma@example.com | `emmaPass123` |
| `frank_g` | frank@example.com | `frankPass123` |

These accounts come with pre-seeded listings (active, sold, and reserved) across all categories, offers in multiple states (pending, accepted, rejected — including competing offers on the same listing), wishlist entries, and sample chat threads — useful for demonstrating every feature without manual setup.

### Admin Login
An admin account exists (`admin@swapnest.com`) with full platform management rights, including the ability to ban/delete users and remove any listing. Credentials are available on request — they are intentionally not published here since this repository is public.

## Project Structure

```
DBMS/
├── backend/           # Node.js/Express backend
│   ├── controllers/   # Route controllers
│   ├── routes/        # API route definitions
│   ├── uploads/       # Uploaded files
│   ├── *.js           # Backend scripts
│   ├── *.sql          # Database schema and seed files
│   └── package.json   # Backend dependencies
├── frontend/          # React frontend
│   ├── src/           # React source code
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
└── README.md
```

## Prerequisites (Local Development)

- **Node.js** installed on your system
- A **Supabase** (PostgreSQL) project, or any PostgreSQL instance
- A `.env` file in the `backend` folder with your database connection string and JWT secret

## Manual Setup

### 1. Database Setup

Run `backend/full_schema.sql` in your PostgreSQL instance (via Supabase's SQL Editor or `psql`) to create tables, functions, and triggers.

To populate demo data (users, listings, offers, wishlist, chat messages), run `backend/seed_demo_data.sql` — it's safe to re-run, as every insert checks for existing data first.

### 2. Backend

```bash
cd backend
npm install
# Configure .env with DB_CONNECTION_STRING and JWT_SECRET
npm start
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

By default the frontend points at `http://localhost:5000/api`. To point it at a deployed backend instead, set `VITE_API_URL` in a `.env` file inside `frontend/`.

## Troubleshooting

**"Database is offline" or 500/503 errors**
Usually means the backend can't reach PostgreSQL. Check that `DB_CONNECTION_STRING` in `backend/.env` is correct and that your Supabase project is active.

**"Network error" on the frontend**
If deployed, confirm `VITE_API_URL` (frontend) and `FRONTEND_URL` (backend, for CORS) are both set correctly and point to each other's live URLs.

## Features

- **Auth**: Secure login/signup with JWT, supports login via email or username
- **Marketplace**: Browse, search, and filter listings
- **Wishlist**: Save items for later
- **Chat**: Real-time messaging between users via WebSockets
- **Offers**: Make and track price offers, with accept/reject flow
- **Admin Dashboard**: User management, listing moderation, category stats, audit logs
- **Trust Score**: Dynamic reputation system based on activity
- **Premium UI**: Modern purple theme with dark mode support

## Technologies Used

- **Backend**: Node.js, Express, PostgreSQL (via Supabase), Socket.io
- **Frontend**: React, Vite, Tailwind CSS
- **Deployment**: Render (backend), Vercel (frontend)
- **Other**: JWT for authentication, Multer for file uploads, bcrypt for password hashing

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is for educational purposes.
