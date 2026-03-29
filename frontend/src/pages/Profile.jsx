import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userApi } from '../api/users';
import { wishlistApi } from '../api/wishlist';
import ListingCard from '../components/ListingCard';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isOwnProfile = currentUser?.id === parseInt(userId);

  useEffect(() => {
    fetchProfile();
    fetchWishlist();
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

  const handleEditSuccess = (updatedUser) => {
    setProfile(prev => ({ ...prev, ...updatedUser }));
    const newUser = { 
      ...currentUser, 
      username: updatedUser.USERNAME, 
      email: updatedUser.EMAIL, 
      phone: updatedUser.PHONE || '',
      PROFILE_PICTURE: updatedUser.PROFILE_PICTURE || ''
    };
    localStorage.setItem('user', JSON.stringify(newUser));
    window.dispatchEvent(new Event('userProfileUpdate'));
  };

  if (loading) return (
    <div className="min-h-screen bg-background dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
    </div>
  );

  if (!profile) return <div className="p-20 text-center font-bold text-gray-500 dark:text-gray-400">User profile not found.</div>;

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-premium dark:shadow-none p-10 lg:p-16 mb-12 border border-blue-50/50 dark:border-gray-800 transition-colors duration-300">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
            <div className="relative">
                <div className="h-40 w-40 bg-primary rounded-[3rem] flex items-center justify-center text-white text-6xl font-black shadow-2xl shadow-primary/30 border-8 border-white dark:border-gray-800 overflow-hidden">
                {profile.PROFILE_PICTURE ? (
                  <img src={profile.PROFILE_PICTURE.startsWith('http') ? profile.PROFILE_PICTURE : `http://localhost:5000${profile.PROFILE_PICTURE}`} alt={profile.USERNAME} className="h-full w-full object-cover" />
                ) : (
                  profile.USERNAME[0].toUpperCase()
                )}
                </div>
                <div className="absolute -bottom-4 -right-4 bg-accent text-white px-4 py-2 rounded-2xl font-black text-sm shadow-xl flex items-center border-4 border-white dark:border-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    VERIFIED
                </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{profile.USERNAME}</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Member since {new Date(profile.CREATED_AT).getFullYear()}</p>
                </div>
                <div className="bg-primary/5 dark:bg-primary/10 rounded-[2rem] p-6 border border-primary/10 dark:border-primary/20 flex items-center gap-6">
                    <div className="text-center px-4 border-r border-primary/10 dark:border-primary/20">
                        <p className="text-xs font-black text-primary dark:text-primary-light uppercase tracking-widest mb-1">Trust Score</p>
                        <p className="text-3xl font-black text-primary dark:text-primary-light">{profile.TRUST_SCORE}%</p>
                    </div>
                    <div className="text-center px-4">
                        <p className="text-xs font-black text-primary dark:text-primary-light uppercase tracking-widest mb-1">Listings</p>
                        <p className="text-3xl font-black text-primary dark:text-primary-light">{profile.LISTINGS_COUNT}</p>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center">
                    <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="font-bold text-gray-700 dark:text-gray-300">Phone Verified</p>
                 </div>
                 <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="font-bold text-gray-700 dark:text-gray-300">Email Verified</p>
                 </div>
                 {isOwnProfile && (
                   <>
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="bg-white dark:bg-gray-950 p-4 rounded-2xl border-2 border-primary/20 hover:border-primary text-primary font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => navigate('/my-listings')}
                      className="bg-primary text-white p-4 rounded-2xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                      My Listings
                    </button>
                   </>
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* User's Listings */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Active Listings</h2>
            <div className="h-1 bg-primary/10 dark:bg-primary/20 flex-1 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {profile.LISTINGS.length > 0 ? profile.LISTINGS.map(listing => (
              <ListingCard 
                key={listing.ID} 
                listing={{...listing, CATEGORY: 'ACTIVE'}} 
                isWishlisted={wishlistIds.includes(listing.ID)}
                onToggleWishlist={toggleWishlist}
              />
            )) : (
              <p className="col-span-full text-center py-20 text-gray-500 dark:text-gray-400 font-bold bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-50 dark:border-gray-800 shadow-sm">
                This user hasn't posted any listings yet.
              </p>
            )}
          </div>
        </div>
      </div>
      
      {isEditModalOpen && (
        <EditProfileModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          user={profile}
          onUpdate={handleEditSuccess}
        />
      )}
    </div>
  );
};

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: user.USERNAME || '',
    phone: user.PHONE || '',
  });
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(
    user.PROFILE_PICTURE 
      ? (user.PROFILE_PICTURE.startsWith('http') ? user.PROFILE_PICTURE : `http://localhost:5000${user.PROFILE_PICTURE}`) 
      : ''
  );
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('phone', formData.phone || '');
      if (profileFile) {
        data.append('profilePicture', profileFile);
      }

      const res = await userApi.updateProfile(data);
      onUpdate(res.data.user);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 transform scale-100 transition-all border border-blue-50/50 dark:border-gray-800">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Edit Profile</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Update your account information.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Username</label>
            <input 
              type="text" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-gray-800 dark:text-white font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Email</label>
            <p className="w-full px-6 py-4 rounded-2xl bg-gray-100 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold">
              {user.EMAIL}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
            <input 
              type="text" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-gray-800 dark:text-white font-bold"
              placeholder="e.g. +91 9876543210"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Profile Picture</label>
            <div className="flex items-center gap-4">
              {profilePreview && (
                <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-800 flex-shrink-0">
                  <img src={profilePreview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <label className="flex-1 flex flex-col items-center px-4 py-4 bg-gray-50 dark:bg-gray-950 text-gray-400 dark:text-gray-500 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-primary transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-1 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-bold text-sm">Upload photo</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 border-2 border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-4 px-6 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
