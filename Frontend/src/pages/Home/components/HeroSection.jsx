const HeroSection = ({styles}) => {
  const handleGetStarted = () => {
    window.open('#membership', '_self');
  };

  return (
    <section className={styles.heroSection}>
      <div className={`${styles.heroContent} ${styles.startAnimation}`}>
        <div className={styles.heroText}>
          <h1>Transform Your Body,<br /> Transform Your Life</h1>
          <p>Join GymRats today and get access to expert-designed workout plans, nutritional guidance, and a supportive community.</p>
          <button onClick={handleGetStarted}>Get Started</button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;