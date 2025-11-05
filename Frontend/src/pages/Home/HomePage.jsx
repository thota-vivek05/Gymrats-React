import styles from './HomePage.module.css';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import MembershipSection from './components/MembershipSection';
import TestimonialsSection from './components/TestimonialsSection';
import AboutSection from './components/AboutSection';

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <Header />
      <HeroSection styles={styles} />
      <ServicesSection styles={styles} />
      <MembershipSection styles={styles} />
      <TestimonialsSection styles={styles} />
      <AboutSection styles={styles} />
      <Footer />
    </div>
  );
};

export default HomePage;

// what to do next 
// take each component from HomePage and seperate the css OR
// keep the css in the HomePage.module.css file and check how it works
// also the header and footer section should be used from the common components folder as it is not showing on login page