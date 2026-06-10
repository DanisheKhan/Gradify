import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Spinner fullPage />;
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user profile is not fetched yet, wait
  if (!userProfile) {
    return <Spinner fullPage />;
  }

  // Check role authorizations
  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    // Redirect authorized users back to their default dashboard
    if (userProfile.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userProfile.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
