import React, { useEffect, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import { useSearchParams, useNavigate } from "react-router-dom";

const AdminReassignment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trainerIdParam = searchParams.get('trainer');
  
  const [poorlyRatedTrainers, setPoorlyRatedTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [potentialTrainers, setPotentialTrainers] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reassignReason, setReassignReason] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [pendingFlags, setPendingFlags] = useState([]);
  const [showFlagsModal, setShowFlagsModal] = useState(false);

  useEffect(() => {
    fetchPoorlyRatedTrainers();
    fetchPendingFlags();
  }, []);

  useEffect(() => {
    if (trainerIdParam && poorlyRatedTrainers.length > 0) {
      const trainer = poorlyRatedTrainers.find(t => t._id === trainerIdParam);
      if (trainer) {
        setSelectedTrainer(trainer);
      }
    }
  }, [trainerIdParam, poorlyRatedTrainers]);

  const fetchPoorlyRatedTrainers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/reassignment/poorly-rated-trainers?minRating=3.0&minReviews=2", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPoorlyRatedTrainers(data.trainers || []);
      }
    } catch (error) {
      console.error("Error fetching poorly rated trainers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingFlags = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/reassignment/pending-flags", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPendingFlags(data.flags || []);
      }
    } catch (error) {
      console.error("Error fetching pending flags:", error);
    }
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setReassignReason("");
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/reassignment/potential-trainers/${user._id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUserDetails(data.user);
        setPotentialTrainers(data.potentialTrainers || []);
      }
    } catch (error) {
      console.error("Error fetching potential trainers:", error);
    }
  };

  const handleReassign = async (newTrainerId) => {
    if (!reassignReason.trim()) {
      alert("Please enter a reason for reassignment");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/reassignment/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          newTrainerId,
          reason: reassignReason
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert(`User successfully reassigned to ${data.data.newTrainer}!`);
        setShowUserModal(false);
        setSelectedUser(null);
        // Refresh data
        fetchPoorlyRatedTrainers();
        fetchPendingFlags();
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error reassigning user:", error);
      alert("Failed to reassign user");
    }
  };

  const handleFlagAction = async (flagId, action) => {
    if (action === 'dismiss') {
      // You can add an API endpoint to dismiss flags if needed
      setPendingFlags(pendingFlags.filter(f => f._id !== flagId));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center flex-1 p-8">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading Reassignment Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
      <AdminSidebar />
      
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Trainer Reassignment</h1>
            <p className="text-[#999] mt-1">Reassign clients from poorly rated trainers</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFlagsModal(true)}
              className="relative bg-[#333] text-white px-4 py-2 rounded hover:bg-[#444]"
            >
              Pending Flags
              {pendingFlags.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingFlags.length}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/admin/ratings')}
              className="bg-[#8A2BE2] text-white px-4 py-2 rounded hover:bg-[#7020a0]"
            >
              Back to Ratings
            </button>
          </div>
        </div>
        
        {poorlyRatedTrainers.length === 0 ? (
          <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-8 text-center">
            <p className="text-[#999]">No poorly rated trainers found. All trainers are performing well!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {poorlyRatedTrainers.map((trainer) => (
              <div key={trainer._id} className="bg-[#111] rounded-lg border border-red-500 p-5">
                <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{trainer.name}</h2>
                    <p className="text-[#999] text-sm">{trainer.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {trainer.specializations?.map((s, i) => (
                        <span key={i} className="bg-[#8A2BE2]/20 text-[#8A2BE2] px-2 py-1 rounded text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0 text-right">
                    <p className="text-red-400 text-2xl font-bold">{trainer.avgRating}</p>
                    <p className="text-[#999] text-sm">{trainer.reviewCount} reviews</p>
                    <p className="text-[#999] text-sm">{trainer.flaggedReviews} flagged</p>
                  </div>
                </div>
                
                <h3 className="font-semibold mb-3 text-[#8A2BE2]">Clients ({trainer.clientDetails?.length || 0})</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#1e1e3a]">
                        <th className="p-3 text-left">Client Name</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Workout Type</th>
                        <th className="p-3 text-left">Membership</th>
                        <th className="p-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainer.clientDetails?.map((client) => (
                        <tr key={client._id} className="border-b border-[#333] hover:bg-[#8A2BE2]/10">
                          <td className="p-3">{client.full_name}</td>
                          <td className="p-3 text-sm">{client.email}</td>
                          <td className="p-3">{client.workout_type || "N/A"}</td>
                          <td className="p-3">{client.membershipType}</td>
                          <td className="p-3">
                            <button
                              onClick={() => handleUserClick(client)}
                              className="px-3 py-1 bg-[#8A2BE2] text-white rounded hover:bg-[#7020a0] text-sm"
                            >
                              Reassign
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!trainer.clientDetails || trainer.clientDetails.length === 0) && (
                        <tr>
                          <td colSpan="5" className="p-4 text-center text-[#999]">
                            No active clients
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Reassignment Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-[#8A2BE2] p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Reassign {selectedUser.full_name}</h2>
                <button onClick={() => setShowUserModal(false)} className="text-[#999] hover:text-white">✕</button>
              </div>
              
              <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg">
                <p><span className="text-[#999]">Current Trainer:</span> {selectedTrainer?.name}</p>
                <p><span className="text-[#999]">Workout Type:</span> {userDetails?.workout_type || "N/A"}</p>
                <p><span className="text-[#999]">Membership:</span> {selectedUser.membershipType}</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Reason for Reassignment *
                </label>
                <textarea
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  rows="3"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="Enter reason for reassigning this user (e.g., poor reviews, specialization mismatch)..."
                  required
                />
              </div>
              
              <h3 className="font-semibold mb-3 text-[#8A2BE2]">Available Trainers</h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                {potentialTrainers.length > 0 ? (
                  potentialTrainers.map((trainer) => (
                    <div key={trainer._id} className="bg-[#1a1a1a] p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div className="flex-1">
                        <p className="font-semibold">{trainer.name}</p>
                        <p className="text-sm text-[#999]">{trainer.specializations?.join(', ')}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs">
                          <span className="text-[#8A2BE2]">⭐ {trainer.avgRating || 'New'}</span>
                          <span className="text-[#999]">{trainer.reviewCount || 0} reviews</span>
                          <span className="text-[#999]">{trainer.activeClients || 0}/{trainer.maxClients} clients</span>
                          <span className="text-[#999]">{trainer.experience} years exp</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleReassign(trainer._id)}
                        className="px-4 py-2 bg-[#8A2BE2] text-white rounded hover:bg-[#7020a0] whitespace-nowrap"
                      >
                        Assign to {trainer.name.split(' ')[0]}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[#999] py-4">No available trainers with matching specializations</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-[#333] text-white rounded hover:bg-[#444]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Pending Flags Modal */}
        {showFlagsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-[#8A2BE2] p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Pending Reassignment Flags ({pendingFlags.length})</h2>
                <button onClick={() => setShowFlagsModal(false)} className="text-[#999] hover:text-white">✕</button>
              </div>
              
              {pendingFlags.length > 0 ? (
                <div className="space-y-3">
                  {pendingFlags.map((flag) => (
                    <div key={flag._id} className="p-4 bg-[#1a1a1a] rounded-lg border border-yellow-500/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{flag.userId?.full_name}</p>
                          <p className="text-sm text-[#999]">Trainer: {flag.trainerId?.name}</p>
                          <p className="text-sm">Rating: ⭐ {flag.rating}</p>
                          {flag.feedback && <p className="text-sm mt-1 text-[#ccc]">"{flag.feedback}"</p>}
                          <p className="text-xs text-[#999] mt-2">{new Date(flag.reviewedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShowFlagsModal(false);
                              handleUserClick(flag.userId);
                            }}
                            className="px-3 py-1 bg-[#8A2BE2] text-white rounded text-sm hover:bg-[#7020a0]"
                          >
                            Reassign
                          </button>
                          <button
                            onClick={() => handleFlagAction(flag._id, 'dismiss')}
                            className="px-3 py-1 bg-[#333] text-white rounded text-sm hover:bg-[#444]"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#999] py-4">No pending flags</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReassignment;