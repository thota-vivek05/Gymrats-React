import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const fetchChangeRequests = async () => {
    try {
      const res = await fetch("/api/admin/trainer-change-requests", { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setChangeRequests(json.requests || []);
        }
      }
    } catch (err) {
      console.error("Error fetching change requests:", err);
    }
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
      } else {
        alert(json.message || "Assignment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleResolveRequest = async (userId, action) => {
    const newTrainerId = selectedNewTrainers[userId];
    if (action === 'approve' && !newTrainerId) {
      return alert("Please select a new trainer before approving.");
    }

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
        if (action === 'approve') {
          fetchData(); // Refresh unassigned users list
        }
      } else {
        alert(data.error || data.message || "Failed to resolve request");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setResolving(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#f1f1f1]">
        <div className="flex flex-col items-center justify-center flex-1 p-16 text-[#cccccc]">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-8 min-h-screen">
        {/* Page Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
          <div>
            <h1 className="m-0 text-2xl font-bold md:text-3xl text-[#f1f1f1]">
              Trainer Assignment
            </h1>
            <p className="mt-1 text-sm text-[#999]">
              Assign trainers to users and manage change requests
            </p>
          </div>
          {changeRequests.length > 0 && (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2">
              <i className="fas fa-exclamation-triangle text-yellow-400"></i>
              <span className="text-yellow-400 text-sm font-medium">
                {changeRequests.length} pending change request{changeRequests.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* SECTION 1: Trainer Change Requests */}
        {/* ═══════════════════════════════════════════ */}
        {changeRequests.length > 0 && (
          <div className="bg-[#111] rounded-lg border border-yellow-500/40 p-5 shadow-[0_4px_8px_rgba(234,179,8,0.15)] mb-8">
            <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-yellow-500/30 text-[#f1f1f1] flex items-center gap-3">
              <i className="fas fa-exchange-alt text-yellow-400"></i>
              Trainer Change Requests
              <span className="ml-auto bg-yellow-500 text-black text-xs font-bold px-2.5 py-1 rounded-full">
                {changeRequests.length}
              </span>
            </h2>

            <div className="space-y-4">
              {changeRequests.map((req) => (
                <div
                  key={req.userId}
                  className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5 hover:border-yellow-500/30 transition-colors"
                >
                  {/* Request Header */}
                  <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8A2BE2] to-[#4A00E0] flex items-center justify-center text-white font-bold text-sm">
                          {req.userName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{req.userName}</h4>
                          <p className="text-gray-400 text-xs">{req.userEmail}</p>
                        </div>
                        <span className="ml-2 bg-[#8A2BE2]/20 text-[#8A2BE2] text-xs px-2 py-0.5 rounded-full font-medium">
                          {req.membershipType}
                        </span>
                      </div>

                      {/* Current Trainer */}
                      {req.currentTrainer && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <i className="fas fa-user-tie text-gray-500 text-xs"></i>
                          <span>Current: <strong className="text-gray-300">{req.currentTrainer.name}</strong></span>
                          <span className="text-gray-600">({req.currentTrainer.email})</span>
                        </div>
                      )}

                      {/* Reason */}
                      <div className="bg-[#222] rounded-lg p-3 mt-2">
                        <p className="text-xs text-gray-500 mb-1">
                          <i className="fas fa-quote-left mr-1"></i> Reason for change:
                        </p>
                        <p className="text-gray-300 text-sm italic">"{req.reason}"</p>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        <i className="fas fa-clock mr-1"></i>
                        Requested: {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 min-w-[280px]">
                      <label className="text-xs text-gray-400 font-medium">Assign New Trainer:</label>
                      <select
                        className="bg-[#0f0f1a] text-[#f1f1f1] border border-[#444] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#8A2BE2] transition-colors"
                        value={selectedNewTrainers[req.userId] || ""}
                        onChange={(e) =>
                          setSelectedNewTrainers((prev) => ({
                            ...prev,
                            [req.userId]: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select new trainer...</option>
                        {trainers
                          .filter(tr => !req.currentTrainer || tr._id !== req.currentTrainer._id)
                          .map((tr) => (
                            <option key={tr._id} value={tr._id}>
                              {tr.name} — {tr.specializations?.join(", ") || "General"}
                            </option>
                          ))}
                      </select>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolveRequest(req.userId, 'approve')}
                          disabled={resolving[req.userId] || !selectedNewTrainers[req.userId]}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/30 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                        >
                          {resolving[req.userId] ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-check"></i>
                          )}
                          Approve & Assign
                        </button>
                        <button
                          onClick={() => handleResolveRequest(req.userId, 'reject')}
                          disabled={resolving[req.userId]}
                          className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white disabled:opacity-50 px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-times"></i>
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* SECTION 2: Unassigned Users (Existing) */}
        {/* ═══════════════════════════════════════════ */}
        <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
          <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
            Unassigned Users
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Name
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Email
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Workout Type
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Assign Trainer
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length ? (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                    >
                      <td className="p-3 text-[#f1f1f1]">{user.full_name}</td>
                      <td className="p-3 text-[#f1f1f1]">{user.email}</td>
                      <td className="p-3 text-[#f1f1f1]">
                        {user.workout_type || "N/A"}
                      </td>
                      <td className="p-3 text-[#f1f1f1]">
                        {/* Only include trainers that match user's workout_type */}
                        {user.workout_type ? (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <select
                              className="
                              bg-[#0f0f1a] 
                              text-[#f1f1f1] 
                              border border-[#333] 
                              rounded 
                              px-2.5 py-2 
                              min-w-[220px]
                              focus:outline-none focus:border-[#8A2BE2]
                            "
                              value={selectedTrainers[user._id] || ""}
                              onChange={(e) =>
                                setSelectedTrainers((prev) => ({
                                  ...prev,
                                  [user._id]: e.target.value,
                                }))
                              }
                            >
                              <option value="">Select trainer</option>
                              {trainers
                                .filter(
                                  (tr) =>
                                    Array.isArray(tr.specializations) &&
                                    tr.specializations.includes(
                                      user.workout_type
                                    )
                                )
                                .map((tr) => (
                                  <option
                                    key={tr._id || tr.id}
                                    value={tr._id || tr.id}
                                  >{`${tr.name} — ${tr.specializations?.join(
                                    ", "
                                  )}`}</option>
                                ))}
                            </select>
                            <button
                              className="
                              bg-[#8A2BE2] 
                              text-white 
                              px-3 py-2 
                              rounded 
                              font-semibold 
                              transition-all duration-150 
                              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#444]
                              hover:enabled:bg-[#7020a0]
                              sm:ml-2
                            "
                              disabled={!selectedTrainers[user._id]}
                              onClick={() =>
                                handleAssign(
                                  user._id,
                                  selectedTrainers[user._id]
                                )
                              }
                            >
                              Assign
                            </button>
                          </div>
                        ) : (
                          <span className="text-[#cccccc] p-10 block text-center md:text-left md:p-0">
                            No workout type specified
                          </span>
                        )}

                        {/* If there are no matching trainers show message */}
                        {user.workout_type &&
                          trainers.filter(
                            (tr) =>
                              Array.isArray(tr.specializations) &&
                              tr.specializations.includes(user.workout_type)
                          ).length === 0 && (
                            <div className="mt-2 text-xs text-[#ccc]">
                              No trainers with matching specialization
                            </div>
                          )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-[#cccccc]">
                      No unassigned users found
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
