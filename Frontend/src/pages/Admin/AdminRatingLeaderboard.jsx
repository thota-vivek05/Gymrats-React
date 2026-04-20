import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const getToneClasses = (tone) => {
  switch (tone) {
    case 'red': return "bg-red-500/5 border-red-500/50 text-red-500";
    case 'orange': return "bg-orange-500/5 border-orange-500/50 text-orange-500";
    case 'yellow': return "bg-yellow-500/5 border-yellow-500/50 text-yellow-500";
    case 'green': return "bg-green-500/5 border-green-500/50 text-green-500";
    case 'purple': return "bg-purple-500/5 border-purple-500/50 text-purple-500";
    case 'blue': return "bg-blue-500/5 border-blue-500/50 text-blue-500";
    default: return "bg-gray-500/5 border-gray-500/50 text-gray-500";
  }
};

const StatCard = ({ label, value, subtext }) => {
  return (
    <div className="bg-[#111] rounded-lg p-5 border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(138,43,226,0.4)]">
      <h3 className="text-[#cccccc] text-[0.65rem] font-bold uppercase tracking-widest mb-2 border-b border-[#333] pb-1">{label}</h3>
      <p className="text-[#8A2BE2] text-3xl font-bold">{value}</p>
      {subtext && <p className="text-gray-500 text-xs mt-1 font-semibold">{subtext}</p>}
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
  const [error, setError] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [trainerReviews, setTrainerReviews] = useState([]);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      const exercisesRes = await fetch(
        `/api/admin/ratings/top-exercises?${selectedCategory ? `category=${selectedCategory}` : ''}`,
        { headers: { "Authorization": `Bearer ${token}` } }
      );
      const trainerRes = await fetch("/api/admin/ratings/trainer-leaderboard", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const exercisesData = await exercisesRes.json();
      const trainerData = await trainerRes.json();
      
      if (exercisesData.success) {
        setTopExercises(exercisesData.exercises || []);
        setCategoryAverages(exercisesData.categoryAverages || []);
      } else {
         setError(exercisesData.message || "Failed to load exercises leaderboard.");
      }
      
      if (trainerData.success) {
        setTrainerLeaderboard(trainerData.leaderboard || []);
        setPoorlyRated(trainerData.poorlyRated || []);
      } else {
         setError(trainerData.message || "Failed to load trainer leaderboard.");
      }
    } catch (err) {
      console.error("Error fetching leaderboard data:", err);
      setError("Network error fetching metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedCategory]);

  const fetchTrainerReviews = async (trainerId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/ratings/trainer/${trainerId}/reviews`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTrainerReviews(data.reviews);
        setSelectedTrainer(trainerLeaderboard.find(t => t._id === trainerId) || poorlyRated.find(t => t._id === trainerId));
        setShowReviewsModal(true);
      }
    } catch (error) { console.error("Error fetching trainer reviews:", error); }
  };

  const handleFlagReview = async (reviewId) => {
    if (!window.confirm("Flag this review for reassignment? This will mark the trainer for review.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/ratings/flag-review/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (selectedTrainer) fetchTrainerReviews(selectedTrainer._id);
      } else { alert("Error: " + data.message); }
    } catch (error) { alert("Failed to flag review"); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-[#f1f1f1] bg-black">
      <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
      <p>Loading Ratings Intelligence...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 min-h-screen text-[#f1f1f1] bg-black">
        
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 flex justify-between items-center">
            <p><strong>Error:</strong> {error}</p>
            <button onClick={() => fetchLeaderboardData()} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition-colors">Try Again</button>
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold">Ratings Intelligence</h1>
           <p className="mt-1 text-sm text-[#999]">Assess global application satisfaction and exercise metrics</p>
        </div>
        <button
          onClick={() => navigate('/admin/reassignment')}
          className="bg-red-900/40 border border-red-800 text-red-400 px-6 py-3 rounded uppercase tracking-widest font-bold text-xs hover:bg-red-900/60 transition-colors"
        >
          Manage Review Reassignments
        </button>
      </div>

      {/* Flagged Attention Center */}
      {poorlyRated.length > 0 && (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 border-b border-[#333] pb-2 text-red-400">⚠️ Underperforming Assets Center</h2>
            <div className="bg-[#111] rounded-lg border border-red-900/50 p-5 shadow-[0_4px_8px_rgba(255,0,0,0.1)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-red-900/40 text-red-400">
                                <th className="p-2 text-left text-xs uppercase tracking-widest">Trainer Risk Identity</th>
                                <th className="p-2 text-left text-xs uppercase tracking-widest">Calculated Score</th>
                                <th className="p-2 text-left text-xs uppercase tracking-widest">Volume Assessed</th>
                                <th className="p-2 text-left text-xs uppercase tracking-widest">Client Count</th>
                                <th className="p-2 text-left text-xs uppercase tracking-widest">Action Panel</th>
                            </tr>
                        </thead>
                        <tbody>
                            {poorlyRated.map(trainer => (
                                <tr key={trainer._id} className="border-b border-[#222]">
                                    <td className="p-3">
                                        <div className="font-bold text-base">{trainer.name}</div>
                                        <div className="text-[0.65rem] text-gray-500 font-mono mt-0.5">{trainer._id.slice(-6)}</div>
                                    </td>
                                    <td className="p-3">
                                        <span className="bg-red-900/30 text-red-400 border border-red-800 font-bold px-2 py-1 rounded text-lg">
                                            {trainer.avgRating?.toFixed(1) || '0.0'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-300 font-semibold">{trainer.reviewCount} total logs</td>
                                    <td className="p-3 text-gray-300 font-semibold">{trainer.totalClients || 0} active mapped</td>
                                    <td className="p-3 flex gap-2">
                                        <button onClick={() => navigate(`/admin/reassignment?trainer=${trainer._id}`)} className="bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-1.5 rounded text-[0.65rem] font-bold uppercase tracking-widest hover:bg-red-500/40 transition-colors">
                                            Execute Client Dump
                                        </button>
                                        <button onClick={() => fetchTrainerReviews(trainer._id)} className="bg-gray-800 text-gray-300 border border-gray-600 px-3 py-1.5 rounded text-[0.65rem] font-bold uppercase tracking-widest hover:bg-gray-700 transition-colors">
                                            Read Complaints
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* Category Stats */}
      {categoryAverages.length > 0 && (
         <div className="mb-8">
            <div className="flex justify-between items-end mb-4 border-b border-[#333] pb-2">
                <h2 className="text-xl font-bold">Category Mean Thresholds</h2>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none">
                    <option value="">All Scopes</option>
                    <option value="Calisthenics">Calisthenics Focus</option>
                    <option value="Weight Loss">Weight Loss Focus</option>
                    <option value="HIIT">HIIT Processing</option>
                    <option value="Strength Training">Strength Mechanics</option>
                    <option value="Cardio">Cardiovascular</option>
                    <option value="Flexibility">Flexibility Target</option>
                    <option value="Bodybuilding">Bodybuilding Scale</option>
                </select>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categoryAverages.slice(0, 4).map((cat) => (
                <StatCard key={cat._id} label={cat._id} value={cat.avgRating.toFixed(1)} subtext={`${cat.count} mapped exercises`} />
              ))}
            </div>
         </div>
      )}
      
      {/* Dual Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Top Exercises */}
          <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.15)] flex flex-col h-[600px]">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-[#8A2BE2] flex justify-between items-center">
              <span>⭐ Asset Leaderboard (Exercises)</span>
              <span className="text-[0.6rem] bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded border border-purple-800">TOP 100</span>
            </h2>
            
            <div className="overflow-y-auto flex-1 pr-2 space-y-2 custom-scrollbar">
              {topExercises.length > 0 ? (
                topExercises.map((ex, idx) => (
                  <div key={ex._id} className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#222] rounded-lg hover:border-[#8A2BE2]/40 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 flex items-center justify-center font-bold text-[#8A2BE2] text-sm leading-none">
                         {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-[#f1f1f1] text-sm">{ex.name}</p>
                        <div className="flex gap-2 mt-1">
                            <span className="text-[0.6rem] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded uppercase tracking-wider">{ex.category}</span>
                            <span className="text-[0.6rem] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded uppercase tracking-wider border border-blue-800/40">{ex.primaryMuscle}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="bg-yellow-900/30 text-yellow-500 font-bold px-2 py-0.5 rounded border border-yellow-700/50 flex items-center gap-1.5">
                          ⭐ {ex.averageRating?.toFixed(1) || '0.0'}
                      </div>
                      <p className="text-[0.65rem] font-semibold text-gray-500 uppercase tracking-widest mt-1">{ex.totalRatings || 0} Logs</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-[#999] py-10 italic">No exercise review traces exist.</div>
              )}
            </div>
          </div>
          
          {/* Top Trainers */}
          <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.15)] flex flex-col h-[600px]">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-[#8A2BE2] flex justify-between items-center">
              <span>🏆 Staff Leaderboard (Trainers)</span>
            </h2>
            
            <div className="overflow-y-auto flex-1 pr-2 space-y-2 custom-scrollbar">
              {trainerLeaderboard.length > 0 ? (
                trainerLeaderboard.map((trainer, idx) => (
                  <div key={trainer._id} onClick={() => fetchTrainerReviews(trainer._id)} className="group flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#222] rounded-lg hover:border-[#8A2BE2]/40 transition-colors cursor-pointer relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10 w-full justify-between">
                      <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm leading-none border ${
                            idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 
                            idx === 1 ? 'bg-gray-400/20 text-gray-300 border-gray-400/50' : 
                            idx === 2 ? 'bg-orange-600/20 text-orange-400 border-orange-600/50' : 
                            'bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]/30'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-[#f1f1f1] text-sm group-hover:text-[#8A2BE2] transition-colors">{trainer.name}</p>
                            <p className="text-[0.65rem] text-gray-500 font-semibold uppercase tracking-widest mt-0.5">{trainer.specializations?.slice(0, 2).join(', ')}</p>
                          </div>
                      </div>

                      <div className="text-right flex flex-col items-end border-l border-[#333] pl-4">
                        <div className="bg-[#111] text-[#f1f1f1] font-bold px-2 py-0.5 rounded border border-[#444] text-sm shadow-inner">
                            {trainer.avgRating?.toFixed(1) || '0.0'}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                           {trainer.flaggedReviews > 0 && <span className="text-[0.6rem] bg-red-900/40 text-red-400 px-1 rounded animate-pulse">⚠️ {trainer.flaggedReviews}</span>}
                           <span className="text-[0.6rem] font-semibold text-gray-600 uppercase tracking-widest">{trainer.reviewCount} Logs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-[#999] py-10 italic">No trainer rating traces exist.</div>
              )}
            </div>
          </div>

      </div>
      
      {/* Standardized Trainer Reviews Modal */}
      {showReviewsModal && selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            
            <div className="flex justify-between items-start mb-6 border-b border-[#333] pb-4">
               <div>
                 <h2 className="text-2xl font-bold flex items-center gap-3">
                   {selectedTrainer.name} 
                   <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 text-sm px-2 py-0.5 rounded shadow-sm">⭐ {selectedTrainer.avgRating?.toFixed(1) || '0.0'}</span>
                 </h2>
                 <p className="text-xs text-[#999] mt-1 font-mono">{selectedTrainer.email}</p>
               </div>
               <button onClick={() => setShowReviewsModal(false)} className="text-[#999] hover:text-white bg-[#222] w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
            </div>
            
            <div className="flex gap-2 mb-6">
                 {selectedTrainer.specializations && selectedTrainer.specializations.map((spec, i) => (
                    <span key={i} className="text-[0.65rem] bg-[#8A2BE2]/10 text-[#8A2BE2] border border-[#8A2BE2]/40 px-2 py-1 rounded uppercase tracking-wider font-bold">{spec}</span>
                 ))}
                 <div className="ml-auto text-xs font-semibold text-gray-400 flex items-center gap-1 bg-[#1a1a1a] px-3 py-1 rounded border border-[#333]">
                    <i className="fas fa-users text-gray-500"></i> {selectedTrainer.reviewCount} Review Logs Fetched
                 </div>
            </div>
            
            <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {trainerReviews.length > 0 ? (
                trainerReviews.map((review) => (
                  <div key={review._id} className={`p-4 rounded-lg relative ${review.flaggedForReassignment ? 'bg-red-900/10 border-l-4 border-red-500 shadow-inner' : 'bg-[#1a1a1a] border border-[#333]'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-[#f1f1f1]">{review.userId?.full_name || 'Anonymous Identifier'}</p>
                        <p className="text-[0.65rem] text-[#777] font-mono mt-0.5 font-bold uppercase tracking-widest">{new Date(review.reviewedAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-black text-yellow-500 border border-[#444] px-2 py-0.5 rounded font-bold text-sm">⭐ {review.rating}</span>
                        {!review.flaggedForReassignment ? (
                          <button onClick={() => handleFlagReview(review._id)} className="text-[0.65rem] font-bold uppercase tracking-widest px-2 py-1.5 bg-orange-900/30 text-orange-400 border border-orange-800/60 rounded hover:bg-orange-900/60 transition-colors">Flag Risk</button>
                        ) : (
                          <span className="text-[0.65rem] font-bold uppercase tracking-widest px-2 py-1 bg-red-900/50 text-red-400 border border-red-500/50 rounded">FLAGGED ALREADY</span>
                        )}
                      </div>
                    </div>
                    {review.feedback && (
                      <div className="mt-3 text-sm text-[#ccc] bg-[#222] p-3 rounded border-l-2 border-[#555] italic">
                          "{review.feedback}"
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-[#999] py-10 bg-[#1a1a1a] rounded border border-[#333] border-dashed italic">No written feedback logs attached to this asset.</div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRatingsLeaderboard;