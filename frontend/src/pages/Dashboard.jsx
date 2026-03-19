import React from 'react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-[2.5rem] shadow-premium p-12 border border-blue-50/50">
                    <div className="flex flex-col md:flex-row items-center gap-10 mb-16 pb-12 border-b border-gray-100">
                        <div className="h-32 w-32 bg-primary rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-primary/30 border-8 border-primary-light">
                            {user?.username[0].toUpperCase()}
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tight">
                                Hello, {user?.username}!
                            </h1>
                            <p className="text-xl text-gray-500 font-medium">Manage your SwapNest account and listings.</p>
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10">
                            <h2 className="text-xs font-black text-primary uppercase tracking-widest mb-6">Profile Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-gray-400 font-black mb-1">Username</p>
                                    <p className="text-xl text-gray-800 font-bold">{user?.username || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-gray-400 font-black mb-1">Email Address</p>
                                    <p className="text-xl text-gray-800 font-bold">{user?.email || 'N/A'}</p>
                                </div>
                                <button className="w-full py-4 bg-white text-primary border-2 border-primary/20 hover:border-primary font-black rounded-2xl transition-all">
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center text-center group hover:bg-primary/5 transition-all cursor-pointer shadow-sm hover:shadow-premium">
                                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Create Listing</h3>
                                <p className="text-gray-500">Add a new item to the market.</p>
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center text-center group hover:bg-primary/5 transition-all cursor-pointer shadow-sm hover:shadow-premium">
                                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">My Listings</h3>
                                <p className="text-gray-500">Manage your active posts.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
