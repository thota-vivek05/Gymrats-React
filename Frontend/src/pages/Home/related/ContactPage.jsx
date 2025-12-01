import React, { useState } from "react";
import Header from "../../../components/common/Header/Header";
import Footer from "../../../components/common/Footer/Footer";

const ContactPage = () => {
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("Message sent!");
    setTimeout(() => setStatus(null), 2500);
  };

  return (
    <>
      <Header />

      <div className="max-w-[1200px] mx-auto px-12 py-12 text-white max-[1016px]:px-6">

        {/* Title */}
        <h1 className="text-4xl font-bold mb-6 text-[#8A2BE2]">Contact Us</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* FORM CARD */}
          <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
            <h2 className="text-2xl mb-4 font-semibold">Send a Message</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                placeholder="Full Name"
                required
                className="w-full bg-black border border-[#444] px-4 py-2 rounded-md"
              />

              <input
                type="email"
                placeholder="Email"
                required
                className="w-full bg-black border border-[#444] px-4 py-2 rounded-md"
              />

              <input
                placeholder="Subject"
                required
                className="w-full bg-black border border-[#444] px-4 py-2 rounded-md"
              />

              <textarea
                placeholder="Message"
                required
                className="w-full bg-black border border-[#444] px-4 py-2 rounded-md h-28"
              />

              <button
                type="submit"
                className="w-full bg-[#8A2BE2] hover:bg-[#7020a0] py-2 rounded-md font-medium"
              >
                Send Message
              </button>

              {status && <p className="text-[#4ade80] text-sm">{status}</p>}
            </form>
          </div>

          {/* INFO CARD */}
          <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
            <h2 className="text-2xl mb-4 font-semibold">Our Info</h2>

            <ul className="space-y-4">
              <li><strong>📍 Address:</strong> 123 Fitness Ave, Muscle City</li>
              <li><strong>📞 Phone:</strong> +1 (555) 123-4567</li>
              <li><strong>✉️ Email:</strong> support@gymrats.com</li>
              <li><strong>⏰ Hours:</strong> Mon-Fri, 9 AM - 5 PM</li>
            </ul>

            <img
              src="https://placehold.co/600x300/000/8A2BE2?text=GymRats+Location"
              alt="map"
              className="rounded-md mt-6 border border-[#222]"
            />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactPage;
