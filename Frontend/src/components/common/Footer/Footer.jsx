import styles from './Footer.module.css';
// import {link} from 'react-router-dom';

const Footer = () => {
  return (
    <footer className={styles['site-footer']}>
      <div className={styles['footer-content']}>
        <div className={styles['footer-column']}>
          <h3>GymRats</h3>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/trainers">Our Trainers</a></li>
            <li><a href="/testimonial">Testimonials</a></li>
            <li><a href="/blog">Blog</a></li>
          </ul>
        </div>

        <div className={styles['footer-column']}>
          <h3>Resources</h3>
          <ul>
            <li><a href="/isolation">Exercise Guide</a></li>
            <li><a href="/nutrition">Nutrition Tips</a></li>
            <li><a href="/workout_plans">Workout Plans</a></li>
            <li><a href="/calculators">Calculators</a></li>
          </ul>
        </div>

        <div className={styles['footer-column']}>
          <h3>Support</h3>
          <ul>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/about">About us</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/privacy_policy">Privacy Policy</a></li>
          </ul>
        </div>

        <div className={styles['footer-column']}>
          <h3>Connect With Us</h3>
          <ul>
            <li><a href="/trainer_form">Become a Trainer</a></li>
          </ul>

          <p className={styles.copyright}>GymRats © 2025. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;