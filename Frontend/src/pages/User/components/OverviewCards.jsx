import React from 'react';

const OverviewCards = ({ todayNutrition, weeklyWorkouts, user }) => {
    // Reusable Card Component
    const StatCard = ({ iconClass, title, value }) => (
        <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:bg-white/10">
            <div className="w-12 h-12 rounded-full bg-[#8A2BE2]/20 flex items-center justify-center text-[#8A2BE2] text-xl">
                <i className={iconClass}></i>
            </div>
            <div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
                <p className="text-white text-xl font-bold">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <StatCard 
                iconClass="fas fa-fire" 
                title="Today's Calories" 
                value={`${todayNutrition.calories_consumed || 0} / ${user.fitness_goals.calorie_goal}`} 
            />
            <StatCard 
                iconClass="fas fa-dumbbell" 
                title="Workouts Completed" 
                value={`${weeklyWorkouts.completed} / ${weeklyWorkouts.total} this week`} 
            />
            <StatCard 
                iconClass="fas fa-utensils" 
                title="Protein Intake" 
                value={`${todayNutrition.protein_consumed || 0}g / ${user.fitness_goals.protein_goal}g`} 
            />
            <StatCard 
                iconClass="fas fa-running" 
                title="Weight Goal" 
                value={`${user.fitness_goals.weight_goal || 70} kg`} 
            />
        </div>
    );
};

export default OverviewCards;