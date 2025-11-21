import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DashboardHeader = ({ user, currentPage }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getDashboardPath = () => {
        if (!user?.membershipType) return '/userdashboard_b';
        return `/userdashboard_${user.membershipType.charAt(0).toLowerCase()}`;
    };

    return (
        <div className="main-navbar">
            <header>
                <div className="brand-logo">
                    <Link to={getDashboardPath()} className="brand-name">GymRats</Link>
                </div>

                <div className="nav-menu">
                    <Link 
                        to={getDashboardPath()} 
                        className={currentPage === 'dashboard' ? 'active' : ''}
                    >
                        Home
                    </Link>
                    <Link to="/user_exercises">Exercises</Link>
                    <Link to="/user_nutrition">Nutrition</Link>
                </div>

                <div className="right-container">
                    <div className="user-profile">
                        <Link to="/userprofile">
                            <span>{user?.full_name || 'User'}</span>
                        </Link>
                    </div>
                </div>

                <div 
                    className="mobile-menu-icon" 
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <img src="/userdashboard/menu.jpg" alt="Menu" height="25px" />
                </div>

                <div className={`mobile-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                    <button 
                        className="close-button" 
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        &times;
                    </button>
                    <Link 
                        to={getDashboardPath()} 
                        className={currentPage === 'dashboard' ? 'active' : ''}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link to="/user_exercises" onClick={() => setMobileMenuOpen(false)}>
                        Exercises
                    </Link>
                    <Link to="/user_nutrition" onClick={() => setMobileMenuOpen(false)}>
                        Nutrition
                    </Link>
                    <div className="sidebar-profile">
                        <Link to="/userprofile" onClick={() => setMobileMenuOpen(false)}>
                            <span>{user?.full_name || 'User'}</span>
                        </Link>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default DashboardHeader;