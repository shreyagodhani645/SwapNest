import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userApi } from '../api/users';
import ListingCard from '../components/ListingCard';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await userApi.getPublicProfile(userId);
      setProfile(res.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
    </div>
  );

  if (!profile) return <div className="p-20 text-center font-bold">User profile not found.</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-[2.5rem] shadow-premium p-10 lg:p-16 mb-12 border border-blue-50/50">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
            <div className="relative">
                <div className="h-40 w-40 bg-primary rounded-[3rem] flex items-center justify-center text-white text-6xl font-black shadow-2xl shadow-primary/30 border-8 border-white">
                {profile.USERNAME[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-4 -right-4 bg-accent text-white px-4 py-2 rounded-2xl font-black text-sm shadow-xl flex items-center border-4 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    VERIFIED
                </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tight">{profile.USERNAME}</h1>
                    <p className="text-gray-500 font-medium text-lg">Member since {new Date(profile.CREATED_AT).getFullYear()}</p>
                </div>
                <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10 flex items-center gap-6">
                    <div className="text-center px-4 border-r border-primary/10">
                        <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Trust Score</p>
                        <p className="text-3xl font-black text-primary">{profile.TRUST_SCORE}%</p>
                    </div>
                    <div className="text-center px-4">
                        <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Listings</p>
                        <p className="text-3xl font-black text-primary">{profile.LISTINGS_COUNT}</p>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center">
                    <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="font-bold text-gray-700">Phone Verified</p>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="font-bold text-gray-700">Email Verified</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* User's Listings */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Active Listings</h2>
            <div className="h-1 bg-primary/10 flex-1 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {profile.LISTINGS.length > 0 ? profile.LISTINGS.map(listing => (
              <ListingCard key={listing.ID} listing={{...listing, CATEGORY: 'ACTIVE'}} isWishlisted={false} onToggleWishlist={() => {}} />
            )) : (
              <p className="col-span-full text-center py-20 text-gray-500 font-bold bg-white rounded-[2rem] border border-gray-50 shadow-sm">
                This user hasn't posted any listings yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
