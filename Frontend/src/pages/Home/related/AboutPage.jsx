import React from "react";
import Header from "../../../components/common/Header/Header";
import Footer from "../../../components/common/Footer/Footer";

const AboutPage = () => {
  return (
    <>
      <Header />

      <div className="max-w-[1200px] mx-auto px-12 py-12 text-white max-[1016px]:px-6">

        {/* PAGE TITLE */}
        <h1 className="text-4xl font-bold text-[#8A2BE2] mb-10 text-center">
          About GymRats
        </h1>

        {/* STORY / MISSION */}
        <div className="bg-[#111] p-8 rounded-xl border border-[#333] shadow-lg mb-14">
          <h2 className="text-3xl font-semibold mb-6 text-center">Our Story</h2>
          <p className="text-[#ccc] leading-relaxed mb-4">
            Founded in 2020, GymRats began with a simple mission:
            to make quality fitness information accessible to everyone, regardless
            of experience level or background.
          </p>
          <p className="text-[#ccc] leading-relaxed mb-4">
            What started as a small blog sharing workout tips has evolved into a
            comprehensive platform offering detailed exercise guides, nutrition
            advice, and personalized training resources.
          </p>
          <p className="text-[#ccc] leading-relaxed mb-4">
            Our team of certified fitness professionals and nutritionists work
            tirelessly to create content that is both scientifically accurate and
            practically applicable in real-world settings.
          </p>
          <p className="text-[#ccc] leading-relaxed">
            Today, GymRats serves millions of fitness enthusiasts worldwide,
            helping them achieve their health and fitness goals through education
            and empowerment.
          </p>
        </div>

        {/* VALUES SECTION */}
        <h2 className="text-3xl font-semibold mb-8 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {[
            {
              title: "Science-Based Approach",
              desc: "Fitness backed by research — no fads, no gimmicks.",
            },
            {
              title: "Inclusivity",
              desc: "Fitness is for everyone — beginners to elite athletes.",
            },
            {
              title: "Education First",
              desc: "We teach proper form, technique & fitness principles.",
            },
            {
              title: "Holistic Wellness",
              desc: "Nutrition, recovery and mental well-being matter.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-[#111] p-6 text-center rounded-xl border border-[#333] hover:border-[#8A2BE2] transition"
            >
              <h3 className="font-semibold text-lg mb-2 text-[#8A2BE2]">{item.title}</h3>
              <p className="text-[#ccc] text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* TEAM SECTION */}
        <h2 className="text-3xl font-semibold mb-8 text-center">Meet Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-20">
          {[
            {
              name: "Alex Strong",
              role: "Head Coach & Strength Specialist",
            },
            {
              name: "Jamie Lee",
              role: "Certified Nutritionist & Wellness Expert",
            },
          ].map((person, index) => (
            <div
              key={index}
              className="bg-[#111] p-6 rounded-xl border border-[#333] text-center hover:border-[#8A2BE2] transition shadow"
            >
              <div className="w-28 h-28 bg-[#333] rounded-full mx-auto mb-4"></div>
              <h3 className="font-semibold text-lg">{person.name}</h3>
              <p className="text-[#8A2BE2] text-sm">{person.role}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AboutPage;
