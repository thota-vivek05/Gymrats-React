import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'; // or 'react-router' if using v7
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    // 1. Wait for AuthContext to check localStorage before making a decision
    if (loading) {
        return <div className="loading-screen">Loading...</div>; // Replace with your spinner
    }

    // 2. If no user is found, force redirect to appropriate login
    if (!user) {
        // Check if trying to access admin route - redirect to admin login
        if (window.location.pathname.startsWith('/admin')) {
            return <Navigate to="/admin/login" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    // 3. (Optional) Role-based access control
    // If the route requires specific roles (e.g., only 'admin') and user doesn't have it
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on user role
        if (user.role === 'trainer') {
            return <Navigate to="/trainer/dashboard" replace />;
        } else if (user.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else {
            return <Navigate to="/login" replace />;
        }
    }

    // 4. If all checks pass, render the child route (The Dashboard)
    return <Outlet />;
};

export default ProtectedRoute;