import React from 'react';

const OverviewCards = ({ todayNutrition, weeklyWorkouts, user }) => {
    return (
        <div className="dashboard-overview">
            <div className="overview-card">
                <div className="overview-icon">
                    <i className="fas fa-fire"></i>
                </div>
                <div className="overview-details">
                    <h3>Today's Calories</h3>
                    <p className="overview-value">
                        {todayNutrition.calories_consumed || 0} / {user.fitness_goals.calorie_goal}
                    </p>
                </div>
            </div>

            <div className="overview-card">
                <div className="overview-icon">
                    <i className="fas fa-dumbbell"></i>
                </div>
                <div className="overview-details">
                    <h3>Workouts Completed</h3>
                    <p className="overview-value">
                        {weeklyWorkouts.completed} / {weeklyWorkouts.total} this week
                    </p>
                </div>
            </div>

            <div className="overview-card">
                <div className="overview-icon">
                    <i className="fas fa-utensils"></i>
                </div>
                <div className="overview-details">
                    <h3>Protein Intake</h3>
                    <p className="overview-value">
                        {todayNutrition.protein_consumed || 0}g / {user.fitness_goals.protein_goal}g
                    </p>
                </div>
            </div>

            <div className="overview-card">
                <div className="overview-icon">
                    <i className="fas fa-running"></i>
                </div>
                <div className="overview-details">
                    <h3>Weight Goal</h3>
                    <p className="overview-value">
                        {user.fitness_goals.weight_goal || 70} kg
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OverviewCards;