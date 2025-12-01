import React from "react";
import Header from "../../../components/common/Header/Header";
import Footer from "../../../components/common/Footer/Footer";
const AboutPage = () => {
  return (
    <>
      <Header />

      <div className="max-w-[1200px] mx-auto px-12 py-12 text-white max-[1016px]:px-6">
        
        <h1 className="text-4xl font-bold text-[#8A2BE2] mb-6">About Us</h1>

        <div className="bg-[#111] p-6 rounded-xl border border-[#333] mb-10">
          <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
          <p className="text-[#ccc] leading-relaxed">
            GymRats exists to provide high-quality fitness guidance...
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#111] p-6 rounded-xl border border-[#333] text-center">
            <div className="w-28 h-28 bg-[#333] rounded-full mx-auto mb-4"></div>
            <h3 className="font-semibold">Alex Strong</h3>
            <p className="text-[#8A2BE2] text-sm">Head Coach</p>
          </div>

          <div className="bg-[#111] p-6 rounded-xl border border-[#333] text-center">
            <div className="w-28 h-28 bg-[#333] rounded-full mx-auto mb-4"></div>
            <h3 className="font-semibold">Jamie Lee</h3>
            <p className="text-[#8A2BE2] text-sm">Nutritionist</p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AboutPage;
