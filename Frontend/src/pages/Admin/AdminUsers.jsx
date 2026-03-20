import React, { useEffect, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import UserDetailsModal from "./components/UserDetailsModal";

const formatDate = (value) => {
  if (!value) return "N/A";
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime())
    ? "N/A"
    : parsedDate.toLocaleDateString();
};

const getMembershipState = (user) => {
  const endDate = user?.membershipDuration?.end_date;

  if (!endDate) {
    return "No Plan";
  }

  const today = new Date();
  const parsedEndDate = new Date(endDate);
  if (Number.isNaN(parsedEndDate.getTime())) {
    return "No Plan";
  }

  if (parsedEndDate < today || user.status === "Inactive" || user.status === "Expired") {
    return "Expired";
  }

  const diffInDays = Math.ceil((parsedEndDate - today) / (1000 * 60 * 60 * 24));
  if (diffInDays <= 7) {
    return "Renew Soon";
  }

  return "Healthy";
};

const getProfileCompleteness = (user) => {
  const fieldsToCheck = [
    user?.full_name,
    user?.email,
    user?.phone,
    user?.dob,
    user?.gender,
    user?.weight,
    user?.height,
    user?.workout_type,
    user?.goal,
  ];

  const completedFields = fieldsToCheck.filter(Boolean).length;
  return Math.round((completedFields / fieldsToCheck.length) * 100);
};

const getUserFlags = (user) => {
  const flags = [];
  const membershipState = getMembershipState(user);
  const completeness = getProfileCompleteness(user);

  if (!user?.trainer) {
    flags.push({ label: "No Trainer", tone: "red" });
  }

  if (membershipState === "Expired") {
    flags.push({ label: "Expired", tone: "red" });
  } else if (membershipState === "Renew Soon") {
    flags.push({ label: "Renew Soon", tone: "yellow" });
  }

  if (completeness < 80) {
    flags.push({ label: "Incomplete Profile", tone: "purple" });
  }

  if ((user?.lastActive && Date.now() - new Date(user.lastActive).getTime() > 1000 * 60 * 60 * 24 * 14)) {
    flags.push({ label: "Inactive 14d+", tone: "yellow" });
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

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all");
  const [membershipFilter, setMembershipFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [trainerFilter, setTrainerFilter] = useState("");
  const [attentionFilter, setAttentionFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "Active",
    membershipType: "Basic",
    weight: "",
    height: "",
    gender: "",
    dob: "",
  });

  const fetchUsers = async () => {
    try {
      setError("");
      let url = viewMode === "dropped" ? "/api/admin/users/dropped" : "/api/admin/users";

      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.append("search", searchTerm);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const message = `Failed to fetch users (${response.status})`;
        setUsers([]);
        setStats(null);
        setError(message);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setUsers(data.users || []);
        setStats(data.stats || null);
      } else {
        setUsers([]);
        setStats(null);
        setError(data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setStats(null);
      setError("Could not load users from the server");
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    };
    loadInitial();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, viewMode]);

  const handleViewDetails = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setSelectedUser(userId);
        setUserDetails(data);
        setIsModalOpen(true);
      } else {
        alert("Could not load user details.");
      }
    } catch (error) {
      console.error("Failed to load details", error);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(users.filter((u) => u._id !== userId));
        alert("User deleted successfully");
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({
      fullName: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      status: user.status || "Active",
      membershipType: user.membershipType || "Basic",
      weight: user.weight || "",
      height: user.height || "",
      gender: user.gender || "",
      dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });
      const data = await response.json();
      if (data.success) {
        setUsers(users.map((u) => (u._id === editingUser._id ? data.user : u)));
        setIsEditModalOpen(false);
        setEditingUser(null);
        alert("User updated successfully!");
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user");
    }
  };

  const clearExtraFilters = () => {
    setMembershipFilter("");
    setStatusFilter("");
    setTrainerFilter("");
    setAttentionFilter("");
  };

  const filteredUsers = users.filter((user) => {
    const flags = getUserFlags(user);
    const membershipState = getMembershipState(user);

    const matchesMembership =
      !membershipFilter || user.membershipType === membershipFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    const matchesTrainer =
      !trainerFilter ||
      (trainerFilter === "assigned" && !!user.trainer) ||
      (trainerFilter === "unassigned" && !user.trainer);
    const matchesAttention =
      !attentionFilter ||
      (attentionFilter === "attention" && flags.length > 0) ||
      (attentionFilter === "expired" && membershipState === "Expired") ||
      (attentionFilter === "renewSoon" && membershipState === "Renew Soon") ||
      (attentionFilter === "incomplete" &&
        flags.some((flag) => flag.label === "Incomplete Profile")) ||
      (attentionFilter === "noTrainer" &&
        flags.some((flag) => flag.label === "No Trainer"));

    return (
      matchesMembership &&
      matchesStatus &&
      matchesTrainer &&
      matchesAttention
    );
  });

  const attentionUsers = filteredUsers.filter((user) => getUserFlags(user).length > 0);
  const noTrainerCount = filteredUsers.filter((user) => !user.trainer).length;
  const renewSoonCount = filteredUsers.filter(
    (user) => getMembershipState(user) === "Renew Soon"
  ).length;
  const expiredCount = filteredUsers.filter(
    (user) => getMembershipState(user) === "Expired"
  ).length;
  const incompleteCount = filteredUsers.filter(
    (user) => getProfileCompleteness(user) < 80
  ).length;
  const activeFilteredCount = filteredUsers.filter(
    (user) => user.status === "Active"
  ).length;
  const activeFilterCount =
    Number(!!membershipFilter) +
    Number(!!statusFilter) +
    Number(!!trainerFilter) +
    Number(!!attentionFilter);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-[#cccccc]">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading Users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
          <div>
            <h1 className="m-0 text-2xl font-bold md:text-3xl text-[#f1f1f1]">
              User Management
            </h1>
            <p className="mt-2 text-sm text-[#9f9f9f]">
              Review members, spot issues early, and act on users that need attention.
            </p>
          </div>
        </div>

        <div className="mb-6 bg-[#111] p-4 rounded-lg border border-[#333]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by Name, Email, or Phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
                />
                <span className="absolute right-3 top-3 text-gray-500">🔍</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setViewMode("all");
                    setSearchTerm("");
                  }}
                  className={`px-4 py-2 rounded transition-colors font-medium ${
                    viewMode === "all"
                      ? "bg-[#8A2BE2] text-white"
                      : "bg-[#222] text-gray-400 hover:bg-[#333]"
                  }`}
                >
                  All Users
                </button>
                <button
                  onClick={() => {
                    setViewMode("dropped");
                    setSearchTerm("");
                  }}
                  className={`px-4 py-2 rounded transition-colors font-medium ${
                    viewMode === "dropped"
                      ? "bg-red-600 text-white"
                      : "bg-[#222] text-gray-400 hover:bg-[#333]"
                  }`}
                >
                  Dropped Users
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Expired">Expired</option>
              </select>

              <select
                value={membershipFilter}
                onChange={(e) => setMembershipFilter(e.target.value)}
                className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
              >
                <option value="">All Memberships</option>
                <option value="Basic">Basic</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>

              <select
                value={trainerFilter}
                onChange={(e) => setTrainerFilter(e.target.value)}
                className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
              >
                <option value="">Trainer Assignment</option>
                <option value="assigned">Assigned Trainer</option>
                <option value="unassigned">No Trainer</option>
              </select>

              <select
                value={attentionFilter}
                onChange={(e) => setAttentionFilter(e.target.value)}
                className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
              >
                <option value="">All Attention States</option>
                <option value="attention">Needs Attention</option>
                <option value="expired">Expired Membership</option>
                <option value="renewSoon">Renew Soon</option>
                <option value="incomplete">Incomplete Profile</option>
                <option value="noTrainer">No Trainer</option>
              </select>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {viewMode === "dropped" ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-red-500/10 text-red-300 border-red-500/40">
                    Dropped users view
                  </span>
                ) : null}
                {membershipFilter ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#8A2BE2]/10 text-[#c79cff] border-[#8A2BE2]/40">
                    Membership: {membershipFilter}
                  </span>
                ) : null}
                {statusFilter ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#8A2BE2]/10 text-[#c79cff] border-[#8A2BE2]/40">
                    Status: {statusFilter}
                  </span>
                ) : null}
                {trainerFilter ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#8A2BE2]/10 text-[#c79cff] border-[#8A2BE2]/40">
                    Trainer: {trainerFilter}
                  </span>
                ) : null}
                {attentionFilter ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#8A2BE2]/10 text-[#c79cff] border-[#8A2BE2]/40">
                    Attention: {attentionFilter}
                  </span>
                ) : null}
              </div>

              <button
                onClick={clearExtraFilters}
                className="px-4 py-2 rounded bg-[#222] text-[#cccccc] hover:bg-[#333] transition-colors text-sm font-medium"
              >
                Clear Extra Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Visible Users"
            value={filteredUsers.length}
            helperText={`${stats?.totalUsers || users.length} total in system`}
          />
          <StatCard
            label="Active In View"
            value={activeFilteredCount}
            helperText="Users currently marked active"
          />
          <StatCard
            label="Needs Attention"
            value={attentionUsers.length}
            helperText="Flags include trainer, renewal, and profile issues"
          />
          <StatCard
            label="Without Trainer"
            value={noTrainerCount}
            helperText="Useful for assignment and follow-up"
          />
        </div>

        <div className="mb-8 bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.2)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-[#f1f1f1]">Attention Center</h2>
              <p className="text-sm text-[#9f9f9f] mt-1">
                Quick admin summary of users that may need action.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-red-300">Expired</p>
              <p className="mt-2 text-2xl font-bold text-white">{expiredCount}</p>
            </div>
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-yellow-300">Renew Soon</p>
              <p className="mt-2 text-2xl font-bold text-white">{renewSoonCount}</p>
            </div>
            <div className="rounded-lg border border-[#8A2BE2]/30 bg-[#8A2BE2]/10 p-4">
              <p className="text-xs uppercase tracking-wide text-[#d4b2ff]">Incomplete Profiles</p>
              <p className="mt-2 text-2xl font-bold text-white">{incompleteCount}</p>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-red-300">No Trainer</p>
              <p className="mt-2 text-2xl font-bold text-white">{noTrainerCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
          <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
            User List
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    User
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Contact
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Status
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Membership
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Attention
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Joined
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const flags = getUserFlags(user);
                    const membershipState = getMembershipState(user);
                    const completeness = getProfileCompleteness(user);

                    return (
                      <tr
                        key={user._id}
                        className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                      >
                        <td className="p-3 text-[#f1f1f1] min-w-[220px]">
                          <div className="font-semibold">{user.full_name}</div>
                          <div className="mt-1 text-xs text-[#9f9f9f]">
                            {user.workout_type || "No workout type"}
                          </div>
                          <div className="mt-2 text-xs text-[#8f8f8f]">
                            Trainer: {user.trainer?.name || "Unassigned"}
                          </div>
                        </td>
                        <td className="p-3 text-[#f1f1f1] min-w-[220px]">
                          <div>{user.email}</div>
                          <div className="mt-1 text-xs text-[#9f9f9f]">
                            {user.phone || "No phone"}
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`
                            inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border
                            ${
                              user.status === "Active"
                                ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]"
                                : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                            }
                          `}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="p-3 min-w-[180px]">
                          <div className="flex flex-col gap-2">
                            <span
                              className={`
                              inline-block w-fit px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border
                              ${
                                user.membershipType === "Platinum"
                                  ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]"
                                  : user.membershipType === "Gold"
                                  ? "bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]"
                                  : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                              }
                            `}
                            >
                              {user.membershipType}
                            </span>
                            <span
                              className={`inline-block w-fit px-3 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full border ${getToneClasses(
                                membershipState === "Healthy"
                                  ? "green"
                                  : membershipState === "Renew Soon"
                                  ? "yellow"
                                  : membershipState === "Expired"
                                  ? "red"
                                  : "purple"
                              )}`}
                            >
                              {membershipState}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 min-w-[220px]">
                          <div className="flex flex-wrap gap-2">
                            {flags.length > 0 ? (
                              flags.map((flag) => (
                                <span
                                  key={`${user._id}-${flag.label}`}
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
                          <div className="mt-2 text-xs text-[#9f9f9f]">
                            Profile completeness: {completeness}%
                          </div>
                        </td>
                        <td className="p-3 text-[#f1f1f1] whitespace-nowrap">
                          <div>{formatDate(user.created_at)}</div>
                          <div className="mt-1 text-xs text-[#8f8f8f]">
                            Last active: {formatDate(user.lastActive)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                            <button
                              onClick={() => handleViewDetails(user._id)}
                              className="
                              px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                              bg-[#2e8b57]/20 text-[#2e8b57] hover:bg-[#2e8b57]/30 border border-[#2e8b57]/50
                              "
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEditClick(user)}
                              className="
                              px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                              bg-[#8A2BE2]/20 text-[#8A2BE2] hover:bg-[#8A2BE2]/30
                            "
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="
                              px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                              bg-[#ff6b6b]/20 text-[#ff6b6b] hover:bg-[#ff6b6b]/30
                            "
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
                    <td colSpan="7" className="p-10 text-center text-[#cccccc]">
                      <p className="text-lg font-medium">No users found.</p>
                      <p className="mt-2 text-sm text-[#8f8f8f]">
                        Try changing the filters or clearing the current view.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">Edit User</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={editFormData.fullName}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, fullName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={editFormData.dob}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, dob: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Gender
                </label>
                <select
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={editFormData.gender}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full bg-black border border-[#333] rounded p-3 text-white"
                    value={editFormData.weight}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, weight: e.target.value })
                    }
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full bg-black border border-[#333] rounded p-3 text-white"
                    value={editFormData.height}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, height: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Status
                </label>
                <select
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Membership Type
                </label>
                <select
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={editFormData.membershipType}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      membershipType: e.target.value,
                    })
                  }
                >
                  <option value="Basic">Basic</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]"
                >
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && userDetails && (
        <UserDetailsModal
          user={selectedUser}
          details={userDetails}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminUsers;
