import React, { useState } from "react";
import Header from "../../../components/common/Header/Header";
import Footer from "../../../components/common/Footer/Footer";

// --- STATIC IMAGES (Reliable Pexels Links) ---
const categoryImages = {
  Chest: "https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg?auto=compress&cs=tinysrgb&w=800",
  Back: "https://images.pexels.com/photos/8810059/pexels-photo-8810059.jpeg?auto=compress&cs=tinysrgb&w=800",
  Legs: "https://images.pexels.com/photos/136404/pexels-photo-136404.jpeg?auto=compress&cs=tinysrgb&w=800",
  Shoulders: "https://images.pexels.com/photos/4720236/pexels-photo-4720236.jpeg?auto=compress&cs=tinysrgb&w=800",
  Arms: "https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=800",
  Core: "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=800",
  Cardio: "https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=800"
};

const categories = [
  "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"
];

const exercisesData = [
  // --- CHEST ---
  {
    id: "c1",
    name: "Push-Ups",
    category: "Chest",
    difficulty: "Beginner",
    target: "Pectorals, Triceps",
    instructions: "1. Start in a plank position.\n2. Lower chest to floor.\n3. Push back up.",
    image: "https://images.pexels.com/photos/176782/pexels-photo-176782.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Body Weight"
  },
  {
    id: "c2",
    name: "Bench Press",
    category: "Chest",
    difficulty: "Intermediate",
    target: "Pectorals, Triceps",
    instructions: "1. Lie on bench.\n2. Lower bar to chest.\n3. Press up.",
    image: "https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Barbell"
  },
  {
    id: "c3",
    name: "Incline Dumbbell Press",
    category: "Chest",
    difficulty: "Intermediate",
    target: "Upper Chest",
    instructions: "1. Set bench to 30°.\n2. Press dumbbells up.\n3. Lower with control.",
    image: "https://images.pexels.com/photos/6740056/pexels-photo-6740056.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Dumbbells"
  },
  {
    id: "c4",
    name: "Cable Crossovers",
    category: "Chest",
    difficulty: "Intermediate",
    target: "Inner Chest",
    instructions: "1. Pull handles across body.\n2. Squeeze chest.\n3. Return.",
    image: "https://images.pexels.com/photos/6455938/pexels-photo-6455938.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Cable Machine"
  },
  {
    id: "c5",
    name: "Chest Dips",
    category: "Chest",
    difficulty: "Advanced",
    target: "Lower Chest",
    instructions: "1. Lower body on dip bars.\n2. Push back up.",
    image: "https://images.pexels.com/photos/4720230/pexels-photo-4720230.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Dip Station"
  },

  // --- BACK ---
  {
    id: "b1",
    name: "Pull-Ups",
    category: "Back",
    difficulty: "Intermediate",
    target: "Lats",
    instructions: "1. Hang from bar.\n2. Pull chin over bar.\n3. Lower.",
    image: "https://images.pexels.com/photos/700446/pexels-photo-700446.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Pull-up Bar"
  },
  {
    id: "b2",
    name: "Deadlift",
    category: "Back",
    difficulty: "Advanced",
    target: "Posterior Chain",
    instructions: "1. Lift bar from ground extending hips.\n2. Stand tall.\n3. Lower.",
    image: "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Barbell"
  },
  {
    id: "b3",
    name: "Bent Over Rows",
    category: "Back",
    difficulty: "Intermediate",
    target: "Mid-Back",
    instructions: "1. Hinge at hips.\n2. Pull bar to waist.\n3. Lower.",
    image: "https://images.pexels.com/photos/4720231/pexels-photo-4720231.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Barbell"
  },
  {
    id: "b4",
    name: "Lat Pulldowns",
    category: "Back",
    difficulty: "Beginner",
    target: "Lats",
    instructions: "1. Pull bar down to chest.\n2. Return up slowly.",
    image: "https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Cable Machine"
  },
  {
    id: "b5",
    name: "Single-Arm Row",
    category: "Back",
    difficulty: "Beginner",
    target: "Lats",
    instructions: "1. Knee on bench.\n2. Pull dumbbell to hip.\n3. Lower.",
    image: "https://images.pexels.com/photos/949129/pexels-photo-949129.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Dumbbell"
  },

  // --- LEGS ---
  {
    id: "l1",
    name: "Barbell Squat",
    category: "Legs",
    difficulty: "Intermediate",
    target: "Quads, Glutes",
    instructions: "1. Bar on back.\n2. Squat down.\n3. Drive up.",
    image: "https://images.pexels.com/photos/136404/pexels-photo-136404.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Barbell"
  },
  {
    id: "l2",
    name: "Lunges",
    category: "Legs",
    difficulty: "Beginner",
    target: "Legs",
    instructions: "1. Step forward.\n2. Drop back knee.\n3. Push back.",
    image: "https://images.pexels.com/photos/3760867/pexels-photo-3760867.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Body Weight"
  },
  {
    id: "l3",
    name: "Leg Press",
    category: "Legs",
    difficulty: "Beginner",
    target: "Quads",
    instructions: "1. Push weight sled away.\n2. Lower slowly.",
    image: "https://images.pexels.com/photos/3775164/pexels-photo-3775164.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Machine"
  },
  {
    id: "l4",
    name: "Romanian Deadlift",
    category: "Legs",
    difficulty: "Intermediate",
    target: "Hamstrings",
    instructions: "1. Hinge hips back.\n2. Lower bar to shins.\n3. Stand up.",
    image: "https://images.pexels.com/photos/6551143/pexels-photo-6551143.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Barbell"
  },
  {
    id: "l5",
    name: "Calf Raises",
    category: "Legs",
    difficulty: "Beginner",
    target: "Calves",
    instructions: "1. Raise heels up.\n2. Lower down.",
    image: "https://images.pexels.com/photos/4327024/pexels-photo-4327024.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Step"
  },

  // --- SHOULDERS ---
  {
    id: "s1",
    name: "Overhead Press",
    category: "Shoulders",
    difficulty: "Intermediate",
    target: "Deltoids",
    instructions: "1. Press bar overhead.\n2. Lower to collarbone.",
    image: "https://images.pexels.com/photos/4720236/pexels-photo-4720236.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Barbell"
  },
  {
    id: "s2",
    name: "Lateral Raises",
    category: "Shoulders",
    difficulty: "Beginner",
    target: "Side Delts",
    instructions: "1. Raise arms to sides.\n2. Lower slowly.",
    image: "https://images.pexels.com/photos/791763/pexels-photo-791763.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Dumbbells"
  },
  {
    id: "s3",
    name: "Face Pulls",
    category: "Shoulders",
    difficulty: "Intermediate",
    target: "Rear Delts",
    instructions: "1. Pull rope to face.\n2. Squeeze rear shoulders.",
    image: "https://images.pexels.com/photos/700446/pexels-photo-700446.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Cable"
  },
  {
    id: "s4",
    name: "Arnold Press",
    category: "Shoulders",
    difficulty: "Intermediate",
    target: "Deltoids",
    instructions: "1. Press up twisting palms.\n2. Reverse down.",
    image: "https://images.pexels.com/photos/4720233/pexels-photo-4720233.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Dumbbells"
  },
  {
    id: "s5",
    name: "Front Raises",
    category: "Shoulders",
    difficulty: "Beginner",
    target: "Front Delts",
    instructions: "1. Raise weight forward.\n2. Lower.",
    image: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Dumbbells"
  },

  // --- ARMS ---
  {
    id: "a1",
    name: "Bicep Curls",
    category: "Arms",
    difficulty: "Beginner",
    target: "Biceps",
    instructions: "1. Curl weight up.\n2. Lower.",
    image: "https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Barbell"
  },
  {
    id: "a2",
    name: "Tricep Pushdowns",
    category: "Arms",
    difficulty: "Beginner",
    target: "Triceps",
    instructions: "1. Push cable down.\n2. Return to 90 degrees.",
    image: "https://images.pexels.com/photos/3760883/pexels-photo-3760883.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Cable"
  },
  {
    id: "a3",
    name: "Hammer Curls",
    category: "Arms",
    difficulty: "Beginner",
    target: "Brachialis",
    instructions: "1. Curl with palms inward.\n2. Lower.",
    image: "https://images.pexels.com/photos/6455823/pexels-photo-6455823.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Dumbbells"
  },
  {
    id: "a4",
    name: "Skull Crushers",
    category: "Arms",
    difficulty: "Intermediate",
    target: "Triceps",
    instructions: "1. Lower bar to forehead.\n2. Extend arms.",
    image: "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "EZ Bar"
  },
  {
    id: "a5",
    name: "Preacher Curls",
    category: "Arms",
    difficulty: "Beginner",
    target: "Biceps",
    instructions: "1. Curl on bench pad.\n2. Extend fully.",
    image: "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "EZ Bar"
  },

  // --- CORE ---
  {
    id: "cr1",
    name: "Plank",
    category: "Core",
    difficulty: "Beginner",
    target: "Abs",
    instructions: "1. Hold straight body position on forearms.",
    image: "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Body Weight"
  },
  {
    id: "cr2",
    name: "Leg Raises",
    category: "Core",
    difficulty: "Advanced",
    target: "Lower Abs",
    instructions: "1. Raise legs while hanging.\n2. Lower slowly.",
    image: "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Pull-up Bar"
  },
  {
    id: "cr3",
    name: "Russian Twists",
    category: "Core",
    difficulty: "Intermediate",
    target: "Obliques",
    instructions: "1. Twist torso side to side seated.",
    image: "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Body Weight"
  },
  {
    id: "cr4",
    name: "Woodchoppers",
    category: "Core",
    difficulty: "Intermediate",
    target: "Obliques",
    instructions: "1. Pull cable diagonally.",
    image: "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Cable"
  },
  {
    id: "cr5",
    name: "Ab Rollout",
    category: "Core",
    difficulty: "Advanced",
    target: "Core",
    instructions: "1. Roll wheel forward.\n2. Pull back.",
    image: "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Ab Wheel"
  },

  // --- CARDIO ---
  {
    id: "ca1",
    name: "Burpees",
    category: "Cardio",
    difficulty: "Intermediate",
    target: "Full Body",
    instructions: "1. Drop to floor.\n2. Jump up.",
    image: "https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Body Weight"
  },
  {
    id: "ca2",
    name: "Jump Rope",
    category: "Cardio",
    difficulty: "Beginner",
    target: "Cardio",
    instructions: "1. Jump continuously.",
    image: "https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Rope"
  },
  {
    id: "ca3",
    name: "Mountain Climbers",
    category: "Cardio",
    difficulty: "Beginner",
    target: "Core/Cardio",
    instructions: "1. Run knees to chest in plank.",
    image: "https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Body Weight"
  },
  {
    id: "ca4",
    name: "Box Jumps",
    category: "Cardio",
    difficulty: "Intermediate",
    target: "Legs",
    instructions: "1. Jump onto box.\n2. Step down.",
    image: "https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Box"
  },
  {
    id: "ca5",
    name: "Kettlebell Swings",
    category: "Cardio",
    difficulty: "Intermediate",
    target: "Posterior Chain",
    instructions: "1. Swing bell with hips.",
    image: "https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=800",
    equipment: "Kettlebell"
  }
];

// --- COMPONENT ---

const ExercisePage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Client-side Filtering
  const filteredExercises = exercisesData.filter((ex) => {
    // 1. Category Filter
    const matchesCategory = activeCategory === "All" || ex.category === activeCategory;
    
    // 2. Search Filter
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.target.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleCardClick = (exercise) => {
    setSelectedExercise(exercise);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setSelectedExercise(null);
  };

  return (
    <div className="min-h-screen bg-[#000] text-white flex flex-col font-sans">
      <Header />

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full pt-6 px-4 gap-6">
        
        {/* --- LEFT SIDEBAR (Desktop) --- */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-[#111] border border-[#333] rounded-lg p-4 sticky top-24">
                <h3 className="text-xl font-bold text-[#8A2BE2] mb-4 border-b border-[#333] pb-2">
                    Categories
                </h3>
                <ul className="space-y-1 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <li 
                        className={`cursor-pointer px-3 py-2 rounded-md transition-colors ${
                            activeCategory === "All" 
                            ? "bg-[#8A2BE2] text-white font-semibold" 
                            : "text-gray-300 hover:bg-[#222] hover:text-[#8A2BE2]"
                        }`}
                        onClick={() => setActiveCategory("All")}
                    >
                        All Exercises
                    </li>
                    {categories.map((cat) => (
                        <li
                            key={cat}
                            className={`cursor-pointer px-3 py-2 rounded-md transition-colors ${
                                activeCategory === cat 
                                ? "bg-[#8A2BE2] text-white font-semibold" 
                                : "text-gray-300 hover:bg-[#222] hover:text-[#8A2BE2]"
                            }`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 pb-12">
            
            {/* Conditional: Detail View OR Grid View */}
            {selectedExercise ? (
                // --- EXERCISE DETAIL VIEW ---
                <div className="bg-[#111] border border-[#333] rounded-xl p-6 lg:p-8 animate-fade-in">
                    <button 
                        onClick={handleBack}
                        className="mb-6 px-4 py-2 bg-[#222] hover:bg-[#333] text-gray-300 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        ← Back to Exercises
                    </button>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Image */}
                        <div className="w-full md:w-1/3">
                            <div className="aspect-square bg-[#222] rounded-lg border border-[#333] overflow-hidden">
                                <img 
                                    src={selectedExercise.image} 
                                    alt={selectedExercise.name} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Text Details */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">
                                        {selectedExercise.name}
                                    </h2>
                                    <span className="inline-block px-3 py-1 bg-[#8A2BE2] bg-opacity-20 text-[#8A2BE2] rounded-full text-sm font-medium border border-[#8A2BE2]">
                                        {selectedExercise.category}
                                    </span>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
                                    selectedExercise.difficulty === 'Beginner' ? 'bg-green-900/20 text-green-400 border-green-800' :
                                    selectedExercise.difficulty === 'Intermediate' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800' :
                                    'bg-red-900/20 text-red-400 border-red-800'
                                }`}>
                                    {selectedExercise.difficulty}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333]">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Target Muscles</p>
                                    <p className="font-medium text-white">{selectedExercise.target}</p>
                                </div>
                                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333]">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Equipment</p>
                                    <p className="font-medium text-white">{selectedExercise.equipment}</p>
                                </div>
                            </div>

                            <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#333]">
                                <h3 className="text-lg font-bold text-white mb-3">Instructions</h3>
                                <div className="space-y-2 text-gray-300 leading-relaxed whitespace-pre-line">
                                    {selectedExercise.instructions}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            ) : (
                // --- GRID VIEW ---
                <>
                    {/* Header & Search */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Isolation Exercises</h1>
                            <p className="text-gray-400 mt-1">Target specific muscle groups effectively</p>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:w-72">
                            <input
                                type="text"
                                placeholder="Search exercises..."
                                className="w-full bg-[#111] border border-[#333] text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:border-[#8A2BE2] transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
                        </div>
                    </div>

                    {/* Mobile Category Dropdown */}
                    <div className="lg:hidden mb-6">
                        <select 
                            className="w-full bg-[#111] border border-[#333] text-white p-3 rounded-lg focus:outline-none focus:border-[#8A2BE2]"
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Exercises Grid */}
                    {filteredExercises.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredExercises.map((exercise) => (
                                <div 
                                    key={exercise.id}
                                    onClick={() => handleCardClick(exercise)}
                                    className="bg-[#111] border border-[#333] rounded-xl overflow-hidden hover:border-[#8A2BE2] transition-all duration-300 cursor-pointer group flex flex-col h-full"
                                >
                                    {/* Card Image Area */}
                                    <div className="h-48 bg-[#222] relative overflow-hidden border-b border-[#333]">
                                        <img 
                                            src={exercise.image} 
                                            alt={exercise.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://placehold.co/600x400/111/8A2BE2?text=Image+Not+Found";
                                            }}
                                        />
                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-semibold text-[#8A2BE2] uppercase tracking-wider">
                                                {exercise.category}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                                exercise.difficulty === 'Beginner' ? 'text-green-400 border-green-800' :
                                                exercise.difficulty === 'Intermediate' ? 'text-yellow-400 border-yellow-800' :
                                                'text-red-400 border-red-800'
                                            }`}>
                                                {exercise.difficulty}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#8A2BE2] transition-colors">
                                            {exercise.name}
                                        </h3>
                                        
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
                                            {exercise.target}
                                        </p>
                                        
                                        <button className="w-full py-2 bg-[#222] text-sm text-gray-300 rounded hover:bg-[#333] transition-colors border border-[#333] group-hover:border-[#8A2BE2] group-hover:text-white">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500 bg-[#111] rounded-xl border border-[#333]">
                            <p className="text-xl">No exercises found.</p>
                            <p className="text-sm mt-2">Try adjusting your search or category filter.</p>
                        </div>
                    )}
                </>
            )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ExercisePage;