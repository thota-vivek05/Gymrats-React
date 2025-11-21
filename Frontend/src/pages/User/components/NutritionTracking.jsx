import React, { useState } from 'react';

const NutritionTracking = ({ todaysConsumedFoods, todayNutrition, user, onFoodComplete }) => {
    const [consumedFoods, setConsumedFoods] = useState(
        todaysConsumedFoods.filter(food => food.consumed)
    );

    const markFoodAsConsumed = async (foodName, calories, protein, carbs, fats) => {
        try {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const today = new Date();
            const dayName = days[today.getDay()];

            const response = await fetch('/api/nutrition/mark-consumed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    foodName,
                    calories,
                    protein,
                    carbs,
                    fats,
                    day: dayName
                })
            });

            const data = await response.json();
            if (data.success) {
                // Add to consumed foods list
                const newFood = {
                    name: foodName,
                    calories,
                    protein,
                    carbs,
                    fats,
                    consumedAt: new Date()
                };
                setConsumedFoods(prev => [newFood, ...prev]);
                onFoodComplete();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error marking food as consumed:', error);
            alert('Network error. Please try again.');
        }
    };

    return (
        <div className="dashboard-wide-card">
            <div className="card-header">
                <h2>Nutrition Tracking</h2>
            </div>
            
            {/* Food Completion Section */}
            <div className="nutrition-food-completion">
                <h3>Today's Food Goals</h3>
                <div className="food-goals-container">
                    {todaysConsumedFoods && todaysConsumedFoods.length > 0 ? (
                        todaysConsumedFoods.map((food, index) => (
                            <div key={index} className="food-goal-item">
                                <div className="food-info">
                                    <h4>{food.name}</h4>
                                    <div className="food-macros">
                                        <span className="calories">{food.calories} kcal</span>
                                        <span className="protein">{food.protein}g protein</span>
                                        {food.carbs && (
                                            <span className="carbs">{food.carbs}g carbs</span>
                                        )}
                                        {food.fats && (
                                            <span className="fats">{food.fats}g fats</span>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    className={`food-complete-btn ${food.consumed ? 'completed' : ''}`}
                                    onClick={() => markFoodAsConsumed(
                                        food.name, 
                                        food.calories, 
                                        food.protein, 
                                        food.carbs || 0, 
                                        food.fats || 0
                                    )}
                                    disabled={food.consumed}
                                >
                                    {food.consumed ? (
                                        <><i className="fas fa-check-circle"></i> Completed</>
                                    ) : (
                                        <><i className="fas fa-check"></i> Mark as Eaten</>
                                    )}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No food goals set for today. Add some foods to your nutrition plan.</p>
                    )}
                </div>
            </div>

            {/* Food Log Section */}
            <div className="nutrition-food-log">
                <h3>Today's Food Log</h3>
                <div className="todays-consumption">
                    <div className="consumption-stats">
                        <div className="stat">
                            <span className="label">Calories:</span>
                            <span className="value">{todayNutrition.calories_consumed || 0}</span>
                            <span className="goal">/ {user.fitness_goals.calorie_goal}</span>
                        </div>
                        <div className="stat">
                            <span className="label">Protein:</span>
                            <span className="value">{todayNutrition.protein_consumed || 0}</span>
                            <span className="goal">/ {user.fitness_goals.protein_goal}g</span>
                        </div>
                    </div>
                </div>
                
                <table className="food-log-table">
                    <thead>
                        <tr>
                            <th>Food</th>
                            <th>Calories</th>
                            <th>Protein</th>
                            <th>Carbs</th>
                            <th>Fats</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {consumedFoods.length > 0 ? (
                            consumedFoods.map((food, index) => (
                                <tr key={index} className="consumed-food-item">
                                    <td>{food.name}</td>
                                    <td>{food.calories} kcal</td>
                                    <td>{food.protein}g</td>
                                    <td>{food.carbs}g</td>
                                    <td>{food.fats}g</td>
                                    <td>
                                        {food.consumedAt ? 
                                            new Date(food.consumedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                                            'Today'
                                        }
                                    </td>
                                    <td><span className="completed-badge">Completed</span></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">No foods consumed today yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NutritionTracking;