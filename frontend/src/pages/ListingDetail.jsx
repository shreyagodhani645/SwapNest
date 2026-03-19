import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { listingsApi } from '../api/listings';
import { wishlistApi } from '../api/wishlist';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import OfferModal from '../components/OfferModal';

const API_BASE_URL = 'http://localhost:5000';


const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchListing();
    checkWishlist();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await listingsApi.getById(id);
      setListing(res.data);
    } catch (err) {
      console.error('Error fetching listing:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await wishlistApi.check(id);
      setIsWishlisted(res.data.isWishlisted);
    } catch (err) {
      console.error('Error checking wishlist:', err);
    }
  };

  const handleToggleWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to use wishlist');
        return;
    }
    try {
      if (isWishlisted) {
        await wishlistApi.remove(id);
        toast.success('Removed from wishlist');
      } else {
        await wishlistApi.add(id);
        toast.success('Added to wishlist');
      }
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      toast.error('Failed to update wishlist');
    }
  };

  const handleMessageSeller = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to chat');
        return;
    }
    navigate(`/chat?listingId=${listing.ID}&userId=${listing.SELLER_ID}&title=${encodeURIComponent(listing.TITLE)}`);
  };

  const handleOpenOfferModal = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to make an offer');
        return;
    }
    setIsOfferModalOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
    </div>
  );
  
  if (!listing) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
        <Link to="/home" className="text-primary font-bold">Back to Home</Link>
    </div>
  );

  const isOwnListing = currentUser?.id === listing.SELLER_ID;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="bg-gray-50 p-8 flex flex-col items-center justify-center space-y-6">
              <div className="relative group w-full">
                <img 
                  src={listing.IMAGES?.[0] ? (listing.IMAGES[0].startsWith('http') ? listing.IMAGES[0] : API_BASE_URL + listing.IMAGES[0]) : 'https://via.placeholder.com/800x600?text=No+Image'} 
                  alt={listing.TITLE} 
                  className="w-full h-auto max-h-[500px] object-cover rounded-3xl shadow-lg transition-transform duration-500 overflow-hidden"
                />
              </div>
              
              {/* Additional Images Thumbnail Strip */}
              {listing.IMAGES && listing.IMAGES.length > 0 && (
                <div className="flex gap-4 w-full overflow-x-auto pb-4 scrollbar-hide px-2">
                  {listing.IMAGES.map((img, idx) => (
                    <img key={idx} src={img.startsWith('http') ? img : API_BASE_URL + img} alt={`${listing.TITLE} ${idx}`} className="h-28 w-28 object-cover rounded-2xl shadow-sm border border-gray-200 cursor-pointer hover:border-primary transition-all flex-shrink-0" />
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-12 lg:p-16 flex flex-col h-full">
              <div className="mb-8">
                <span className="px-4 py-2 bg-primary/10 text-primary font-black rounded-full text-xs uppercase tracking-widest inline-block mb-6">
                  {listing.CATEGORY_NAME}
                </span>
                <h1 className="text-5xl font-black text-gray-900 leading-tight mb-4">
                  {listing.TITLE}
                </h1>
                <div className="flex items-center text-gray-500 text-lg mb-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {listing.CONDITION} &bull; {listing.LOCATION}
                </div>
                <div className="text-4xl font-black text-primary mb-10 tracking-tight">
                  ₹{listing.PRICE.toLocaleString()}
                </div>
                
                {/* Actions */}
                {!isOwnListing && (
                  <div className="flex flex-col gap-4 mb-10">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          console.log('offer clicked');
                          handleOpenOfferModal();
                        }}
                        className="flex-1 bg-white border-4 border-primary text-primary px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] transform active:scale-95"
                      >
                        Make an Offer
                      </button>
                      <button 
                        onClick={() => {
                          console.log('wishlist clicked');
                          handleToggleWishlist();
                        }}
                        className={`flex-1 px-8 py-4 rounded-2xl font-black shadow-lg transition-all hover:scale-[1.02] transform active:scale-95 ${
                          isWishlisted ? 'bg-secondary text-white shadow-secondary/20' : 'bg-primary hover:bg-primary-dark text-white shadow-primary/20'
                        }`}
                      >
                        {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      </button>
                    </div>
                    <button 
                      onClick={handleMessageSeller}
                      className="w-full bg-dark hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-gray-900/20 transition-all hover:scale-[1.02] transform active:scale-95"
                    >
                      Message Seller
                    </button>
                  </div>
                )}

                <div className="prose prose-lg text-gray-600 max-w-none leading-relaxed mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                  {listing.DESCRIPTION}
                </div>
              </div>

              {/* Seller Info */}
              <div className="mt-auto pt-10 border-t border-gray-100">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Seller Information</h3>
                <Link to={`/profile/${listing.SELLER_ID}`} className="flex items-center p-6 bg-gray-50/50 rounded-3xl border border-gray-100 hover:bg-primary/5 transition-all">
                  <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                    {listing.SELLER_NAME[0].toUpperCase()}
                  </div>
                  <div className="ml-6">
                    <p className="text-xl font-bold text-gray-900 mb-1">{listing.SELLER_NAME}</p>
                    <p className="text-primary font-medium">View Profile & Trust Score</p>
                  </div>
                  <div className="ml-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OfferModal 
        isOpen={isOfferModalOpen} 
        onClose={() => setIsOfferModalOpen(false)} 
        listing={listing}
        onOfferSent={() => alert('Offer sent successfully!')}
      />
    </div>
  );
};

export default ListingDetail;
