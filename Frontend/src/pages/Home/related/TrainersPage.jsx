import Header from "../../../components/common/Header/Header";
import Footer from "../../../components/common/Footer/Footer";

const TrainersPage = () => {
  const trainers = [
    {
      name: "Alex Strong",
      specialty: "Strength & Conditioning",
      bio: "Focuses on heavy lifting and functional strength for athletes.",
    },
    {
      name: "Jamie Lee",
      specialty: "Nutrition & Weight Loss",
      bio: "Expert in meal planning and metabolic health.",
    },
    {
      name: "Marcus Volt",
      specialty: "High-Intensity Interval Training (HIIT)",
      bio: "Specializes in explosive cardio and fat-burning workouts.",
    },
    {
      name: "Sarah Zen",
      specialty: "Yoga & Flexibility",
      bio: "Certified instructor focusing on recovery and mental well-being.",
    },
  ];

  return (
    <>
      <Header />
      <div className="max-w-[1200px] mx-auto px-12 py-12 text-white max-[1016px]:px-6 min-h-screen">
        {/* PAGE TITLE */}
        <h1 className="text-4xl font-bold text-[#8A2BE2] mb-10 text-center">
          Our Expert Trainers
        </h1>

        <p className="text-[#ccc] text-center max-w-2xl mx-auto mb-14 text-lg">
          Work with our world-class certified professionals to reach your fitness goals faster and safer.
        </p>

        {/* TRAINERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-20">
          {trainers.map((trainer, index) => (
            <div
              key={index}
              className="bg-[#111] p-8 rounded-xl border border-[#333] hover:border-[#8A2BE2] transition-all duration-300 shadow-lg flex flex-col items-center text-center"
            >
              <div className="w-32 h-32 bg-[#333] rounded-full mb-6 border-2 border-[#8A2BE2] flex items-center justify-center overflow-hidden">
                 {/* Placeholder for trainer image */}
                 <span className="text-[#8A2BE2] text-4xl font-bold">{trainer.name.charAt(0)}</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">{trainer.name}</h3>
              <p className="text-[#8A2BE2] font-medium mb-4">{trainer.specialty}</p>
              <p className="text-[#ccc] leading-relaxed">
                {trainer.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TrainersPage;