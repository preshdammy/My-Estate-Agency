import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import Navbar from './components/Layout/Navbar';

// Public Pages
import HomePage from './pages/Public/Home/HomePage';
import AboutPage from './pages/Public/About/AboutPage';
import ContactPage from './pages/Public/Contact/ContactPage';
import FAQPage from './pages/Public/FAQ/FAQPage';

// Auth Pages
import LoginPage from './Pages/Auth/Login/LoginPage';
import UserRegisterPage from './Pages/Auth/Register/userRegisterPage';
import AgentRegisterPage from './Pages/Auth/Register/agentRegisterPage';
import TestAPI from './Pages/testApi';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role } = useSelector((state) => state.auth);
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/user" element={<UserRegisterPage />} />
        <Route path="/register/agent" element={<AgentRegisterPage />} />
        <Route path="/register" element={<Navigate to="/register/user" replace />} />
        
        {/* Protected User Routes */}
        <Route 
          path="/user/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <div>User Dashboard (Coming Soon)</div>
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Agent Routes */}
        <Route 
          path="/agent/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <div>Agent Dashboard (Coming Soon)</div>
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Admin Dashboard (Coming Soon)</div>
            </ProtectedRoute>
          } 
        />

        <Route path="/test-api" element={<TestAPI />} />
        
        {/* 404 */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;