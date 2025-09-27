import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ChatBot } from './components/ChatBot.tsx';
import { Home } from './pages/Home';
import { Appointments } from './pages/Appointments';
import { Doctors } from './pages/Doctors';
import { Services } from './pages/Services';
import { ServiceDetail } from './pages/ServiceDetail';
import { Contact } from './pages/Contact';
import { Reports } from './pages/Reports';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { RoleBasedRoute } from './components/RoleBasedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import DoctorProfile from './pages/DoctorProfile';
import { PatientProfile } from './pages/PatientProfile';
import { DoctorAppointments } from './pages/DoctorAppointments';
import { DoctorPatients } from './pages/DoctorPatients';
import { DoctorReports } from './pages/DoctorReports';
import { AdminDoctors } from './pages/AdminDoctors';
import { AdminPatients } from './pages/AdminPatients';
import { AdminAppointments } from './pages/AdminAppointments';
import { AdminRecords } from './pages/AdminRecords';
import { AdminFeedback } from './pages/AdminFeedback';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  const isDoctorRoute = window.location.pathname.startsWith('/doctor-');
  const isAdminRoute = window.location.pathname.startsWith('/admin-');
  const isAuthRoute = window.location.pathname === '/login' || window.location.pathname === '/register';
  
  // Redirect authenticated users to their appropriate dashboard if they're on the home page
  React.useEffect(() => {
    if (isAuthenticated && user && window.location.pathname === '/') {
      if (user.role === 'admin') {
        window.location.href = '/admin-dashboard';
      } else if (user.role === 'doctor') {
        window.location.href = '/doctor-dashboard';
      }
      // Patients stay on home page
    }
  }, [isAuthenticated, user]);
  
  // Show patient navbar logic:
  // - Before login: show on all public routes (not auth routes)
  // - After login: show only for patients on patient routes (not doctor/admin routes)
  const showPatientNavbar = !isDoctorRoute && !isAdminRoute && !isAuthRoute && 
    (!isAuthenticated || (isAuthenticated && user?.role === 'patient'));
  
  return (
    <div className="min-h-screen bg-warm-bg relative">
      {showPatientNavbar && <Navbar />}
      <main className="w-full overflow-x-hidden">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    {user?.role === 'patient' ? <PatientProfile /> : <Profile />}
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor-profile"
                element={
                  <RoleBasedRoute allowedRoles={['doctor']} redirectTo="/">
                    <DoctorProfile />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/patient-profile"
                element={
                  <RoleBasedRoute allowedRoles={['patient']} redirectTo="/">
                    <PatientProfile />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <div>Dashboard (Protected Route)</div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor-dashboard"
                element={
                  <RoleBasedRoute allowedRoles={['doctor']} redirectTo="/">
                    <DoctorDashboard />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <RoleBasedRoute allowedRoles={['admin']} redirectTo="/">
                    <AdminDashboard />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/doctor-appointments"
                element={
                  <RoleBasedRoute allowedRoles={['doctor']} redirectTo="/">
                    <DoctorAppointments />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/doctor-patients"
                element={
                  <RoleBasedRoute allowedRoles={['doctor']} redirectTo="/">
                    <DoctorPatients />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/doctor-reports"
                element={
                  <RoleBasedRoute allowedRoles={['doctor']} redirectTo="/">
                    <DoctorReports />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/admin-doctors"
                element={
                  <RoleBasedRoute allowedRoles={['admin']} redirectTo="/">
                    <AdminDoctors />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/admin-patients"
                element={
                  <RoleBasedRoute allowedRoles={['admin']} redirectTo="/">
                    <AdminPatients />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/admin-appointments"
                element={
                  <RoleBasedRoute allowedRoles={['admin']} redirectTo="/">
                    <AdminAppointments />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/admin-records"
                element={
                  <RoleBasedRoute allowedRoles={['admin']} redirectTo="/">
                    <AdminRecords />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/admin-feedback"
                element={
                  <RoleBasedRoute allowedRoles={['admin']} redirectTo="/">
                    <AdminFeedback />
                  </RoleBasedRoute>
                }
              />
              <Route path="/" element={<Home />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:servicename" element={<ServiceDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        {/* ChatBot should appear on all pages */}
        <ChatBot />
        </div>
  );
};

export default App;