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
import UserDashboard from './Pages/User/Dashboard/userDashboard';
import BrowseProperties from './Pages/User/Properties/browseProperties';
import PropertyDetails from './Pages/User/Properties/PropertyDetails';
import MyBookings from './Pages/User/Bookings/myBookings';
import BookingDetails from './Pages/User/Bookings/bookingDetails';
import MyInspections from './Pages/User/Inspections/requestInspections';
import SubmitReport from './Pages/User/Reports/submitReports';
import UserProfile from './Pages/User/Dashboard/userProfile';
import MyReports from './Pages/User/Reports/myReports';
import ReportDetails from './Pages/User/Reports/reportDetails';
import AgentDashboard from './Pages/Agent/Dashboard/agentDashboard';
import AddProperty from './Pages/Agent/Properties/addProperty';
import AgentProperties from './Pages/Agent/Properties/agentProperty';
import EditProperty from './Pages/Agent/Properties/editProperty';
import AdminDashboard from './Pages/Admin/Dashboard/adminDashboard';
import ManageInspections from './Pages/Agent/Inspections/manageInspections';
import ManageBookings from './Pages/Agent/Bookings/manageBookings';
import ManageReports from './Pages/Agent/Reports/manageReports';
import InspectionDetails from './Pages/Agent/Inspections/inspectionDetails';

        // Add this route in your protected agent routes section


// Auth Pages
import LoginPage from './Pages/Auth/Login/LoginPage';
import UserRegisterPage from './Pages/Auth/Register/userRegisterPage';
import AgentRegisterPage from './Pages/Auth/Register/agentRegisterPage';

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
        <Route path="/properties" element={<BrowseProperties />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        
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
              <UserDashboard />
            </ProtectedRoute>
          } 
        /> 

        <Route path="/user/bookings" element={
          <ProtectedRoute allowedRoles={['user']}>
            <MyBookings />
          </ProtectedRoute>
        } />
        
        <Route path="/user/bookings/:id" element={
          <ProtectedRoute allowedRoles={['user']}>
            <BookingDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/user/inspections" element={
          <ProtectedRoute allowedRoles={['user']}>
            <MyInspections />
          </ProtectedRoute>
        } />

        <Route path="/user/reports" element={
          <ProtectedRoute allowedRoles={['user']}>
            <MyReports />
          </ProtectedRoute>
        } />
        
        <Route path="/user/reports/new" element={
          <ProtectedRoute allowedRoles={['user']}>
            <SubmitReport />
          </ProtectedRoute>
        } />

        <Route path="/user/reports/:id" element={
          <ProtectedRoute allowedRoles={['user']}>
            <ReportDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/user/profile" element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserProfile />
          </ProtectedRoute>
        } /> 
        
        {/* Protected Agent Routes */}
       <Route path="/agent/dashboard" element={
        <ProtectedRoute allowedRoles={['agent']}>
          <AgentDashboard />
        </ProtectedRoute>
      } />

      <Route path="/agent/properties/add" element={
        <ProtectedRoute allowedRoles={['agent']}>
          <AddProperty />
        </ProtectedRoute>
      } />

    
        <Route path="/agent/properties" element={
          <ProtectedRoute allowedRoles={['agent']}>
            <AgentProperties />
          </ProtectedRoute>
        } />

        <Route path="/agent/properties/edit/:id" element={
          <ProtectedRoute allowedRoles={['agent']}>
            <EditProperty />
          </ProtectedRoute>
        } />

        <Route path="/agent/inspections" element={
          <ProtectedRoute allowedRoles={['agent']}>
            <ManageInspections />
          </ProtectedRoute>
        } />

        <Route path="/agent/inspections/:id" element={
          <ProtectedRoute allowedRoles={['agent']}>
            <InspectionDetails />
          </ProtectedRoute>
        } />

        <Route path="/agent/bookings" element={
          <ProtectedRoute allowedRoles={['agent']}>
            <ManageBookings />
          </ProtectedRoute>
        } />

        <Route path="/agent/reports" element={
          <ProtectedRoute allowedRoles={['agent']}>
            <ManageReports />
          </ProtectedRoute>
        } />
        
        {/* Protected Admin Routes */}
       <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

               
        {/* 404 */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;