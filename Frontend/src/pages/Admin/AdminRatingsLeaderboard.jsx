import React, { useEffect, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import { useNavigate } from "react-router-dom";

const StatCard = ({ label, value, subtext }) => {
  return (
    <div className="bg-[#111] rounded-lg p-5 border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
      <h3 className="text-[#cccccc] text-sm font-semibold uppercase tracking-wide mb-2">{label}</h3>
      <p className="text-[#8A2BE2] text-3xl font-bold">{value}</p>
      {subtext && <p className="text-[#999] text-xs mt-1">{subtext}</p>}
    </div>
  );
};

const AdminRatingsLeaderboard = () => {
  const navigate = useNavigate();
  const [topExercises, setTopExercises] = useState([]);
  const [trainerLeaderboard, setTrainerLeaderboard] = useState([]);
  const [poorlyRated, setPoorlyRated] = useState([]);
  const [categoryAverages, setCategoryAverages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [trainerReviews, setTrainerReviews] = useState([]);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedCategory]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Fetch top exercises
      const exercisesRes = await fetch(
        `/api/admin/ratings/top-exercises?${selectedCategory ? `category=${selectedCategory}` : ''}`,
        { headers: { "Authorization": `Bearer ${token}` } }
      );
      
      // Fetch trainer leaderboard
      const trainerRes = await fetch("/api/admin/ratings/trainer-leaderboard", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const exercisesData = await exercisesRes.json();
      const trainerData = await trainerRes.json();
      
      if (exercisesData.success) {
        setTopExercises(exercisesData.exercises || []);
        setCategoryAverages(exercisesData.categoryAverages || []);
      }
      
      if (trainerData.success) {
        setTrainerLeaderboard(trainerData.leaderboard || []);
        setPoorlyRated(trainerData.poorlyRated || []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainerReviews = async (trainerId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/ratings/trainer/${trainerId}/reviews`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTrainerReviews(data.reviews);
        setSelectedTrainer(trainerLeaderboard.find(t => t._id === trainerId));
        setShowReviewsModal(true);
      }
    } catch (error) {
      console.error("Error fetching trainer reviews:", error);
    }
  };

  const handleFlagReview = async (reviewId) => {
    if (!confirm("Flag this review for reassignment? This will mark the trainer for review.")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/ratings/flag-review/${reviewId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        alert("Review flagged successfully!");
        // Refresh reviews
        if (selectedTrainer) {
          fetchTrainerReviews(selectedTrainer._id);
        }
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error flagging review:", error);
      alert("Failed to flag review");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center flex-1 p-8">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading Ratings Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
      <AdminSidebar />
      
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Ratings Intelligence</h1>
          <button
            onClick={() => navigate('/admin/reassignment')}
            className="bg-[#8A2BE2] text-white px-4 py-2 rounded hover:bg-[#7020a0]"
          >
            Manage Reassignments
          </button>
        </div>
        
        {/* Category Filter */}
        <div className="mb-6 bg-[#111] p-4 rounded-lg border border-[#333]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-2 rounded focus:outline-none focus:border-[#8A2BE2]"
          >
            <option value="">All Categories</option>
            <option value="Calisthenics">Calisthenics</option>
            <option value="Weight Loss">Weight Loss</option>
            <option value="HIIT">HIIT</option>
            <option value="Strength Training">Strength Training</option>
            <option value="Cardio">Cardio</option>
            <option value="Flexibility">Flexibility</option>
            <option value="Bodybuilding">Bodybuilding</option>
          </select>
        </div>
        
        {/* Category Stats */}
        {categoryAverages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {categoryAverages.slice(0, 4).map((cat) => (
              <StatCard
                key={cat._id}
                label={cat._id}
                value={cat.avgRating.toFixed(1)}
                subtext={`${cat.count} exercises`}
              />
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Rated Exercises */}
          <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-[#8A2BE2]">
              ⭐ Top Rated Exercises
            </h2>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {topExercises.length > 0 ? (
                topExercises.map((ex, idx) => (
                  <div key={ex._id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#252525]">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8A2BE2] font-bold">{idx + 1}.</span>
                      <div>
                        <p className="font-semibold">{ex.name}</p>
                        <p className="text-xs text-[#999]">{ex.category} • {ex.primaryMuscle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#8A2BE2] font-bold">{ex.averageRating?.toFixed(1) || '0.0'}</p>
                      <p className="text-xs text-[#999]">{ex.totalRatings || 0} reviews</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-[#999] py-4">No rated exercises found</p>
              )}
            </div>
          </div>
          
          {/* Trainer Leaderboard */}
          <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-[#8A2BE2]">
              🏆 Top Rated Trainers
            </h2>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {trainerLeaderboard.length > 0 ? (
                trainerLeaderboard.map((trainer, idx) => (
                  <div 
                    key={trainer._id} 
                    className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#252525] cursor-pointer"
                    onClick={() => fetchTrainerReviews(trainer._id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${
                        idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-[#8A2BE2]'
                      }`}>{idx + 1}.</span>
                      <div>
                        <p className="font-semibold">{trainer.name}</p>
                        <p className="text-xs text-[#999]">{trainer.specializations?.slice(0, 2).join(', ')}</p>
                        {trainer.flaggedReviews > 0 && (
                          <span className="text-xs text-red-400">⚠️ {trainer.flaggedReviews} flagged</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#8A2BE2] font-bold">{trainer.avgRating}</p>
                      <p className="text-xs text-[#999]">{trainer.reviewCount} reviews</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-[#999] py-4">No trainer ratings yet</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Poorly Rated Trainers - For Reassignment */}
        {poorlyRated.length > 0 && (
          <div className="bg-[#111] rounded-lg border border-red-500 p-5">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-red-500 text-red-400">
              ⚠️ Trainers Needing Review (Avg Rating {'<'} 3.0)
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1e1e3a]">
                    <th className="p-3 text-left">Trainer</th>
                    <th className="p-3 text-left">Rating</th>
                    <th className="p-3 text-left">Reviews</th>
                    <th className="p-3 text-left">Clients</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {poorlyRated.map((trainer) => (
                    <tr key={trainer._id} className="border-b border-[#333]">
                      <td className="p-3">{trainer.name}</td>
                      <td className="p-3">
                        <span className="text-red-400 font-bold">{trainer.avgRating}</span>
                      </td>
                      <td className="p-3">{trainer.reviewCount}</td>
                      <td className="p-3">{trainer.totalClients || 0}</td>
                      <td className="p-3">
                        <button
                          onClick={() => navigate(`/admin/reassignment?trainer=${trainer._id}`)}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                        >
                          Review Clients
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Trainer Reviews Modal */}
      {showReviewsModal && selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#8A2BE2] p-6 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedTrainer.name} - Reviews</h2>
              <button onClick={() => setShowReviewsModal(false)} className="text-[#999] hover:text-white">✕</button>
            </div>
            
            <div className="mb-4 p-3 bg-[#1a1a1a] rounded-lg">
              <p><span className="text-[#999]">Average Rating:</span> <span className="text-[#8A2BE2] font-bold">{selectedTrainer.avgRating}</span> ({selectedTrainer.reviewCount} reviews)</p>
              <p><span className="text-[#999]">Specializations:</span> {selectedTrainer.specializations?.join(', ')}</p>
            </div>
            
            <div className="space-y-3">
              {trainerReviews.length > 0 ? (
                trainerReviews.map((review) => (
                  <div key={review._id} className={`p-4 rounded-lg ${review.flaggedForReassignment ? 'bg-red-500/10 border border-red-500' : 'bg-[#1a1a1a]'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{review.userId?.full_name || 'Anonymous'}</p>
                        <p className="text-sm text-[#999]">{new Date(review.reviewedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-500">⭐ {review.rating}</span>
                        {!review.flaggedForReassignment && (
                          <button
                            onClick={() => handleFlagReview(review._id)}
                            className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                          >
                            Flag
                          </button>
                        )}
                        {review.flaggedForReassignment && (
                          <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                            Flagged
                          </span>
                        )}
                      </div>
                    </div>
                    {review.feedback && (
                      <p className="mt-2 text-sm text-[#ccc]">{review.feedback}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-[#999] py-4">No reviews found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRatingsLeaderboard;