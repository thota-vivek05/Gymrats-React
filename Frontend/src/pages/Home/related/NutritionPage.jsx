import React from "react";
import Header from "../../../components/common/Header/Header";
import Footer from "../../../components/common/Footer/Footer";

const NutritionPage = () => {
  const dietTypes = [
    {
      title: "Muscle Building",
      description: "A high-protein, calorie-surplus diet designed to maximize muscle growth while minimizing fat gain.",
      macros: { protein: "40%", carbs: "40%", fats: "20%" }
    },
    {
      title: "Fat Loss",
      description: "A moderate-protein, calorie-deficit diet focused on preserving muscle while promoting fat loss.",
      macros: { protein: "35%", carbs: "30%", fats: "35%" }
    },
    {
      title: "Performance",
      description: "A high-carbohydrate diet designed to fuel intense training sessions and optimize athletic performance.",
      macros: { protein: "25%", carbs: "55%", fats: "20%" }
    }
  ];

  const mealPlan = [
    { meal: "Breakfast", foods: "4 eggs, 1 cup oatmeal with berries, 1 tbsp honey", calories: 650, protein: "40g" },
    { meal: "Snack", foods: "Protein shake with 1 banana and 1 tbsp peanut butter", calories: 350, protein: "30g" },
    { meal: "Lunch", foods: "8oz chicken breast, 1 cup brown rice, 1 cup vegetables", calories: 700, protein: "60g" },
    { meal: "Pre-Workout", foods: "1 apple, 2 rice cakes with 1 tbsp honey", calories: 250, protein: "2g" },
    { meal: "Post-Workout", foods: "Protein shake with 2 cups milk", calories: 400, protein: "40g" },
    { meal: "Dinner", foods: "8oz salmon, 1 sweet potato, 2 cups mixed vegetables", calories: 650, protein: "45g" }
  ];

  const supplements = [
    {
      title: "Protein Powder",
      info: "A convenient way to increase protein intake, especially post-workout when nutrient timing is important for muscle recovery.",
      dosage: "1-2 scoops (25-50g) post-workout or as needed to meet daily protein goals."
    },
    {
      title: "Creatine Monohydrate",
      info: "One of the most researched supplements, creatine helps increase strength, power, and muscle mass when combined with resistance training.",
      dosage: "5g daily, with or without a loading phase."
    },
    {
      title: "Essential Fatty Acids",
      info: "Omega-3 fatty acids support recovery, reduce inflammation, and promote overall health and well-being.",
      dosage: "1-3g of combined EPA/DHA daily from fish oil or algae sources."
    }
  ];

  return (
    <>
      <Header />
      
      <div className="bg-[#111] py-16 text-center border-b border-[#333]">
        <h1 className="text-5xl font-bold text-[#8A2BE2] mb-4">Nutrition Guide</h1>
        <p className="text-xl text-gray-400">Optimize your fitness journey with proper nutrition tailored to your goals</p>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12 text-white">
        
        {/* Diet Types Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 border-b border-[#8A2BE2] pb-2 inline-block">Diet Types for Different Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dietTypes.map((diet, i) => (
              <div key={i} className="bg-[#111] p-6 rounded-xl border border-[#333] flex flex-col justify-between">
                <div>
                  <h3 className="text-xl text-[#8A2BE2] font-semibold mb-3">{diet.title}</h3>
                  <p className="text-gray-400 mb-6">{diet.description}</p>
                </div>
                <div className="flex justify-between bg-[#1a1a1a] p-4 rounded-lg">
                  <div className="text-center">
                    <span className="block text-lg font-bold text-[#8A2BE2]">{diet.macros.protein}</span>
                    <span className="text-xs uppercase text-gray-500">Protein</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-lg font-bold text-[#8A2BE2]">{diet.macros.carbs}</span>
                    <span className="text-xs uppercase text-gray-500">Carbs</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-lg font-bold text-[#8A2BE2]">{diet.macros.fats}</span>
                    <span className="text-xs uppercase text-gray-500">Fats</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Meal Plan Table */}
        <section className="mb-16 overflow-x-auto">
          <h2 className="text-3xl font-bold mb-4 border-b border-[#8A2BE2] pb-2 inline-block">Sample Muscle Building Meal Plan</h2>
          <p className="text-gray-400 mb-8">This sample meal plan provides approximately 3,000 calories with a focus on high-quality protein sources, complex carbohydrates, and healthy fats.</p>
          <table className="w-full text-left border-collapse bg-[#111] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#8A2BE2] text-white">
                <th className="p-4">Meal</th>
                <th className="p-4">Foods</th>
                <th className="p-4">Calories</th>
                <th className="p-4">Protein</th>
              </tr>
            </thead>
            <tbody>
              {mealPlan.map((row, i) => (
                <tr key={i} className="border-b border-[#333] hover:bg-[#1a1a1a] transition-colors">
                  <td className="p-4 font-semibold text-[#8A2BE2]">{row.meal}</td>
                  <td className="p-4 text-gray-300">{row.foods}</td>
                  <td className="p-4">{row.calories}</td>
                  <td className="p-4 text-[#8A2BE2] font-bold">{row.protein}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Supplements Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8 border-b border-[#8A2BE2] pb-2 inline-block">Recommended Supplements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supplements.map((sup, i) => (
              <div key={i} className="bg-[#111] p-6 rounded-xl border border-[#333]">
                <h3 className="text-xl text-[#8A2BE2] font-semibold mb-3">{sup.title}</h3>
                <p className="text-gray-400 mb-4">{sup.info}</p>
                <div className="text-sm border-t border-[#333] pt-4">
                  <strong className="text-white">Recommended Intake:</strong> 
                  <p className="text-[#8A2BE2] mt-1">{sup.dosage}</p>
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

export default NutritionPage;