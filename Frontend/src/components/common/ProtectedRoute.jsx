import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'; // or 'react-router' if using v7
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    // 1. Wait for AuthContext to check localStorage before making a decision
    if (loading) {
        return <div className="loading-screen">Loading...</div>; // Replace with your spinner
    }

    // 2. If no user is found, force redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. (Optional) Role-based access control
    // If the route requires specific roles (e.g., only 'trainer') and user doesn't have it
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard or an unauthorized page
        return <Navigate to={user.role === 'trainer' ? '/trainer/dashboard' : '/dashboard'} replace />;
    }

    // 4. If all checks pass, render the child route (The Dashboard)
    return <Outlet />;
};

export default ProtectedRoute;