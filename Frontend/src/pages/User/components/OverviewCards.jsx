// Frontend/src/pages/User/components/OverviewCards.jsx
import React, { useState, useEffect } from 'react';

// --- ANIMATED ICON COMPONENT (Solid Purple) ---
const ProgressIcon = ({ iconClass, targetPercentage }) => {
    const [currentPercent, setCurrentPercent] = useState(0);
    
    // THEME: Solid Purple
    const SOLID_PURPLE = "#8A2BE2";

    useEffect(() => {
        // Trigger animation after mount
        const timer = setTimeout(() => {
            const validPercent = Math.min(Math.max(targetPercentage || 0, 0), 100);
            setCurrentPercent(validPercent);
        }, 300);
        return () => clearTimeout(timer);
    }, [targetPercentage]);

    return (
        // Container
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center relative overflow-hidden shrink-0 border border-white/10">
            
            {/* LAYER 1: Background "Empty" Icon */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <i 
                    className={`${iconClass} text-white opacity-20`} 
                    style={{ fontSize: '1.5rem' }}
                ></i>
            </div>
            
            {/* LAYER 2: The "Solid" Fill Animation */}
            <div 
                className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out z-10 overflow-hidden"
                style={{ 
                    height: `${currentPercent}%`, 
                    backgroundColor: SOLID_PURPLE 
                }}
            >
                {/* LAYER 3: The "Filled" Icon (White for contrast) */}
                <div className="h-12 w-12 flex items-center justify-center absolute bottom-0 left-0">
                    <i 
                        className={iconClass} 
                        style={{ 
                            fontSize: '1.5rem', 
                            color: 'white', 
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                        }}
                    ></i>
                </div>
            </div>
        </div>
    );
};

const OverviewCards = ({ todayNutrition, weeklyWorkouts, todayWorkout, user }) => {
    
    // Safety checks
    const exercisesCompleted = todayWorkout?.completedExercises || 0;
    const exercisesTotal = todayWorkout?.totalExercises || 0;

    // 1. Calories
    const calConsumed = todayNutrition?.calories_consumed || 0;
    const calGoal = user?.fitness_goals?.calorie_goal || 2000;
    const calorieProgress = calGoal > 0 ? Math.round((calConsumed / calGoal) * 100) : 0;

    // 2. Exercises
    const exerciseProgress = exercisesTotal > 0 
        ? Math.round((exercisesCompleted / exercisesTotal) * 100) 
        : 0;

    // 3. Protein
    const protConsumed = todayNutrition?.protein_consumed || 0;
    const protGoal = user?.fitness_goals?.protein_goal || 150;
    const proteinProgress = protGoal > 0 ? Math.round((protConsumed / protGoal) * 100) : 0;

    // 4. Weight Goal Logic (Database Driven)
    const currentWeight = user?.weight || 0; 
    const targetWeight = user?.fitness_goals?.weight_goal || 70;
    let weightProgress = 0;
    let weightSubtitle = `Target: ${targetWeight} kg`;

    if (currentWeight > 0 && targetWeight > 0) {
        const diff = Math.abs(currentWeight - targetWeight);
        
        // VISUAL LOGIC:
        // We define a "Visual Range" of 20kg.
        // If you are within 20kg of your goal, the liquid starts filling up.
        // 20kg away = 0% full.
        // 10kg away = 50% full.
        // 0kg away (Goal Met) = 100% full.
        const maxRange = 20; 
        weightProgress = Math.max(0, 100 - (diff / maxRange) * 100);
        
        if (diff === 0) {
            weightProgress = 100;
            weightSubtitle = "Goal Reached!";
        } else {
             weightSubtitle = `${diff.toFixed(1)} kg to go`;
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {/* CARD 1: Calories */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:bg-white/10">
                <ProgressIcon 
                    iconClass="fas fa-fire" 
                    targetPercentage={calorieProgress} 
                />
                <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Today's Calories</h3>
                    <p className="text-white text-xl font-bold">{calConsumed} / {calGoal}</p>
                </div>
            </div>

            {/* CARD 2: Exercises */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:bg-white/10">
                <ProgressIcon 
                    iconClass="fas fa-dumbbell" 
                    targetPercentage={exerciseProgress} 
                />
                <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Exercises Completed</h3>
                    <p className="text-white text-xl font-bold">{exercisesCompleted} / {exercisesTotal}</p>
                </div>
            </div>

            {/* CARD 3: Protein */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:bg-white/10">
                <ProgressIcon 
                    iconClass="fas fa-utensils" 
                    targetPercentage={proteinProgress} 
                />
                <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Protein Intake</h3>
                    <p className="text-white text-xl font-bold">{protConsumed}g / {protGoal}g</p>
                </div>
            </div>

            {/* CARD 4: Weight Goal */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:bg-white/10">
                <ProgressIcon 
                    iconClass="fas fa-running" 
                    targetPercentage={weightProgress} 
                />
                <div>
                    {/* 1. Changed Label to 'Weight Goal' */}
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Weight Goal</h3>
                    <div className="flex flex-col">
                        {/* 2. Changed Value to 'targetWeight' */}
                        <span className="text-white text-xl font-bold">{targetWeight} kg</span>
                        {/* 3. Kept the subtitle (e.g. '5.0 kg to go') */}
                        <span className="text-xs text-gray-400">{weightSubtitle}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewCards;