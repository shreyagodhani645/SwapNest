import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import MyListings from './pages/MyListings';
import EditListing from './pages/EditListing';
import Wishlist from './pages/Wishlist';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Router>
      <div className="bg-background min-h-screen selection:bg-primary/30 font-sans tracking-tight">
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '1rem',
              background: '#333',
              color: '#fff',
              fontWeight: 'bold',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/home" element={<Home />} />
          <Route path="/listings/create" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
          <Route path="/listings/edit/:id" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/profile/:userId" element={<Profile />} />
          
          <Route 
            path="/my-listings" 
            element={
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wishlist" 
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
