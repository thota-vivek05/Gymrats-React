const MembershipSection = ({styles}) => {
  const plans = [
    {
      name: "Basic Plan",
      price: "₹299",
      description: "Perfect for beginners",
      features: [
        { text: "Access to Exercise Guide", included: true },
        { text: "Basic Workout Plans", included: true },
        { text: "Nutritional Tips", included: true },
        { text: "Current Stats Tracking", included: false },
        { text: "Online Classes", included: false },
        { text: "Personal Training Sessions", included: false }
      ],
      popular: false
    },
    {
      name: "Gold Plan",
      price: "₹599",
      description: "For dedicated fitness enthusiasts",
      features: [
        { text: "Access to Exercise Guide", included: true },
        { text: "Advanced Workout Plans", included: true },
        { text: "Detailed Nutritional Guidance", included: true },
        { text: "Current Stats Tracking", included: true },
        { text: "Online Classes", included: false },
        { text: "Personal Training Sessions", included: false }
      ],
      popular: true
    },
    {
      name: "Platinum Plan",
      price: "₹999",
      description: "The ultimate fitness experience",
      features: [
        { text: "Access to Exercise Guide", included: true },
        { text: "Premium Workout Plans", included: true },
        { text: "Comprehensive Nutrition Guidance", included: true },
        { text: "Current Stats Tracking with Goals", included: true },
        { text: "Online Classes", included: true },
        { text: "Personal Training Sessions", included: true }
      ],
      popular: false
    }
  ];

  return (
    <section className={styles.membershipSection} id="membership">
      <div className={styles.sectionHeader}>
        <h2>Membership Plans</h2>
        <p>Choose the plan that fits your lifestyle and fitness goals. All plans include access to our comprehensive exercise guide.</p>
      </div>

      <div className={styles.planCards}>
        {plans.map((plan, index) => (
          <div key={index} className={styles.planCard}>
            {plan.popular && <div className={styles.planPopular}>Popular</div>}
            <div className={styles.planHeader}>
              <h3>{plan.name}</h3>
              <div className={styles.planPrice}>{plan.price}<span>/month</span></div>
              <p>{plan.description}</p>
            </div>
            <div className={styles.planFeatures}>
              <ul>
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className={feature.included ? styles.included : styles.excluded}>
                    {feature.text}
                  </li>
                ))}
              </ul>
              <a href="/auth/?form=signup" className={styles.btn}>Get Started</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MembershipSection;