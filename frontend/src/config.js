// Shared backend base URL (no /api suffix) — used for image URLs, 
// socket.io connections, and anywhere else that needs the raw server origin.
// In production, set VITE_API_URL in Vercel (e.g. https://swapnest-nwv9.onrender.com/api)
// and this derives the base automatically by stripping the /api suffix.

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_BASE_URL = apiUrl.replace(/\/api\/?$/, '');