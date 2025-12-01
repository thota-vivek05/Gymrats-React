import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

// Import your existing Dashboard components
// Note: Assuming these components are now in the src/pages/User/components/ directory
import DashboardHero from './components/DashboardHero.jsx';
import OverviewCards from './components/OverviewCards.jsx';
import TodaysWorkout from './components/TodaysWorkout.jsx';
import ProgressTracking from './components/ProgressTracking.jsx';
import NutritionTracking from './components/NutritionTracking.jsx';
import UpcomingClass from './components/UpcomingClass.jsx';

// --- Reusable Tailwind Layout Components (Simplified for dashboard) ---

const Header = ({ onOpenNav, userName }) => (
    <div className="bg-gray-900 border-b border-gray-800 shadow-xl fixed top-0 w-full z-40">
        <header className="flex justify-between items-center max-w-7xl mx-auto p-4 sm:p-5">
            <Link to="/home" className="text-white text-2xl font-bold transition duration-300 hover:text-indigo-400">
                GymRats
            </Link>
            
            <div className="flex items-center space-x-4">
                <span className="text-gray-300 hidden sm:block">Welcome, <span className="font-semibold text-indigo-400">{userName}</span></span>
                <div className="cursor-pointer" onClick={onOpenNav}>
                    <i className="fas fa-bars text-indigo-400 text-2xl"></i>
                </div>
            </div>
        </header>
    </div>
);

const Footer = () => (
    <footer className="bg-gray-900 text-white p-4 text-center border-t border-gray-800">
        <p className="text-sm text-gray-600">GymRats Dashboard &copy; 2025</p>
    </footer>
);

// --- Dashboard Component ---

const UserDashboard = () => {
    // CRUCIAL: Retrieve authentication status and user details
    const { user, loading, logout, isAuthReady } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // 1. Authentication and Redirect Logic 
    useEffect(() => {
        // If authentication is ready but no user is found, force redirect to login.
        if (isAuthReady && !user && !loading) {
            console.log("Authentication failed. Redirecting to login.");
            navigate('/login');
        }
    }, [user, isAuthReady, loading, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/home');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);

    // 2. Render Loading State (If auth is loading OR auth is ready but user is null/not yet loaded)
    if (loading || !isAuthReady || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-500"></div>
                <p className="ml-4 text-white text-lg">Loading Dashboard...</p>
            </div>
        );
    }
    
    // User is guaranteed to exist here due to the checks above.
    const userName = user.displayName || user.email?.split('@')[0] || 'User';

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col">
            {/* Main Header */}
            <Header onOpenNav={openSidebar} userName={userName} />

            {/* Sidebar/Mobile Menu */}
            <div 
                className={`fixed top-0 right-0 h-full w-64 bg-gray-800 shadow-2xl transform transition-transform duration-300 z-50 p-6 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:static md:w-auto md:shadow-none md:bg-transparent`}
            >
                <button className="absolute top-4 right-4 text-white text-3xl hover:text-indigo-400 md:hidden" onClick={closeSidebar}>
                    &times;
                </button>
                <div className="flex flex-col space-y-6 pt-12 md:pt-0 text-white">
                    <h3 className="text-xl font-bold text-indigo-400">Navigation</h3>
                    <Link to="/userdashboard" onClick={closeSidebar} className="hover:text-indigo-400 transition">Dashboard</Link>
                    <Link to="/user/nutrition" onClick={closeSidebar} className="hover:text-indigo-400 transition">My Nutrition</Link>
                    <Link to="/user/exercises" onClick={closeSidebar} className="hover:text-indigo-400 transition">My Workouts</Link>
                    <Link to="/user/profile" onClick={closeSidebar} className="hover:text-indigo-400 transition">Profile Settings</Link>
                    
                    <button 
                        onClick={handleLogout} 
                        className="mt-8 bg-red-600 text-white p-2 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pt-24 pb-8">
                
                <DashboardHero userName={userName} />

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column (2/3 width on large screens) */}
                    <div className="lg:col-span-2 space-y-6">
                        <OverviewCards />
                        <TodaysWorkout />
                        <ProgressTracking />
                    </div>

                    {/* Right Column (1/3 width on large screens) */}
                    <div className="lg:col-span-1 space-y-6">
                        <NutritionTracking />
                        <UpcomingClass />
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default UserDashboard;