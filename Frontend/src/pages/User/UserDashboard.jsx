import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Components
import DashboardHero from "./components/DashboardHero";
import OverviewCards from "./components/OverviewCards";
import TodaysWorkout from "./components/TodaysWorkout";
import UpcomingClass from "./components/UpcomingClass";
import ProgressTracking from "./components/ProgressTracking";
import NutritionTracking from "./components/NutritionTracking";
import BookTrainerSession from "./components/BookTrainerSession";

const UserDashboard = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [dashboardData, setDashboardData] = useState({
    todayNutrition: {
      calories_consumed: 0,
      protein_consumed: 0,
      calorie_goal: 2200,
      protein_goal: 90,
    },
    weeklyWorkouts: { completed: 0, total: 0 },
    todayWorkout: {
      name: "No Workout Scheduled",
      exercises: [],
      progress: 0,
      completedExercises: 0,
      totalExercises: 0,
      duration: 0,
      workoutPlanId: null,
    },
    exerciseProgress: [],
    upcomingClass: null,
    todaysConsumedFoods: [],
    nutritionChartData: { labels: [], calories: [], protein: [] },
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    fetchDashboardData(true);
  }, [type]);

  const fetchDashboardData = async (showLoading = true) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [
        userResponse,
        workoutResponse,
        nutritionResponse,
        statsResponse,
        progressResponse,
        classResponse,
        appointmentsResponse,
      ] = await Promise.all([
        fetch("/api/user/profile", { headers }),
        fetch("/api/workout/today", { headers }),
        fetch("/api/nutrition/today", { headers }),
        fetch("/api/workout/weekly-stats", { headers }),
        fetch("/api/exercise/progress", { headers }),
        fetch("/api/class/upcoming", { headers }),
        fetch("/api/user/appointments", { headers }),
      ]);

      if (userResponse.status === 401 || userResponse.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const userData = userResponse.ok ? await userResponse.json() : null;
      const workoutData = workoutResponse.ok ? await workoutResponse.json() : null;
      const nutritionData = nutritionResponse.ok ? await nutritionResponse.json() : null;
      const statsData = statsResponse.ok ? await statsResponse.json() : null;
      const progressData = progressResponse.ok ? await progressResponse.json() : null;
      const classData = classResponse.ok ? await classResponse.json() : null;
      const appointmentsData = appointmentsResponse.ok ? await appointmentsResponse.json() : null;

      if (userData && userData.success) {
        setUser(userData.user);
      }

      // Find the next approved appointment with a meet link (for Upcoming Class)
      let approvedSession = null;
      if (appointmentsData?.appointments) {
        const now = new Date();
        const futureApproved = appointmentsData.appointments
          .filter((apt) => apt.status === 'approved' && new Date(apt.date) >= new Date(now.toDateString()))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (futureApproved.length > 0) {
          const apt = futureApproved[0];
          approvedSession = {
            name: 'Personal Training Session',
            date: apt.date,
            time: `${apt.startTime} – ${apt.endTime}`,
            meetLink: apt.meetLink || '',
            trainerName: apt.trainerId?.name || 'Trainer',
            description: apt.notes || '',
          };
        }
      }

      // Use approved appointment as upcoming class if no scheduled class exists,
      // or if the appointment is sooner than the scheduled class
      const scheduledClass = classData?.success ? classData.upcomingClass : null;
      let finalUpcomingClass = scheduledClass;
      if (approvedSession) {
        if (!scheduledClass || new Date(approvedSession.date) <= new Date(scheduledClass.date)) {
          finalUpcomingClass = approvedSession;
        }
      }

      setDashboardData((prev) => ({
        ...prev,
        todayWorkout: workoutData?.success ? workoutData : prev.todayWorkout,
        todayNutrition: nutritionData?.success ? nutritionData.todayNutrition : prev.todayNutrition,
        todaysConsumedFoods: nutritionData?.success ? nutritionData.todaysConsumedFoods : prev.todaysConsumedFoods,
        weeklyWorkouts: statsData?.success ? statsData.weeklyWorkouts : prev.weeklyWorkouts,
        exerciseProgress: progressData?.success ? progressData.exerciseProgress : prev.exerciseProgress,
        upcomingClass: finalUpcomingClass,
      }));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Called by TodaysWorkout after a successful /api/exercise/complete response.
  // Only patches the todayWorkout slice — no full re-fetch, no blink.
  const handleExerciseComplete = ({ progress, completedExercises, totalExercises, exerciseId }) => {
    setDashboardData((prev) => ({
      ...prev,
      todayWorkout: {
        ...prev.todayWorkout,
        progress,
        completedExercises,
        totalExercises,
        exercises: prev.todayWorkout.exercises.map((ex) =>
          ex._id === exerciseId ? { ...ex, completed: true } : ex
        ),
      },
    }));
  };

  // Called by NutritionTracking after a successful /api/nutrition/mark-consumed response.
  // Only patches the todayNutrition slice — no full re-fetch, no blink.
  const handleFoodComplete = ({ calories, protein, foodName }) => {
    setDashboardData((prev) => ({
      ...prev,
      todayNutrition: {
        ...prev.todayNutrition,
        calories_consumed: (prev.todayNutrition.calories_consumed || 0) + calories,
        protein_consumed: (prev.todayNutrition.protein_consumed || 0) + protein,
      },
      // Also flip the food's consumed flag so the button turns green instantly
      todaysConsumedFoods: prev.todaysConsumedFoods.map((f) =>
        f.name === foodName ? { ...f, consumed: true, consumedAt: new Date() } : f
      ),
    }));
  };



  // --- ACCESS CONTROL HELPER ---
  const hasAccess = (requiredTier) => {
    if (!user || !user.membershipType) return false;
    const plans = { Basic: 1, Gold: 2, Platinum: 3 };
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
    <div className="w-full text-gray-100 font-sans">
      <DashboardHero user={user} />

      <div className="max-w-7xl mx-auto px-5 pb-10 overflow-x-hidden">
        {/* 1. Overview Cards - Visible to ALL */}
        <OverviewCards
          todayNutrition={dashboardData.todayNutrition}
          weeklyWorkouts={dashboardData.weeklyWorkouts}
          todayWorkout={dashboardData.todayWorkout}
          user={user}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* 2. Today's Workout - Visible to ALL */}
          <TodaysWorkout
            todayWorkout={dashboardData.todayWorkout}
            onExerciseComplete={handleExerciseComplete}
          />

          {/* 3. Platinum Section (Classes & Trainer) */}
          <div className="flex flex-col gap-6">
              {hasAccess("Platinum") ? (
                <UpcomingClass upcomingClass={dashboardData.upcomingClass} />
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col items-center justify-center text-center h-full min-h-[150px]">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3 text-gray-500 text-xl">
                    <i className="fas fa-lock"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-300 mb-1">Live Classes Locked</h3>
                  <p className="text-xs text-gray-500">Upgrade to Platinum to access live classes.</p>
                </div>
              )}


          </div>
        </div>

        {/* Book Trainer Session - Full Width (Platinum Only) */}
        {hasAccess("Platinum") && user.trainer && (
          <div className="mb-10">
            <BookTrainerSession trainer={user.trainer} />
          </div>
        )}

        {/* 4. Progress Tracking - PLATINUM ONLY */}
        {hasAccess("Platinum") && (
          <ProgressTracking
            exerciseProgress={dashboardData.exerciseProgress}
            nutritionChartData={dashboardData.nutritionChartData}
          />
        )}

        {/* 5. Nutrition Tracking - GOLD & PLATINUM ONLY */}
        {hasAccess("Gold") ? (
          <NutritionTracking
            todaysConsumedFoods={dashboardData.todaysConsumedFoods}
            todayNutrition={dashboardData.todayNutrition}
            user={user}
            onFoodComplete={handleFoodComplete}
          />
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center mt-10">
            <h3 className="text-xl font-bold text-gray-300 mb-2">Nutrition Tracking Locked</h3>
            <p className="text-sm text-gray-500">Upgrade to Gold or Platinum to unlock advanced nutrition tracking and meal logs.</p>
          </div>
        )}
      </div>



    </div>
  );
};

export default UserDashboard;