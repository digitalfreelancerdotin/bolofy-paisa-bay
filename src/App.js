import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './components/LandingPage';
import LoginPage from './components/Authentication/LoginPage';
import Chat from './components/Chat';
import FinancialCalendar from './components/FinancialCalendar';
import MyPoliciesPage from './components/MyPoliciesPage';

import { authUtils } from './components/utils/auth';

// Protected Route Component - only protects the route, doesn't redirect elsewhere
const ProtectedRoute = ({ children }) => {
  if (!authUtils.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Auth Route Component - only for login page, redirects to chat if logged in
const AuthRoute = ({ children }) => {
  if (authUtils.isAuthenticated()) {
    return <Navigate to="/chat" />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{ bottom: 40, right: 40 }}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#ffffff',
            padding: '16px',
            borderRadius: '10px',
            fontSize: '14px'
          },
          success: { style: { background: '#10B981' } },
          error: { style: { background: '#EF4444' } },
          loading: { style: { background: '#3B82F6' } }
        }}
      />
      
      <Routes>
        {/* Landing page - accessible to all */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<Chat />} />
        
        {/* Login page - redirects to chat if already logged in */}
        <Route path="/login" element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        } />
        
        

<Route path="/calendar" element={
          <ProtectedRoute>
            <FinancialCalendar />
          </ProtectedRoute>
        } />
<Route path="/policies" element={
          <ProtectedRoute>
            <MyPoliciesPage />
          </ProtectedRoute>
        } />

        {/* Catch all undefined routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;