import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import useAuthStore from './store/authStore';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Patient pages
import PatientDashboard from './pages/patient/Dashboard';
import BrowseDoctors from './pages/patient/BrowseDoctors';
import DoctorProfile from './pages/patient/DoctorProfile';
import BookAppointment from './pages/patient/BookAppointment';
import PatientAppointments from './pages/patient/Appointments';
import Chat from './pages/patient/Chat';
import Prescriptions from './pages/patient/Prescriptions';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import CreateDoctor from './pages/admin/CreateDoctor';
import AdminAppointments from './pages/admin/Appointments';

// Protected route wrapper
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
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/doctors" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageDoctors />
            </ProtectedRoute>
          } />
          <Route path="/admin/doctors/create" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CreateDoctor />
            </ProtectedRoute>
          } />
          <Route path="/admin/appointments" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAppointments />
            </ProtectedRoute>
          } />

          {/* Patient routes */}
          <Route path="/patient/dashboard" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient/doctors" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <BrowseDoctors />
            </ProtectedRoute>
          } />
          <Route path="/patient/doctors/:id" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <DoctorProfile />
            </ProtectedRoute>
          } />
          <Route path="/patient/book/:doctorId" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <BookAppointment />
            </ProtectedRoute>
          } />
          <Route path="/patient/appointments" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientAppointments />
            </ProtectedRoute>
          } />
          <Route path="/patient/chat/:appointmentId" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/patient/prescriptions" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Prescriptions />
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<div className="text-center mt-20 text-2xl">404 - Page Not Found</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
