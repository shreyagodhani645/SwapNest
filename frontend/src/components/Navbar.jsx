import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('user')));

  React.useEffect(() => {
    const handleUserUpdate = () => {
      setUser(JSON.parse(localStorage.getItem('user')));
    };

    window.addEventListener('userProfileUpdate', handleUserUpdate);
    return () => window.removeEventListener('userProfileUpdate', handleUserUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/home" className="flex-shrink-0 flex items-center group">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center transform transition-all group-hover:rotate-12 shadow-lg shadow-primary/20">
                <span className="text-white font-black text-2xl">S</span>
              </div>
              <span className="ml-3 text-2xl font-black text-gray-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">
                Swap<span className="text-primary italic">Nest</span>
              </span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-8">
            <Link 
              to="/home" 
              className={`text-sm font-bold transition-all ${isActive('/home') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'}`}
            >
              Home
            </Link>
            {user && (
              <>
                <Link 
                  to="/chat" 
                  className={`text-sm font-bold transition-all ${isActive('/chat') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'}`}
                >
                  Inbox
                </Link>
                <Link 
                  to="/wishlist" 
                  className={`text-sm font-bold transition-all ${isActive('/wishlist') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'}`}
                >
                  Wishlist
                </Link>
                <Link 
                  to="/my-listings" 
                  className={`text-sm font-bold transition-all ${isActive('/my-listings') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'}`}
                >
                  My Listings
                </Link>
                <Link 
                  to="/listings/create" 
                  className={`text-sm font-bold transition-all ${isActive('/listings/create') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'}`}
                >
                  Post a Listing
                </Link>
              </>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <Sun size={20} />
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-6">
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100/50 dark:bg-gray-800/50 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:border-primary transition-all"
                >
                  <div className="h-8 w-8 bg-primary-light rounded-full flex items-center justify-center text-white text-[10px] overflow-hidden">
                    {user?.PROFILE_PICTURE ? (
                      <img src={user.PROFILE_PICTURE.startsWith('http') ? user.PROFILE_PICTURE : `http://localhost:5000${user.PROFILE_PICTURE}`} alt={user?.username || 'User'} className="h-full w-full object-cover" />
                    ) : (
                      user?.username?.[0]?.toUpperCase() || '?'
                    )}
                  </div>
                  <span>{user?.username || 'User'}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-4 py-2 rounded-full transition-all"
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
