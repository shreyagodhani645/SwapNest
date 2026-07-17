import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { offersApi } from '../api/offers';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [sentOffers, setSentOffers] = useState([]);
    const [loadingOffers, setLoadingOffers] = useState(true);

    useEffect(() => {
        const handleUserUpdate = () => {
            setUser(JSON.parse(localStorage.getItem('user')));
        };
        window.addEventListener('userProfileUpdate', handleUserUpdate);
        return () => window.removeEventListener('userProfileUpdate', handleUserUpdate);
    }, []);

    useEffect(() => {
        fetchSentOffers();
    }, []);

    const fetchSentOffers = async () => {
        try {
            const res = await offersApi.getMySentOffers();
            setSentOffers(res.data);
        } catch (err) {
            console.error('Error fetching sent offers:', err);
        } finally {
            setLoadingOffers(false);
        }
    };

    return (
        <div className="min-h-screen bg-background dark:bg-gray-950 transition-colors duration-300">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-premium dark:shadow-none p-12 border border-blue-50/50 dark:border-gray-800 transition-colors duration-300">
                    <div className="flex flex-col md:flex-row items-center gap-10 mb-16 pb-12 border-b border-gray-100 dark:border-gray-800">
                        <div className="h-32 w-32 bg-primary rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-primary/30 border-8 border-primary-light dark:border-gray-800 overflow-hidden">
                            {user?.PROFILE_PICTURE ? (
                                <img src={user.PROFILE_PICTURE.startsWith('http') ? user.PROFILE_PICTURE : `${API_BASE_URL}${user.PROFILE_PICTURE}`} alt={user.username} className="h-full w-full object-cover" />
                            ) : (
                                user?.username?.[0]?.toUpperCase() || '?'
                            )}
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                Hello, {user?.username}!
                            </h1>
                            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">Manage your SwapNest account and listings.</p>
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-primary/5 dark:bg-primary/10 rounded-[2rem] p-8 border border-primary/10 dark:border-primary/20">
                            <h2 className="text-xs font-black text-primary dark:text-primary-light uppercase tracking-widest mb-6">Profile Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-black mb-1">Username</p>
                                    <p className="text-xl text-gray-800 dark:text-gray-200 font-bold">{user?.username || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-black mb-1">Email Address</p>
                                    <p className="text-xl text-gray-800 dark:text-gray-200 font-bold">{user?.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-black mb-1">Phone</p>
                                    <p className="text-xl text-gray-800 dark:text-gray-200 font-bold">{user?.phone || 'Not set'}</p>
                                </div>
                                <button 
                                    onClick={() => navigate(`/profile/${user.id}`)}
                                    className="w-full py-4 bg-white dark:bg-gray-950 text-primary dark:text-primary-light border-2 border-primary/20 dark:border-primary/40 hover:border-primary dark:hover:border-primary font-black rounded-2xl transition-all shadow-sm"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div 
                                onClick={() => navigate('/listings/create')}
                                className="bg-white dark:bg-gray-950 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center group hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-pointer shadow-sm hover:shadow-premium dark:hover:shadow-none"
                            >
                                <div className="h-16 w-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Create Listing</h3>
                                <p className="text-gray-500 dark:text-gray-400">Add a new item to the market.</p>
                            </div>

                            <div 
                                onClick={() => navigate('/my-listings')}
                                className="bg-white dark:bg-gray-950 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center group hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-pointer shadow-sm hover:shadow-premium dark:hover:shadow-none"
                            >
                                <div className="h-16 w-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">My Listings</h3>
                                <p className="text-gray-500 dark:text-gray-400">Manage your active posts.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sent Offers Section */}
                <div className="mt-12 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-premium dark:shadow-none p-10 border border-blue-50/50 dark:border-gray-800 transition-colors duration-300">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">My Sent Offers</h2>
                    
                    {loadingOffers ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                        </div>
                    ) : sentOffers.length === 0 ? (
                        <p className="text-gray-400 dark:text-gray-500 font-medium italic py-6 text-center">You haven't sent any offers yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {sentOffers.map(offer => (
                                <div key={offer.ID} className="bg-gray-50 dark:bg-gray-950 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800 dark:text-white text-lg">{offer.LISTING_TITLE}</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mt-1">
                                            Seller: {offer.SELLER_NAME} &bull; Listed at ₹{offer.LISTING_PRICE?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-2xl font-black text-primary">₹{offer.AMOUNT?.toLocaleString()}</p>
                                        <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                                            offer.STATUS === 'accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                            offer.STATUS === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                        }`}>
                                            {offer.STATUS}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
