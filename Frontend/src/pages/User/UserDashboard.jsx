import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './UserDashboard.module.css';

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
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [
                userResponse,
                workoutResponse,
                nutritionResponse,
                statsResponse,
                progressResponse,
                classResponse
            ] = await Promise.all([
                fetch('/api/user/profile', { credentials: 'include' }),
                fetch('/api/workout/today', { credentials: 'include' }),
                fetch('/api/nutrition/today', { credentials: 'include' }),
                fetch('/api/workout/weekly-stats', { credentials: 'include' }),
                fetch('/api/exercise/progress', { credentials: 'include' }),
                fetch('/api/class/upcoming', { credentials: 'include' })
            ]);

            // Check for authentication errors
            if (userResponse.status === 401 || workoutResponse.status === 401) {
                navigate('/login_signup?form=login');
                return;
            }

            // Process responses
            const userData = userResponse.ok ? await userResponse.json() : null;
            const workoutData = workoutResponse.ok ? await workoutResponse.json() : null;
            const nutritionData = nutritionResponse.ok ? await nutritionResponse.json() : null;
            const statsData = statsResponse.ok ? await statsResponse.json() : null;
            const progressData = progressResponse.ok ? await progressResponse.json() : null;
            const classData = classResponse.ok ? await classResponse.json() : null;

            if (userData && userData.success) {
                setUser(userData.user);
            }

            // Update dashboard data
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
        // Refresh workout data
        fetch('/api/workout/today', { credentials: 'include' })
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
        // Refresh nutrition data
        fetch('/api/nutrition/today', { credentials: 'include' })
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
            <div className="user-dashboard">
                <div className="loading">Loading your dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-dashboard">
                <div className="error">{error}</div>
                <button onClick={fetchDashboardData}>Retry</button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="user-dashboard">
                <div className="error">Please log in to view dashboard</div>
            </div>
        );
    }

    return (
        <div className="user-dashboard">
            <DashboardHeader user={user} currentPage="dashboard" />
            
            <DashboardHero user={user} />
            
            <div className="dashboard-container">
                <OverviewCards 
                    todayNutrition={dashboardData.todayNutrition}
                    weeklyWorkouts={dashboardData.weeklyWorkouts}
                    user={user}
                />
                
                <div className="dashboard-grid">
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