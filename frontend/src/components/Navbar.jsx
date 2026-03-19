import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/home" className="flex-shrink-0 flex items-center group">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center transform transition-all group-hover:rotate-12 shadow-lg shadow-primary/20">
                <span className="text-white font-black text-2xl">S</span>
              </div>
              <span className="ml-3 text-2xl font-black text-gray-900 tracking-tight group-hover:text-primary transition-colors">
                Swap<span className="text-primary italic">Nest</span>
              </span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-8">
            <Link 
              to="/home" 
              className={`text-sm font-bold transition-all ${isActive('/home') ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
            >
              Home
            </Link>
            <Link 
              to="/chat" 
              className={`text-sm font-bold transition-all ${isActive('/chat') ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
            >
              Inbox
            </Link>
            <Link 
              to="/wishlist" 
              className={`text-sm font-bold transition-all ${isActive('/wishlist') ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
            >
              Wishlist
            </Link>
            {user && (
              <>
                <Link 
                  to="/my-listings" 
                  className={`text-sm font-bold transition-all ${isActive('/my-listings') ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
                >
                  My Listings
                </Link>
                <Link 
                  to="/listings/create" 
                  className={`text-sm font-bold transition-all ${isActive('/listings/create') ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
                >
                  Post a Listing
                </Link>
              </>
            )}
            {user ? (
              <div className="flex items-center space-x-6">
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 text-sm font-bold text-gray-700 bg-gray-100/50 px-4 py-2 rounded-full border border-gray-200 hover:bg-white hover:border-primary transition-all"
                >
                  <div className="h-6 w-6 bg-primary-light rounded-full flex items-center justify-center text-white text-[10px]">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span>{user.username}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-full transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-primary/20 transition-all">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
