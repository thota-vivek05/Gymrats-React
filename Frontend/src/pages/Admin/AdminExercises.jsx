import React, { useEffect, useState } from "react";

// Helper functions for localized computation
const getAttentionFlags = (exercise) => {
  const flags = [];
  if (!exercise.image || exercise.image.trim() === '') flags.push("Missing Image");
  if (!exercise.instructions || exercise.instructions.trim().length < 20) flags.push("Short Instructions");
  if (!exercise.targetMuscles || exercise.targetMuscles.length === 0) flags.push("No Target Muscles");
  if (!exercise.verified) flags.push("Unverified");
  return flags;
};

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

// Reusable StatCard Component
const StatCard = ({ label, value }) => {
  return (
    <div className="bg-[#111] rounded-lg p-5 border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(138,43,226,0.4)]">
      <h3 className="text-[#cccccc] text-sm font-semibold uppercase tracking-wide mb-2">{label}</h3>
      <p className="text-[#8A2BE2] text-3xl font-bold">{value}</p>
    </div>
  );
};

// Reusable AttentionCard Component
const AttentionCard = ({ label, value, color }) => {
  const toneClasses = getToneClasses(color);
  return (
    <div className={`rounded-lg p-4 border shadow-md flex justify-between items-center ${toneClasses}`}>
      <h3 className="text-sm font-semibold uppercase tracking-wide opacity-80">{label}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

const AdminExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  
  // Base Filters mapped directly to backend + local compute
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterVerified, setFilterVerified] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterAttention, setFilterAttention] = useState("All");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  
  const [addFormData, setAddFormData] = useState({
    name: "", category: "", difficulty: "", targetMuscles: "", instructions: "",
    type: "Reps", defaultSets: 3, defaultRepsOrDuration: "", equipment: "",
    primaryMuscle: "", secondaryMuscles: "", image: ""
  });
  
  const [editFormData, setEditFormData] = useState({
    name: "", category: "", difficulty: "", targetMuscles: "", instructions: "",
    type: "Reps", defaultSets: 3, defaultRepsOrDuration: "", equipment: "",
    primaryMuscle: "", secondaryMuscles: "", image: "", verified: false
  });

  const fetchExercises = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = "/api/admin/exercises";
      const params = new URLSearchParams();
      
      if (searchTerm) params.append("search", searchTerm);
      if (filterCategory !== "All") params.append("category", filterCategory);
      if (filterDifficulty !== "All") params.append("difficulty", filterDifficulty);
      if (filterVerified !== "All") params.append("verified", filterVerified);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
      const data = await response.json();
      
      if (data.success) {
        setExercises(data.exercises || []);
        setStats(data.stats);
        setError(null);
      } else {
        setError(data.message || "Failed to load exercises");
      }
    } catch (err) {
      console.error("Error fetching exercises:", err);
      setError("Network error. Please ensure the backend is running.");
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      await fetchExercises();
      setLoading(false);
    };
    loadInitial();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExercises();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterCategory, filterDifficulty, filterVerified]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this exercise?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/admin/exercises/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setExercises(exercises.filter((e) => e._id !== id));
      alert("Exercise deleted");
    } catch (err) {
      alert("Failed to delete exercise");
    }
  };

  // Modals & Forms logic exactly preserved!
  const handleAddExercise = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const exerciseData = {
        ...addFormData,
        targetMuscles: addFormData.targetMuscles.split(',').map(m => m.trim()),
        secondaryMuscles: addFormData.secondaryMuscles ? addFormData.secondaryMuscles.split(',').map(m => m.trim()) : [],
        equipment: addFormData.equipment ? addFormData.equipment.split(',').map(e => e.trim()) : [],
        defaultSets: parseInt(addFormData.defaultSets)
      };
      
      const response = await fetch("/api/admin/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(exerciseData)
      });
      
      const data = await response.json();
      if (data.success) {
        setExercises([data.exercise, ...exercises]);
        setIsAddModalOpen(false);
        setAddFormData({
          name: "", category: "", difficulty: "", targetMuscles: "", instructions: "",
          type: "Reps", defaultSets: 3, defaultRepsOrDuration: "", equipment: "",
          primaryMuscle: "", secondaryMuscles: "", image: ""
        });
        alert("Exercise added successfully!");
      } else { alert("Error: " + data.message); }
    } catch (err) { alert("Failed to add exercise"); }
  };

  const handleEditClick = (exercise) => {
    setEditingExercise(exercise);
    setEditFormData({
      name: exercise.name || "", category: exercise.category || "", difficulty: exercise.difficulty || "",
      targetMuscles: exercise.targetMuscles ? exercise.targetMuscles.join(', ') : "",
      instructions: exercise.instructions || "", type: exercise.type || "Reps", defaultSets: exercise.defaultSets || 3,
      defaultRepsOrDuration: exercise.defaultRepsOrDuration || "",
      equipment: exercise.equipment ? exercise.equipment.join(', ') : "",
      primaryMuscle: exercise.primaryMuscle || "",
      secondaryMuscles: exercise.secondaryMuscles ? exercise.secondaryMuscles.join(', ') : "",
      image: exercise.image || "", verified: exercise.verified || false
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateExercise = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const exerciseData = {
        ...editFormData,
        targetMuscles: editFormData.targetMuscles.split(',').map(m => m.trim()),
        secondaryMuscles: editFormData.secondaryMuscles ? editFormData.secondaryMuscles.split(',').map(m => m.trim()) : [],
        equipment: editFormData.equipment ? editFormData.equipment.split(',').map(e => e.trim()) : [],
        defaultSets: parseInt(editFormData.defaultSets)
      };
      const response = await fetch(`/api/admin/exercises/${editingExercise._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(exerciseData)
      });
      const data = await response.json();
      if (data.success) {
        setExercises(exercises.map(e => e._id === editingExercise._id ? data.exercise : e));
        setIsEditModalOpen(false);
        setEditingExercise(null);
        alert("Exercise updated successfully!");
      } else { alert("Error: " + data.message); }
    } catch (err) { alert("Failed to update exercise"); }
  };

  const handleVerifyExercise = async (id, currentVerified) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/exercises/${id}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ verified: !currentVerified })
      });
      const data = await response.json();
      if (data.success) {
        setExercises(exercises.map(e => e._id === id ? data.exercise : e));
      }
    } catch (err) { alert("Failed to update verification status"); }
  };

  // Compute Displayed Exercises with local filters that don't need backend querying
  let displayedExercises = exercises.filter((e) => {
    if (filterType !== "All" && e.type !== filterType) return false;
    if (filterAttention === "Needs Attention" && getAttentionFlags(e).length === 0) return false;
    return true;
  });

  const clearExtraFilters = () => {
    setFilterCategory("All");
    setFilterDifficulty("All");
    setFilterVerified("All");
    setFilterType("All");
    setFilterAttention("All");
  };

  const hasExtraFilters = filterCategory !== "All" || filterDifficulty !== "All" || filterVerified !== "All" || filterType !== "All" || filterAttention !== "All";

  // Attention Center Analytics
  let missingImagesCount = 0;
  let shortInstructionsCount = 0;
  let missingMusclesCount = 0;
  let unverifiedCount = 0;
  
  exercises.forEach(e => {
      if (!e.image || e.image.trim() === '') missingImagesCount++;
      if (!e.instructions || e.instructions.trim().length < 20) shortInstructionsCount++;
      if (!e.targetMuscles || e.targetMuscles.length === 0) missingMusclesCount++;
      if (!e.verified) unverifiedCount++;
  });

  let inViewNeedsAttention = displayedExercises.filter(e => getAttentionFlags(e).length > 0).length;
  let verifiedInView = displayedExercises.filter(e => e.verified).length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#f1f1f1] bg-black">
      <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
      <p>Loading Exercises...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 min-h-screen text-[#f1f1f1] bg-black">
        
       {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 flex justify-between items-center">
            <p><strong>Error:</strong> {error}</p>
            <button onClick={() => fetchExercises()} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition-colors">Try Again</button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
        <h1 className="m-0 text-2xl font-bold md:text-3xl text-[#f1f1f1]">
          Exercise Management
        </h1>
        <button onClick={() => setIsAddModalOpen(true)} className="w-full md:w-auto bg-[#8A2BE2] text-white px-6 py-3 rounded font-semibold transition-all duration-300 hover:bg-[#7020a0] hover:-translate-y-0.5">
          + Add Exercise
        </button>
      </div>

      {/* Attention Center Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 border-b border-[#333] pb-2">Exercise Attention Center</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AttentionCard label="Missing Images" value={missingImagesCount} color="red" />
            <AttentionCard label="Short Instructions" value={shortInstructionsCount} color="orange" />
            <AttentionCard label="Missing Muscle Tags" value={missingMusclesCount} color="yellow" />
            <AttentionCard label="Unverified Exercises" value={unverifiedCount} color="purple" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visible Exercises" value={displayedExercises.length} />
        <StatCard label="Verified in View" value={verifiedInView} />
        <StatCard label="Needs Attention" value={inViewNeedsAttention} />
        <StatCard label="Total Categories" value={stats?.categories || 0} />
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-[#111] p-4 rounded-lg border border-[#333]">
        <div className="relative mb-4">
            <input
            type="text"
            placeholder="Search exercises by name, equipment, or muscles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
            />
            <span className="absolute right-3 top-3 text-gray-500">🔍</span>
        </div>

        {/* Extra Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#333]">
            <span className="text-sm font-semibold text-gray-400">Filters:</span>
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Calisthenics">Calisthenics</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="HIIT">HIIT</option>
              <option value="Strength Training">Strength Training</option>
              <option value="Cardio">Cardio</option>
              <option value="Flexibility">Flexibility</option>
              <option value="Bodybuilding">Bodybuilding</option>
            </select>
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={filterVerified} onChange={e => setFilterVerified(e.target.value)}>
              <option value="All">Verification State</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="All">Training Type</option>
              <option value="Reps">Reps</option>
              <option value="Time">Time</option>
            </select>
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={filterAttention} onChange={e => setFilterAttention(e.target.value)}>
              <option value="All">Attention: All</option>
              <option value="Needs Attention">Requires Attention Only</option>
            </select>

            {hasExtraFilters && (
                <button onClick={clearExtraFilters} className="text-sm text-[#8A2BE2] hover:text-[#a55fee] font-semibold border border-[#8A2BE2]/30 px-3 py-1.5 rounded bg-[#8A2BE2]/10 transition-colors">
                    Clear Filters
                </button>
            )}
        </div>
      </div>

       {hasExtraFilters && (
        <div className="flex gap-2 mb-4 items-center flex-wrap">
            <span className="text-sm text-gray-400">Active Filters:</span>
            {filterCategory !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">{filterCategory}</span>}
            {filterDifficulty !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">{filterDifficulty}</span>}
            {filterVerified !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">{filterVerified === 'true' ? 'Verified' : 'Unverified'}</span>}
            {filterType !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">{filterType} Base</span>}
            {filterAttention !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">Needs Attention</span>}
        </div>
      )}

      {/* Exercises Table */}
      <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
        <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
          Exercise Library ({displayedExercises.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm md:text-base">
            <thead>
              <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Summary</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Type & Target</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Instructions Preview</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Attention</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedExercises.length > 0 ? (
                displayedExercises.map((e) => {
                  const flags = getAttentionFlags(e);
                  
                  return (
                    <tr key={e._id} className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10">
                      
                      <td className="p-3">
                        <div className="font-semibold text-lg text-[#f1f1f1] flex items-center gap-2">
                            {e.name}
                            {e.verified ? (
                                <span className="text-green-400 bg-green-900/30 text-[0.6rem] px-1 rounded-sm border border-green-700 font-bold uppercase tracking-widest">Verified</span>
                            ) : (
                                <span className="text-orange-400 bg-orange-900/30 text-[0.6rem] px-1 rounded-sm border border-orange-700 font-bold uppercase tracking-widest">Unvfd</span>
                            )}
                        </div>
                        <div className="text-xs font-semibold text-[#8A2BE2] mt-0.5">{e.category}</div>
                        
                        <div className="mt-1.5 flex gap-2 items-center">
                            <span className={`inline-block px-2 text-[0.65rem] font-bold uppercase tracking-wide rounded border ${
                              e.difficulty === "Beginner" ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]" : 
                              e.difficulty === "Intermediate" ? "bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]" : 
                              "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                            }`}>
                              {e.difficulty}
                            </span>
                        </div>
                      </td>

                      <td className="p-3 align-top">
                        <div className="flex flex-col gap-1.5">
                           <div className="text-xs text-gray-300">
                               <span className="text-gray-500 font-semibold mr-1">Tense:</span>
                               {e.type} ({e.defaultSets}x {e.defaultRepsOrDuration})
                           </div>
                           <div className="text-xs text-blue-300">
                               <span className="text-gray-500 font-semibold mr-1">Primary:</span>
                               {e.primaryMuscle || "Unknown"}
                           </div>
                           <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {(e.targetMuscles || []).map((m, i) => (
                                <span key={i} className="bg-gray-800 text-gray-300 border border-gray-600 px-1.5 rounded text-[0.6rem] font-medium uppercase tracking-wider">
                                  {m}
                                </span>
                              ))}
                           </div>
                        </div>
                      </td>

                      <td className="p-3 text-xs text-[#cccccc] max-w-xs align-top hidden md:table-cell">
                         <p className="line-clamp-3">{e.instructions || <span className="italic text-gray-600">No instructions written</span>}</p>
                      </td>

                      <td className="p-3 align-top">
                         <div className="flex flex-col gap-1 items-start max-w-[140px]">
                              {flags.length > 0 ? (
                                  flags.map((flag, idx) => (
                                      <span key={idx} className="bg-red-900/30 text-red-400 border border-red-800 text-[0.6rem] px-1.5 py-0.5 rounded-sm whitespace-nowrap">⚠️ {flag}</span>
                                  ))
                              ) : (
                                  <span className="text-green-500 text-xs font-semibold">✓ Clear</span>
                              )}
                         </div>
                      </td>

                      <td className="p-3 align-top">
                        <div className="flex flex-col gap-2">
                          {!e.verified && (
                            <button
                                onClick={() => handleVerifyExercise(e._id, e.verified)}
                                className="px-3 py-1.5 rounded text-[0.7rem] font-semibold transition-all duration-300 uppercase tracking-widest border bg-[#ffc107]/10 text-[#ffc107] border-[#ffc107]/40 hover:bg-[#ffc107]/30"
                            >
                                Verify
                            </button>
                          )}
                          <div className="flex gap-2">
                              <button onClick={() => handleEditClick(e)} className="flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-all duration-300 bg-[#8A2BE2]/20 text-[#8A2BE2] border border-[#8A2BE2]/30 hover:bg-[#8A2BE2]/30">
                                Edit
                              </button>
                              <button onClick={() => handleDelete(e._id)} className="flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-all duration-300 bg-[#ff6b6b]/20 text-[#ff6b6b] border border-[#ff6b6b]/30 hover:bg-[#ff6b6b]/30">
                                Del
                              </button>
                          </div>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-[#cccccc]">
                    <p>No exercises found matching filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Add Exercise Modal */}
       {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">Add New Exercise</h2>
              <form onSubmit={handleAddExercise}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Name*</label>
                    <input type="text" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.name} onChange={(e) => setAddFormData({...addFormData, name: e.target.value})} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Category*</label>
                    <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.category} onChange={(e) => setAddFormData({...addFormData, category: e.target.value})} required>
                      <option value="">Select Category</option>
                      <option value="Calisthenics">Calisthenics</option>
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="HIIT">HIIT</option>
                      <option value="Strength Training">Strength Training</option>
                      <option value="Cardio">Cardio</option>
                      <option value="Flexibility">Flexibility</option>
                      <option value="Bodybuilding">Bodybuilding</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Difficulty*</label>
                    <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.difficulty} onChange={(e) => setAddFormData({...addFormData, difficulty: e.target.value})} required>
                      <option value="">Select Difficulty</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Type*</label>
                    <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.type} onChange={(e) => setAddFormData({...addFormData, type: e.target.value})} required>
                      <option value="Reps">Reps</option>
                      <option value="Time">Time</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Default Sets</label>
                    <input type="number" min="1" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.defaultSets} onChange={(e) => setAddFormData({...addFormData, defaultSets: e.target.value})} />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Default Reps/Duration*</label>
                    <input type="text" placeholder="e.g., 10-12 reps or 30 sec" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.defaultRepsOrDuration} onChange={(e) => setAddFormData({...addFormData, defaultRepsOrDuration: e.target.value})} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Primary Muscle*</label>
                    <input type="text" placeholder="e.g., Chest, Back, Quadriceps" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.primaryMuscle} onChange={(e) => setAddFormData({...addFormData, primaryMuscle: e.target.value})} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Target Muscles*</label>
                    <input type="text" placeholder="comma separated (e.g., Chest, Triceps)" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.targetMuscles} onChange={(e) => setAddFormData({...addFormData, targetMuscles: e.target.value})} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Secondary Muscles</label>
                    <input type="text" placeholder="comma separated" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.secondaryMuscles} onChange={(e) => setAddFormData({...addFormData, secondaryMuscles: e.target.value})} />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Equipment</label>
                    <input type="text" placeholder="comma separated" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.equipment} onChange={(e) => setAddFormData({...addFormData, equipment: e.target.value})} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">Instructions*</label>
                  <textarea rows="3" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.instructions} onChange={(e) => setAddFormData({...addFormData, instructions: e.target.value})} required />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">Image URL</label>
                  <input type="url" placeholder="https://example.com/image.jpg" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.image} onChange={(e) => setAddFormData({...addFormData, image: e.target.value})} />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">Add Exercise</button>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Edit Exercise Modal */}
        {isEditModalOpen && editingExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">Edit Exercise</h2>
              <form onSubmit={handleUpdateExercise}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Name*</label>
                    <input type="text" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Category*</label>
                    <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.category} onChange={(e) => setEditFormData({...editFormData, category: e.target.value})} required>
                      <option value="">Select Category</option>
                      <option value="Calisthenics">Calisthenics</option>
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="HIIT">HIIT</option>
                      <option value="Strength Training">Strength Training</option>
                      <option value="Cardio">Cardio</option>
                      <option value="Flexibility">Flexibility</option>
                      <option value="Bodybuilding">Bodybuilding</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Difficulty*</label>
                    <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.difficulty} onChange={(e) => setEditFormData({...editFormData, difficulty: e.target.value})} required>
                      <option value="">Select Difficulty</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Type*</label>
                    <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.type} onChange={(e) => setEditFormData({...editFormData, type: e.target.value})} required>
                      <option value="Reps">Reps</option>
                      <option value="Time">Time</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Default Sets</label>
                    <input type="number" min="1" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.defaultSets} onChange={(e) => setEditFormData({...editFormData, defaultSets: e.target.value})} />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Default Reps/Duration*</label>
                    <input type="text" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.defaultRepsOrDuration} onChange={(e) => setEditFormData({...editFormData, defaultRepsOrDuration: e.target.value})} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Primary Muscle*</label>
                    <input type="text" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.primaryMuscle} onChange={(e) => setEditFormData({...editFormData, primaryMuscle: e.target.value})} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Target Muscles*</label>
                    <input type="text" placeholder="comma separated" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.targetMuscles} onChange={(e) => setEditFormData({...editFormData, targetMuscles: e.target.value})} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Secondary Muscles</label>
                    <input type="text" placeholder="comma separated" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.secondaryMuscles} onChange={(e) => setEditFormData({...editFormData, secondaryMuscles: e.target.value})} />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Equipment</label>
                    <input type="text" placeholder="comma separated" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.equipment} onChange={(e) => setEditFormData({...editFormData, equipment: e.target.value})} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">Instructions*</label>
                  <textarea rows="3" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.instructions} onChange={(e) => setEditFormData({...editFormData, instructions: e.target.value})} required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">Image URL</label>
                  <input type="url" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.image} onChange={(e) => setEditFormData({...editFormData, image: e.target.value})} />
                </div>
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#cccccc]">
                    <input type="checkbox" checked={editFormData.verified} onChange={(e) => setEditFormData({...editFormData, verified: e.target.checked})} className="w-4 h-4" />
                    Verified Exercise
                  </label>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">Update Exercise</button>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminExercises;
