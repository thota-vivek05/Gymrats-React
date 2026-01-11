import React, { useEffect, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import { useNavigate } from "react-router-dom";

const AdminTrainerAssignment = () => {
  const [trainers, setTrainers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTrainers, setSelectedTrainers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/trainer-assignment-data", {
          credentials: "include",
        });
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
    fetchData();
  }, [navigate]);

  const handleAssign = async (userId, trainerId) => {
    if (!trainerId) return alert("Select a trainer");
    try {
      const res = await fetch("/api/admin/trainer-assign", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
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

  // Shared container styles
  const containerClasses =
    "min-h-screen bg-black text-[#f1f1f1] font-sans flex flex-col";

  if (loading)
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center flex-1 p-16 text-[#cccccc]">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {/* Page Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
          <div>
            <h1 className="m-0 text-2xl font-bold md:text-3xl text-[#f1f1f1]">
              Trainer Assignment
            </h1>
            <p className="mt-1 text-sm text-[#999]">
              Assign available trainers to unassigned users
            </p>
          </div>
        </div>

        {/* Table Container */}
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
      </main>
    </div>
  );
};

export default AdminTrainerAssignment;
