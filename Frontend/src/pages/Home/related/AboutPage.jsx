import React from "react";
import Header from "../../../components/common/Header/Header";
import Footer from "../../../components/common/Footer/Footer";

const AboutPage = () => {
  // Data mapped from about.ejs
  const values = [
    {
      title: "Science-Based Approach",
      icon: "fas fa-check-circle",
      desc: "We believe in fitness information backed by scientific research and proven methodologies. No fads, no gimmicks—just evidence-based practices.",
    },
    {
      title: "Inclusivity",
      icon: "fas fa-users",
      desc: "Fitness is for everyone. We create content that addresses the needs of individuals at all levels, from beginners to advanced athletes.",
    },
    {
      title: "Education First",
      icon: "fas fa-lightbulb",
      desc: "We prioritize teaching proper form, technique, and principles to empower you with knowledge that lasts a lifetime.",
    },
    {
      title: "Holistic Wellness",
      icon: "fas fa-heart",
      desc: "We recognize that fitness extends beyond the gym. Nutrition, recovery, and mental well-being are integral parts of the journey.",
    },
  ];

  const services = [
    {
      title: "Personalized Workout Plans",
      icon: "fas fa-dumbbell",
      desc: "Access detailed exercise guides with proper form instructions, targeted muscle groups, and progression paths tailored to your fitness level.",
    },
    {
      title: "Nutrition Guidance",
      icon: "fas fa-apple-alt",
      desc: "Discover meal plans, nutritional information, and dietary advice to complement your workout routine and maximize your results.",
    },
    {
      title: "Community Support",
      icon: "fas fa-users",
      desc: "Join our community of fitness enthusiasts to share experiences, get motivation, and celebrate achievements on your fitness journey.",
    },
    {
      title: "Educational Resources",
      icon: "fas fa-book",
      desc: "Access our extensive library of articles, videos, and guides covering everything from exercise techniques to recovery strategies.",
    },
  ];

  return (
    <>
      <Header />

      {/* Welcome Banner */}
      <div className="bg-[#111] py-16 text-center border-b border-[#333]">
        <h1 className="text-5xl font-bold text-[#8A2BE2] mb-4">About GymRats</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto px-4">
          Dedicated to empowering individuals on their fitness journey with expert guidance and comprehensive resources.
        </p>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12 text-white">
        
        {/* Our Story Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-xl overflow-hidden border border-[#333] shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1975&auto=format&fit=crop" 
                alt="GymRats Founding"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold border-b-2 border-[#8A2BE2] pb-2 inline-block">Our Story</h2>
              <p className="text-[#ccc] leading-relaxed text-lg">
                Founded in 2020, GymRats began with a simple mission: to make quality fitness information accessible to everyone, regardless of experience level or background.
              </p>
              <p className="text-[#ccc] leading-relaxed text-lg">
                What started as a small blog sharing workout tips has evolved into a comprehensive platform offering detailed exercise guides, nutrition advice, and personalized training resources.
              </p>
              <p className="text-[#ccc] leading-relaxed text-lg">
                Our team of certified fitness professionals and nutritionists work tirelessly to create content that is both scientifically accurate and practically applicable in real-world settings.
              </p>
              <p className="text-[#ccc] leading-relaxed text-lg">
                Today, GymRats serves millions of fitness enthusiasts worldwide, helping them achieve their health and fitness goals through education and empowerment.
              </p>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              At GymRats, our core values guide everything we do. They reflect our commitment to providing exceptional fitness resources and fostering a supportive community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((item, index) => (
              <div
                key={index}
                className="bg-[#111] p-8 text-center rounded-xl border border-[#333] hover:border-[#8A2BE2] transition-all duration-300 shadow-lg group"
              >
                <i className={`${item.icon} text-4xl text-[#8A2BE2] mb-6 group-hover:scale-110 transition-transform`}></i>
                <h3 className="font-bold text-xl mb-4">{item.title}</h3>
                <p className="text-[#ccc] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Services Section */}
        <section className="mb-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              At GymRats, we offer a comprehensive range of fitness services designed to help you achieve your health and wellness goals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-[#111] p-8 rounded-xl border border-[#333] flex items-start space-x-6 hover:bg-[#161616] transition-colors shadow-lg"
              >
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <i className={`${service.icon} text-3xl text-[#8A2BE2]`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">{service.title}</h3>
                  <p className="text-[#ccc] leading-relaxed">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default AboutPage;