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
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    condition: '',
    sort: 'newest',
    showSold: false
  });

  useEffect(() => {
    fetchCategories();
    fetchWishlist();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await listingsApi.getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
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

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.location) params.location = filters.location;
      if (filters.condition) params.condition = filters.condition;
      if (filters.showSold) params.showSold = 'true';
      if (filters.sort === 'price_asc') params.sort = 'price_asc';
      else if (filters.sort === 'price_desc') params.sort = 'price_desc';

      const res = await listingsApi.getAll(params);
      setListings(res.data);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (listingId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to use wishlist');
      return;
    }
    try {
      if (wishlistIds.includes(listingId)) {
        await wishlistApi.remove(listingId);
        setWishlistIds(wishlistIds.filter(id => id !== listingId));
        toast.success('Removed from wishlist');
      } else {
        await wishlistApi.add(listingId);
        setWishlistIds([...wishlistIds, listingId]);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      condition: '',
      sort: 'newest',
      showSold: false
    });
  };

  const activeFilterCount = [
    filters.category, filters.minPrice, filters.maxPrice,
    filters.location, filters.condition, filters.showSold
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header + Search */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Marketplace</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Discover unique items from your campus community.</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filters.sort}
                onChange={(e) => setFilters({...filters, sort: e.target.value})}
                className="px-5 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all border ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-primary'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search listings by name or description..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-800 dark:text-white font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm animate-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.ID} value={cat.NAME}>{cat.NAME}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Min Price (₹)</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl font-bold text-gray-700 dark:text-gray-300 outline-none"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Max Price (₹)</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl font-bold text-gray-700 dark:text-gray-300 outline-none"
                    placeholder="99999"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Location</label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl font-bold text-gray-700 dark:text-gray-300 outline-none"
                    placeholder="e.g. Mumbai"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
                <div className="flex items-center gap-4">
                  <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Condition</label>
                  <select
                    value={filters.condition}
                    onChange={(e) => setFilters({...filters, condition: e.target.value})}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer text-sm"
                  >
                    <option value="">All</option>
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.showSold}
                      onChange={(e) => setFilters({...filters, showSold: e.target.checked})}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Show Sold Items</span>
                  </label>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Active Filter Tags */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-full text-xs font-bold">
                  {filters.category}
                  <button onClick={() => setFilters({...filters, category: ''})} className="ml-2 hover:text-red-500">×</button>
                </span>
              )}
              {filters.minPrice && (
                <span className="inline-flex items-center px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-full text-xs font-bold">
                  Min ₹{filters.minPrice}
                  <button onClick={() => setFilters({...filters, minPrice: ''})} className="ml-2 hover:text-red-500">×</button>
                </span>
              )}
              {filters.maxPrice && (
                <span className="inline-flex items-center px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-full text-xs font-bold">
                  Max ₹{filters.maxPrice}
                  <button onClick={() => setFilters({...filters, maxPrice: ''})} className="ml-2 hover:text-red-500">×</button>
                </span>
              )}
              {filters.location && (
                <span className="inline-flex items-center px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-full text-xs font-bold">
                  📍 {filters.location}
                  <button onClick={() => setFilters({...filters, location: ''})} className="ml-2 hover:text-red-500">×</button>
                </span>
              )}
              {filters.condition && (
                <span className="inline-flex items-center px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-full text-xs font-bold">
                  {filters.condition}
                  <button onClick={() => setFilters({...filters, condition: ''})} className="ml-2 hover:text-red-500">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          </div>
        ) : listings.length > 0 ? (
          <>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 mb-6 uppercase tracking-widest">
              {listings.length} {listings.length === 1 ? 'item' : 'items'} found
            </p>
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
          </>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No listings found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters or search term.</p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
