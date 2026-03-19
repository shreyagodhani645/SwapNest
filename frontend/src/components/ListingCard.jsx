import React from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';


const ListingCard = ({ listing, isWishlisted, onToggleWishlist }) => {
  // Ensure listing.ID is always a string for the route
  return (
    <Link to={`/listings/${String(listing.ID)}`} className="group bg-white rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 block">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={listing.IMAGE_URL ? (listing.IMAGE_URL.startsWith('http') ? listing.IMAGE_URL : API_BASE_URL + listing.IMAGE_URL) : 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={listing.TITLE} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <button 
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist(listing.ID);
          }}
          className={`absolute top-4 right-4 p-2 rounded-full shadow-lg transition-all duration-300 ${
            isWishlisted ? 'bg-primary text-white scale-110' : 'bg-white/80 text-gray-600 hover:bg-white hover:text-primary'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary font-bold rounded-full text-xs uppercase tracking-wider">
            {listing.CATEGORY_NAME || listing.CATEGORY}
          </span>
        </div>
      </div>
      <div className="p-6 block">
        <h3 className="text-xl font-bold text-gray-800 mb-2 truncate group-hover:text-primary transition-colors">
          {listing.TITLE}
        </h3>
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {listing.CONDITION} • {listing.LOCATION}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-black text-primary">
            ₹{listing.PRICE.toLocaleString()}
          </span>
          <span className="text-primary-dark font-semibold text-sm flex items-center">
            View Details 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
