import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Components
import DashboardHeader from "./components/DashboardHeader";
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

  // NEW STATES: Trainer Management (Platinum Only)
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({ rating: 5, feedback: '' });

  useEffect(() => {
    fetchDashboardData();
  }, [type]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
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
        fetch("/appointments", { headers }),
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
      setLoading(false);
    }
  };

  const handleExerciseComplete = () => {
    fetchDashboardData(); // Refresh to update progress bar
  };

  const handleFoodComplete = () => {
    fetchDashboardData(); // Refresh to update nutrition stats
  };

  // --- NEW TRAINER HANDLERS ---
  const submitTrainerRating = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/trainer/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ trainerId: user?.trainer?._id, ...ratingData })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Trainer rated successfully! Thank you for your feedback.");
        setShowRatingModal(false);
        setRatingData({ rating: 5, feedback: '' });
      } else {
        alert(data.error || "Failed to submit rating");
      }
    } catch (err) { alert("Error submitting rating"); }
  };

  const requestTrainerChange = async () => {
    if (window.confirm("Are you sure you want to request a new trainer? This will immediately unassign your current trainer.")) {
      try {
        const res = await fetch('/api/user/trainer/change', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ reason: "Requested via user dashboard" })
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            fetchDashboardData(); // Refresh UI to remove trainer card
        } else {
            alert(data.error);
        }
      } catch (err) { alert("Error requesting trainer change"); }
    }
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
    <div className="min-h-screen bg-black text-gray-100 font-sans overflow-x-hidden">
      <DashboardHeader user={user} currentPage="dashboard" />
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

              {/* My Trainer Card (Platinum Only) */}
              {hasAccess("Platinum") && (
                  <div className="bg-[#161616] border border-[#333] rounded-lg p-6 shadow-lg">
                      <div className="flex items-center gap-3 border-b border-[#333] pb-3 mb-4">
                          <i className="fas fa-user-tie text-[#8A2BE2] text-xl"></i>
                          <h3 className="text-xl font-bold text-white">My Personal Trainer</h3>
                      </div>
                      
                      {user.trainer ? (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                  <h4 className="text-lg font-semibold text-[#daa520]">{user.trainer.name}</h4>
                                  <p className="text-sm text-gray-400 mb-1">{user.trainer.email}</p>
                                  {user.trainer.specializations && (
                                    <p className="text-xs text-gray-500"><i className="fas fa-star text-yellow-500 mr-1"></i> {user.trainer.specializations.join(', ')}</p>
                                  )}
                              </div>
                              <div className="flex flex-col gap-2 w-full sm:w-auto">
                                  <button onClick={() => setShowRatingModal(true)} className="px-4 py-2 bg-[#8A2BE2]/20 border border-[#8A2BE2]/50 text-[#8A2BE2] hover:bg-[#8A2BE2] hover:text-white rounded text-sm font-medium transition-all w-full text-center">
                                      Rate Trainer
                                  </button>
                                  <button onClick={requestTrainerChange} className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded text-sm font-medium transition-all w-full text-center">
                                      Request Change
                                  </button>
                              </div>
                          </div>
                      ) : (
                          <div className="text-center py-6">
                              <div className="inline-block p-3 rounded-full bg-[#222] mb-3">
                                  <i className="fas fa-hourglass-half text-[#daa520] text-xl"></i>
                              </div>
                              <p className="text-gray-300 font-medium">No trainer assigned yet.</p>
                              <p className="text-gray-500 text-sm mt-1">Our managers are pairing you with the perfect coach!</p>
                          </div>
                      )}
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

      {/* --- TRAINER RATING MODAL --- */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#161616] p-6 rounded-xl border border-[#333] shadow-2xl w-full max-w-sm">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold text-white">Rate Your Trainer</h2>
                    <button onClick={() => setShowRatingModal(false)} className="text-[#aaa] hover:text-white text-xl">&times;</button>
                </div>
                
                <form onSubmit={submitTrainerRating} className="space-y-5">
                    {/* INTERACTIVE STAR RATING SECTION */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Rating (1 to 5 Stars)</label>
                        <div className="flex items-center gap-2 mb-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    // This updates the rating number in the state when clicked
                                    onClick={() => setRatingData({...ratingData, rating: star})}
                                    className={`text-3xl focus:outline-none transition-colors duration-200 ${
                                        ratingData.rating >= star ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-gray-600 hover:text-gray-400'
                                    }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 italic">Ratings of 2 stars or below will notify management for a review.</p>
                    </div>
                    
                    {/* FEEDBACK SECTION */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Feedback / Comments</label>
                        <textarea 
                            rows="3" 
                            required
                            value={ratingData.feedback} 
                            onChange={(e) => setRatingData({...ratingData, feedback: e.target.value})} 
                            className="w-full bg-[#222] border border-[#444] rounded-lg p-3 text-white focus:outline-none focus:border-[#8A2BE2] transition-colors" 
                            placeholder="Tell us about your experience..."
                        ></textarea>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowRatingModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-[#8A2BE2] hover:bg-[#7a1bd2] text-white rounded font-medium transition-colors">Submit Rating</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;