import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Users", path: "/admin/users", icon: "👥" },
    { name: "Trainers", path: "/admin/trainers", icon: "💪" },
    { name: "Trainer Assignment", path: "/admin/trainer-assignment", icon: "🔗" },
    { name: "Memberships", path: "/admin/memberships", icon: "💳" },
    { name: "Exercises", path: "/admin/exercises", icon: "🏋️" },
    { name: "Verify", path: "/admin/verifiers", icon: "✅" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-5 py-3 transition-all duration-200 border-r-4 ${
      isActive
        ? "bg-[#8A2BE2] text-white border-white font-semibold"
        : "text-gray-400 border-transparent hover:bg-[#1a1a1a] hover:text-gray-100 hover:border-[#8A2BE2]"
    }`;

  const SidebarContent = ({ onClose }) => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="border-b border-[#8A2BE2] px-5 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#8A2BE2]">GymRats</h1>
          <p className="text-xs text-gray-400 mt-0.5">Admin Portal</p>
        </div>
        {/* Close button visible only on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none md:hidden"
          >
            &times;
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 overflow-y-auto">
        <ul className="list-none p-0 m-0">
          {menuItems.map((item) => (
            <li key={item.name} className="mb-1">
              <NavLink
                to={item.path}
                className={linkClass}
                onClick={onClose}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-[#8A2BE2] p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-5 py-3 text-gray-400 hover:text-white hover:bg-[#ff6b6b]/20 rounded transition-all duration-200 border border-transparent hover:border-[#ff6b6b]"
        >
          <span className="text-lg flex-shrink-0">🚪</span>
          <span className="text-sm font-semibold whitespace-nowrap">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile Hamburger Button (shown below md) ── */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#8A2BE2] text-white p-2 rounded-lg shadow-lg"
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Mobile Backdrop ── */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Mobile Slide-in Sidebar ── */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-[#8A2BE2] shadow-2xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onClose={() => setIsOpen(false)} />
      </aside>

      {/* ── Desktop Sidebar (always visible ≥ md) ── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-black border-r border-[#8A2BE2] shadow-[2px_0_8px_rgba(138,43,226,0.2)] z-40 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#1a1a1a] [&::-webkit-scrollbar-thumb]:bg-[#8A2BE2] [&::-webkit-scrollbar-thumb]:rounded">
        <SidebarContent onClose={null} />
      </aside>
    </>
  );
};

export default AdminSidebar;
