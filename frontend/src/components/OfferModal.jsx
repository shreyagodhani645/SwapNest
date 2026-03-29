import React, { useState } from 'react';
import { offersApi } from '../api/offers';
import toast from 'react-hot-toast';

const OfferModal = ({ isOpen, onClose, listing, onOfferSent }) => {
  const [offerPrice, setOfferPrice] = useState(listing?.PRICE || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await offersApi.create({
        listing_id: listing.ID,
        amount: parseFloat(offerPrice)
      });
      toast.success('Offer submitted successfully!');
      onOfferSent();
      onClose();
    } catch (err) {
      toast.error('Failed to send offer. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl dark:shadow-none max-w-md w-full p-10 transform scale-100 transition-all border border-blue-50/50 dark:border-gray-800">
        <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Make an Offer</h2>
            <h3 className="text-xl font-bold text-primary dark:text-primary-light mb-2 line-clamp-1">{listing?.TITLE}</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">Enter your best price for this item.</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 text-sm font-bold border-l-4 border-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Your Price (₹)</label>
            <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300 dark:text-gray-700">₹</span>
                <input 
                type="number" 
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                required
                className="w-full pl-12 pr-6 py-5 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-2xl font-black text-gray-800 dark:text-white"
                placeholder="0.00"
                />
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 border-2 border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-black rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-4 px-6 bg-primary hover:bg-primary-dark text-white font-black rounded-2xl shadow-lg shadow-primary/20 dark:shadow-none transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;
