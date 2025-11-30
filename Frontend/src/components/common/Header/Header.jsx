import React, { useState } from 'react';

const Header = () => {
  // State to manage the mobile menu toggle
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="m-0 bg-black border-b border-[#333]">
      {/* headerTag equivalent 
         Responsive padding: px-[3rem] normally, px-[1.5rem] below 1016px 
      */}
      <header className="flex justify-between items-center py-[0.8rem] px-[3rem] max-w-[1200px] mx-auto max-[1016px]:px-[1.5rem]">
        
        {/* Branding */}
        <div className="text-[#f1f1f1] font-bold transition-all duration-300 ease-in-out hover:scale-110 max-[600px]:mr-auto">
          <a href="/home" className="no-underline text-[#f1f1f1] text-[1.5rem] font-medium">
            GymRats
          </a>
        </div>

        {/* Nav Menu */}
        {/* Hidden at max-width 1016px */}
        <div className="flex gap-[2rem] max-[1016px]:hidden">
          {['Home', 'Exercises', 'Nutrition', 'About', 'Contact'].map((item, index) => {
            const href = item === 'Home' ? '/home' : `/${item.toLowerCase()}`;
            return (
              <a 
                key={index} 
                href={href} 
                className="cursor-pointer relative transition-all duration-100 ease-in-out no-underline text-[#f1f1f1] text-[1rem] font-medium hover:text-[#8A2BE2]"
              >
                {item}
              </a>
            );
          })}
        </div>

        {/* Right Container (Login) */}
        {/* Auto margin-left below 1016px, Hidden below 600px */}
        <div className="flex items-center gap-[1rem] max-[1016px]:ml-auto max-[600px]:hidden">
          <div className="loginButton">
            <a 
              href="/login" 
              className="bg-[#8A2BE2] px-4 py-2 rounded-[30px] text-[0.9rem] font-medium transition-all duration-300 ease-in-out hover:bg-[#7020a0] no-underline text-[#f1f1f1]"
            >
              Login / Signup
            </a>
          </div>
        </div>

        {/* Mobile Menu Icon */}
        {/* Hidden by default, Block display below 1016px */}
        <div 
          className="hidden cursor-pointer max-[1016px]:block max-[1016px]:ml-[1rem]" 
          id="menuIcon" 
          onClick={handleMenuToggle}
        >
          <img src="/home/menu.jpg" alt="Menu" height="25px" className="h-[25px]" />
        </div>

        {/* Mobile Sidebar */}
        {/* Width transitions between 0 and 250px based on state */}
        <div 
          className={`fixed z-[1000] top-0 left-0 bg-[#8A2BE2] overflow-x-hidden transition-all duration-500 pt-[60px] h-full ${
            isMobileMenuOpen ? 'w-[250px]' : 'w-0'
          }`}
          id="sideNavbar"
        >
          {/* Close Button */}
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleMenuToggle(); }} 
            className="absolute top-0 right-[25px] text-[36px] ml-[50px] no-underline text-white block transition-all duration-300"
            id="closeBtn"
          >
            &times;
          </a>

          {/* Sidebar Links */}
          {['Home', 'Exercises', 'Nutrition', 'About', 'Contact', 'Login / Signup'].map((item, index) => {
             const href = item === 'Home' ? '/home' : item === 'Login / Signup' ? '/login' : `/${item.toLowerCase()}`;
             return (
               <a 
                 key={index}
                 href={href} 
                 className="px-[15px] py-[10px] no-underline text-[1.2rem] text-white block transition-all duration-300"
               >
                 {item}
               </a>
             )
          })}
        </div>
      </header>
    </div>
  );
};

export default Header;