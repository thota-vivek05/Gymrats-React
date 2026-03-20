import React, { useEffect, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import { useNavigate } from "react-router-dom";

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

const getActiveClientCount = (trainer) =>
  Array.isArray(trainer?.clients)
    ? trainer.clients.filter((client) => client?.isActive !== false).length
    : trainer?.totalClients || 0;

const getCapacityInfo = (trainer) => {
  const activeClients = getActiveClientCount(trainer);
  const maxClients = trainer?.maxClients || 20;
  const utilization = Math.min(
    100,
    Math.round((activeClients / Math.max(maxClients, 1)) * 100)
  );

  return {
    activeClients,
    maxClients,
    utilization,
    availableSlots: Math.max(maxClients - activeClients, 0),
  };
};

const getTrainerFlags = (trainer) => {
  const flags = [];
  const { utilization, availableSlots } = getCapacityInfo(trainer);

  if (trainer?.status !== "Active") {
    flags.push({ label: trainer?.status || "Inactive", tone: "red" });
  }

  if (!trainer?.meetingLink) {
    flags.push({ label: "No Meeting Link", tone: "purple" });
  }

  if (!trainer?.specializations || trainer.specializations.length === 0) {
    flags.push({ label: "No Specialization", tone: "purple" });
  }

  if (utilization >= 90) {
    flags.push({ label: "Near Capacity", tone: "yellow" });
  } else if (availableSlots === 0) {
    flags.push({ label: "At Capacity", tone: "red" });
  }

  if ((trainer?.rating || 0) > 0 && trainer.rating < 3.5) {
    flags.push({ label: "Low Rating", tone: "yellow" });
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

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    specializations: [],
    status: "Active",
    meetingLink: "",
  });

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [attentionFilter, setAttentionFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    experience: "",
    specializations: "",
    status: "Active",
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
      fetchTrainers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, experienceFilter]);

  const fetchTrainers = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (searchTerm.trim()) {
        params.append("search", searchTerm);
      }
      if (statusFilter) {
        params.append("status", statusFilter);
      }
      if (experienceFilter) {
        params.append("experience", experienceFilter);
      }

      const queryString = params.toString();
      const url = `/api/admin/trainers${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setTrainers([]);
        setStats(null);
        setError(`Failed to fetch trainers (${response.status})`);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setTrainers(data.trainers || []);
        setStats(data.stats || null);
      } else {
        setTrainers([]);
        setStats(null);
        setError(data.message || "Failed to fetch trainers");
      }
    } catch (error) {
      console.error("Error fetching trainers:", error);
      setTrainers([]);
      setStats(null);
      setError("Could not load trainers from the server");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this trainer?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/admin/trainers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrainers(trainers.filter((t) => t._id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const specializationsArray = editFormData.specializations
        ? Array.isArray(editFormData.specializations)
          ? editFormData.specializations
          : editFormData.specializations.split(",").map((s) => s.trim())
        : [];

      const response = await fetch(`/api/admin/trainers/${editingTrainer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editFormData.name,
          email: editFormData.email,
          phone: editFormData.phone,
          experience: editFormData.experience,
          specializations: specializationsArray,
          status: editFormData.status,
          meetingLink: editFormData.meetingLink,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTrainers(
          trainers.map((t) => (t._id === editingTrainer._id ? data.trainer : t))
        );
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
        ? addFormData.specializations.split(",").map((s) => s.trim())
        : [];

      const response = await fetch("/api/admin/trainers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: addFormData.name,
          email: addFormData.email,
          password: addFormData.password,
          phone: addFormData.phone,
          experience: addFormData.experience,
          specializations: specializationsArray,
          status: addFormData.status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTrainers([data.trainer, ...trainers]);
        setIsAddModalOpen(false);
        setAddFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          experience: "",
          specializations: "",
          status: "Active",
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

  const clearExtraFilters = () => {
    setSpecializationFilter("");
    setAvailabilityFilter("");
    setAttentionFilter("");
  };

  const filteredTrainers = trainers.filter((trainer) => {
    const { availableSlots, utilization } = getCapacityInfo(trainer);
    const flags = getTrainerFlags(trainer);

    const matchesSpecialization =
      !specializationFilter ||
      (trainer.specializations || []).includes(specializationFilter);

    const matchesAvailability =
      !availabilityFilter ||
      (availabilityFilter === "available" && availableSlots > 0) ||
      (availabilityFilter === "full" && availableSlots === 0) ||
      (availabilityFilter === "nearCapacity" && utilization >= 90);

    const matchesAttention =
      !attentionFilter ||
      (attentionFilter === "attention" && flags.length > 0) ||
      (attentionFilter === "meetingLink" &&
        flags.some((flag) => flag.label === "No Meeting Link")) ||
      (attentionFilter === "lowRating" &&
        flags.some((flag) => flag.label === "Low Rating")) ||
      (attentionFilter === "capacity" &&
        flags.some(
          (flag) =>
            flag.label === "Near Capacity" || flag.label === "At Capacity"
        )) ||
      (attentionFilter === "inactive" && trainer.status !== "Active");

    return matchesSpecialization && matchesAvailability && matchesAttention;
  });

  const visibleAvailableCount = filteredTrainers.filter(
    (trainer) => getCapacityInfo(trainer).availableSlots > 0
  ).length;
  const visibleAttentionCount = filteredTrainers.filter(
    (trainer) => getTrainerFlags(trainer).length > 0
  ).length;
  const nearCapacityCount = filteredTrainers.filter(
    (trainer) => getCapacityInfo(trainer).utilization >= 90
  ).length;
  const missingMeetingLinkCount = filteredTrainers.filter(
    (trainer) => !trainer.meetingLink
  ).length;

  if (loading)
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-[#cccccc]">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading Trainers...</p>
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
              Trainer Management
            </h1>
            <p className="mt-2 text-sm text-[#9f9f9f]">
              Track trainer workload, availability, and setup quality in one place.
            </p>
          </div>
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
            + Add Trainer
          </button>
        </div>

        <div className="mb-6 bg-[#111] p-4 rounded-lg border border-[#333]">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search trainers by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
              />
              <span className="absolute right-3 top-3 text-gray-500">🔍</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
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
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
              >
                <option value="">All Experience Levels</option>
                <option value="1-2">1-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>

              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
              >
                <option value="">All Specializations</option>
                {SPECIALIZATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
              >
                <option value="">All Availability</option>
                <option value="available">Has Capacity</option>
                <option value="nearCapacity">Near Capacity</option>
                <option value="full">Fully Booked</option>
              </select>

              <select
                value={attentionFilter}
                onChange={(e) => setAttentionFilter(e.target.value)}
                className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
              >
                <option value="">All Attention States</option>
                <option value="attention">Needs Attention</option>
                <option value="meetingLink">Missing Meeting Link</option>
                <option value="lowRating">Low Rating</option>
                <option value="capacity">Capacity Risk</option>
                <option value="inactive">Inactive Status</option>
              </select>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {statusFilter ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#8A2BE2]/10 text-[#c79cff] border-[#8A2BE2]/40">
                    Status: {statusFilter}
                  </span>
                ) : null}
                {experienceFilter ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#8A2BE2]/10 text-[#c79cff] border-[#8A2BE2]/40">
                    Experience: {experienceFilter}
                  </span>
                ) : null}
                {specializationFilter ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#8A2BE2]/10 text-[#c79cff] border-[#8A2BE2]/40">
                    Specialization: {specializationFilter}
                  </span>
                ) : null}
                {availabilityFilter ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#8A2BE2]/10 text-[#c79cff] border-[#8A2BE2]/40">
                    Availability: {availabilityFilter}
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
                Clear Extra Filters
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
            label="Visible Trainers"
            value={filteredTrainers.length}
            helperText={`${stats?.totalTrainers || trainers.length} active trainers in stats`}
          />
          <StatCard
            label="Available Slots"
            value={visibleAvailableCount}
            helperText="Trainers who can still take clients"
          />
          <StatCard
            label="Needs Attention"
            value={visibleAttentionCount}
            helperText="Flags include links, ratings, and capacity"
          />
          <StatCard
            label="Pending Approvals"
            value={stats?.pendingApprovals || 0}
            helperText="Trainer applications awaiting review"
          />
        </div>

        <div className="mb-8 bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.2)]">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#f1f1f1]">Trainer Attention Center</h2>
            <p className="text-sm text-[#9f9f9f] mt-1">
              Quick summary of setup gaps and workload pressure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-yellow-300">Near Capacity</p>
              <p className="mt-2 text-2xl font-bold text-white">{nearCapacityCount}</p>
            </div>
            <div className="rounded-lg border border-[#8A2BE2]/30 bg-[#8A2BE2]/10 p-4">
              <p className="text-xs uppercase tracking-wide text-[#d4b2ff]">Missing Meeting Link</p>
              <p className="mt-2 text-2xl font-bold text-white">{missingMeetingLinkCount}</p>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-red-300">Inactive Trainers</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {filteredTrainers.filter((trainer) => trainer.status !== "Active").length}
              </p>
            </div>
            <div className="rounded-lg border border-[#8A2BE2]/30 bg-[#8A2BE2]/10 p-4">
              <p className="text-xs uppercase tracking-wide text-[#d4b2ff]">Unique Specializations</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {stats?.specializationCount || stats?.totalCertifications || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
          <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
            Trainer Directory
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Trainer
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Specializations
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Experience
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Workload
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
                {filteredTrainers.length > 0 ? (
                  filteredTrainers.map((trainer) => {
                    const { activeClients, maxClients, utilization, availableSlots } =
                      getCapacityInfo(trainer);
                    const flags = getTrainerFlags(trainer);

                    return (
                      <tr
                        key={trainer._id}
                        className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                      >
                        <td className="p-3 text-[#f1f1f1] min-w-[220px]">
                          <div className="font-semibold">{trainer.name}</div>
                          <div className="mt-1 text-xs text-[#9f9f9f]">{trainer.email}</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span
                              className={`inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full border ${getToneClasses(
                                trainer.status === "Active" ? "green" : "red"
                              )}`}
                            >
                              {trainer.status}
                            </span>
                            <span
                              className={`inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full border ${getToneClasses(
                                availableSlots > 0 ? "green" : "red"
                              )}`}
                            >
                              {availableSlots > 0 ? "Available" : "Full"}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 min-w-[220px]">
                          <div className="flex flex-wrap gap-1.5">
                            {(trainer.specializations || []).length > 0 ? (
                              trainer.specializations.map((specialization, index) => (
                                <span
                                  key={`${trainer._id}-${index}`}
                                  className="bg-[#8A2BE2]/20 text-[#8A2BE2] px-2 py-1 rounded text-xs"
                                >
                                  {specialization}
                                </span>
                              ))
                            ) : (
                              <span className="text-[#8f8f8f] text-sm">No specializations</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-[#f1f1f1] min-w-[160px]">
                          <div>{trainer.experience} years</div>
                          <div className="mt-1 text-xs text-[#9f9f9f]">
                            Rating: {trainer.rating ? trainer.rating.toFixed(1) : "N/A"}
                          </div>
                          <div className="mt-1 text-xs text-[#9f9f9f]">
                            Link: {trainer.meetingLink ? "Added" : "Missing"}
                          </div>
                        </td>
                        <td className="p-3 min-w-[180px]">
                          <div className="flex items-center justify-between text-sm text-[#f1f1f1] mb-2">
                            <span>{activeClients}/{maxClients} clients</span>
                            <span className="text-[#9f9f9f]">{utilization}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#222] overflow-hidden">
                            <div
                              className={`h-full ${
                                utilization >= 90
                                  ? "bg-[#ffc107]"
                                  : utilization >= 70
                                  ? "bg-[#8A2BE2]"
                                  : "bg-[#2e8b57]"
                              }`}
                              style={{ width: `${utilization}%` }}
                            />
                          </div>
                          <div className="mt-2 text-xs text-[#9f9f9f]">
                            {availableSlots} slots available
                          </div>
                        </td>
                        <td className="p-3 min-w-[220px]">
                          <div className="flex flex-wrap gap-2">
                            {flags.length > 0 ? (
                              flags.map((flag) => (
                                <span
                                  key={`${trainer._id}-${flag.label}`}
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
                            <button
                              onClick={() => {
                                setEditingTrainer(trainer);
                                setEditFormData({
                                  name: trainer.name || "",
                                  email: trainer.email || "",
                                  phone: trainer.phone || "",
                                  experience: trainer.experience || "",
                                  specializations: trainer.specializations || [],
                                  status: trainer.status || "Active",
                                  meetingLink: trainer.meetingLink || "",
                                });
                              }}
                              className="px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300 bg-[#8A2BE2]/20 text-[#8A2BE2] hover:bg-[#8A2BE2]/30"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => navigate(`/admin/trainer/${trainer._id}`)}
                              className="px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300 bg-[#2e8b57]/20 text-[#90ee90] hover:bg-[#2e8b57]/30"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(trainer._id)}
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
                    <td colSpan="6" className="p-10 text-center text-[#cccccc]">
                      <p className="text-lg font-medium">No trainers found.</p>
                      <p className="mt-2 text-sm text-[#8f8f8f]">
                        Try changing the filters or search terms.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {editingTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">
              Edit {editingTrainer.name}
            </h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
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
                  Experience
                </label>
                <select
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={editFormData.experience}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      experience: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Experience</option>
                  <option value="1-2">1-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Specializations (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Calisthenics, Strength Training"
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={
                    Array.isArray(editFormData.specializations)
                      ? editFormData.specializations.join(", ")
                      : editFormData.specializations
                  }
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      specializations: e.target.value,
                    })
                  }
                />
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
                  Meeting Link
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={editFormData.meetingLink}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      meetingLink: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTrainer(null)}
                  className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">
              Add New Trainer
            </h2>
            <form onSubmit={handleAddTrainer}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Name*
                </label>
                <input
                  type="text"
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={addFormData.name}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Email*
                </label>
                <input
                  type="email"
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={addFormData.email}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Password*
                </label>
                <input
                  type="password"
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={addFormData.password}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Phone*
                </label>
                <input
                  type="text"
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={addFormData.phone}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Experience*
                </label>
                <select
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={addFormData.experience}
                  onChange={(e) =>
                    setAddFormData({
                      ...addFormData,
                      experience: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Experience</option>
                  <option value="1-2">1-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Specializations (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Calisthenics, Strength Training"
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={addFormData.specializations}
                  onChange={(e) =>
                    setAddFormData({
                      ...addFormData,
                      specializations: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#cccccc] mb-2">
                  Status
                </label>
                <select
                  className="w-full bg-black border border-[#333] rounded p-3 text-white"
                  value={addFormData.status}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, status: e.target.value })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]"
                >
                  Add Trainer
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]"
                >
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

export default AdminTrainers;
