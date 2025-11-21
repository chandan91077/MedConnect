import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import useAuthStore from './store/authStore';

import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="App min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Patient Routes - To be implemented */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold mb-4">Patient Dashboard</h1>
                      <p className="text-gray-600">Coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Doctor Routes - To be implemented */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold mb-4">Doctor Dashboard</h1>
                      <p className="text-gray-600">Coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/doctor/onboarding"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold mb-4">Doctor Onboarding</h1>
                      <p className="text-gray-600">Complete your profile to start accepting patients</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes - To be implemented */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
                      <p className="text-gray-600">Coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Doctors List - Public */}
            <Route
              path="/doctors"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Browse Doctors</h1>
                    <p className="text-gray-600">Coming soon...</p>
                  </div>
                </div>
              }
            />
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;