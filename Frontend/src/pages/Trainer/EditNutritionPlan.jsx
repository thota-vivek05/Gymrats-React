// pages/Trainer/EditNutritionPlan.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditNutritionPlan.module.css';

// Mock Food Database (Keep your existing foodDatabase array here)
const foodDatabase = [
    { name: 'Chicken Breast', protein: 31, carbs: 0, fats: 0, calories: 165, category: 'protein', macroType: 'protein' },
    { name: 'Tofu (BBQ)', protein: 15, carbs: 0, fats: 0, calories: 145, category: 'protein', macroType: 'protein' },
    { name: 'Whey Protein', protein: 24, carbs: 4, fats: 1, calories: 120, category: 'protein', macroType: 'protein' },
    { name: 'Egg Whites', protein: 11, carbs: 1, fats: 0, calories: 52, category: 'protein', macroType: 'protein' },
    { name: 'Greek Yogurt', protein: 10, carbs: 4, fats: 0, calories: 59, category: 'protein', macroType: 'protein' },
    { name: 'Soy Beans', protein: 20, carbs: 10, fats: 9, calories: 172, category: 'protein', macroType: 'protein' },
    { name: 'Brown Rice', protein: 2, carbs: 45, fats: 0, calories: 112, category: 'carbs', macroType: 'carbs' },
    { name: 'Sweet Potato', protein: 2, carbs: 20, fats: 0, calories: 86, category: 'carbs', macroType: 'carbs' },
    { name: 'Oatmeal', protein: 13, carbs: 66, fats: 7, calories: 389, category: 'carbs', macroType: 'carbs' },
    { name: 'Avocado', protein: 2, carbs: 9, fats: 15, calories: 160, category: 'fats', macroType: 'fats' },
    { name: 'Almonds', protein: 21, carbs: 22, fats: 50, calories: 579, category: 'fats', macroType: 'fats' },
    { name: 'Banana', protein: 1, carbs: 23, fats: 0, calories: 89, category: 'fruits', macroType: 'carbs' },
    { name: 'Berries Mix', protein: 1, carbs: 14, fats: 0, calories: 57, category: 'fruits', macroType: 'carbs' },
    { name: 'Broccoli', protein: 3, carbs: 7, fats: 0, calories: 34, category: 'vegetables', macroType: 'carbs' },
    { name: 'Spinach', protein: 3, carbs: 3.6, fats: 0, calories: 23, category: 'vegetables', macroType: 'carbs' },
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// FIX: Correct API Base URL
const API_BASE_URL = '/api/trainer';

const EditNutritionPlan = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    
    const [client, setClient] = useState({ name: 'Loading...', id: clientId });
    const [proteinGoal, setProteinGoal] = useState(0);
    const [calorieGoal, setCalorieGoal] = useState(0);
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [selectedDay, setSelectedDay] = useState('Monday'); // Default to Monday
    
    // UI states
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        const fetchNutritionData = async () => {
            if (!clientId) return;

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login first');
                navigate('/login');
                return;
            }

            const headers = { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            try {
                const [clientRes, nutritionRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/client/${clientId}`, { headers }),
                    fetch(`${API_BASE_URL}/nutrition/${clientId}`, { headers })
                ]);

                if (clientRes.ok) {
                    const clientData = await clientRes.json();
                    setClient({ 
                        name: clientData.full_name || 'Client', 
                        id: clientId 
                    });
                }

                if (nutritionRes.ok) {
                    const data = await nutritionRes.json();
                    const nutrition = data.nutrition || {};

                    setProteinGoal(nutrition.protein_goal || 0);
                    setCalorieGoal(nutrition.calorie_goal || 0);
                    
                    if (nutrition.foods && Array.isArray(nutrition.foods)) {
                        setSelectedFoods(nutrition.foods);
                    }
                }
            } catch (error) {
                console.error("Error fetching nutrition data:", error);
            }
        };

        fetchNutritionData();
    }, [clientId, navigate]);
    
    // Memoized Totals
    const nutritionTotals = useMemo(() => {
        return selectedFoods.reduce((totals, food) => {
            totals.protein += parseInt(food.protein || 0);
            totals.carbs += parseInt(food.carbs || 0);
            totals.fats += parseInt(food.fats || 0);
            totals.calories += parseInt(food.calories || 0);
            return totals;
        }, { protein: 0, carbs: 0, fats: 0, calories: 0 });
    }, [selectedFoods]);

    // Filtering Foods
    const filteredFoods = useMemo(() => {
        return foodDatabase.filter(food => {
            const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || food.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, categoryFilter]);

    const handleAddFood = (food) => {
        setSelectedFoods(prev => [
            ...prev, 
            { ...food }
        ]);
    };
    
    const handleRemoveFood = (indexToRemove) => {
        setSelectedFoods(prev => prev.filter((_, index) => index !== indexToRemove));
    };
    
    // Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedDay) {
            alert('Please select a day for the nutrition plan');
            return;
        }

        const payload = {
            userId: clientId,
            proteinGoal: parseInt(proteinGoal) || 0,
            calorieGoal: parseInt(calorieGoal) || 0,
            foods: selectedFoods,
            day: selectedDay,
        };

        try {
            const token = localStorage.getItem('token');
            // FIX: Use correct endpoint path matching server.js mount
            const response = await fetch(`${API_BASE_URL}/edit_nutritional_plan`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();

            if (data.success || response.ok) {
                alert('Nutrition plan successfully saved!');
                // Navigate back and trigger client selection via URL param
                navigate(`/trainer?clientId=${clientId}`);
            } else {
                alert('Error: ' + (data.error || 'Failed to save nutrition plan.'));
            }
        } catch (error) {
            console.error('Error saving nutrition plan:', error);
            alert('Failed to save nutrition plan.');
        }
    };
    
    const proteinGoalValue = parseInt(proteinGoal) || 0;
    const proteinPercentValue = proteinGoalValue > 0 ? (nutritionTotals.protein / proteinGoalValue) * 100 : 0;
    const cappedPercentage = Math.min(proteinPercentValue, 100);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Edit Nutrition Plan</h1>
                <p>Customize the nutrition plan for <span id="clientName">{client.name}</span></p>
            </div>

            <div className={styles['content-wrapper']}>
                {/* Left Section: Available Foods */}
                <div className={styles['available-foods-section']}>
                    <div className={styles['section-header']}>
                        <h2>Available Foods</h2>
                        <div className={styles['search-bar']}>
                            <input type="text" placeholder="Search foods..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div className={styles['category-filter']}>
                            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                <option value="all">All Categories</option>
                                <option value="protein">Protein</option>
                                <option value="carbs">Carbohydrates</option>
                                <option value="fats">Healthy Fats</option>
                                <option value="fruits">Fruits</option>
                                <option value="vegetables">Vegetables</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles['food-list']}>
                        {filteredFoods.map((food, index) => (
                            <div className={styles['food-item']} key={index}>
                                <div className={styles['food-info']}>
                                    <h3>{food.name}</h3>
                                    <p>{food.protein}g P | {food.carbs}g C | {food.fats}g F</p>
                                    <p>{food.calories} kcal</p>
                                </div>
                                <div className={styles['food-macro']}>
                                    <div className={`${styles['macro-circle']} ${styles[food.macroType]}`}>
                                        <span>{food.macroType.charAt(0).toUpperCase()}</span>
                                    </div>
                                </div>
                                <button type="button" className={styles['add-btn']} onClick={() => handleAddFood(food)}>Add</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Section: Client's Nutrition Plan */}
                <div className={styles['nutrition-plan-section']}>
                    <div className={styles['section-header']}>
                        <h2>Client's Nutrition Plan</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className={styles['nutrition-goals']}>
                            <div className={styles['goal-input']}>
                                <label>Daily Protein Goal (g):</label>
                                <input type="number" value={proteinGoal} onChange={(e) => setProteinGoal(e.target.value)} min="0" />
                            </div>
                            <div className={styles['goal-input']}>
                                <label>Daily Calorie Goal:</label>
                                <input type="number" value={calorieGoal} onChange={(e) => setCalorieGoal(e.target.value)} min="0" />
                            </div>
                        </div>

                        <div className={styles['nutrition-summary']}>
                            <div className={styles['macro-summary']}>
                                <div className={styles['macro-item']}>
                                    <span className={styles['macro-label']}>Protein:</span>
                                    <span className={styles['macro-value']}>{nutritionTotals.protein}g</span>
                                </div>
                                <div className={styles['macro-item']}>
                                    <span className={styles['macro-label']}>Carbs:</span>
                                    <span className={styles['macro-value']}>{nutritionTotals.carbs}g</span>
                                </div>
                                <div className={styles['macro-item']}>
                                    <span className={styles['macro-label']}>Fats:</span>
                                    <span className={styles['macro-value']}>{nutritionTotals.fats}g</span>
                                </div>
                                <div className={styles['macro-item']}>
                                    <span className={styles['macro-label']}>Calories:</span>
                                    <span className={styles['macro-value']}>{nutritionTotals.calories}</span>
                                </div>
                            </div>
                            <div className={styles['progress-container']}>
                                <label>Protein Goal Progress:</label>
                                <div className={styles['progress-bar']}>
                                    <div className={styles.progress} style={{ width: `${cappedPercentage}%` }}></div>
                                </div>
                                <span>{Math.round(proteinPercentValue)}%</span>
                            </div>
                        </div>

                        <div className={styles['selected-foods']}>
                            <h3>Selected Foods</h3>
                            <div className={styles['selected-food-list']}>
                                {selectedFoods.length === 0 ? (
                                    <div className={styles['empty-state']}>
                                        <p>No foods selected yet.</p>
                                    </div>
                                ) : (
                                    selectedFoods.map((food, index) => (
                                        <div className={styles['selected-food-item']} key={index}>
                                            <div className={styles['food-info']}>
                                                <h4>{food.name}</h4>
                                                <p>P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g</p>
                                                <p>{food.calories} kcal</p>
                                            </div>
                                            <button type="button" className={styles['remove-btn']} onClick={() => handleRemoveFood(index)}>Remove</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className={styles['day-selection']}>
                            <label>Select Day for Nutrition Plan:</label>
                            <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} required>
                                <option value="">-- Choose a day --</option>
                                {daysOfWeek.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles['action-buttons']}>
                            <button type="submit" className={styles['save-btn']}>Save Nutrition Plan</button>
                            <button type="button" className={styles['cancel-btn']} onClick={() => navigate(`/trainer?clientId=${clientId}`)}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditNutritionPlan;