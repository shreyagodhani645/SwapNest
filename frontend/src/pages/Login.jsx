import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/auth';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-premium p-12 border border-blue-50/50">
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-primary/10 rounded-3xl mb-6">
                <span className="text-primary font-black text-3xl">S</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 font-medium">Log in to manage your swaps.</p>
        </div>
        
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-8 rounded-r-xl">
            <p className="font-bold">Success</p>
            <p>{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-r-xl">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
              placeholder="john@example.com"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 px-6 bg-primary hover:bg-primary-dark text-white font-black rounded-2xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] disabled:opacity-50 text-lg"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-10 text-center text-sm font-bold text-gray-400">
          New to SwapNest?{' '}
          <Link to="/signup" className="text-primary hover:underline transition-all underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
