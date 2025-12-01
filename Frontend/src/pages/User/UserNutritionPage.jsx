import React, { useState} from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

// Static Placeholder Data for the User
const staticNutritionData = {
    dailyGoals: {
        calories: 2500,
        protein: 180,
        carbs: 250,
        fat: 80,
    },
    today: {
        calories: 1950,
        protein: 150,
        carbs: 200,
        fat: 60,
    },
    planDetails: {
        name: "Muscle Gain Phase 1",
        trainer: "Jane Doe (Trainer ID: TRN-9382)",
        lastUpdated: "2025-11-28",
    },
    mealPlan: [
        { time: "Breakfast (7:00 AM)", meal: "Oats with protein powder and berries", macros: "450 Cal / P: 35 / C: 50 / F: 12" },
        { time: "Lunch (1:00 PM)", meal: "Chicken breast, brown rice, and steamed broccoli", macros: "650 Cal / P: 55 / C: 60 / F: 18" },
        { time: "Dinner (7:30 PM)", meal: "Salmon with sweet potato and asparagus", macros: "700 Cal / P: 50 / C: 45 / F: 30" },
        { time: "Snacks", meal: "Protein shake (Post-Workout) and apple", macros: "250 Cal / P: 40 / C: 35 / F: 0" },
    ]
};

// --- Reusable Tailwind Layout Components ---
// Note: These are duplicated for independence. In a real app, import them once.

const Header = ({ onOpenNav }) => (
    <div className="bg-gray-900 border-b border-gray-800 shadow-xl fixed top-0 w-full z-40">
        <header className="flex justify-between items-center max-w-7xl mx-auto p-4 sm:p-5">
            <Link to="/home" className="text-white text-2xl font-bold transition duration-300 hover:text-indigo-400">
                GymRats
            </Link>
            
            <div className="hidden lg:flex space-x-8 text-gray-300 font-medium">
                <Link to="/home" className="hover:text-indigo-400 transition">Home</Link>
                <Link to="/exercises" className="hover:text-indigo-400 transition">Exercises</Link>
                <Link to="/nutrition" className="hover:text-indigo-400 transition">Nutrition</Link>
                <Link to="/about" className="hover:text-indigo-400 transition">About</Link>
                <Link to="/contact" className="hover:text-indigo-400 transition">Contact</Link>
            </div>

            <div className="lg:hidden cursor-pointer" onClick={onOpenNav}>
                <i className="fas fa-bars text-indigo-400 text-2xl"></i>
            </div>
        </header>
    </div>
);

const Footer = () => (
    <footer className="bg-gray-900 text-white pt-12 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className>
                    <h3 className="text-xl font-semibold mb-4 text-indigo-400">GymRats</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><Link to="/about" className="hover:text-indigo-400 transition">About Us</Link></li>
                        <li><Link to="/trainers" className="hover:text-indigo-400 transition">Our Trainers</Link></li>
                        <li><Link to="/testimonial" className="hover:text-indigo-400 transition">Testimonials</Link></li>
                        <li><Link to="/blog" className="hover:text-indigo-400 transition">Blog</Link></li>
                    </ul>
                </div>
                <div className>
                    <h3 className="text-xl font-semibold mb-4 text-indigo-400">Resources</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><Link to="/exercises" className="hover:text-indigo-400 transition">Exercise Guide</Link></li>
                        <li><Link to="/nutrition" className="hover:text-indigo-400 transition">Nutrition Tips</Link></li>
                        <li><Link to="/workout_plans" className="hover:text-indigo-400 transition">Workout Plans</Link></li>
                        <li><Link to="/calculators" className="hover:text-indigo-400 transition">Calculators</Link></li>
                    </ul>
                </div>
                <div className>
                    <h3 className="text-xl font-semibold mb-4 text-indigo-400">Support</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><Link to="/contact" className="hover:text-indigo-400 transition">Contact Us</Link></li>
                        <li><Link to="/about" className="hover:text-indigo-400 transition">About us</Link></li>
                        <li><Link to="/terms" className="hover:text-indigo-400 transition">Terms of Service</Link></li>
                        <li><Link to="/privacy_policy" className="hover:text-indigo-400 transition">Privacy Policy</Link></li>
                    </ul>
                </div>
                <div className>
                    <h3 className="text-xl font-semibold mb-4 text-indigo-400">Connect</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><Link to="/trainer_form" className="hover:text-indigo-400 transition">Become a Trainer</Link></li>
                        <li><Link to="/contact" className="hover:text-indigo-400 transition">Contact Us</Link></li>
                    </ul>
                </div>
            </div>
            <div className="mt-10 text-center text-gray-600 border-t border-gray-800 pt-6">
                <p className="text-sm">GymRats &copy; 2025. All rights reserved.</p>
            </div>
        </div>
    </footer>
);
// --- End of Reusable Tailwind Layout Components ---

// Helper function for progress bar width
const getProgress = (current, goal) => {
    return Math.min(100, Math.round((current / goal) * 100));
};

const MacroGoalProgress = ({ name, unit, current, goal, color }) => {
    const progress = getProgress(current, goal);
    const progressColor = progress >= 100 ? 'bg-green-500' : color;
    const textColor = progress >= 100 ? 'text-green-400' : 'text-white';
    
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium">{name}</span>
                <span className={`text-sm font-bold ${textColor}`}>
                    {current} {unit} / {goal} {unit}
                </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                    className={`h-3 rounded-full transition-all duration-700 ${progressColor}`} 
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                ></div>
            </div>
        </div>
    );
};


const UserNutritionPage = () => {
    const { user } = useAuth(); // Assuming useAuth provides the user object
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    const openNav = () => setIsMobileNavOpen(true);
    const closeNav = () => setIsMobileNavOpen(false);

    // Placeholder data calculation for the summary cards
    const { dailyGoals, today, planDetails, mealPlan } = staticNutritionData;

    const remainingMacros = {
        calories: dailyGoals.calories - today.calories,
        protein: dailyGoals.protein - today.protein,
        carbs: dailyGoals.carbs - today.carbs,
        fat: dailyGoals.fat - today.fat,
    };
    
    // Safety check for user details display
    const userName = user?.displayName || user?.email?.split('@')[0] || 'GymRat';

    const MacroSummaryCard = ({ title, value, unit, icon, color }) => (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md flex items-center space-x-4">
            <div className={`p-3 rounded-full ${color} text-white text-xl`}>
                <i className={icon}></i>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-400">{title}</p>
                <h3 className="text-2xl font-bold text-white">{value}<span className="text-base font-normal text-gray-400 ml-1">{unit}</span></h3>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-900 min-h-screen pt-20 flex flex-col">
            <Header onOpenNav={openNav} />

            {/* Side Navigation for Mobile */}
            <div 
                className={`fixed top-0 right-0 h-full w-64 bg-gray-900 shadow-2xl transform transition-transform duration-300 z-50 p-6 ${isMobileNavOpen ? 'translate-x-0' : 'translate-x-full'} lg:hidden`}
            >
                <button className="absolute top-4 right-4 text-white text-3xl hover:text-indigo-400" onClick={closeNav}>
                    &times;
                </button>
                <div className="flex flex-col space-y-6 pt-12 text-white">
                    <Link to="/home" onClick={closeNav} className="hover:text-indigo-400">Home</Link>
                    <Link to="/userdashboard" onClick={closeNav} className="hover:text-indigo-400">Dashboard</Link>
                    <Link to="/user/nutrition" onClick={closeNav} className="hover:text-indigo-400">Nutrition Plan</Link>
                    {/* Add other user navigation links here */}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow py-8">
                
                {/* Dashboard Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-white mb-2">Welcome Back, {userName}</h1>
                    <p className="text-xl text-indigo-400 font-medium">Your Daily Nutrition Tracker</p>
                </div>

                {/* Macro Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MacroSummaryCard 
                        title="Calories Consumed" 
                        value={today.calories} 
                        unit="Cal" 
                        icon="fas fa-fire" 
                        color="bg-red-600" 
                    />
                    <MacroSummaryCard 
                        title="Protein Intake" 
                        value={today.protein} 
                        unit="g" 
                        icon="fas fa-dumbbell" 
                        color="bg-indigo-600" 
                    />
                    <MacroSummaryCard 
                        title="Carbs Intake" 
                        value={today.carbs} 
                        unit="g" 
                        icon="fas fa-bread-slice" 
                        color="bg-yellow-600" 
                    />
                    <MacroSummaryCard 
                        title="Fat Intake" 
                        value={today.fat} 
                        unit="g" 
                        icon="fas fa-cheese" 
                        color="bg-green-600" 
                    />
                </div>

                {/* Progress and Plan Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    
                    {/* Daily Progress Section (2/3 width) */}
                    <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-indigo-900/50 shadow-lg space-y-6">
                        <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-3 mb-4">Daily Macro Progress</h2>
                        
                        <MacroGoalProgress 
                            name="Calories" 
                            unit="Cal" 
                            current={today.calories} 
                            goal={dailyGoals.calories} 
                            color="bg-red-500" 
                        />
                        <MacroGoalProgress 
                            name="Protein" 
                            unit="g" 
                            current={today.protein} 
                            goal={dailyGoals.protein} 
                            color="bg-indigo-500" 
                        />
                        <MacroGoalProgress 
                            name="Carbohydrates" 
                            unit="g" 
                            current={today.carbs} 
                            goal={dailyGoals.carbs} 
                            color="bg-yellow-500" 
                        />
                        <MacroGoalProgress 
                            name="Fats" 
                            unit="g" 
                            current={today.fat} 
                            goal={dailyGoals.fat} 
                            color="bg-green-500" 
                        />

                        <div className="pt-4 border-t border-gray-700 mt-4">
                            <h3 className="text-xl font-semibold text-white mb-2">Remaining Goals</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                                <p className="text-gray-300">Cal: <span className="font-bold text-lg text-red-400">{remainingMacros.calories}</span></p>
                                <p className="text-gray-300">P: <span className="font-bold text-lg text-indigo-400">{remainingMacros.protein}</span></p>
                                <p className="text-gray-300">C: <span className="font-bold text-lg text-yellow-400">{remainingMacros.carbs}</span></p>
                                <p className="text-gray-300">F: <span className="font-bold text-lg text-green-400">{remainingMacros.fat}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Plan Details Card (1/3 width) */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-indigo-900/50 shadow-lg h-full flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-indigo-400 border-b border-gray-700 pb-3 mb-4">Current Plan</h2>
                            
                            <p className="text-gray-300 mb-4">
                                <span className="font-semibold text-white">Plan Name:</span> {planDetails.name}
                            </p>
                            <p className="text-gray-300 mb-4">
                                <span className="font-semibold text-white">Assigned Trainer:</span> {planDetails.trainer}
                            </p>
                            <p className="text-gray-300 mb-4">
                                <span className="font-semibold text-white">Last Updated:</span> {planDetails.lastUpdated}
                            </p>

                            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Daily Target Macros</h3>
                            <div className="space-y-1 text-sm text-gray-400">
                                <p>Calories: <span className="font-bold text-red-300">{dailyGoals.calories} Cal</span></p>
                                <p>Protein: <span className="font-bold text-indigo-300">{dailyGoals.protein} g</span></p>
                                <p>Carbs: <span className="font-bold text-yellow-300">{dailyGoals.carbs} g</span></p>
                                <p>Fat: <span className="font-bold text-green-300">{dailyGoals.fat} g</span></p>
                            </div>
                        </div>

                        <Link 
                            to="/edit_nutritional_plan" // Assuming this is the next destination path
                            className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold text-center hover:bg-indigo-700 transition duration-300 mt-6"
                        >
                            View/Edit Plan History
                        </Link>
                    </div>
                </div>

                {/* Today's Meal Plan Section */}
                <div className="bg-gray-800 p-6 md:p-8 rounded-xl border border-indigo-900/50 shadow-lg mb-8">
                    <h2 className="text-3xl font-bold text-white mb-6 border-b border-indigo-500/50 pb-3">Today's Recommended Meal Plan</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {mealPlan.map((meal, index) => (
                            <div key={index} className="bg-gray-900 p-5 rounded-lg border border-gray-700 shadow-md flex flex-col space-y-2 hover:ring-2 hover:ring-indigo-600 transition duration-300">
                                <h3 className="text-xl font-semibold text-indigo-400">{meal.time}</h3>
                                <p className="text-white text-lg font-medium">{meal.meal}</p>
                                <p className="text-gray-400 text-sm">{meal.macros}</p>
                                <button className="mt-3 bg-gray-700 text-gray-200 py-1 rounded-md text-sm hover:bg-gray-600 transition">Log Meal</button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 italic">
                            Consult your assigned trainer ({planDetails.trainer}) before making drastic changes to your diet.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default UserNutritionPage;