import React, { useState, useEffect } from 'react';
import { listingsApi } from '../api/listings';
import { wishlistApi } from '../api/wishlist';
import ListingCard from '../components/ListingCard';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const Home = () => {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ category: '', search: '' });

  useEffect(() => {
    fetchData();
    fetchWishlist();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [listingsRes, categoriesRes] = await Promise.all([
        listingsApi.getAll(filters),
        listingsApi.getCategories()
      ]);
      setListings(listingsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load listings. Please verify the server connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await wishlistApi.get();
      setWishlistIds(res.data.map(item => item.ID));
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };

  const toggleWishlist = async (listingId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        toast.error('Please login to use wishlist');
        return;
    }
    try {
      const isWishlisted = wishlistIds.includes(listingId);
      if (!isWishlisted) {
        await wishlistApi.add(listingId);
        setWishlistIds([...wishlistIds, listingId]);
        toast.success('Added to wishlist');
      } else {
        await wishlistApi.remove(listingId);
        setWishlistIds(wishlistIds.filter(id => id !== listingId));
        toast.success('Removed from wishlist');
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Find what you need, <span className="text-primary italic">Swap</span> easily.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            SwapNest is the premier destination for sustainable trading and community-driven commerce.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="relative flex-1 max-w-xl">
            <input 
              type="text" 
              placeholder="Search items like 'iPhone', 'Bike'..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-lg shadow-sm"
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setFilters({ ...filters, category: '' })}
              className={`px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap border-2 ${
                filters.category === '' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-gray-100 text-gray-500 hover:border-primary/30 hover:text-primary'
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button 
                key={cat.ID}
                onClick={() => setFilters({ ...filters, category: cat.NAME })}
                className={`px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap border-2 ${
                  filters.category === cat.NAME ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-gray-100 text-gray-500 hover:border-primary/30 hover:text-primary'
                }`}
              >
                {cat.NAME}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-red-100">
            <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-red-600 mb-2">Error Loading Listings</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {listings.map(listing => (
              <ListingCard 
                key={listing.ID} 
                listing={listing} 
                isWishlisted={wishlistIds.includes(listing.ID)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No listings found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
