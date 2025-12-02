import React, { useEffect, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";

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

const AdminVerifiers = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch("/api/admin/trainer-applications", {
          credentials: "include",
        });
        const data = await response.json();
        console.log("Trainer applications data:", data);
        if (data.success) {
          setApplications(data.applications || []);
          setStats(data.stats || {});
        } else {
          console.error("Failed to fetch applications:", data.message);
          setApplications([]);
          setStats({
            totalApplications: 0,
            pendingApplications: 0,
            approvedApplications: 0,
            rejectedApplications: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching trainer applications:", error);
        setApplications([]);
        setStats({
          totalApplications: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleApprove = async (id) => {
    try {
      const response = await fetch(
        `/api/admin/trainer-applications/${id}/approve`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      console.log("Approve response:", data, "Status:", response.status);

      if (response.ok && data.success) {
        setApplications(
          applications.map((app) =>
            app._id === id ? { ...app, status: "Approved" } : app
          )
        );
        if (stats) {
          setStats({
            ...stats,
            pendingApplications: Math.max(0, stats.pendingApplications - 1),
            approvedApplications: (stats.approvedApplications || 0) + 1,
          });
        }
        alert("Trainer application approved successfully!");
      } else {
        alert("Failed to approve: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Failed to approve application: " + err.message);
      console.error("Approve error:", err);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return; // User cancelled
    try {
      const response = await fetch(
        `/api/admin/trainer-applications/${id}/reject`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: reason || "" }),
        }
      );
      const data = await response.json();
      console.log("Reject response:", data, "Status:", response.status);

      if (response.ok && data.success) {
        setApplications(
          applications.map((app) =>
            app._id === id ? { ...app, status: "Rejected" } : app
          )
        );
        if (stats) {
          setStats({
            ...stats,
            pendingApplications: Math.max(0, stats.pendingApplications - 1),
            rejectedApplications: (stats.rejectedApplications || 0) + 1,
          });
        }
        alert("Trainer application rejected successfully!");
      } else {
        alert("Failed to reject: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Failed to reject application: " + err.message);
      console.error("Reject error:", err);
    }
  };

  // Shared container styles
  const containerClasses =
    "min-h-screen bg-black text-[#f1f1f1] font-sans flex flex-col";

  if (loading)
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-[#cccccc]">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading Trainer Applications...</p>
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
              Trainer Applications
            </h1>
            <p className="mt-1 text-sm text-[#999]">
              Review and manage trainer applications
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Applications"
            value={stats?.totalApplications || 0}
          />
          <StatCard
            label="Pending Review"
            value={stats?.pendingApplications || 0}
          />
          <StatCard label="Approved" value={stats?.approvedApplications || 0} />
          <StatCard label="Rejected" value={stats?.rejectedApplications || 0} />
        </div>

        {/* Applications Table */}
        <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
          <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
            Trainer Applications
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
                    Phone
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Experience
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Specializations
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Status
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <tr
                      key={app._id}
                      className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                    >
                      <td className="p-3 text-[#f1f1f1]">{app.name}</td>
                      <td className="p-3 text-[#f1f1f1]">{app.email}</td>
                      <td className="p-3 text-[#f1f1f1]">{app.phone}</td>
                      <td className="p-3 text-[#f1f1f1]">
                        {app.experience} years
                      </td>
                      <td className="p-3 text-[#f1f1f1]">
                        {app.specializations?.join(", ") || "None"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`
                          inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border
                          ${
                            app.status === "Pending"
                              ? "bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]"
                              : app.status === "Approved"
                              ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]"
                              : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                          }
                        `}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                          {app.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(app._id)}
                                title="Approve this trainer application"
                                className="
                                  px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                                  bg-[#2e8b57]/20 text-[#90ee90] hover:bg-[#2e8b57]/30
                                "
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(app._id)}
                                title="Reject this trainer application"
                                className="
                                  px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                                  bg-[#ff6b6b]/20 text-[#ff6b6b] hover:bg-[#ff6b6b]/30
                                "
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {app.status !== "Pending" && (
                            <span className="text-xs text-[#999]">
                              {app.status === "Approved"
                                ? "Approved ✓"
                                : "Rejected ✗"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-[#cccccc]">
                      No trainer applications found.
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

export default AdminVerifiers;
