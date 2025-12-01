import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Import Redux hook

const ProtectedRoute = ({ allowedRoles }) => {
    // Replace useAuth() with useSelector to get state from Redux
    const { user, loading } = useSelector((state) => state.auth);

    // 1. Wait for Redux to initialize (check localStorage)
    if (loading) {
        return <div className="loading-screen">Loading...</div>; 
    }

    // 2. If no user is found, force redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Role-based access control
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard if they don't have permission
        if (user.role === 'trainer') {
            return <Navigate to="/trainer" replace />;
        } else if (user.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // 4. If all checks pass, render the child route
    return <Outlet />;
};

export default ProtectedRoute;