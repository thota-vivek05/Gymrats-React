import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const DashboardHeader = ({ user, currentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getDashboardPath = () => {
    return "/dashboard";
  };

  const navLinkClasses = (page) =>
    `text-gray-300 hover:text-[#8A2BE2] transition-colors ${
      currentPage === page ? "text-[#8A2BE2] font-semibold" : ""
    }`;

  return (
    <div className="bg-black/90 sticky top-0 z-40 border-b border-gray-800 backdrop-blur-sm">
      <header className="flex justify-between items-center h-16 px-5 max-w-7xl mx-auto">

        {/* Brand */}
        <div className="flex-shrink-0">
          <Link
            to={getDashboardPath()}
            className="text-2xl font-bold text-[#8A2BE2] tracking-wider"
          >
            GymRats
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex gap-8 items-center">
          <Link to={getDashboardPath()} className={navLinkClasses("dashboard")}>
            Home
          </Link>
          <Link to="/user_exercises" className={navLinkClasses("exercises")}>
            Exercises
          </Link>
          <Link to="/user_nutrition" className={navLinkClasses("nutrition")}>
            Nutrition
          </Link>
        </div>

        {/* Desktop: User Name + Logout */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/userprofile"
            className="text-gray-300 hover:text-[#8A2BE2] font-semibold transition-colors text-base"
          >
            {user?.full_name || 'User'}
          </Link>
          <button
            onClick={handleLogout}
            className="px-5 py-1.5 rounded-full border border-[#8A2BE2] text-[#8A2BE2] text-sm font-medium hover:bg-[#8A2BE2] hover:text-white transition-all duration-300 ease-in-out"
          >
            Logout
          </button>
        </div>

        {/* Mobile Hamburger Icon */}
        <div
          className="md:hidden cursor-pointer p-2 text-gray-300 hover:text-white"
          onClick={() => setMobileMenuOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
      </header>

      {/* Mobile Sidebar Overlay (backdrop) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-72 bg-[#111] z-50 transform transition-transform duration-300 ease-in-out shadow-2xl border-l border-gray-800 flex flex-col p-6 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          className="self-end text-3xl text-gray-400 hover:text-white mb-6 leading-none"
          onClick={() => setMobileMenuOpen(false)}
        >
          &times;
        </button>

        {/* Brand in Sidebar */}
        <Link
          to={getDashboardPath()}
          className="text-2xl font-bold text-[#8A2BE2] tracking-wider mb-8"
          onClick={() => setMobileMenuOpen(false)}
        >
          GymRats
        </Link>

        {/* Nav Links */}
        <div className="flex flex-col gap-5 text-lg flex-1">
          <Link
            to={getDashboardPath()}
            className={`${navLinkClasses("dashboard")} text-lg py-2 border-b border-gray-800`}
            onClick={() => setMobileMenuOpen(false)}
          >
            🏠 Home
          </Link>
          <Link
            to="/user_exercises"
            className={`${navLinkClasses("exercises")} text-lg py-2 border-b border-gray-800`}
            onClick={() => setMobileMenuOpen(false)}
          >
            🏋️ Exercises
          </Link>
          <Link
            to="/user_nutrition"
            className={`${navLinkClasses("nutrition")} text-lg py-2 border-b border-gray-800`}
            onClick={() => setMobileMenuOpen(false)}
          >
            🥗 Nutrition
          </Link>

          {/* Profile + Logout at bottom */}
          <div className="pt-4 mt-auto flex flex-col gap-4">
            <Link
              to="/userprofile"
              className="text-gray-300 hover:text-[#8A2BE2] transition-colors text-base font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              👤 {user?.full_name || "My Profile"}
            </Link>
            <button
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="text-left px-4 py-2 rounded-full border border-[#8A2BE2] text-[#8A2BE2] font-medium hover:bg-[#8A2BE2] hover:text-white transition-all duration-300 w-full text-center"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
