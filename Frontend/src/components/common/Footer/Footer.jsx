import { Link } from 'react-router-dom';

const Footer = () => {
  // Shared classes to keep the JSX clean
  const linkClasses = "text-[#cccccc] no-underline text-[0.95rem] transition-colors duration-200 hover:text-[#8A2BE2]";
  const columnClasses = "flex-1 min-w-[200px] mr-[20px] mb-[20px] max-[1016px]:w-full max-[1016px]:mr-0 max-[1016px]:mb-[30px]";
  const headingClasses = "mb-[20px] text-[1.2rem] font-semibold text-white";

  return (
    <footer className="bg-[#0e0e0e] text-white pt-[60px] pb-10 px-5">
      <div className="max-w-[1200px] mx-auto flex justify-between flex-wrap max-[1016px]:flex-col max-[1016px]:px-5">
        
        {/* Column 1: GymRats */}
        <div className={columnClasses}>
          <h3 className={headingClasses}>GymRats</h3>
          <ul className="list-none p-0">
            <li className="mb-3"><Link to="/about" className={linkClasses}>About Us</Link></li>
            <li className="mb-3"><Link to="/trainers" className={linkClasses}>Our Trainers</Link></li>
            {/* <li className="mb-3"><Link to="/testimonial" className={linkClasses}>Testimonials</Link></li>
            <li className="mb-3"><Link to="/blog" className={linkClasses}>Blog</Link></li> */}
          </ul>
        </div>

        {/* Column 2: Resources */}
        <div className={columnClasses}>
          <h3 className={headingClasses}>Resources</h3>
          <ul className="list-none p-0">
            <li className="mb-3"><Link to="/isolation" className={linkClasses}>Exercise Guide</Link></li>
            <li className="mb-3"><Link to="/nutrition" className={linkClasses}>Nutrition Tips</Link></li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div className={columnClasses}>
          <h3 className={headingClasses}>Support</h3>
          <ul className="list-none p-0">
            <li className="mb-3"><Link to="/about" className={linkClasses}>About us</Link></li>
            <li className="mb-3"><Link to="/contact" className={linkClasses}>Contact Us</Link></li>
          </ul>
        </div>

        {/* Column 4: Connect With Us */}
        <div className={columnClasses}>
          <h3 className={headingClasses}>Connect With Us</h3>
          <ul className="list-none p-0">
            <li className="mb-3"><Link to="/signup/trainer" className={linkClasses}>Become a Trainer</Link></li>
          </ul>
          <p className="text-[0.9rem] text-[#999] mt-2.5">
            GymRats © 2025. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;