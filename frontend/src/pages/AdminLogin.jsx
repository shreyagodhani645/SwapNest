import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(formData);
      const { token, user } = response.data;

      if (user.role !== 'admin') {
        setError('Access denied. This login is for administrators only.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-20">
      <div className="max-w-md w-full bg-gray-900 rounded-[2.5rem] shadow-2xl p-12 border border-gray-800">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-red-500/20 rounded-3xl mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-white mb-2">Admin Panel</h2>
          <p className="text-gray-400 font-medium">Restricted access — administrators only.</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border-l-4 border-red-500 text-red-400 p-4 mb-8 rounded-r-xl">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Admin Email</label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              value={formData.email}
              className="w-full px-6 py-4 rounded-2xl border border-gray-800 bg-gray-950/50 text-white focus:bg-gray-900 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all outline-none"
              placeholder="admin@swapnest.com"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              value={formData.password}
              className="w-full px-6 py-4 rounded-2xl border border-gray-800 bg-gray-950/50 text-white focus:bg-gray-900 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all outline-none"
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 px-6 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg shadow-red-600/20 transition-all transform active:scale-[0.98] disabled:opacity-50 text-lg"
          >
            {loading ? 'Authenticating...' : 'Admin Sign In'}
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-gray-800 text-center">
          <a href="/login" className="text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">
            ← Back to User Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
