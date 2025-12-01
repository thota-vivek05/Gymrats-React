import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Components
import DashboardHeader from './components/DashboardHeader';
import DashboardHero from './components/DashboardHero';
import OverviewCards from './components/OverviewCards';
import TodaysWorkout from './components/TodaysWorkout';
import UpcomingClass from './components/UpcomingClass';
import ProgressTracking from './components/ProgressTracking';
import NutritionTracking from './components/NutritionTracking';

const UserDashboard = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        todayNutrition: { calories_consumed: 0, protein_consumed: 0, calorie_goal: 2200, protein_goal: 90 },
        weeklyWorkouts: { completed: 0, total: 0 },
        todayWorkout: { 
            name: 'No Workout Scheduled',
            exercises: [], 
            progress: 0,
            completedExercises: 0,
            totalExercises: 0,
            duration: 0,
            workoutPlanId: null
        },
        exerciseProgress: [],
        upcomingClass: null,
        todaysConsumedFoods: [],
        nutritionChartData: { labels: [], calories: [], protein: [] }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, [type]);

    const fetchDashboardData = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const [
                userResponse,
                workoutResponse,
                nutritionResponse,
                statsResponse,
                progressResponse,
                classResponse
            ] = await Promise.all([
                fetch('/api/user/profile', { headers }),
                fetch('/api/workout/today', { headers }),
                fetch('/api/nutrition/today', { headers }),
                fetch('/api/workout/weekly-stats', { headers }),
                fetch('/api/exercise/progress', { headers }),
                fetch('/api/class/upcoming', { headers })
            ]);

            if (userResponse.status === 401 || workoutResponse.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }

            const userData = userResponse.ok ? await userResponse.json() : null;
            const workoutData = workoutResponse.ok ? await workoutResponse.json() : null;
            const nutritionData = nutritionResponse.ok ? await nutritionResponse.json() : null;
            const statsData = statsResponse.ok ? await statsResponse.json() : null;
            const progressData = progressResponse.ok ? await progressResponse.json() : null;
            const classData = classResponse.ok ? await classResponse.json() : null;

            if (userData && userData.success) {
                setUser(userData.user);
            }

            setDashboardData(prev => ({
                ...prev,
                todayWorkout: workoutData?.success ? workoutData : prev.todayWorkout,
                todayNutrition: nutritionData?.success ? nutritionData.todayNutrition : prev.todayNutrition,
                todaysConsumedFoods: nutritionData?.success ? nutritionData.todaysConsumedFoods : prev.todaysConsumedFoods,
                weeklyWorkouts: statsData?.success ? statsData.weeklyWorkouts : prev.weeklyWorkouts,
                exerciseProgress: progressData?.success ? progressData.exerciseProgress : prev.exerciseProgress,
                upcomingClass: classData?.success ? classData.upcomingClass : prev.upcomingClass
            }));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleExerciseComplete = () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch('/api/workout/today', { 
            headers: { 'Authorization': `Bearer ${token}` } 
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setDashboardData(prev => ({
                        ...prev,
                        todayWorkout: data
                    }));
                }
            })
            .catch(console.error);
    };

    const handleFoodComplete = () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch('/api/nutrition/today', { 
            headers: { 'Authorization': `Bearer ${token}` } 
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setDashboardData(prev => ({
                        ...prev,
                        todayNutrition: data.todayNutrition,
                        todaysConsumedFoods: data.todaysConsumedFoods
                    }));
                }
            })
            .catch(console.error);
    };

    // --- NEW HELPER FUNCTION FOR ACCESS CONTROL ---
    const hasAccess = (requiredTier) => {
        if (!user || !user.membershipType) return false;
        
        // Map membership types to levels
        const plans = {
            'Basic': 1,
            'Gold': 2,
            'Platinum': 3
        };

        const userTier = plans[user.membershipType] || 0;
        const requiredLevel = plans[requiredTier] || 0;

        return userTier >= requiredLevel;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-black text-[#f1f1f1] text-lg">
                <div>Loading your dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-black text-white gap-4">
                <div className="text-red-500">{error}</div>
                <button 
                    onClick={fetchDashboardData}
                    className="px-4 py-2 bg-[#8A2BE2] rounded hover:bg-[#7B25C9] transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-black text-gray-100 font-sans">
            <DashboardHeader user={user} currentPage="dashboard" />
            
            <DashboardHero user={user} />
            
            <div className="max-w-7xl mx-auto px-5 pb-10">
                {/* 1. Overview Cards - Visible to ALL */}
                <OverviewCards 
                    todayNutrition={dashboardData.todayNutrition}
                    weeklyWorkouts={dashboardData.weeklyWorkouts}
                    todayWorkout={dashboardData.todayWorkout} // <--- ADD THIS LINE
                    user={user}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* 2. Today's Workout - Visible to ALL */}
                    <TodaysWorkout 
                        todayWorkout={dashboardData.todayWorkout}
                        onExerciseComplete={handleExerciseComplete}
                    />
                    
                    {/* 3. Upcoming Class - PLATINUM ONLY */}
                    {hasAccess('Platinum') ? (
                        <UpcomingClass upcomingClass={dashboardData.upcomingClass} />
                    ) : (
                        // Placeholder for non-Platinum users
                        <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 text-gray-500 text-2xl">
                                <i className="fas fa-lock"></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-300 mb-2">Live Classes Locked</h3>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                Upgrade to our Platinum plan to access live classes with professional trainers.
                            </p>
                        </div>
                    )}
                </div>
                
                {/* 4. Progress Tracking - PLATINUM ONLY */}
                {hasAccess('Platinum') && (
                    <ProgressTracking 
                        exerciseProgress={dashboardData.exerciseProgress}
                        nutritionChartData={dashboardData.nutritionChartData}
                    />
                )}
                
                {/* 5. Nutrition Tracking - GOLD & PLATINUM ONLY */}
                {hasAccess('Gold') ? (
                    <NutritionTracking 
                        todaysConsumedFoods={dashboardData.todaysConsumedFoods}
                        todayNutrition={dashboardData.todayNutrition}
                        user={user}
                        onFoodComplete={handleFoodComplete}
                    />
                ) : (
                     // Optional: You can remove this 'else' block if you want it to just be invisible
                     <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center mt-10">
                        <h3 className="text-xl font-bold text-gray-300 mb-2">Nutrition Tracking Locked</h3>
                        <p className="text-sm text-gray-500">
                            Upgrade to Gold or Platinum to unlock advanced nutrition tracking and meal logs.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;