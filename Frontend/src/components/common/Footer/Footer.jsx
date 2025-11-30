import React from 'react';

const Footer = () => {
  // Shared classes to keep the JSX clean
  const linkClasses = "text-[#cccccc] no-underline text-[0.95rem] transition-colors duration-200 hover:text-[#8A2BE2]";
  const columnClasses = "flex-1 min-w-[200px] mr-[20px] mb-[20px] max-[1016px]:w-full max-[1016px]:mr-0 max-[1016px]:mb-[30px]";
  const headingClasses = "mb-[20px] text-[1.2rem] font-semibold text-white";

  return (
    <footer className="bg-[#0e0e0e] text-white pt-[60px] pb-[40px] px-[20px]">
      <div className="max-w-[1200px] mx-auto flex justify-between flex-wrap max-[1016px]:flex-col max-[1016px]:px-[20px]">
        
        {/* Column 1: GymRats */}
        <div className={columnClasses}>
          <h3 className={headingClasses}>GymRats</h3>
          <ul className="list-none p-0">
            <li className="mb-[12px]"><a href="/about" className={linkClasses}>About Us</a></li>
            <li className="mb-[12px]"><a href="/trainers" className={linkClasses}>Our Trainers</a></li>
            <li className="mb-[12px]"><a href="/testimonial" className={linkClasses}>Testimonials</a></li>
            <li className="mb-[12px]"><a href="/blog" className={linkClasses}>Blog</a></li>
          </ul>
        </div>

        {/* Column 2: Resources */}
        <div className={columnClasses}>
          <h3 className={headingClasses}>Resources</h3>
          <ul className="list-none p-0">
            <li className="mb-[12px]"><a href="/isolation" className={linkClasses}>Exercise Guide</a></li>
            <li className="mb-[12px]"><a href="/nutrition" className={linkClasses}>Nutrition Tips</a></li>
            <li className="mb-[12px]"><a href="/workout_plans" className={linkClasses}>Workout Plans</a></li>
            <li className="mb-[12px]"><a href="/calculators" className={linkClasses}>Calculators</a></li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div className={columnClasses}>
          <h3 className={headingClasses}>Support</h3>
          <ul className="list-none p-0">
            <li className="mb-[12px]"><a href="/contact" className={linkClasses}>Contact Us</a></li>
            <li className="mb-[12px]"><a href="/about" className={linkClasses}>About us</a></li>
            <li className="mb-[12px]"><a href="/terms" className={linkClasses}>Terms of Service</a></li>
            <li className="mb-[12px]"><a href="/privacy_policy" className={linkClasses}>Privacy Policy</a></li>
          </ul>
        </div>

        {/* Column 4: Connect With Us */}
        <div className={columnClasses}>
          <h3 className={headingClasses}>Connect With Us</h3>
          <ul className="list-none p-0">
            <li className="mb-[12px]"><a href="/signup/trainer" className={linkClasses}>Become a Trainer</a></li>
          </ul>

          <p className="text-[0.9rem] text-[#999] mt-[10px]">
            GymRats © 2025. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;