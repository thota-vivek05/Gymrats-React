import React from "react";
import Header from "../../../components/common/Header/Header";
import Footer from "../../../components/common/Footer/Footer";
const exercises = [
  { title: "Barbell Squat", desc: "Lower body strength" },
  { title: "Bench Press", desc: "Chest + triceps" },
  { title: "Deadlift", desc: "Full posterior chain" },
  { title: "Pull-up", desc: "Back & biceps" },
  { title: "OHP", desc: "Shoulders" },
  { title: "RDL", desc: "Hamstrings & glutes" },
];

const ExercisePage = () => {
  return (
    <>
      <Header />

      <div className="max-w-[1200px] mx-auto px-12 py-12 text-white max-[1016px]:px-6">

        <h1 className="text-4xl font-bold text-[#8A2BE2] mb-6">Exercises</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((ex, index) => (
            <div
              key={index}
              className="bg-[#111] p-4 rounded-xl border border-[#333]"
            >
              <div className="h-36 bg-[#222] rounded-md mb-3" />
              <h3 className="text-lg font-semibold">{ex.title}</h3>
              <p className="text-[#ccc] text-sm mt-1">{ex.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ExercisePage;
