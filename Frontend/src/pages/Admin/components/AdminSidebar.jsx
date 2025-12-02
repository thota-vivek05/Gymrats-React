import { NavLink, useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Users', path: '/admin/users', icon: '👥' },
    { name: 'Trainers', path: '/admin/trainers', icon: '💪' },
    { name: 'Trainer Assignment', path: '/admin/trainer-assignment', icon: '🔗' },
    { name: 'Memberships', path: '/admin/memberships', icon: '💳' },
    { name: 'Exercises', path: '/admin/exercises', icon: '🏋️' },
    { name: 'Verify', path: '/admin/verifiers', icon: '✅' },
  ];

  const handleLogout = () => {
    // Clear any admin session/token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Redirect to home page
    navigate('/');
  };

  return (
    <aside
      className="
        fixed left-0 top-0 z-50 h-screen overflow-y-auto
        bg-black text-gray-100 font-sans
        border-r border-[#8A2BE2] shadow-[2px_0_8px_rgba(138,43,226,0.2)]
        transition-all duration-300
        /* Responsive Widths: Hidden < 480px, 64px (icon only) between 480px-768px, 256px > 768px */
        hidden w-16 min-[480px]:block md:w-64
        /* Scrollbar Styling using arbitrary variants */
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-[#1a1a1a]
        [&::-webkit-scrollbar-thumb]:bg-[#8A2BE2]
        [&::-webkit-scrollbar-thumb]:rounded
        hover:[&::-webkit-scrollbar-thumb]:bg-[#a040ff]
      "
    >
      {/* Header */}
      <div className="border-b border-[#8A2BE2] p-6 text-center md:text-left">
        <h1 className="mb-1 text-lg font-bold text-[#8A2BE2] md:text-2xl">
          GymRats
        </h1>
        <p className="mt-1 hidden text-xs text-gray-400 md:block">
          Admin Portal
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <ul className="m-0 list-none p-0">
          {menuItems.map((item) => (
            <li key={item.name} className="mb-2">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 md:px-6 transition-all duration-300 ease-in-out border-r-4 justify-center md:justify-start ${
                    isActive
                      ? 'bg-[#8A2BE2] text-white border-white font-semibold'
                      : 'text-gray-400 border-transparent hover:bg-[#1a1a1a] hover:text-gray-100 hover:border-[#8A2BE2]'
                  }`
                }
              >
                <span className="text-xl md:mr-3 md:text-lg">
                  {item.icon}
                </span>
                <span className="hidden md:block">
                  {item.name}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-[#8A2BE2] p-4">
        <button
          onClick={handleLogout}
          className="
            flex items-center justify-center md:justify-start w-full
            px-3 py-3 md:px-6
            text-gray-400 hover:text-white hover:bg-[#ff6b6b]/20
            transition-all duration-300 ease-in-out
            rounded border border-transparent hover:border-[#ff6b6b]
          "
        >
          <span className="text-xl md:mr-3 md:text-lg">
            🚪
          </span>
          <span className="hidden md:block font-semibold">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;