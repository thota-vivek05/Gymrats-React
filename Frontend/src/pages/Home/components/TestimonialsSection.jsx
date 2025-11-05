const TestimonialsSection = ({styles}) => {
  const testimonials = [
    {
      content: "The exercise guide at GymRats has been a game-changer for my fitness journey. The detailed instructions and videos helped me perfect my form, and I've seen incredible results in just 3 months!",
      author: {
        name: "John Mitchell",
        joinDate: "Member since 2024",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop"
      }
    },
    {
      content: "As someone who struggled with nutrition, the guidance I received from GymRats has been invaluable. The meal plans are easy to follow, and I finally understand how to eat to support my fitness goals.",
      author: {
        name: "Sarah Davis",
        joinDate: "Member since 2023",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop"
      }
    }
  ];

  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.sectionHeader}>
        <h2>Success Stories</h2>
        <p>Hear from our members who have transformed their lives with GymRats.</p>
      </div>

      <div className={styles.testimonialsContainer}>
        {testimonials.map((testimonial, index) => (
          <div key={index} className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <p>{testimonial.content}</p>
            </div>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAuthorImage}>
                <img src={testimonial.author.image} alt={testimonial.author.name} />
              </div>
              <div className={styles.testimonialAuthorInfo}>
                <h4>{testimonial.author.name}</h4>
                <p>{testimonial.author.joinDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;