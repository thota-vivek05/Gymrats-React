import React, { useEffect, useState } from "react";

// Helper Functions
const getDaysWaiting = (createdAt) => {
  if (!createdAt) return 0;
  const createdDate = new Date(createdAt);
  const diffTime = Math.abs(new Date() - createdDate);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const getAttentionFlags = (app) => {
  const flags = [];
  const daysWaiting = getDaysWaiting(app.createdAt);
  
  if (app.status === "Pending" && daysWaiting >= 7) flags.push("Waiting 7d+");
  if (!app.specializations || app.specializations.length === 0) flags.push("No Specialization");
  if (app.status === "Rejected" && (app.rejectionReason || app.reason)) flags.push("Has Rejection Note");
  
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

const StatCard = ({ label, value }) => (
  <div className="bg-[#111] rounded-lg p-5 border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(138,43,226,0.4)]">
    <h3 className="text-[#cccccc] text-sm font-semibold uppercase tracking-wide mb-2">{label}</h3>
    <p className="text-[#8A2BE2] text-3xl font-bold">{value}</p>
  </div>
);

const AttentionCard = ({ label, value, color }) => {
  const toneClasses = getToneClasses(color);
  return (
    <div className={`rounded-lg p-4 border shadow-md flex justify-between items-center ${toneClasses}`}>
      <h3 className="text-sm font-semibold uppercase tracking-wide opacity-80">{label}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

const AdminVerifiers = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSpecialization, setFilterSpecialization] = useState("All");
  const [filterAttention, setFilterAttention] = useState("All");

  const [viewingApp, setViewingApp] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/trainer-applications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications || []);
        setStats(data.stats || {});
      } else {
        setError(data.message || "Failed to load trainer applications.");
        setApplications([]);
        setStats({ totalApplications: 0, pendingApplications: 0, approvedApplications: 0, rejectedApplications: 0 });
      }
    } catch (error) {
      console.error("Error fetching trainer applications:", error);
      setError("Network error. Could not reach backend.");
      setApplications([]);
      setStats({ totalApplications: 0, pendingApplications: 0, approvedApplications: 0, rejectedApplications: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/trainer-applications/${id}/approve`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setApplications(applications.map((app) => app._id === id ? { ...app, status: "Approved" } : app));
        if (stats) setStats({ ...stats, pendingApplications: Math.max(0, stats.pendingApplications - 1), approvedApplications: (stats.approvedApplications || 0) + 1 });
      } else { alert("Failed to approve: " + (data.message || "Unknown error")); }
    } catch (err) { alert("Failed to approve application: " + err.message); }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/trainer-applications/${id}/reject`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ reason: reason || "" }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setApplications(applications.map((app) => app._id === id ? { ...app, status: "Rejected", rejectionReason: reason || "" } : app));
        if (stats) setStats({ ...stats, pendingApplications: Math.max(0, stats.pendingApplications - 1), rejectedApplications: (stats.rejectedApplications || 0) + 1 });
      } else { alert("Failed to reject: " + (data.message || "Unknown error")); }
    } catch (err) { alert("Failed to reject application: " + err.message); }
  };

  // Extract Specializations dynamically for dropdown filter
  const extractedSpecializations = [...new Set(applications.flatMap(app => app.specializations || []))].sort();

  // Local Data Filtering
  let displayedApplications = applications.filter(app => {
     if (filterStatus !== "All" && app.status !== filterStatus) return false;
     if (filterSpecialization !== "All" && !(app.specializations || []).includes(filterSpecialization)) return false;
     if (filterAttention === "Needs Attention" && getAttentionFlags(app).length === 0) return false;
     return true;
  });

  const clearExtraFilters = () => {
    setFilterStatus("All");
    setFilterSpecialization("All");
    setFilterAttention("All");
  };

  const hasExtraFilters = filterStatus !== "All" || filterSpecialization !== "All" || filterAttention !== "All";

  // Attention Center Computations
  const pending7PlusCount = applications.filter(app => app.status === "Pending" && getDaysWaiting(app.createdAt) >= 7).length;
  const missingSpecCount = applications.filter(app => !app.specializations || app.specializations.length === 0).length;
  const rejectedCount = applications.filter(app => app.status === "Rejected").length;
  const pendingInView = displayedApplications.filter(app => app.status === "Pending").length;
  const attentionInView = displayedApplications.filter(app => getAttentionFlags(app).length > 0).length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#f1f1f1] bg-black">
      <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
      <p>Loading Trainer Applications...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 min-h-screen text-[#f1f1f1] bg-black">
        
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 flex justify-between items-center">
            <p><strong>Error:</strong> {error}</p>
            <button onClick={() => fetchApplications()} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition-colors">Try Again</button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
        <div>
          <h1 className="m-0 text-2xl font-bold md:text-3xl text-[#f1f1f1]">
            Trainer Applications
          </h1>
          <p className="mt-1 text-sm text-[#999]">Review and manage trainer applications</p>
        </div>
      </div>

      {/* Application Attention Center */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 border-b border-[#333] pb-2">Application Attention Center</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AttentionCard label="Pending 7+ Days" value={pending7PlusCount} color="red" />
            <AttentionCard label="Missing Specialization" value={missingSpecCount} color="orange" />
            <AttentionCard label="Total Rejected" value={rejectedCount} color="blue" />
            <AttentionCard label="Pending in View" value={pendingInView} color="purple" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visible Applications" value={displayedApplications.length} />
        <StatCard label="Needs Attention" value={attentionInView} />
        <StatCard label="Approved History" value={stats?.approvedApplications || 0} />
        <StatCard label="System Total" value={stats?.totalApplications || 0} />
      </div>

      {/* Filters Base */}
      <div className="mb-6 bg-[#111] p-4 rounded-lg border border-[#333]">
        <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-400">Filters:</span>
            
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="All">Any Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            
            <select className="bg-[#1e1e3a] text-sm text-gray-200 border border-[#444] rounded px-3 py-1.5 focus:outline-none max-w-[200px]" value={filterSpecialization} onChange={e => setFilterSpecialization(e.target.value)}>
              <option value="All">Any Specialization</option>
              {extractedSpecializations.map((spec, idx) => (
                  <option key={idx} value={spec}>{spec}</option>
              ))}
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
            {filterStatus !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">{filterStatus}</span>}
            {filterSpecialization !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">Spec: {filterSpecialization}</span>}
            {filterAttention !== 'All' && <span className="bg-[#1e1e3a] text-gray-300 text-xs px-2 py-1 rounded border border-[#444]">Needs Attention</span>}
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
        <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
          Dashboard Feed ({displayedApplications.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm md:text-base">
            <thead>
              <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Applicant</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Submission Data</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Specializations</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Attention / Notes</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedApplications.length > 0 ? (
                displayedApplications.map((app) => {
                   const flags = getAttentionFlags(app);
                   return (
                     <tr key={app._id} className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10">
                        <td className="p-3 align-top">
                           <div className="font-semibold text-lg text-[#f1f1f1] flex items-center gap-2">
                             {app.name}
                             <span className={`inline-block px-2 text-[0.6rem] font-bold uppercase tracking-wide rounded-sm border ${
                               app.status === "Pending" ? "bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]/50" : 
                               app.status === "Approved" ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]/50" : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]/50"
                             }`}>{app.status}</span>
                           </div>
                           <div className="text-xs text-gray-400 mt-0.5">{app.email}</div>
                           <div className="text-xs text-gray-500 mt-0.5 font-mono">{app.phone}</div>
                        </td>

                        <td className="p-3 align-top text-[#cccccc]">
                           <div className="mb-1">
                               <span className="text-gray-500 font-semibold mr-1 text-xs">Applied Date:</span><br/>
                               {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Date Unknown"}
                           </div>
                           <div className="text-xs font-semibold">
                               <span className="text-gray-500">Wait Duration: </span>
                               <span className={app.status === "Pending" && getDaysWaiting(app.createdAt) >= 7 ? "text-red-400" : "text-blue-300"}>
                                   {getDaysWaiting(app.createdAt)} days
                               </span>
                           </div>
                           <div className="text-xs font-semibold mt-1">
                               <span className="text-gray-500">Exp: </span><span className="text-white">{app.experience} Years</span>
                           </div>
                        </td>

                        <td className="p-3 align-top max-w-[200px]">
                           <div className="flex flex-wrap gap-1">
                              {app.specializations && app.specializations.length > 0 ? (
                                app.specializations.map((spec, i) => (
                                  <span key={i} className="bg-purple-900/30 text-purple-300 border border-purple-800/80 px-1.5 rounded text-[0.65rem] font-medium uppercase tracking-wider">
                                    {spec}
                                  </span>
                                ))
                              ) : (
                                 <span className="text-xs italic text-gray-600">None Configured</span>
                              )}
                           </div>
                        </td>

                        <td className="p-3 align-top">
                           <div className="flex flex-col gap-1 items-start max-w-[160px]">
                              {flags.length > 0 ? (
                                  flags.map((flag, idx) => (
                                      <span key={idx} className="bg-red-900/30 text-red-400 border border-red-800 text-[0.6rem] px-1.5 py-0.5 rounded-sm whitespace-nowrap">⚠️ {flag}</span>
                                  ))
                              ) : (
                                  <span className="text-green-500 text-xs font-semibold pr-2">✓ Clear</span>
                              )}
                              {(app.rejectionReason || app.reason) && (
                                  <div className="text-xs text-orange-400 mt-1 italic border-l-2 border-orange-500 pl-1 py-0.5">
                                      Note: {app.rejectionReason || app.reason}
                                  </div>
                              )}
                           </div>
                        </td>

                        <td className="p-3 align-top">
                           <div className="flex flex-col gap-2 min-w-[90px]">
                            <button onClick={() => setViewingApp(app)} className="px-2 py-1.5 rounded text-xs font-semibold transition-all duration-300 bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 text-[#8A2BE2] hover:bg-[#8A2BE2]/40 uppercase tracking-widest text-center mb-1">View Data</button>
                            {app.status === "Pending" ? (
                              <>
                                <button onClick={() => handleApprove(app._id)} className="px-2 py-1.5 rounded text-xs font-semibold transition-all duration-300 bg-[#2e8b57]/20 border border-[#2e8b57]/40 text-[#90ee90] hover:bg-[#2e8b57]/40 uppercase tracking-widest text-center">Approve</button>
                                <button onClick={() => handleReject(app._id)} className="px-2 py-1.5 rounded text-xs font-semibold transition-all duration-300 bg-[#ff6b6b]/20 border border-[#ff6b6b]/40 text-[#ff6b6b] hover:bg-[#ff6b6b]/40 uppercase tracking-widest text-center">Reject</button>
                              </>
                            ) : (
                                <span className="text-xs font-bold uppercase tracking-widest text-[#555] p-1 border border-[#333] text-center rounded bg-[#1e1e1e]">
                                  {app.status === "Approved" ? "Approved ✓" : "Rejected ✗"}
                                </span>
                            )}
                          </div>
                        </td>
                     </tr>
                   );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-[#cccccc]">
                    No applications mapped to active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* View Application Modal */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setViewingApp(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white pb-1 w-8 h-8 flex justify-center items-center rounded-full bg-[#222]">✕</button>
            <h2 className="text-xl font-bold text-[#f1f1f1] mb-6 pb-2 border-b border-[#333]">Application Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8A2BE2] uppercase tracking-widest mb-1">Full Name</label>
                <div className="text-white bg-[#1a1a1a] p-3 rounded border border-[#333] font-medium">{viewingApp.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8A2BE2] uppercase tracking-widest mb-1">Email</label>
                  <div className="text-white bg-[#1a1a1a] p-3 rounded border border-[#333] font-medium text-sm break-all">{viewingApp.email}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8A2BE2] uppercase tracking-widest mb-1">Phone Number</label>
                  <div className="text-white bg-[#1a1a1a] p-3 rounded border border-[#333] font-medium font-mono text-sm">{viewingApp.phone}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8A2BE2] uppercase tracking-widest mb-1">Experience</label>
                  <div className="text-white bg-[#1a1a1a] p-3 rounded border border-[#333] font-medium text-sm">{viewingApp.experience} Years</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8A2BE2] uppercase tracking-widest mb-1">Current Status</label>
                  <div className="text-white bg-[#1a1a1a] p-3 rounded border border-[#333] font-medium text-sm">{viewingApp.status}</div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8A2BE2] uppercase tracking-widest mb-1">Specializations</label>
                <div className="flex flex-wrap gap-2 text-white bg-[#1a1a1a] p-3 rounded border border-[#333]">
                  {viewingApp.specializations && viewingApp.specializations.length > 0 ? (
                    viewingApp.specializations.map((s, i) => (
                      <span key={i} className="bg-purple-900/40 text-purple-300 px-2 py-0.5 text-xs rounded border border-purple-800">{s}</span>
                    ))
                  ) : <span className="text-gray-500 italic text-sm">None explicitly defined</span>}
                </div>
              </div>
              {viewingApp.createdAt && (
                <div>
                  <label className="block text-xs font-semibold text-[#8A2BE2] uppercase tracking-widest mb-1">Date Applied</label>
                  <div className="text-white bg-[#1a1a1a] p-3 rounded border border-[#333] font-medium text-sm">{new Date(viewingApp.createdAt).toLocaleString()}</div>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              {viewingApp.status === "Pending" && (
                <>
                  <button onClick={() => { handleApprove(viewingApp._id); setViewingApp(null); }} className="px-4 py-2 rounded font-bold transition-all bg-[#2e8b57] text-white hover:bg-[#2e8b57]/80 text-sm">Approve Applicant</button>
                  <button onClick={() => { handleReject(viewingApp._id); setViewingApp(null); }} className="px-4 py-2 rounded font-bold transition-all bg-[#ff6b6b] text-white hover:bg-[#ff6b6b]/80 text-sm">Reject Applicant</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminVerifiers;
