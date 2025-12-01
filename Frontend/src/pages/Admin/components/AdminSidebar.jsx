import { NavLink } from 'react-router-dom';
import styles from './AdminSidebar.module.css';

const AdminSidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Users', path: '/admin/users', icon: '👥' },
    { name: 'Trainers', path: '/admin/trainers', icon: '💪' },
      { name: 'Trainer Assignment', path: '/admin/trainer-assignment', icon: '🔗' },
    { name: 'Memberships', path: '/admin/memberships', icon: '💳' },
    { name: 'Exercises', path: '/admin/exercises', icon: '🏋️' },
    { name: 'Verify', path: '/admin/verifiers', icon: '✅' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.logo}>GymRats</h1>
        <p className={styles.subtitle}>Admin Portal</p>
      </div>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {menuItems.map((item) => (
            <li key={item.name} className={styles.navItem}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                <span className={styles.icon}>{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;