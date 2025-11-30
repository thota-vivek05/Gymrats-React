import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Users', path: '/admin/users', icon: '👥' },
    { name: 'Trainers', path: '/admin/trainers', icon: '💪' },
    { name: 'Memberships', path: '/admin/memberships', icon: '💳' },
    { name: 'Exercises', path: '/admin/exercises', icon: '🏋️' },
    { name: 'Verifiers', path: '/admin/verifiers', icon: '✅' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-red-500">GymRats</h1>
        <p className="text-xs text-gray-400 mt-1">Admin Portal</p>
      </div>
      <nav className="mt-6">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-2">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white border-r-4 border-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;