import React, { useEffect, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";

const SPECIALIZATION_OPTIONS = [
  "Calisthenics",
  "Weight Loss",
  "HIIT",
  "Competitive",
  "Strength Training",
  "Cardio",
  "Flexibility",
  "Bodybuilding",
];

const formatDate = (value) => {
  if (!value) return "N/A";
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime())
    ? "N/A"
    : parsedDate.toLocaleDateString();
};

const getDaysSince = (value) => {
  if (!value) return null;
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return Math.max(
    0,
    Math.ceil((Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24))
  );
};

const getApplicationFlags = (application) => {
  const flags = [];
  const daysSinceApplied = getDaysSince(application.createdAt);

  if (!application.specializations || application.specializations.length === 0) {
    flags.push({ label: "No Specialization", tone: "purple" });
  }

  if (!application.phone) {
    flags.push({ label: "No Phone", tone: "red" });
  }

  if (application.status === "Pending" && daysSinceApplied !== null && daysSinceApplied >= 7) {
    flags.push({ label: "Waiting 7d+", tone: "yellow" });
  }

  if (application.status === "Rejected" && application.verificationNotes) {
    flags.push({ label: "Has Rejection Note", tone: "purple" });
  }

  return flags;
};

const getToneClasses = (tone) => {
  if (tone === "green") {
    return "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]";
  }
  if (tone === "yellow") {
    return "bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]";
  }
  if (tone === "red") {
    return "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]";
  }
  return "bg-[#8A2BE2]/20 text-[#c79cff] border-[#8A2BE2]";
};

const StatCard = ({ label, value, helperText }) => {
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
      {helperText ? (
        <p className="mt-2 text-xs text-[#8f8f8f]">{helperText}</p>
      ) : null}
    </div>
  );
};

const AdminVerifiers = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [attentionFilter, setAttentionFilter] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/trainer-applications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setApplications([]);
        setStats({
          totalApplications: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0,
        });
        setError(`Failed to fetch applications (${response.status})`);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setApplications(data.applications || []);
        setStats(data.stats || {});
      } else {
        setApplications([]);
        setStats({
          totalApplications: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0,
        });
        setError(data.message || "Failed to fetch trainer applications");
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
      setError("Could not load trainer applications from the server");
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setApplications(
          applications.map((application) =>
            application._id === id
              ? { ...application, status: "Approved" }
              : application
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
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/trainer-applications/${id}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reason || "" }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setApplications(
          applications.map((application) =>
            application._id === id
              ? {
                  ...application,
                  status: "Rejected",
                  verificationNotes: reason || application.verificationNotes,
                }
              : application
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
    }
  };

  const filteredApplications = applications.filter((application) => {
    const flags = getApplicationFlags(application);
    const matchesStatus = !statusFilter || application.status === statusFilter;
    const matchesSpecialization =
      !specializationFilter ||
      (application.specializations || []).includes(specializationFilter);
    const matchesAttention =
      !attentionFilter ||
      (attentionFilter === "attention" && flags.length > 0) ||
      (attentionFilter === "waiting" &&
        flags.some((flag) => flag.label === "Waiting 7d+")) ||
      (attentionFilter === "noSpecialization" &&
        flags.some((flag) => flag.label === "No Specialization")) ||
      (attentionFilter === "notes" &&
        flags.some((flag) => flag.label === "Has Rejection Note"));

    return matchesStatus && matchesSpecialization && matchesAttention;
  });

  const needsAttentionCount = filteredApplications.filter(
    (application) => getApplicationFlags(application).length > 0
  ).length;
  const waitingLongCount = filteredApplications.filter((application) =>
    getApplicationFlags(application).some((flag) => flag.label === "Waiting 7d+")
  ).length;
  const noSpecializationCount = filteredApplications.filter((application) =>
    getApplicationFlags(application).some(
      (flag) => flag.label === "No Specialization"
    )
  ).length;

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
        <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
          <div>
            <h1 className="m-0 text-2xl font-bold md:text-3xl text-[#f1f1f1]">
              Trainer Applications
            </h1>
            <p className="mt-1 text-sm text-[#999]">
              Review incoming trainer applications and act on stalled or incomplete requests.
            </p>
          </div>
        </div>

        <div className="mb-6 bg-[#111] p-4 rounded-lg border border-[#333]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
            >
              <option value="">All Specializations</option>
              {SPECIALIZATION_OPTIONS.map((specialization) => (
                <option key={specialization} value={specialization}>
                  {specialization}
                </option>
              ))}
            </select>

            <select
              value={attentionFilter}
              onChange={(e) => setAttentionFilter(e.target.value)}
              className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
            >
              <option value="">All Attention States</option>
              <option value="attention">Needs Attention</option>
              <option value="waiting">Pending 7+ Days</option>
              <option value="noSpecialization">No Specialization</option>
              <option value="notes">Has Rejection Note</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Visible Applications"
            value={filteredApplications.length}
            helperText={`${stats?.totalApplications || 0} total applications`}
          />
          <StatCard
            label="Pending Review"
            value={stats?.pendingApplications || 0}
            helperText="Applications waiting for action"
          />
          <StatCard
            label="Needs Attention"
            value={needsAttentionCount}
            helperText="Long wait, missing data, or noted rejections"
          />
          <StatCard
            label="Approved"
            value={stats?.approvedApplications || 0}
            helperText="Applications already converted to trainers"
          />
        </div>

        <div className="mb-8 bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.2)]">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#f1f1f1]">Application Attention Center</h2>
            <p className="text-sm text-[#9f9f9f] mt-1">
              Quick summary of application review pressure and missing profile signals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-yellow-300">Waiting 7+ Days</p>
              <p className="mt-2 text-2xl font-bold text-white">{waitingLongCount}</p>
            </div>
            <div className="rounded-lg border border-[#8A2BE2]/30 bg-[#8A2BE2]/10 p-4">
              <p className="text-xs uppercase tracking-wide text-[#d4b2ff]">No Specialization</p>
              <p className="mt-2 text-2xl font-bold text-white">{noSpecializationCount}</p>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-red-300">Rejected</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {stats?.rejectedApplications || 0}
              </p>
            </div>
            <div className="rounded-lg border border-[#8A2BE2]/30 bg-[#8A2BE2]/10 p-4">
              <p className="text-xs uppercase tracking-wide text-[#d4b2ff]">Pending Visible</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {filteredApplications.filter((application) => application.status === "Pending").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
          <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
            Trainer Applications
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Applicant
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Contact
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Experience
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Specializations
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Attention
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((application) => {
                    const flags = getApplicationFlags(application);
                    const daysSinceApplied = getDaysSince(application.createdAt);

                    return (
                      <tr
                        key={application._id}
                        className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                      >
                        <td className="p-3 text-[#f1f1f1] min-w-[200px]">
                          <div className="font-semibold">{application.name}</div>
                          <div className="mt-1 text-xs text-[#9f9f9f]">
                            Submitted: {formatDate(application.createdAt)}
                          </div>
                          <div className="mt-1 text-xs text-[#8f8f8f]">
                            {daysSinceApplied !== null ? `${daysSinceApplied} day(s) ago` : "N/A"}
                          </div>
                        </td>
                        <td className="p-3 text-[#f1f1f1] min-w-[220px]">
                          <div>{application.email}</div>
                          <div className="mt-1 text-xs text-[#9f9f9f]">
                            {application.phone || "No phone"}
                          </div>
                          <div className="mt-2">
                            <span
                              className={`inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full border ${
                                application.status === "Pending"
                                  ? "bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]"
                                  : application.status === "Approved"
                                  ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]"
                                  : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                              }`}
                            >
                              {application.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-[#f1f1f1]">
                          {application.experience} years
                        </td>
                        <td className="p-3 text-[#f1f1f1] min-w-[220px]">
                          {(application.specializations || []).length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {application.specializations.map((specialization, index) => (
                                <span
                                  key={`${application._id}-${index}`}
                                  className="bg-[#8A2BE2]/20 text-[#8A2BE2] px-2 py-1 rounded text-xs"
                                >
                                  {specialization}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#8f8f8f] text-sm">None</span>
                          )}
                          {application.verificationNotes ? (
                            <p className="mt-2 text-xs text-[#9f9f9f] line-clamp-2">
                              Note: {application.verificationNotes}
                            </p>
                          ) : null}
                        </td>
                        <td className="p-3 min-w-[220px]">
                          <div className="flex flex-wrap gap-2">
                            {flags.length > 0 ? (
                              flags.map((flag) => (
                                <span
                                  key={`${application._id}-${flag.label}`}
                                  className={`inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full border ${getToneClasses(
                                    flag.tone
                                  )}`}
                                >
                                  {flag.label}
                                </span>
                              ))
                            ) : (
                              <span className="inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full border bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]">
                                Healthy
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                            {application.status === "Pending" ? (
                              <>
                                <button
                                  onClick={() => handleApprove(application._id)}
                                  title="Approve this trainer application"
                                  className="
                                  px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                                  bg-[#2e8b57]/20 text-[#90ee90] hover:bg-[#2e8b57]/30
                                "
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(application._id)}
                                  title="Reject this trainer application"
                                  className="
                                  px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                                  bg-[#ff6b6b]/20 text-[#ff6b6b] hover:bg-[#ff6b6b]/30
                                "
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-[#999]">
                                {application.status === "Approved"
                                  ? "Approved ✓"
                                  : "Rejected ✗"}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-[#cccccc]">
                      <p className="text-lg font-medium">No trainer applications found.</p>
                      <p className="mt-2 text-sm text-[#8f8f8f]">
                        Try adjusting the filters or review state.
                      </p>
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
