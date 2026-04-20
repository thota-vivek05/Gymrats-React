import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Helper logics
const SPECIALIZATION_OPTIONS = [
  "Calisthenics", "Weight Loss", "HIIT", "Competitive", 
  "Strength Training", "Cardio", "Flexibility", "Bodybuilding"
];

const getActiveClientCount = (trainer) => {
  return (trainer.clients || []).filter(c => c.isActive).length;
};

const getCapacityInfo = (trainer) => {
  const active = getActiveClientCount(trainer);
  const max = trainer.maxClients || 20; // Default max is 20 if not set
  const percent = Math.min(Math.round((active / max) * 100), 100);
  const availableSlots = Math.max(max - active, 0);
  return { active, max, percent, availableSlots };
};

const getTrainerFlags = (trainer) => {
  const flags = [];
  if (!trainer.meetingLink || trainer.meetingLink.trim() === '') flags.push("No Meeting Link");
  if (!trainer.specializations || trainer.specializations.length === 0) flags.push("No Specialization");
  
  const cap = getCapacityInfo(trainer);
  if (cap.percent >= 100) flags.push("At Capacity");
  else if (cap.percent >= 80) flags.push("Near Capacity");

  if (trainer.rating > 0 && trainer.rating < 3) flags.push("Low Rating");

  if (trainer.status === "Inactive") flags.push("Inactive");
  if (trainer.status === "Suspended") flags.push("Suspended");
  if (trainer.status === "Expired") flags.push("Expired");

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

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingTrainer, setEditingTrainer] = useState(null);
  const [editFormData, setEditFormData] = useState({ 
    name: "", email: "", phone: "", experience: "", 
    specializations: [], status: "Active", meetingLink: "" 
  });

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // New Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [experienceFilter, setExperienceFilter] = useState("All");
  const [specializationFilter, setSpecializationFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [attentionFilter, setAttentionFilter] = useState("All");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "", email: "", password: "", phone: "", 
    experience: "", specializations: "", status: "Active"
  });

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      await fetchTrainers();
      setLoading(false);
    };
    loadInitial();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTrainers(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTrainers = async (search = "") => {
    try {
      const token = localStorage.getItem("token");
      let url = "/api/admin/trainers";
      
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setTrainers(data.trainers || []);
        setError(null);
        if (!search.trim() && data.stats) setStats(data.stats);
      } else {
        setError(data.message || "Failed to fetch trainers");
      }
    } catch (error) {
      console.error("Error fetching trainers:", error);
      setError("Network or server error occurred");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trainer?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/admin/trainers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setTrainers(trainers.filter((t) => t._id !== id));
      alert("Trainer deleted!");
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const specializationsArray = editFormData.specializations 
        ? (Array.isArray(editFormData.specializations) 
          ? editFormData.specializations 
          : editFormData.specializations.split(',').map(s => s.trim()))
        : [];
      
      const response = await fetch(`/api/admin/trainers/${editingTrainer._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: editFormData.name,
          email: editFormData.email,
          phone: editFormData.phone,
          experience: editFormData.experience,
          specializations: specializationsArray,
          status: editFormData.status,
          meetingLink: editFormData.meetingLink
        })
      });

      const data = await response.json();

      if (data.success) {
        setTrainers(trainers.map(t => t._id === editingTrainer._id ? data.trainer : t));
        setEditingTrainer(null);
        alert("Trainer updated successfully!");
      } else {
        alert("Server error: " + data.message);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Failed to update trainer");
    }
  };

  const handleAddTrainer = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const specializationsArray = addFormData.specializations 
        ? addFormData.specializations.split(',').map(s => s.trim())
        : [];
      
      const response = await fetch("/api/admin/trainers", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: addFormData.name,
          email: addFormData.email,
          password: addFormData.password,
          phone: addFormData.phone,
          experience: addFormData.experience,
          specializations: specializationsArray,
          status: addFormData.status
        })
      });

      const data = await response.json();

      if (data.success) {
        setTrainers([data.trainer, ...trainers]);
        setIsAddModalOpen(false);
        setAddFormData({
          name: "", email: "", password: "", phone: "", 
          experience: "", specializations: "", status: "Active"
        });
        alert("Trainer added successfully!");
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Failed to add trainer");
    }
  };

  // Client-side computed lists for remaining filters
  let displayedTrainers = trainers.filter(t => {
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    if (experienceFilter !== "All" && t.experience !== experienceFilter) return false;
    if (specializationFilter !== "All" && !(t.specializations || []).includes(specializationFilter)) return false;
    
    if (availabilityFilter !== "All") {
      const cap = getCapacityInfo(t);
      if (availabilityFilter === "Available" && cap.percent >= 100) return false;
      if (availabilityFilter === "Near Capacity" && (cap.percent < 80 || cap.percent >= 100)) return false;
      if (availabilityFilter === "Full" && cap.percent < 100) return false;
    }

    if (attentionFilter === "Needs Attention" && getTrainerFlags(t).length === 0) return false;

    return true;
  });

  const clearExtraFilters = () => {
    setStatusFilter("All");
    setExperienceFilter("All");
    setSpecializationFilter("All");
    setAvailabilityFilter("All");
    setAttentionFilter("All");
  };

  const hasExtraFilters = statusFilter !== "All" || experienceFilter !== "All" || specializationFilter !== "All" || availabilityFilter !== "All" || attentionFilter !== "All";

  // Summarize Attention
  let nearCapacityCount = 0;
  let noMeetingLinkCount = 0;
  let inactiveCount = 0;
  let allSpecs = new Set();
  
  trainers.forEach(t => {
    if (getCapacityInfo(t).percent >= 80) nearCapacityCount++;
    if (!t.meetingLink || t.meetingLink === '') noMeetingLinkCount++;
    if (t.status !== 'Active') inactiveCount++;
    (t.specializations || []).forEach(s => allSpecs.add(s));
  });

  let inViewNeedsAttention = displayedTrainers.filter(t => getTrainerFlags(t).length > 0).length;
  let totalAvailableSlots = displayedTrainers.reduce((acc, t) => acc + getCapacityInfo(t).availableSlots, 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#f1f1f1] bg-black">
      <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
      <p>Loading Trainers...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 min-h-screen text-[#f1f1f1] bg-black">
      
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 flex justify-between items-center">
            <p><strong>Error:</strong> {error}</p>
            <button onClick={() => fetchTrainers()} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition-colors">Try Again</button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
        <h1 className="m-0 text-2xl font-bold md:text-3xl text-[#f1f1f1]">
          Trainer Management
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto bg-[#8A2BE2] text-white px-6 py-3 rounded font-semibold transition-all duration-300 hover:bg-[#7020a0] hover:-translate-y-0.5"
        >
          + Add Trainer
        </button>
      </div>

      {/* Attention Center Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 border-b border-[#333] pb-2">Attention Center</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AttentionCard label="Near Capacity (>=80%)" value={nearCapacityCount} color="orange" />
            <AttentionCard label="Missing Meeting Link" value={noMeetingLinkCount} color="red" />
            <AttentionCard label="Inactive Trainers" value={inactiveCount} color="yellow" />
            <AttentionCard label="Unique Specializations" value={allSpecs.size} color="purple" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visible Trainers" value={displayedTrainers.length} />
        <StatCard label="Total Available Slots" value={totalAvailableSlots} />
        <StatCard label="Needs Attention" value={inViewNeedsAttention} />
        <StatCard label="Pending Approvals" value={stats?.pendingApprovals || 0} />
      </div>

      {/* Search and Filters Array */}
      <div className="flex flex-col gap-4 mb-6 bg-[#111] p-4 rounded-lg border border-[#333]">
        <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search trainers by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
              />
              <span className="absolute right-3 top-3 text-gray-500">🔍</span>
            </div>
        </div>

        {/* Extra Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#333] mt-2">
            <span className="text-sm font-semibold text-gray-400">Filters:</span>
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Expired">Expired</option>
            </select>
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={experienceFilter} onChange={e => setExperienceFilter(e.target.value)}>
                <option value="All">All Experiences</option>
                <option value="1-2">1-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
            </select>
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={specializationFilter} onChange={e => setSpecializationFilter(e.target.value)}>
                <option value="All">All Specializations</option>
                {SPECIALIZATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={availabilityFilter} onChange={e => setAvailabilityFilter(e.target.value)}>
                <option value="All">Any Availability</option>
                <option value="Available">Available (&lt; 100%)</option>
                <option value="Near Capacity">Near Capacity (80-99%)</option>
                <option value="Full">Full (100%)</option>
            </select>
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={attentionFilter} onChange={e => setAttentionFilter(e.target.value)}>
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
            {statusFilter !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">{statusFilter}</span>}
            {experienceFilter !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">{experienceFilter}</span>}
            {specializationFilter !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">{specializationFilter}</span>}
            {availabilityFilter !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">{availabilityFilter}</span>}
            {attentionFilter !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">Needs Attention</span>}
        </div>
      )}

      {/* Trainers Table */}
      <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
        <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
          Trainer Directory ({displayedTrainers.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm md:text-base">
            <thead>
              <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Trainer</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Specializations</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Experience & Info</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Workload</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Attention</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedTrainers.length > 0 ? (
                displayedTrainers.map((t) => {
                  const cap = getCapacityInfo(t);
                  const flags = getTrainerFlags(t);
                  
                  return (
                    <tr key={t._id} className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10">
                      
                      <td className="p-3">
                        <div className="font-semibold text-[#f1f1f1] text-base">{t.name}</div>
                        <div className="text-xs text-gray-400 mb-1">{t.email}</div>
                        <div className="flex gap-2 items-center">
                            <span className={`inline-block px-2 text-[0.65rem] font-semibold uppercase tracking-wide rounded border ${
                              t.status === "Active" ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]" : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                            }`}>
                              {t.status}
                            </span>
                            <span className={`inline-block px-2 text-[0.65rem] font-bold uppercase tracking-wide rounded border ${
                              cap.percent >= 100 ? "bg-red-900/40 text-red-500 border-red-800" : "bg-blue-900/40 text-blue-400 border-blue-800"
                            }`}>
                                {cap.percent >= 100 ? "FULL" : "AVAILABLE"}
                            </span>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {(t.specializations || []).length > 0 ? t.specializations.map((s, i) => (
                            <span key={i} className="bg-[#8A2BE2]/20 text-[#8A2BE2] border border-[#8A2BE2]/50 px-2 py-0.5 rounded text-[0.65rem] font-semibold uppercase tracking-wider">
                              {s}
                            </span>
                          )) : <span className="text-gray-500 text-xs italic">None documented</span>}
                        </div>
                      </td>

                      <td className="p-3">
                         <div className="flex flex-col gap-1 text-xs">
                             <div className="text-gray-300"><span className="text-gray-500">Exp:</span> {t.experience} yrs</div>
                             <div className="text-yellow-500 font-semibold"><span className="text-gray-500 font-normal">Rating:</span> {t.rating > 0 ? `★ ${t.rating.toFixed(1)}/5` : "Unrated"}</div>
                             <div className="text-gray-300"><span className="text-gray-500">Link:</span> {t.meetingLink ? "Configured" : "Missing"}</div>
                         </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col gap-1.5 items-start">
                            <div className="text-xs text-gray-300 font-medium">{cap.active} / {cap.max} Clients <span className="text-gray-500 ml-1">({cap.availableSlots} free)</span></div>
                            <div className="w-full max-w-[120px] bg-gray-800 rounded-full h-1.5 shadow-inner">
                                <div className={`h-1.5 rounded-full shadow ${
                                    cap.percent >= 100 ? 'bg-red-500' : cap.percent >= 80 ? 'bg-orange-500' : 'bg-green-500'
                                  }`} style={{ width: `${cap.percent}%` }}></div>
                            </div>
                            <span className={`text-[0.65rem] font-bold uppercase tracking-widest ${cap.percent >= 80 ? 'text-orange-400' : 'text-gray-500'}`}>{cap.percent}% Utilized</span>
                        </div>
                      </td>

                      <td className="p-3">
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

                      <td className="p-3">
                        <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                          <button
                            onClick={() => {
                              setEditingTrainer(t);
                              setEditFormData({ 
                                name: t.name || "", email: t.email || "", phone: t.phone || "",
                                experience: t.experience || "", specializations: t.specializations || [],
                                status: t.status || "Active", meetingLink: t.meetingLink || "" 
                              });
                            }}
                            className="px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300 bg-[#8A2BE2]/20 text-[#8A2BE2] border border-[#8A2BE2]/30 hover:bg-[#8A2BE2]/30"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(t._id)}
                            className="px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300 bg-[#ff6b6b]/20 text-[#ff6b6b] border border-[#ff6b6b]/30 hover:bg-[#ff6b6b]/30"
                          >
                            Delete
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-[#cccccc]">
                    <p>No trainers found matching filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals - Unchanged logic, preserved functionality */}
      {editingTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">Edit {editingTrainer.name}</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Name</label>
                <input type="text" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Email</label>
                <input type="email" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Phone</label>
                <input type="text" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Experience</label>
                <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.experience} onChange={(e) => setEditFormData({...editFormData, experience: e.target.value})} required>
                  <option value="">Select Experience</option>
                  <option value="1-2">1-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Specializations (comma separated)</label>
                <input type="text" placeholder="e.g., Calisthenics, Strength Training" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={Array.isArray(editFormData.specializations) ? editFormData.specializations.join(', ') : editFormData.specializations} onChange={(e) => setEditFormData({...editFormData, specializations: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Status</label>
                <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.status} onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Meeting Link</label>
                <input type="url" placeholder="https://meet.google.com/..." className="w-full bg-black border border-[#333] rounded p-3 text-white" value={editFormData.meetingLink} onChange={(e) => setEditFormData({...editFormData, meetingLink: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">Save Changes</button>
                <button type="button" onClick={() => setEditingTrainer(null)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">Add New Trainer</h2>
            <form onSubmit={handleAddTrainer}>
              <div className="mb-4"><label className="block text-sm font-semibold text-[#cccccc] mb-2">Name*</label><input type="text" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.name} onChange={(e) => setAddFormData({...addFormData, name: e.target.value})} required /></div>
              <div className="mb-4"><label className="block text-sm font-semibold text-[#cccccc] mb-2">Email*</label><input type="email" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.email} onChange={(e) => setAddFormData({...addFormData, email: e.target.value})} required /></div>
              <div className="mb-4"><label className="block text-sm font-semibold text-[#cccccc] mb-2">Password*</label><input type="password" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.password} onChange={(e) => setAddFormData({...addFormData, password: e.target.value})} required /></div>
              <div className="mb-4"><label className="block text-sm font-semibold text-[#cccccc] mb-2">Phone*</label><input type="text" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.phone} onChange={(e) => setAddFormData({...addFormData, phone: e.target.value})} required /></div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Experience*</label>
                <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.experience} onChange={(e) => setAddFormData({...addFormData, experience: e.target.value})} required>
                  <option value="">Select Experience</option>
                  <option value="1-2">1-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div className="mb-4"><label className="block text-sm font-semibold text-[#cccccc] mb-2">Specializations (comma separated)</label><input type="text" placeholder="e.g., Calisthenics, Strength Training" className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.specializations} onChange={(e) => setAddFormData({...addFormData, specializations: e.target.value})} /></div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">Status</label>
                <select className="w-full bg-black border border-[#333] rounded p-3 text-white" value={addFormData.status} onChange={(e) => setAddFormData({...addFormData, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">Add Trainer</button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrainers;
