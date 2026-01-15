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

    // 2. If no user is found, force redirect to appropriate login
    if (!user) {
        // Check if trying to access admin route - redirect to admin login
        if (window.location.pathname.startsWith('/admin')) {
            return <Navigate to="/admin/login" replace />;
        }
        return <Navigate to="/login" replace />;
    }

<<<<<<< HEAD
    // 3. (Optional) Role-based access control
    // If the route requires specific roles (e.g., only 'admin') and user doesn't have it
=======
    // 3. Role-based access control
>>>>>>> rahul-final
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