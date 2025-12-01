// Frontend/src/pages/User/components/OverviewCards.jsx
import React from 'react';

// UPDATE: Destructure todayWorkout from props
const OverviewCards = ({ todayNutrition, weeklyWorkouts, todayWorkout, user }) => {
    
    // Safety check for values
    const exercisesCompleted = todayWorkout?.completedExercises || 0;
    const exercisesTotal = todayWorkout?.totalExercises || 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:bg-white/10">
                <div className="w-12 h-12 rounded-full bg-[#8A2BE2]/20 flex items-center justify-center text-[#8A2BE2] text-xl">
                    <i className="fas fa-fire"></i>
                </div>
                <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Today's Calories</h3>
                    <p className="text-white text-xl font-bold">
                        {todayNutrition.calories_consumed || 0} / {user.fitness_goals.calorie_goal}
                    </p>
                </div>
            </div>

            {/* MODIFIED CARD: Shows Daily Exercises instead of Weekly Plans */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:bg-white/10">
                <div className="w-12 h-12 rounded-full bg-[#8A2BE2]/20 flex items-center justify-center text-[#8A2BE2] text-xl">
                    <i className="fas fa-dumbbell"></i>
                </div>
                <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Exercises Completed</h3>
                    <p className="text-white text-xl font-bold">
                        {exercisesCompleted} / {exercisesTotal} today
                    </p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:bg-white/10">
                <div className="w-12 h-12 rounded-full bg-[#8A2BE2]/20 flex items-center justify-center text-[#8A2BE2] text-xl">
                    <i className="fas fa-utensils"></i>
                </div>
                <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Protein Intake</h3>
                    <p className="text-white text-xl font-bold">
                        {todayNutrition.protein_consumed || 0}g / {user.fitness_goals.protein_goal}g
                    </p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:bg-white/10">
                <div className="w-12 h-12 rounded-full bg-[#8A2BE2]/20 flex items-center justify-center text-[#8A2BE2] text-xl">
                    <i className="fas fa-running"></i>
                </div>
                <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Weight Goal</h3>
                    <p className="text-white text-xl font-bold">
                        {user.fitness_goals.weight_goal || 70} kg
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OverviewCards; 
