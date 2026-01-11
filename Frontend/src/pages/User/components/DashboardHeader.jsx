import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const DashboardHeader = ({ user, currentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
        logout();
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
        <div className="flex-shrink-0">
          <Link
            to={getDashboardPath()}
            className="text-2xl font-bold text-[#8A2BE2] tracking-wider"
          >
            GymRats
          </Link>
        </div>

        {/* Desktop Menu */}
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

        <div className="hidden md:flex items-center">
          <div className="text-gray-300 hover:text-white cursor-pointer">
            <Link to="/userprofile">
              <span>{user?.full_name || "User"}</span>
            </Link>

            <button 
                 onClick={handleLogout}
                className="text-gray-300 hover:text-red-500 transition-colors font-medium border border-gray-700 hover:border-red-500 rounded px-4 py-1.5 text-sm"
                    >  Logout  </button>
          </div>
        </div>

        {/* Mobile Menu Icon */}
        <div
          className="md:hidden cursor-pointer p-2"
          onClick={() => setMobileMenuOpen(true)}
        >
          <img
            src="/userdashboard/menu.jpg"
            alt="Menu"
            className="h-6 w-auto invert"
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        <div
          className={`fixed inset-y-0 right-0 w-64 bg-[#111] z-50 transform transition-transform duration-300 ease-in-out shadow-2xl border-l border-gray-800 flex flex-col p-6 ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            className="self-end text-3xl text-gray-400 hover:text-white mb-8"
            onClick={() => setMobileMenuOpen(false)}
          >
            &times;
          </button>

          <div className="flex flex-col gap-6 text-lg">
            <Link
              to={getDashboardPath()}
              className={navLinkClasses("dashboard")}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/user_exercises"
              className="text-gray-300 hover:text-[#8A2BE2]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Exercises
            </Link>
            <Link
              to="/user_nutrition"
              className="text-gray-300 hover:text-[#8A2BE2]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Nutrition
            </Link>
            <div className="border-t border-gray-700 pt-6 mt-2">
              <Link
                to="/userprofile"
                className="text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{user?.full_name || "User"}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Backdrop for mobile menu */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </header>
    </div>
  );
};

export default DashboardHeader;
