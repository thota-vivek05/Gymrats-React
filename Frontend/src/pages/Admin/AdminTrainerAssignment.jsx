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

const AttentionCard = ({ label, value, color }) => {
  const toneClasses = getToneClasses(color);
  return (
    <div className={`rounded-lg p-4 border shadow-md flex justify-between items-center ${toneClasses}`}>
      <h3 className="text-sm font-semibold uppercase tracking-wide opacity-80">{label}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

const AdminTrainerAssignment = () => {
  const [trainers, setTrainers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTrainers, setSelectedTrainers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Change Requests State
  const [changeRequests, setChangeRequests] = useState([]);
  const [selectedNewTrainers, setSelectedNewTrainers] = useState({});
  const [resolving, setResolving] = useState({});

  const token = localStorage.getItem("token");
  const headers = { "Authorization": `Bearer ${token}` };

  useEffect(() => {
    fetchData();
    fetchChangeRequests();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/trainer-assignment-data", { headers });
      if (!res.ok) {
        if (res.status === 401) return navigate("/admin/login");
        throw new Error("Failed to fetch assignment data");
      }
      const json = await res.json();
      if (json.success) {
        setTrainers(json.trainers || []);
        setUsers(json.unassignedUsers || []);
      } else {
        setError(json.message || "Failed to load");
      }
    } catch (err) {
      console.error(err);
      setError("Server error gathering assignment data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchChangeRequests = async () => {
    try {
      const res = await fetch("/api/admin/trainer-change-requests", { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success) setChangeRequests(json.requests || []);
      }
    } catch (err) { console.error("Error fetching change requests:", err); }
  };

  const handleAssign = async (userId, trainerId) => {
    if (!trainerId) return alert("Select a trainer");
    try {
      const res = await fetch("/api/admin/assign-trainer-admin", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ userId, trainerId }),
      });
      if (!res.ok) {
        if (res.status === 401) return navigate("/admin/login");
        const err = await res.json();
        return alert(err.message || "Assignment failed");
      }
      const json = await res.json();
      if (json.success) {
        alert("Assigned successfully");
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      } else { alert(json.message || "Assignment failed"); }
    } catch (err) { console.error(err); alert("Server error"); }
  };

  const handleResolveRequest = async (userId, action) => {
    const newTrainerId = selectedNewTrainers[userId];
    if (action === 'approve' && !newTrainerId) return alert("Please select a new trainer before approving.");

    setResolving(prev => ({ ...prev, [userId]: true }));

    try {
      const res = await fetch(`/api/admin/trainer-change-requests/${userId}/resolve`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ action, newTrainerId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setChangeRequests(prev => prev.filter(r => r.userId !== userId));
        if (action === 'approve') fetchData();
      } else { alert(data.error || data.message || "Failed to resolve request"); }
    } catch (err) { console.error(err); alert("Server error"); } 
    finally { setResolving(prev => ({ ...prev, [userId]: false })); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#f1f1f1] bg-black">
      <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
      <p>Loading Assignment Matrix...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 min-h-screen bg-black text-[#f1f1f1]">
        
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 flex justify-between items-center">
            <p><strong>Error:</strong> {error}</p>
            <button onClick={() => fetchData()} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition-colors">Try Again</button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
        <div>
          <h1 className="m-0 text-2xl font-bold md:text-3xl text-[#f1f1f1]">Trainer Assignment</h1>
          <p className="mt-1 text-sm text-[#999]">Designate available trainers and process change requests</p>
        </div>
      </div>

      {/* Assignment Attention Center */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 border-b border-[#333] pb-2">Assignment Attention Center</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AttentionCard label="Total Unassigned Users" value={users.length} color="purple" />
            <AttentionCard label="Change Requests Pending" value={changeRequests.length} color={changeRequests.length > 0 ? "orange" : "green"} />
        </div>
      </div>

      {/* SECTION 1: Trainer Change Requests */}
      {changeRequests.length > 0 && (
        <div className="bg-[#111] rounded-lg border border-orange-500/40 p-5 shadow-[0_4px_8px_rgba(234,179,8,0.15)] mb-8">
          <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-orange-500/30 text-[#f1f1f1] flex items-center gap-3">
            Change Requests
          </h2>

          <div className="space-y-4">
            {changeRequests.map((req) => (
              <div key={req.userId} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5 hover:border-orange-500/30 transition-colors">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    
                    <div className="flex items-center gap-3 mb-2">
                       <div className="font-bold text-lg">{req.userName}</div>
                       <span className="bg-purple-900/30 text-purple-300 text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-sm border border-purple-800/80 font-medium">{req.membershipType}</span>
                    </div>
                    
                    <div className="text-gray-400 text-xs font-mono mb-3">{req.userEmail}</div>

                    {req.currentTrainer && (
                      <div className="text-xs text-gray-400 mb-2 font-semibold">
                        Current Assignment: <strong className="text-gray-300">{req.currentTrainer.name}</strong> <span className="text-gray-600">({req.currentTrainer.email})</span>
                      </div>
                    )}

                    <div className="bg-[#222] border-l-2 border-orange-500 rounded p-3 mt-2">
                      <p className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-500 mb-1">Reason for change:</p>
                      <p className="text-gray-300 text-sm italic">"{req.reason}"</p>
                    </div>

                    <p className="text-[0.65rem] text-gray-500 mt-3 uppercase tracking-widest font-bold">
                      Requested: {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[300px]">
                    <label className="text-xs text-gray-400 font-medium uppercase tracking-widest">Assign New Trainer:</label>
                    <select
                      className="bg-[#0f0f1a] text-[#f1f1f1] border border-[#444] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#8A2BE2] transition-colors"
                      value={selectedNewTrainers[req.userId] || ""}
                      onChange={(e) => setSelectedNewTrainers((prev) => ({ ...prev, [req.userId]: e.target.value }))}
                    >
                      <option value="">Select new trainer...</option>
                      {trainers.filter(tr => !req.currentTrainer || tr._id !== req.currentTrainer._id).map((tr) => (
                          <option key={tr._id} value={tr._id}>{tr.name} — {tr.specializations?.join(", ") || "General"}</option>
                      ))}
                    </select>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleResolveRequest(req.userId, 'approve')}
                        disabled={resolving[req.userId] || !selectedNewTrainers[req.userId]}
                        className="flex-1 bg-[#2e8b57]/20 border border-[#2e8b57]/40 text-[#90ee90] hover:bg-[#2e8b57]/40 disabled:opacity-50 px-2 py-2 rounded text-xs uppercase tracking-widest font-bold transition-all"
                      >
                        {resolving[req.userId] ? "Working..." : "Approve Change"}
                      </button>
                      <button
                        onClick={() => handleResolveRequest(req.userId, 'reject')}
                        disabled={resolving[req.userId]}
                        className="flex-1 bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 text-[#ff6b6b] hover:bg-[#ff6b6b]/30 px-2 py-2 rounded text-xs uppercase tracking-widest font-bold transition-all"
                      >
                        Reject Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Unassigned Users (Existing) */}
      <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
        <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
          Unassigned Client Processing ({users.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm md:text-base">
            <thead>
              <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">User Info</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Target Workout Goal</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Assignment Logic</th>
              </tr>
            </thead>
            <tbody>
              {users.length ? (
                users.map((user) => {
                  const matchingTrainers = trainers.filter((tr) => Array.isArray(tr.specializations) && tr.specializations.includes(user.workout_type));
                  
                  return (
                  <tr key={user._id} className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10">
                    <td className="p-3 text-[#f1f1f1] align-top">
                        <div className="font-bold text-lg">{user.full_name}</div>
                        <div className="text-gray-500 font-mono text-xs">{user.email}</div>
                    </td>
                    
                    <td className="p-3 text-[#f1f1f1] align-top">
                       {user.workout_type ? (
                          <span className="bg-blue-900/40 text-blue-300 border border-blue-800/80 px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider">
                              {user.workout_type}
                          </span>
                       ) : (
                          <span className="text-xs italic text-gray-600">No workout goal provided</span>
                       )}
                    </td>
                    
                    <td className="p-3 text-[#f1f1f1] align-top">
                      {user.workout_type ? (
                        <div className="flex flex-col gap-2">
                          <select
                            className="bg-[#0f0f1a] text-[#f1f1f1] border border-[#333] rounded px-3 py-2 text-sm max-w-[280px] focus:outline-none focus:border-[#8A2BE2]"
                            value={selectedTrainers[user._id] || ""}
                            onChange={(e) => setSelectedTrainers((prev) => ({ ...prev, [user._id]: e.target.value }))}
                          >
                            <option value="">Select automatically matched trainer...</option>
                            {matchingTrainers.map((tr) => (
                                <option key={tr._id || tr.id} value={tr._id || tr.id}>{`${tr.name} — ${tr.specializations?.join(", ")}`}</option>
                            ))}
                          </select>
                          <button
                            className="bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 text-[#8A2BE2] px-3 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all hover:bg-[#8A2BE2]/40 disabled:opacity-30 disabled:cursor-not-allowed max-w-[280px]"
                            disabled={!selectedTrainers[user._id]}
                            onClick={() => handleAssign(user._id, selectedTrainers[user._id])}
                          >
                            Execute Assignment
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600 italic">User must select a workout goal before assignment.</span>
                      )}

                      {user.workout_type && matchingTrainers.length === 0 && (
                          <div className="mt-2 text-[0.65rem] text-orange-400 font-bold uppercase tracking-widest">
                            ⚠️ Zero trainers match this specialization
                          </div>
                      )}
                    </td>
                  </tr>
                )})) : (
                <tr>
                  <td colSpan="3" className="p-10 text-center text-[#cccccc]">
                    No unassigned users awaiting processing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTrainerAssignment;
