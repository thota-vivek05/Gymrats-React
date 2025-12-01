// pages/Trainer/EditNutritionPlan.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Mock Food Database
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

const API_BASE_URL = '/api/trainer';

const EditNutritionPlan = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    
    const [client, setClient] = useState({ name: 'Loading...', id: clientId });
    const [proteinGoal, setProteinGoal] = useState(0);
    const [calorieGoal, setCalorieGoal] = useState(0);
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [selectedDay, setSelectedDay] = useState('Monday');
    
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
    
    const nutritionTotals = useMemo(() => {
        return selectedFoods.reduce((totals, food) => {
            totals.protein += parseInt(food.protein || 0);
            totals.carbs += parseInt(food.carbs || 0);
            totals.fats += parseInt(food.fats || 0);
            totals.calories += parseInt(food.calories || 0);
            return totals;
        }, { protein: 0, carbs: 0, fats: 0, calories: 0 });
    }, [selectedFoods]);

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

    // Helper to get color based on macro type
    const getMacroColorClass = (type) => {
        switch(type) {
            case 'protein': return 'bg-[#e3342f]/80'; // Red
            case 'carbs': return 'bg-[#f6993f]/80'; // Orange
            case 'fats': return 'bg-[#3490dc]/80'; // Blue
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="w-full max-w-[1200px] mx-auto my-[30px] px-5 flex-1 font-['Outfit',_sans-serif] text-[#f1f1f1]">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');`}</style>
            
            {/* Header */}
            <div className="text-center mb-[30px]">
                <h1 className="text-[1.8rem] md:text-[2.5rem] font-bold text-[#f1f1f1] mb-[10px]">Edit Nutrition Plan</h1>
                <p className="text-[1.2rem] text-[#cccccc]">
                    Customize the nutrition plan for <span className="text-[#8A2BE2] font-semibold">{client.name}</span>
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-[30px]">
                {/* Left Section: Available Foods */}
                <div className="flex-1 bg-[#1e1e1e]/60 rounded-[10px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] p-[25px] border border-[#8A2BE2]/30 lg:p-[15px] xl:p-[25px]">
                    <div className="mb-[20px]">
                        <h2 className="text-[1.8rem] font-semibold text-[#f1f1f1] mb-[15px]">Available Foods</h2>
                        <div className="mb-[15px]">
                            <input 
                                type="text" 
                                placeholder="Search foods..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full p-[12px_15px] rounded-[5px] border border-[#8A2BE2]/30 bg-[#1e1e1e]/80 text-[#f1f1f1] text-[1rem] focus:outline-none focus:border-[#8A2BE2] focus:shadow-[0_0_10px_rgba(138,43,226,0.4)]"
                            />
                        </div>
                        <div className="mb-[20px]">
                            <select 
                                value={categoryFilter} 
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full p-[12px_15px] rounded-[5px] border border-[#8A2BE2]/30 bg-[#1e1e1e]/80 text-[#f1f1f1] text-[1rem] appearance-none cursor-pointer focus:outline-none focus:border-[#8A2BE2] focus:shadow-[0_0_10px_rgba(138,43,226,0.4)]"
                                style={{backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 15px center', backgroundSize: '15px'}}
                            >
                                <option value="all">All Categories</option>
                                <option value="protein">Protein</option>
                                <option value="carbs">Carbohydrates</option>
                                <option value="fats">Healthy Fats</option>
                                <option value="fruits">Fruits</option>
                                <option value="vegetables">Vegetables</option>
                            </select>
                        </div>
                    </div>

                    <div className="max-h-[600px] overflow-y-auto pr-[5px] [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#1e1e1e]/40 [&::-webkit-scrollbar-track]:rounded-[4px] [&::-webkit-scrollbar-thumb]:bg-[#8A2BE2]/50 [&::-webkit-scrollbar-thumb]:rounded-[4px]">
                        {filteredFoods.map((food, index) => (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center bg-[#282828]/60 rounded-[8px] p-[15px] mb-[15px] transition-transform duration-200 shadow-sm hover:-translate-y-[2px] hover:shadow-[0_5px_15px_rgba(138,43,226,0.3)]" key={index}>
                                <div className="flex-1 mb-[10px] sm:mb-0">
                                    <h3 className="text-[1.2rem] font-semibold text-[#f1f1f1] mb-[5px]">{food.name}</h3>
                                    <p className="text-[0.9rem] text-[#cccccc] mb-[3px]">{food.protein}g P | {food.carbs}g C | {food.fats}g F</p>
                                    <p className="text-[0.9rem] text-[#cccccc] mb-[3px]">{food.calories} kcal</p>
                                </div>
                                <div className="mx-[15px] my-[10px] sm:my-0">
                                    <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center font-bold text-[0.9rem] text-white ${getMacroColorClass(food.macroType)}`}>
                                        <span>{food.macroType.charAt(0).toUpperCase()}</span>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    className="w-full sm:w-auto bg-[#8A2BE2] text-white border-none rounded-[5px] p-[8px_15px] text-[0.9rem] font-medium cursor-pointer transition-colors duration-200 hover:bg-[#7020a0]"
                                    onClick={() => handleAddFood(food)}
                                >
                                    Add
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Section: Client's Nutrition Plan */}
                <div className="flex-1 bg-[#1e1e1e]/60 rounded-[10px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] p-[25px] border border-[#8A2BE2]/30 flex flex-col lg:p-[15px] xl:p-[25px]">
                    <div className="mb-[20px]">
                        <h2 className="text-[1.8rem] font-semibold text-[#f1f1f1] mb-[15px]">Client's Nutrition Plan</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px] mb-[20px]">
                            <div className="mb-[10px]">
                                <label className="block text-[0.95rem] mb-[5px] text-[#f1f1f1]">Daily Protein Goal (g):</label>
                                <input 
                                    type="number" 
                                    value={proteinGoal} 
                                    onChange={(e) => setProteinGoal(e.target.value)} 
                                    min="0"
                                    className="w-full p-[10px] rounded-[5px] border border-[#8A2BE2]/30 bg-[#1e1e1e]/80 text-[#f1f1f1] text-[1rem] focus:outline-none focus:border-[#8A2BE2] focus:shadow-[0_0_10px_rgba(138,43,226,0.4)]"
                                />
                            </div>
                            <div className="mb-[10px]">
                                <label className="block text-[0.95rem] mb-[5px] text-[#f1f1f1]">Daily Calorie Goal:</label>
                                <input 
                                    type="number" 
                                    value={calorieGoal} 
                                    onChange={(e) => setCalorieGoal(e.target.value)} 
                                    min="0" 
                                    className="w-full p-[10px] rounded-[5px] border border-[#8A2BE2]/30 bg-[#1e1e1e]/80 text-[#f1f1f1] text-[1rem] focus:outline-none focus:border-[#8A2BE2] focus:shadow-[0_0_10px_rgba(138,43,226,0.4)]"
                                />
                            </div>
                        </div>

                        <div className="bg-[#282828]/60 rounded-[8px] p-[15px] mb-[20px]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[10px] mb-[15px]">
                                <div className="text-center">
                                    <span className="block text-[0.9rem] text-[#cccccc] mb-[5px]">Protein:</span>
                                    <span className="text-[1.1rem] font-semibold text-[#f1f1f1]">{nutritionTotals.protein}g</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-[0.9rem] text-[#cccccc] mb-[5px]">Carbs:</span>
                                    <span className="text-[1.1rem] font-semibold text-[#f1f1f1]">{nutritionTotals.carbs}g</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-[0.9rem] text-[#cccccc] mb-[5px]">Fats:</span>
                                    <span className="text-[1.1rem] font-semibold text-[#f1f1f1]">{nutritionTotals.fats}g</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-[0.9rem] text-[#cccccc] mb-[5px]">Calories:</span>
                                    <span className="text-[1.1rem] font-semibold text-[#f1f1f1]">{nutritionTotals.calories}</span>
                                </div>
                            </div>
                            <div className="mt-[10px]">
                                <label className="block text-[0.95rem] mb-[5px] text-[#f1f1f1]">Protein Goal Progress:</label>
                                <div className="h-[12px] bg-[#1e1e1e]/80 rounded-[6px] mb-[5px] overflow-hidden">
                                    <div className="h-full bg-[#8A2BE2] rounded-[6px] transition-[width] duration-300 ease-in-out" style={{ width: `${cappedPercentage}%` }}></div>
                                </div>
                                <span>{Math.round(proteinPercentValue)}%</span>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <h3 className="text-[1.3rem] font-semibold text-[#f1f1f1] mb-[15px]">Selected Foods</h3>
                            <div className="flex-1 overflow-y-auto pr-[5px] min-h-[150px] [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#1e1e1e]/40 [&::-webkit-scrollbar-track]:rounded-[4px] [&::-webkit-scrollbar-thumb]:bg-[#8A2BE2]/50 [&::-webkit-scrollbar-thumb]:rounded-[4px]">
                                {selectedFoods.length === 0 ? (
                                    <div className="text-center p-[30px] text-[#999] italic">
                                        <p>No foods selected yet.</p>
                                    </div>
                                ) : (
                                    selectedFoods.map((food, index) => (
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#282828]/60 rounded-[8px] p-[12px_15px] mb-[10px]" key={index}>
                                            <div className="flex-1 mb-[10px] sm:mb-0">
                                                <h4 className="text-[1.1rem] font-semibold text-[#f1f1f1] mb-[5px]">{food.name}</h4>
                                                <p className="text-[0.85rem] text-[#cccccc] mb-[2px]">P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g</p>
                                                <p className="text-[0.85rem] text-[#cccccc] mb-[2px]">{food.calories} kcal</p>
                                            </div>
                                            <button 
                                                type="button" 
                                                className="w-full sm:w-auto bg-[#e3342f]/80 text-white border-none rounded-[5px] p-[6px_12px] text-[0.85rem] font-medium cursor-pointer transition-colors duration-200 hover:bg-[#e3342f]"
                                                onClick={() => handleRemoveFood(index)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="my-[20px]">
                            <label className="block mb-[8px] font-bold text-[#f1f1f1]">Select Day for Nutrition Plan:</label>
                            <select 
                                value={selectedDay} 
                                onChange={(e) => setSelectedDay(e.target.value)} 
                                required
                                className="p-[10px_12px] border-2 border-[#ddd] rounded-[8px] w-full max-w-full md:max-w-[300px] text-[16px] bg-white text-[#333] cursor-pointer focus:outline-none focus:border-[#8A2BE2] focus:shadow-[0_0_10px_rgba(138,43,226,0.4)]"
                            >
                                <option value="">-- Choose a day --</option>
                                {daysOfWeek.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col md:flex-row gap-[15px] mt-[20px]">
                            <button 
                                type="submit" 
                                className="flex-1 p-[12px_20px] rounded-[5px] text-[1rem] font-semibold cursor-pointer transition-all duration-200 bg-[#8A2BE2] text-white border-none hover:bg-[#7020a0]"
                            >
                                Save Nutrition Plan
                            </button>
                            <button 
                                type="button" 
                                className="flex-1 p-[12px_20px] rounded-[5px] text-[1rem] font-semibold cursor-pointer transition-all duration-200 bg-transparent text-[#f1f1f1] border border-[#666] hover:bg-white/10 hover:border-[#999]"
                                onClick={() => navigate(`/trainer?clientId=${clientId}`)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditNutritionPlan;