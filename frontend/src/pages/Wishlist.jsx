import React, { useState, useEffect } from 'react';
import { wishlistApi } from '../api/wishlist';
import ListingCard from '../components/ListingCard';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistApi.get();
      setListings(res.data);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (listingId) => {
    try {
      await wishlistApi.remove(listingId);
      setListings(listings.filter(item => item.ID !== listingId));
      toast.success('Item removed from wishlist');
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      toast.error('Failed to remove item');
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-12">
            <div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Your Wishlist</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Saved items that you are keeping an eye on.</p>
            </div>
            <div className="h-16 w-16 bg-primary/10 dark:bg-primary/20 rounded-3xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {listings.map(listing => (
              <div key={listing.ID} className="relative">
                <ListingCard 
                  listing={listing} 
                  isWishlisted={true}
                  onToggleWishlist={handleRemove}
                />
                <button 
                  onClick={() => handleRemove(listing.ID)}
                  className="w-full mt-3 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-500 dark:hover:bg-red-600 hover:text-white py-3 rounded-2xl font-black transition-all shadow-sm border border-red-100 dark:border-red-900/30"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-6xl mb-6">💖</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Save some items you like and they will show up here!</p>
            <button 
                onClick={() => window.location.href = '/home'}
                className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
                Browse Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
