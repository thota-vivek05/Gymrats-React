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
                <OverviewCards 
                    todayNutrition={dashboardData.todayNutrition}
                    weeklyWorkouts={dashboardData.weeklyWorkouts}
                    user={user}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <TodaysWorkout 
                        todayWorkout={dashboardData.todayWorkout}
                        onExerciseComplete={handleExerciseComplete}
                    />
                    
                    <UpcomingClass upcomingClass={dashboardData.upcomingClass} />
                </div>
                
                <ProgressTracking 
                    exerciseProgress={dashboardData.exerciseProgress}
                    nutritionChartData={dashboardData.nutritionChartData}
                />
                
                <NutritionTracking 
                    todaysConsumedFoods={dashboardData.todaysConsumedFoods}
                    todayNutrition={dashboardData.todayNutrition}
                    user={user}
                    onFoodComplete={handleFoodComplete}
                />
            </div>
        </div>
    );
};

export default UserDashboard;