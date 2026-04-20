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
    fetchDashboardData();
  }, [type]);

  const fetchDashboardData = async (showLoading = true) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    if (showLoading) setLoading(true);
    setError(null);

    // 1. Fetch User Profile (required for rendering structure)
    fetch("/api/user/profile", { headers })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success) setUser(data.user);
        // Turn off global loader immediately once the user is fetched
        setLoading(false); 
      })
      .catch((err) => {
        if (err.message !== "Unauthorized") {
          console.error("Error fetching user:", err);
          setError("Failed to load user profile");
          setLoading(false);
        }
      });

    // 2. Fire and Forget the rest! They update local state progressively as they finish.
    fetch("/api/workout/today", { headers })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDashboardData((p) => ({ ...p, todayWorkout: data }));
      }).catch(console.error);

    fetch("/api/nutrition/today", { headers })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setDashboardData((p) => ({
            ...p,
            todayNutrition: data.todayNutrition,
            todaysConsumedFoods: data.todaysConsumedFoods,
          }));
        }
      }).catch(console.error);

    fetch("/api/workout/weekly-stats", { headers })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDashboardData((p) => ({ ...p, weeklyWorkouts: data.weeklyWorkouts }));
      }).catch(console.error);

    fetch("/api/exercise/progress", { headers })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDashboardData((p) => ({ ...p, exerciseProgress: data.exerciseProgress }));
      }).catch(console.error);

    // 3. Class and Appointments depend on each other for comparison
    Promise.all([
      fetch("/api/class/upcoming", { headers }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/user/appointments", { headers }).then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([classData, appointmentsData]) => {
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

      const scheduledClass = classData?.success ? classData.upcomingClass : null;
      let finalUpcomingClass = scheduledClass;
      if (approvedSession) {
        if (!scheduledClass || new Date(approvedSession.date) <= new Date(scheduledClass.date)) {
          finalUpcomingClass = approvedSession;
        }
      }

      setDashboardData((p) => ({ ...p, upcomingClass: finalUpcomingClass }));
    });
  };

  // Called by TodaysWorkout — surgically patches only todayWorkout, no full re-fetch
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

  // Called by NutritionTracking — surgically patches only todayNutrition, no full re-fetch
  const handleFoodComplete = ({ calories, protein, foodName }) => {
    setDashboardData((prev) => ({
      ...prev,
      todayNutrition: {
        ...prev.todayNutrition,
        calories_consumed: (prev.todayNutrition.calories_consumed || 0) + calories,
        protein_consumed: (prev.todayNutrition.protein_consumed || 0) + protein,
      },
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