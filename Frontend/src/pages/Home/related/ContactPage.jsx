import React, { useEffect } from "react"; // Added useEffect
import Header from "../../../components/common/Header/Header";
import Footer from "../../../components/common/Footer/Footer";

const ContactPage = () => {
  // Logic to load icons only for this page
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.id = "font-awesome-contact"; // Unique ID to track it
    document.head.appendChild(link);

    // Cleanup function: Removes the link when you leave the page
    return () => {
      const existingLink = document.getElementById("font-awesome-contact");
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
    };
  }, []);

  const contactMethods = [
    {
      title: "Our Location",
      info: ["IIIT Sricity Bh1 chittor District", "Andhra pradhesh"],
      icon: "fas fa-location-dot",
      color: "text-white-500",
    },
    {
      title: "Phone",
      info: ["+91 7013716285", "Mon-Fri: 8am - 8pm"],
      icon: "fas fa-phone-volume",
      color: "text-green-500",
    },
    {
      title: "Email",
      info: ["gymratsweb@gmail.com", "cheelaancesh@gmail.com"],
      icon: "fas fa-envelope-open-text",
      color: "text-blue-500",
    },
  ];

  const socialLinks = [
    { icon: 'facebook-f', url: '#', color: 'hover:text-[#1877F2]' },
    { icon: 'twitter', url: '#', color: 'hover:text-[#1DA1F2]' },
    { icon: 'instagram', url: '#', color: 'hover:text-[#E4405F]' },
    { icon: 'youtube', url: '#', color: 'hover:text-[#FF0000]' },
    { icon: 'linkedin-in', url: '#', color: 'hover:text-[#0A66C2]' },
  ];

  return (
    <>
      <Header />

      <div className="bg-[#111] py-20 text-center border-b border-[#333]">
        <h1 className="text-6xl font-extrabold text-[#8A2BE2] mb-6 tracking-tight">
          Join the Movement
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto px-4 leading-relaxed">
          GymRats is more than just a resource; it's a community dedicated to 
          empowering your fitness journey through expert guidance and science-backed information.
        </p>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-16 text-white">
        
        {/* Support Pillars */}
        <section className="mb-24 text-center">
          <h2 className="text-3xl font-bold mb-12">How Can We Help You?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-[#111] p-8 rounded-2xl border border-[#333] hover:border-[#8A2BE2] transition-colors group">
              <div className="text-[#8A2BE2] text-4xl mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-dumbbell"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Training Guidance</h3>
              <p className="text-gray-400">Need help understanding a specific exercise or progression path?</p>
            </div>
            <div className="bg-[#111] p-8 rounded-2xl border border-[#333] hover:border-[#8A2BE2] transition-colors group">
              <div className="text-[#8A2BE2] text-4xl mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-apple-whole"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Nutrition Clarity</h3>
              <p className="text-gray-400">Questions about macro splits or meal planning for your goals?</p>
            </div>
            <div className="bg-[#111] p-8 rounded-2xl border border-[#333] hover:border-[#8A2BE2] transition-colors group">
              <div className="text-[#8A2BE2] text-4xl mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-handshake"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Collaborations</h3>
              <p className="text-gray-400">Are you a trainer or nutritionist looking to contribute?</p>
            </div>
          </div>
        </section>

        {/* Contact Method Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          {contactMethods.map((method, idx) => (
            <div 
              key={idx} 
              className="bg-[#111] p-10 rounded-2xl border border-[#333] hover:border-[#8A2BE2] transition-all duration-300 text-center group shadow-xl"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1a1a1a] mb-6 group-hover:scale-110 transition-transform">
                <i className={`${method.icon} ${method.color} text-2xl`}></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">{method.title}</h3>
              {method.info.map((line, i) => (
                <p key={i} className="text-gray-400 leading-relaxed">{line}</p>
              ))}
            </div>
          ))}
        </div>

        {/* Social Links */}
        <section className="bg-gradient-to-r from-[#111] to-[#1a1a1a] p-12 rounded-3xl border border-[#333] text-center mb-24">
          <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
          <div className="flex justify-center flex-wrap gap-4 mt-8">
            {socialLinks.map((social) => (
              <a 
                key={social.icon} 
                href={social.url} 
                className={`w-14 h-14 bg-black flex items-center justify-center rounded-xl border border-[#333] hover:border-[#8A2BE2] ${social.color} transition-all duration-300 text-xl shadow-lg hover:-translate-y-1`}
              >
                <i className={`fab fa-${social.icon}`}></i>
              </a>
            ))}
          </div>
        </section>

        {/* Map Section */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center">Visit Our Headquarters</h2>
          <div className="relative group rounded-3xl overflow-hidden border border-[#333] shadow-2xl">
            <img
              src="/contact/map.webp"
              alt="Map Location"
              className="w-full h-[450px] object-cover group-hover:opacity-60 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm">
              <a 
                href="https://maps.google.com/?q=IIIT+Sricity" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#8A2BE2] px-10 py-4 rounded-xl font-bold text-white hover:bg-[#7020a0] transition-all transform hover:scale-105"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactPage;