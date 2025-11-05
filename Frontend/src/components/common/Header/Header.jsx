import styles from './Header.module.css';

const Header = () => {
  const handleMenuToggle = () => {
    // Mobile menu toggle logic will go here
    console.log('Menu toggle clicked');
  };

  return (
    <div className={styles['mainNavbar']}>
      <header className={styles.headerTag}>
        {/* Header Branding */}
        <div className={styles['brandLogo']}>
          <a href="/home" className={styles['brandName']}>GymRats</a>
        </div>

        <div className={styles['navMenu']}>
          <a href="/home">Home</a>
          <a href="/isolation">Exercises</a>
          <a href="/nutrition">Nutrition</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>

        <div className={styles['rightContainer']}>
          
          <div className={styles['loginButton']}>
            <a href="/auth">Login / Signup</a>
          </div>
        </div>

        <div className={styles['mobileMenuIcon']} id="menuIcon" onClick={handleMenuToggle}>
          <img src="/home/menu.jpg" alt="Menu" height="25px" />
        </div>

        <div className={styles['mobileSidebar']} id="sideNavbar">
          <a href="#" onClick={(e) => e.preventDefault()} className={styles['closeButton']} id="closeBtn">&times;</a>
          <a href="/home">Home</a>
          <a href="/isolation">Exercises</a>
          <a href="/nutrition">Nutrition</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/auth">Login / Signup</a>
        </div>
      </header>
    </div>
  );
};

export default Header;