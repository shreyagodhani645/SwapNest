import React, { useState, useEffect } from 'react';
import { offersApi } from '../api/offers';
import { listingsApi } from '../api/listings';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5000';

const MyListings = () => {
  const [myListings, setMyListings] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listingsRes, offersRes] = await Promise.all([
        listingsApi.getMyListings(),
        offersApi.getMyListingsOffers()
      ]);
      setMyListings(listingsRes.data);
      setOffers(offersRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load your listings and offers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (offerId, newStatus) => {
    try {
      await offersApi.updateStatus(offerId, newStatus);
      toast.success('Offer status updated!');
      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update offer status.');
    }
  };

  const handleListingStatus = async (listingId, newStatus) => {
    try {
      await listingsApi.updateStatus(listingId, newStatus);
      toast.success(`Listing marked as ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update listing status');
    }
  };

  const groupedListings = myListings.map(listing => {
    return {
      ...listing,
      offers: offers.filter(o => o.LISTING_ID === listing.ID)
    };
  });

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await listingsApi.deleteListing(listingId);
      setMyListings(prev => prev.filter(l => l.ID !== listingId));
      toast.success('Listing deleted!');
    } catch (err) {
      toast.error('Failed to delete listing');
    }
  };

  const statusBadge = (status) => {
    const s = status || 'active';
    const styles = {
      active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      sold: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      reserved: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[s] || styles.active}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-8">My Listings & Offers</h1>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
          </div>
        ) : groupedListings.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">You have no listings</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedListings.map((group, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-premium dark:shadow-none p-8 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b dark:border-gray-800 pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-2xl font-black text-gray-800 dark:text-white">{group.TITLE}</h2>
                      <p className="text-gray-500 dark:text-gray-400 font-bold mt-1">
                        ₹{group.PRICE?.toLocaleString()} &bull; {group.ITEM_CONDITION || group.CONDITION}
                      </p>
                    </div>
                    {statusBadge(group.STATUS)}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {/* Status Toggle Buttons */}
                    {(group.STATUS === 'active' || !group.STATUS) && (
                      <button 
                        onClick={() => handleListingStatus(group.ID, 'sold')}
                        className="text-sm font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 dark:border-red-900/30 px-4 py-2 rounded-xl transition-all"
                      >
                        Mark Sold
                      </button>
                    )}
                    {group.STATUS === 'sold' && (
                      <button 
                        onClick={() => handleListingStatus(group.ID, 'active')}
                        className="text-sm font-bold text-green-600 hover:text-white hover:bg-green-600 border border-green-200 dark:border-green-900/30 px-4 py-2 rounded-xl transition-all"
                      >
                        Re-activate
                      </button>
                    )}
                    {group.STATUS === 'reserved' && (
                      <>
                        <button 
                          onClick={() => handleListingStatus(group.ID, 'sold')}
                          className="text-sm font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 dark:border-red-900/30 px-4 py-2 rounded-xl transition-all"
                        >
                          Mark Sold
                        </button>
                        <button 
                          onClick={() => handleListingStatus(group.ID, 'active')}
                          className="text-sm font-bold text-green-600 hover:text-white hover:bg-green-600 border border-green-200 dark:border-green-900/30 px-4 py-2 rounded-xl transition-all"
                        >
                          Re-activate
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => window.location.href = `/listings/${String(group.ID)}`}
                      className="text-sm font-bold text-primary dark:text-primary-light hover:text-primary-dark border border-primary/20 dark:border-primary/40 px-4 py-2 rounded-xl transition-all"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => window.location.href = `/listings/edit/${String(group.ID)}`}
                      className="text-sm font-bold text-secondary hover:text-white hover:bg-secondary border border-secondary/20 px-4 py-2 rounded-xl transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteListing(group.ID)}
                      className="text-sm font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 dark:border-red-900/30 px-4 py-2 rounded-xl transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {group.offers.length === 0 ? (
                    <p className="text-gray-400 dark:text-gray-500 italic font-medium px-4">No offers received yet.</p>
                  ) : group.offers.map(offer => (
                    <div key={offer.ID} className="bg-gray-50 dark:bg-gray-950 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
                      <div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Buyer: {offer.BUYER_NAME}</p>
                        <p className="text-3xl font-black text-primary">₹{offer.AMOUNT?.toLocaleString()}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                          offer.STATUS === 'accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          offer.STATUS === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {offer.STATUS}
                        </span>
                        
                        {offer.STATUS === 'pending' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleStatusUpdate(offer.ID, 'accepted')}
                              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(offer.ID, 'rejected')}
                              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
