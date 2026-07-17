import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { listingsApi } from '../api/listings';
import { wishlistApi } from '../api/wishlist';
import { userApi } from '../api/users';
import OfferModal from '../components/OfferModal';
import ListingCard from '../components/ListingCard';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [relatedListings, setRelatedListings] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchListing();
    checkWishlist();
    fetchWishlistIds();
  }, [id]);

  const fetchListing = async () => {
    console.log('DEBUG: ListingDetail extracting ID from URL:', id);
    try {
      const res = await listingsApi.getById(id);
      console.log('DEBUG: Listing API response:', res.data);
      setListing(res.data);
      // Fetch seller profile
      if (res.data.SELLER_ID) {
        fetchSeller(res.data.SELLER_ID);
      }
      // Fetch related listings
      if (res.data.CATEGORY_NAME) {
        fetchRelated(res.data.CATEGORY_NAME, res.data.ID);
      }
    } catch (err) {
      console.error('Error fetching listing:', err);
      toast.error('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeller = async (sellerId) => {
    try {
      const res = await userApi.getPublicProfile(sellerId);
      setSeller(res.data);
    } catch (err) {
      console.error('Error fetching seller:', err);
    }
  };

  const fetchRelated = async (category, excludeId) => {
    try {
      const res = await listingsApi.getAll({ category, excludeId });
      setRelatedListings(res.data.slice(0, 4));
    } catch (err) {
      console.error('Error fetching related:', err);
    }
  };

  const fetchWishlistIds = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await wishlistApi.get();
      setWishlistIds(res.data.map(item => item.ID));
    } catch (err) {
      console.error('Error fetching wishlist:', err);
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

  const toggleWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to use wishlist');
      return;
    }
    try {
      if (isWishlisted) {
        await wishlistApi.remove(id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistApi.add(id);
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const toggleRelatedWishlist = async (listingId) => {
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

  if (loading) return (
    <div className="min-h-screen bg-background dark:bg-gray-950">
      <Navbar />
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen bg-background dark:bg-gray-950">
      <Navbar />
      <div className="text-center py-40">
        <p className="text-2xl font-bold text-gray-500">Listing not found</p>
      </div>
    </div>
  );

  const images = listing.IMAGES || [];
  const currentImage = images[selectedImage] || '';
  const isSold = listing.STATUS === 'sold';
  const isReserved = listing.STATUS === 'reserved';
  const isOwner = user?.id === listing.SELLER_ID;

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
          {/* Image Carousel */}
          <div className="mb-10 lg:mb-0">
            <div className="relative rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-premium dark:shadow-none aspect-square">
              {currentImage ? (
                <img 
                  src={currentImage.startsWith('http') ? currentImage : API_BASE_URL + currentImage}
                  alt={listing.TITLE}
                  className={`w-full h-full object-cover ${isSold ? 'grayscale-[30%]' : ''}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Status Overlay */}
              {isSold && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="px-8 py-4 bg-red-500 text-white font-black text-2xl rounded-2xl shadow-2xl tracking-widest uppercase transform -rotate-12">
                    SOLD
                  </span>
                </div>
              )}
              {isReserved && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="px-8 py-4 bg-yellow-500 text-white font-black text-2xl rounded-2xl shadow-2xl tracking-widest uppercase transform -rotate-12">
                    RESERVED
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto py-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-primary shadow-lg shadow-primary/20 scale-105' : 'border-gray-200 dark:border-gray-800 hover:border-primary/50'
                    }`}
                  >
                    <img 
                      src={img.startsWith('http') ? img : API_BASE_URL + img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Panel */}
          <div>
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-premium dark:shadow-none p-8 lg:p-10 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-4 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light font-bold rounded-full text-xs uppercase tracking-wider">{listing.CATEGORY_NAME}</span>
                <span className={`px-4 py-1.5 font-bold rounded-full text-xs uppercase tracking-wider ${
                  (listing.ITEM_CONDITION || listing.CONDITION) === 'New' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                  (listing.ITEM_CONDITION || listing.CONDITION) === 'Like New' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
                  'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                }`}>{listing.ITEM_CONDITION || listing.CONDITION}</span>
                {isSold && <span className="px-4 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold rounded-full text-xs uppercase tracking-wider">SOLD</span>}
                {isReserved && <span className="px-4 py-1.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 font-bold rounded-full text-xs uppercase tracking-wider">RESERVED</span>}
              </div>

              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-4">{listing.TITLE}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <p className={`text-4xl font-black ${isSold ? 'text-gray-400 line-through' : 'text-primary'}`}>₹{listing.PRICE?.toLocaleString()}</p>
              </div>

              {listing.LOCATION && (
                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-bold">{listing.LOCATION}</span>
                </div>
              )}

              {listing.DESCRIPTION && (
                <div className="mb-8">
                  <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{listing.DESCRIPTION}</p>
                </div>
              )}

              {/* Action Buttons */}
              {!isOwner && (
                <div className="space-y-4 mb-8">
                  {!isSold && (
                    <button
                      onClick={() => {
                        if (!user) { toast.error('Please login first'); return; }
                        setIsOfferModalOpen(true);
                      }}
                      className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/30 dark:shadow-none transition-all transform active:scale-95"
                    >
                      Make an Offer
                    </button>
                  )}
                  <div className="flex gap-4">
                    <button
                      onClick={toggleWishlist}
                      className={`flex-1 py-4 font-bold rounded-2xl transition-all border-2 flex items-center justify-center gap-2 ${
                        isWishlisted 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                    </button>
                    <button
                      onClick={() => {
                        if (!user) { toast.error('Please login first'); return; }
                        navigate(`/chat?listingId=${listing.ID}&userId=${listing.SELLER_ID}&title=${listing.TITLE}`);
                      }}
                      className="flex-1 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-secondary hover:text-secondary font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Message Seller
                    </button>
                  </div>
                </div>
              )}

              {/* Seller Info — show full profile if available, fallback to listing data */}
              {(seller || listing.SELLER_NAME) && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                  <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Seller</h3>
                  <Link 
                    to={`/profile/${listing.SELLER_ID}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary transition-all"
                  >
                    <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center text-white text-xl font-black overflow-hidden flex-shrink-0">
                      {seller?.PROFILE_PICTURE ? (
                        <img src={seller.PROFILE_PICTURE.startsWith('http') ? seller.PROFILE_PICTURE : API_BASE_URL + seller.PROFILE_PICTURE} alt={seller.USERNAME || listing.SELLER_NAME} className="h-full w-full object-cover" />
                      ) : (
                        (seller?.USERNAME || listing.SELLER_NAME)?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 dark:text-white">{seller?.USERNAME || listing.SELLER_NAME}</p>
                      {seller?.CREATED_AT ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Member since {new Date(seller.CREATED_AT).getFullYear()}</p>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{listing.SELLER_EMAIL || 'View full profile →'}</p>
                      )}
                    </div>
                    {seller?.TRUST_SCORE != null && (
                      <div className="text-center">
                        <p className="text-2xl font-black text-primary">{seller.TRUST_SCORE}%</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trust</p>
                      </div>
                    )}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Related Listings</h2>
              <div className="h-1 bg-primary/10 dark:bg-primary/20 flex-1 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedListings.map(item => (
                <ListingCard
                  key={item.ID}
                  listing={item}
                  isWishlisted={wishlistIds.includes(item.ID)}
                  onToggleWishlist={toggleRelatedWishlist}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        listing={listing}
        onOfferSent={() => fetchListing()}
      />
    </div>
  );
};

export default ListingDetail;
