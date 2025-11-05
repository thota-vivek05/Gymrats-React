const ServicesSection = ({styles}) => {
  const handleExploreServices = () => {
    window.open('/about', '_self');
  };

  const services = [
    {
      image: "https://img.icons8.com/ios/250/8A2BE2/dumbbell.png",
      title: "Personal Training",
      description: "Our personal training services offer expert guidance tailored to your fitness level. From initial assessments to customized workout plans, we ensure your progress is our top priority."
    },
    {
      image: "https://img.icons8.com/ios/250/8A2BE2/yoga.png",
      title: "Muscle Isolation",
      description: "Learn proper form and technique for effective isolation exercises that target specific muscle groups for maximum definition and growth."
    },
    {
      image: "https://img.icons8.com/ios/250/8A2BE2/salad.png",
      title: "Nutrition Consultation",
      description: "Our nutrition experts offer personalized dietary advice to complement your workout routine and help you achieve optimal health and performance."
    }
  ];

  return (
    <section className={`${styles.servicesSection} ${styles.autoshow}`}>
      <h1>Our Gym Services</h1>
      <div className={styles.servicesContainer}>
        {services.map((service, index) => (
          <div key={index} className={styles.serviceCard}>
            <img src={service.image} className={styles.serviceImage} alt={service.title} />
            <h2>{service.title}</h2>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
      <button onClick={handleExploreServices}>Explore Services</button>
    </section>
  );
};

export default ServicesSection;