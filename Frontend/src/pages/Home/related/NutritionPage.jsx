import React from "react";
import Header from "../../../components/common/Header/Header";
import Footer from "../../../components/common/Footer/Footer";

const articles = [
  { title: "Protein Guide", excerpt: "Daily protein needs explained." },
  { title: "Meal Prep", excerpt: "Simple prep ideas anyone can follow." },
  { title: "Macros 101", excerpt: "Understanding carbs, fats, proteins." },
];

const NutritionPage = () => {
  return (
    <>
      <Header />

      <div className="max-w-[1200px] mx-auto px-12 py-12 text-white max-[1016px]:px-6">

        <h1 className="text-4xl font-bold text-[#8A2BE2] mb-6">Nutrition</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="md:col-span-2 space-y-6">
            {articles.map((a, i) => (
              <div key={i} className="bg-[#111] p-6 rounded-xl border border-[#333]">
                <h2 className="text-xl text-[#8A2BE2] font-semibold">{a.title}</h2>
                <p className="text-[#ccc] mt-2">{a.excerpt}</p>
                <button className="mt-4 bg-[#8A2BE2] hover:bg-[#7020a0] px-4 py-2 rounded-md">
                  Read More
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-[#111] p-5 rounded-xl border border-[#333]">
              <h3 className="text-lg font-semibold">Macronutrients</h3>
              <p className="text-[#ccc] text-sm mt-2">
                Quick breakdown of key nutrients.
              </p>
            </div>

            <div className="bg-[#111] p-5 rounded-xl border border-[#333]">
              <h3 className="text-lg font-semibold">Supplements</h3>
              <p className="text-[#ccc] text-sm mt-2">
                What works and what doesn't.
              </p>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default NutritionPage;
