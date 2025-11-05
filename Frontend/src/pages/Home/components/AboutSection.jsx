const AboutSection = ({styles}) => {
  return (
    <section className={`${styles.aboutSection} ${styles.autoshow}`}>
      <div className={styles.aboutImage}>
        <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e" alt="About GymRats" />
      </div>

      <div className={styles.aboutContent}>
        <h2>About Us</h2>
        <p>Welcome to GymRats, your ultimate destination for fitness enthusiasts! Our mission is to empower you to achieve your best self through state-of-the-art gym facilities, personalized training programs, and a vibrant community. Whether you're a beginner or a seasoned athlete, we have the perfect plan tailored for you. Join us and transform your fitness journey with expert trainers, modern equipment, and a supportive atmosphere.</p>
      </div>
    </section>
  );
};

export default AboutSection;