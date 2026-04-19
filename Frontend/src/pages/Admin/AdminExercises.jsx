import React, { useEffect, useState } from "react";

// Reusable StatCard Component
const StatCard = ({ label, value }) => {
  return (
    <div
      className="
      bg-[#111] 
      rounded-lg 
      p-5 
      border border-[#8A2BE2] 
      shadow-[0_4px_8px_rgba(138,43,226,0.3)] 
      transition-all duration-300 ease-in-out
      hover:-translate-y-1 
      hover:shadow-[0_8px_16px_rgba(138,43,226,0.4)]
    "
    >
      <h3 className="text-[#cccccc] text-sm font-semibold uppercase tracking-wide mb-2">
        {label}
      </h3>
      <p className="text-[#8A2BE2] text-3xl font-bold">{value}</p>
    </div>
  );
};

const AdminExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterVerified, setFilterVerified] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [addFormData, setAddFormData] = useState({
    name: "",
    category: "",
    difficulty: "",
    targetMuscles: "",
    instructions: "",
    type: "Reps",
    defaultSets: 3,
    defaultRepsOrDuration: "",
    equipment: "",
    primaryMuscle: "",
    secondaryMuscles: "",
    image: ""
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    category: "",
    difficulty: "",
    targetMuscles: "",
    instructions: "",
    type: "Reps",
    defaultSets: 3,
    defaultRepsOrDuration: "",
    equipment: "",
    primaryMuscle: "",
    secondaryMuscles: "",
    image: "",
    verified: false
  });

  const fetchExercises = async () => {
  try {
    // DON'T set loading here - this causes re-render and focus loss
    // setLoading(true);  <-- REMOVE THIS
    
    const token = localStorage.getItem("token");
    let url = "/api/admin/exercises";
    const params = new URLSearchParams();
    
    if (searchTerm) params.append("search", searchTerm);
    if (filterCategory) params.append("category", filterCategory);
    if (filterDifficulty) params.append("difficulty", filterDifficulty);
    if (filterVerified) params.append("verified", filterVerified);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await response.json();
    if (data.success) {
      setExercises(data.exercises);
      setStats(data.stats);
    }
  } catch (error) {
    console.error("Error fetching exercises:", error);
  } finally {
    // DON'T set loading here
    // setLoading(false);  <-- REMOVE THIS
  }
};

// Initial load effect - only runs once
useEffect(() => {
  const loadInitial = async () => {
    setLoading(true);
    await fetchExercises();
    setLoading(false);
  };
  loadInitial();
}, []);

// Debounced search/filter effect
useEffect(() => {
  const timer = setTimeout(() => {
    fetchExercises();
  }, 500);
  return () => clearTimeout(timer);
}, [searchTerm, filterCategory, filterDifficulty, filterVerified]);

 const handleDelete = async (id) => {
    if (!confirm("Delete this exercise?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/admin/exercises/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setExercises(exercises.filter((e) => e._id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

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
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
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
        } else {
          alert("Error: " + data.message);
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Failed to add exercise");
      }
    };

    const handleEditClick = (exercise) => {
      setEditingExercise(exercise);
      setEditFormData({
        name: exercise.name || "",
        category: exercise.category || "",
        difficulty: exercise.difficulty || "",
        targetMuscles: exercise.targetMuscles ? exercise.targetMuscles.join(', ') : "",
        instructions: exercise.instructions || "",
        type: exercise.type || "Reps",
        defaultSets: exercise.defaultSets || 3,
        defaultRepsOrDuration: exercise.defaultRepsOrDuration || "",
        equipment: exercise.equipment ? exercise.equipment.join(', ') : "",
        primaryMuscle: exercise.primaryMuscle || "",
        secondaryMuscles: exercise.secondaryMuscles ? exercise.secondaryMuscles.join(', ') : "",
        image: exercise.image || "",
        verified: exercise.verified || false
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
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(exerciseData)
        });
        
        const data = await response.json();
        if (data.success) {
          setExercises(exercises.map(e => e._id === editingExercise._id ? data.exercise : e));
          setIsEditModalOpen(false);
          setEditingExercise(null);
          alert("Exercise updated successfully!");
        } else {
          alert("Error: " + data.message);
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Failed to update exercise");
      }
    };

    const handleVerifyExercise = async (id, currentVerified) => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/admin/exercises/${id}/verify`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ verified: !currentVerified })
        });
        
        const data = await response.json();
        if (data.success) {
          setExercises(exercises.map(e => e._id === id ? data.exercise : e));
          alert(`Exercise ${data.exercise.verified ? 'verified' : 'unverified'}!`);
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Failed to update verification status");
      }
    };

  // Shared container classes
  const containerClasses =
    "min-h-screen bg-black text-[#f1f1f1] font-sans flex flex-col";

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#f1f1f1]">
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-[#cccccc]">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading Exercises...</p>
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-8 min-h-screen">
        {/* Page Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
          <h1 className="m-0 text-2xl font-bold md:text-3xl text-[#f1f1f1]">
            Exercise Management
          </h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="
            w-full md:w-auto
            bg-[#8A2BE2] 
            text-white 
            px-6 py-3 
            rounded 
            font-semibold 
            transition-all duration-300 
            hover:bg-[#7020a0] 
            hover:-translate-y-0.5
          "
          >
            + Add Exercise
          </button>
        </div>

                {/* Search and Filters */}
        <div className="mb-6 bg-[#111] p-4 rounded-lg border border-[#333]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1e1e3a] border border-[#333] text-white px-4 py-2 rounded focus:outline-none focus:border-[#8A2BE2]"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
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
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-2 rounded focus:outline-none focus:border-[#8A2BE2]"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-2 rounded focus:outline-none focus:border-[#8A2BE2]"
            >
              <option value="">All Exercises</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Exercises"
            value={stats?.totalExercises || 0}
          />
          <StatCard label="By Category" value={stats?.categories || 0} />
          <StatCard
            label="Difficulty Levels"
            value={stats?.difficulties || 0}
          />
          <StatCard label="Last Updated" value={stats?.recentUpdates || 0} />
        </div>

        {/* Exercises Table */}
        <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
          <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
            Exercise Library
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Name
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Category
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Difficulty
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Muscle Groups
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Instructions
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {exercises.length > 0 ? (
                  exercises.map((e) => (
                    <tr
                      key={e._id}
                      className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                    >
                      <td className="p-3 text-[#f1f1f1]">{e.name}</td>
                      <td className="p-3 text-[#f1f1f1]">{e.category}</td>
                      <td className="p-3">
                      <span
                        className={`
                        inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border
                        ${
                          e.difficulty === "Beginner"
                            ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]"
                            : e.difficulty === "Intermediate"
                            ? "bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]"
                            : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                        }
                      `}
                      >
                        {e.difficulty}
                      </span>
                      </td>
                  <td className="p-3 text-[#f1f1f1]">
                    {e.primaryMuscle || (e.targetMuscles?.join(", ") || "N/A")}
                  </td>
                      <td className="p-3 text-xs text-[#f1f1f1]">
                        {e.instructions?.substring(0, 50)}...
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                          <button
                            onClick={() => handleVerifyExercise(e._id, e.verified)}
                            className={`px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                              ${e.verified 
                                ? 'bg-[#2e8b57]/20 text-[#90ee90] hover:bg-[#2e8b57]/30' 
                                : 'bg-[#ffc107]/20 text-[#ffc107] hover:bg-[#ffc107]/30'}`}
                          >
                            {e.verified ? 'Verified' : 'Verify'}
                          </button>
                          <button
                            onClick={() => handleEditClick(e)}
                            className="px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300 bg-[#8A2BE2]/20 text-[#8A2BE2] hover:bg-[#8A2BE2]/30"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(e._id)}
                            className="px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300 bg-[#ff6b6b]/20 text-[#ff6b6b] hover:bg-[#ff6b6b]/30"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-[#cccccc]">
                      No exercises found.
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
            <input
              type="text"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={addFormData.name}
              onChange={(e) => setAddFormData({...addFormData, name: e.target.value})}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Category*</label>
            <select
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={addFormData.category}
              onChange={(e) => setAddFormData({...addFormData, category: e.target.value})}
              required
            >
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
            <select
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={addFormData.difficulty}
              onChange={(e) => setAddFormData({...addFormData, difficulty: e.target.value})}
              required
            >
              <option value="">Select Difficulty</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Type*</label>
            <select
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={addFormData.type}
              onChange={(e) => setAddFormData({...addFormData, type: e.target.value})}
              required
            >
              <option value="Reps">Reps</option>
              <option value="Time">Time</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Default Sets</label>
            <input
              type="number"
              min="1"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={addFormData.defaultSets}
              onChange={(e) => setAddFormData({...addFormData, defaultSets: e.target.value})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Default Reps/Duration*</label>
            <input
              type="text"
              placeholder="e.g., 10-12 reps or 30 sec"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={addFormData.defaultRepsOrDuration}
              onChange={(e) => setAddFormData({...addFormData, defaultRepsOrDuration: e.target.value})}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Primary Muscle*</label>
            <input
              type="text"
              placeholder="e.g., Chest, Back, Quadriceps"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={addFormData.primaryMuscle}
              onChange={(e) => setAddFormData({...addFormData, primaryMuscle: e.target.value})}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Target Muscles*</label>
            <input
              type="text"
              placeholder="comma separated (e.g., Chest, Triceps)"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={addFormData.targetMuscles}
              onChange={(e) => setAddFormData({...addFormData, targetMuscles: e.target.value})}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Secondary Muscles</label>
            <input
              type="text"
              placeholder="comma separated"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={addFormData.secondaryMuscles}
              onChange={(e) => setAddFormData({...addFormData, secondaryMuscles: e.target.value})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Equipment</label>
            <input
              type="text"
              placeholder="comma separated"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={addFormData.equipment}
              onChange={(e) => setAddFormData({...addFormData, equipment: e.target.value})}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Instructions*</label>
          <textarea
            rows="3"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={addFormData.instructions}
            onChange={(e) => setAddFormData({...addFormData, instructions: e.target.value})}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Image URL</label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={addFormData.image}
            onChange={(e) => setAddFormData({...addFormData, image: e.target.value})}
          />
        </div>
        <div className="flex gap-4">
          <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">
            Add Exercise
          </button>
          <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">
            Cancel
          </button>
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
            <input
              type="text"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={editFormData.name}
              onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Category*</label>
            <select
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={editFormData.category}
              onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
              required
            >
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
            <select
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={editFormData.difficulty}
              onChange={(e) => setEditFormData({...editFormData, difficulty: e.target.value})}
              required
            >
              <option value="">Select Difficulty</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Type*</label>
            <select
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={editFormData.type}
              onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
              required
            >
              <option value="Reps">Reps</option>
              <option value="Time">Time</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Default Sets</label>
            <input
              type="number"
              min="1"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={editFormData.defaultSets}
              onChange={(e) => setEditFormData({...editFormData, defaultSets: e.target.value})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Default Reps/Duration*</label>
            <input
              type="text"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={editFormData.defaultRepsOrDuration}
              onChange={(e) => setEditFormData({...editFormData, defaultRepsOrDuration: e.target.value})}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Primary Muscle*</label>
            <input
              type="text"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={editFormData.primaryMuscle}
              onChange={(e) => setEditFormData({...editFormData, primaryMuscle: e.target.value})}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Target Muscles*</label>
            <input
              type="text"
              placeholder="comma separated"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={editFormData.targetMuscles}
              onChange={(e) => setEditFormData({...editFormData, targetMuscles: e.target.value})}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Secondary Muscles</label>
            <input
              type="text"
              placeholder="comma separated"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={editFormData.secondaryMuscles}
              onChange={(e) => setEditFormData({...editFormData, secondaryMuscles: e.target.value})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#cccccc] mb-2">Equipment</label>
            <input
              type="text"
              placeholder="comma separated"
              className="w-full bg-black border border-[#333] rounded p-3 text-white"
              value={editFormData.equipment}
              onChange={(e) => setEditFormData({...editFormData, equipment: e.target.value})}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Instructions*</label>
          <textarea
            rows="3"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={editFormData.instructions}
            onChange={(e) => setEditFormData({...editFormData, instructions: e.target.value})}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Image URL</label>
          <input
            type="url"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={editFormData.image}
            onChange={(e) => setEditFormData({...editFormData, image: e.target.value})}
          />
        </div>
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#cccccc]">
            <input
              type="checkbox"
              checked={editFormData.verified}
              onChange={(e) => setEditFormData({...editFormData, verified: e.target.checked})}
              className="w-4 h-4"
            />
            Verified Exercise
          </label>
        </div>
        <div className="flex gap-4">
          <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">
            Update Exercise
          </button>
          <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminExercises;
