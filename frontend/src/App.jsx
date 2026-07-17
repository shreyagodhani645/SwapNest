import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAutoLogout from './hooks/useAutoLogout';
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
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'admin') {
      return <Navigate to="/login" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  useAutoLogout();

  return (
    <div className="bg-background dark:bg-gray-950 min-h-screen selection:bg-primary/30 font-sans tracking-tight transition-colors duration-300">
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '1rem',
            background: '#333',
            color: '#fff',
            fontWeight: 'bold',
          },
        }}
        containerStyle={{
          bottom: 40,
          right: 20,
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/home" element={<Home />} />
        <Route path="/listings/create" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
        <Route path="/listings/edit/:id" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        
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
        
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  );
};

export default App;