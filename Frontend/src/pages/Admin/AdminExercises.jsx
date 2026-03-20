import React, { useEffect, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";

const CATEGORY_OPTIONS = [
  "Calisthenics",
  "Weight Loss",
  "HIIT",
  "Strength Training",
  "Cardio",
  "Flexibility",
  "Bodybuilding",
];

const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const TYPE_OPTIONS = ["Reps", "Time"];

const normalizeCategories = (category) =>
  Array.isArray(category) ? category.filter(Boolean) : category ? [category] : [];

const formatCategories = (category) => normalizeCategories(category).join(", ");

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

const getExerciseFlags = (exercise) => {
  const flags = [];

  if (!exercise?.image) {
    flags.push({ label: "No Image", tone: "purple" });
  }

  if (!exercise?.instructions || exercise.instructions.trim().length < 40) {
    flags.push({ label: "Short Instructions", tone: "yellow" });
  }

  if (!exercise?.primaryMuscle) {
    flags.push({ label: "No Primary Muscle", tone: "red" });
  }

  if (!exercise?.targetMuscles || exercise.targetMuscles.length === 0) {
    flags.push({ label: "No Target Muscles", tone: "red" });
  }

  if (!exercise?.equipment || exercise.equipment.length === 0) {
    flags.push({ label: "No Equipment Tag", tone: "purple" });
  }

  if (!exercise?.verified) {
    flags.push({ label: "Unverified", tone: "yellow" });
  }

  return flags;
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

const AdminExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterVerified, setFilterVerified] = useState("");
  const [filterType, setFilterType] = useState("");
  const [attentionFilter, setAttentionFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [addFormData, setAddFormData] = useState({
    name: "",
    category: [],
    difficulty: "",
    targetMuscles: "",
    instructions: "",
    type: "Reps",
    defaultSets: 3,
    defaultRepsOrDuration: "",
    equipment: "",
    primaryMuscle: "",
    secondaryMuscles: "",
    image: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    category: [],
    difficulty: "",
    targetMuscles: "",
    instructions: "",
    type: "Reps",
    defaultSets: 3,
    defaultRepsOrDuration: "",
    equipment: "",
    primaryMuscle: "",
    secondaryMuscles: "",
    image: "",
    verified: false,
  });

  const fetchExercises = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");
      let url = "/api/admin/exercises";
      const params = new URLSearchParams();

      if (searchTerm) params.append("search", searchTerm);
      if (filterCategory) params.append("category", filterCategory);
      if (filterDifficulty) params.append("difficulty", filterDifficulty);
      if (filterVerified) params.append("verified", filterVerified);

      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setExercises([]);
        setStats(null);
        setError(`Failed to fetch exercises (${response.status})`);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setExercises(data.exercises || []);
        setStats(data.stats || null);
      } else {
        setExercises([]);
        setStats(null);
        setError(data.message || "Failed to fetch exercises");
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      setExercises([]);
      setStats(null);
      setError("Could not load exercises from the server");
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      await fetchExercises();
      setLoading(false);
    };
    loadInitial();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExercises();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterCategory, filterDifficulty, filterVerified]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this exercise?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/admin/exercises/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setExercises(exercises.filter((exercise) => exercise._id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleAddExercise = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const exerciseData = {
        ...addFormData,
        category: normalizeCategories(addFormData.category),
        targetMuscles: addFormData.targetMuscles
          .split(",")
          .map((muscle) => muscle.trim())
          .filter(Boolean),
        secondaryMuscles: addFormData.secondaryMuscles
          ? addFormData.secondaryMuscles
              .split(",")
              .map((muscle) => muscle.trim())
              .filter(Boolean)
          : [],
        equipment: addFormData.equipment
          ? addFormData.equipment
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        defaultSets: parseInt(addFormData.defaultSets, 10),
      };

      const response = await fetch("/api/admin/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(exerciseData),
      });

      const data = await response.json();
      if (data.success) {
        setExercises([data.exercise, ...exercises]);
        setIsAddModalOpen(false);
        setAddFormData({
          name: "",
          category: [],
          difficulty: "",
          targetMuscles: "",
          instructions: "",
          type: "Reps",
          defaultSets: 3,
          defaultRepsOrDuration: "",
          equipment: "",
          primaryMuscle: "",
          secondaryMuscles: "",
          image: "",
        });
        alert("Exercise added successfully!");
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to add exercise");
    }
  };

  const handleEditClick = (exercise) => {
    setEditingExercise(exercise);
    setEditFormData({
      name: exercise.name || "",
      category: normalizeCategories(exercise.category),
      difficulty: exercise.difficulty || "",
      targetMuscles: exercise.targetMuscles
        ? exercise.targetMuscles.join(", ")
        : "",
      instructions: exercise.instructions || "",
      type: exercise.type || "Reps",
      defaultSets: exercise.defaultSets || 3,
      defaultRepsOrDuration: exercise.defaultRepsOrDuration || "",
      equipment: exercise.equipment ? exercise.equipment.join(", ") : "",
      primaryMuscle: exercise.primaryMuscle || "",
      secondaryMuscles: exercise.secondaryMuscles
        ? exercise.secondaryMuscles.join(", ")
        : "",
      image: exercise.image || "",
      verified: exercise.verified || false,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateExercise = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const exerciseData = {
        ...editFormData,
        category: normalizeCategories(editFormData.category),
        targetMuscles: editFormData.targetMuscles
          .split(",")
          .map((muscle) => muscle.trim())
          .filter(Boolean),
        secondaryMuscles: editFormData.secondaryMuscles
          ? editFormData.secondaryMuscles
              .split(",")
              .map((muscle) => muscle.trim())
              .filter(Boolean)
          : [],
        equipment: editFormData.equipment
          ? editFormData.equipment
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        defaultSets: parseInt(editFormData.defaultSets, 10),
      };

      const response = await fetch(`/api/admin/exercises/${editingExercise._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(exerciseData),
      });

      const data = await response.json();
      if (data.success) {
        setExercises(
          exercises.map((exercise) =>
            exercise._id === editingExercise._id ? data.exercise : exercise
          )
        );
        setIsEditModalOpen(false);
        setEditingExercise(null);
        alert("Exercise updated successfully!");
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to update exercise");
    }
  };

  const clearExtraFilters = () => {
    setFilterType("");
    setAttentionFilter("");
  };

  const filteredExercises = exercises.filter((exercise) => {
    const flags = getExerciseFlags(exercise);

    const matchesType = !filterType || exercise.type === filterType;
    const matchesAttention =
      !attentionFilter ||
      (attentionFilter === "attention" && flags.length > 0) ||
      (attentionFilter === "noImage" &&
        flags.some((flag) => flag.label === "No Image")) ||
      (attentionFilter === "instructions" &&
        flags.some((flag) => flag.label === "Short Instructions")) ||
      (attentionFilter === "unverified" &&
        flags.some((flag) => flag.label === "Unverified")) ||
      (attentionFilter === "missingMuscle" &&
        flags.some(
          (flag) =>
            flag.label === "No Primary Muscle" ||
            flag.label === "No Target Muscles"
        ));

    return matchesType && matchesAttention;
  });

  const visibleVerifiedCount = filteredExercises.filter(
    (exercise) => exercise.verified
  ).length;
  const attentionCount = filteredExercises.filter(
    (exercise) => getExerciseFlags(exercise).length > 0
  ).length;
  const noImageCount = filteredExercises.filter((exercise) => !exercise.image).length;
  const shortInstructionsCount = filteredExercises.filter(
    (exercise) =>
      !exercise.instructions || exercise.instructions.trim().length < 40
  ).length;
  const missingMuscleCount = filteredExercises.filter(
    (exercise) =>
      !exercise.primaryMuscle ||
      !exercise.targetMuscles ||
      exercise.targetMuscles.length === 0
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-[#cccccc]">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading Exercises...</p>
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
              Exercise Management
            </h1>
            <p className="mt-2 text-sm text-[#9f9f9f]">
              Manage your exercise library, spot missing data, and keep content quality high.
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
            + Add Exercise
          </button>
        </div>

        <div className="mb-6 bg-[#111] p-4 rounded-lg border border-[#333]">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1e1e3a] border border-[#333] text-white px-4 py-2 rounded focus:outline-none focus:border-[#8A2BE2]"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-2 rounded focus:outline-none focus:border-[#8A2BE2]"
              >
                <option value="">All Categories</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-2 rounded focus:outline-none focus:border-[#8A2BE2]"
              >
                <option value="">All Difficulties</option>
                {DIFFICULTY_OPTIONS.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
              <select
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
                className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-2 rounded focus:outline-none focus:border-[#8A2BE2]"
              >
                <option value="">All Exercises</option>
                <option value="true">Verified Only</option>
                <option value="false">Unverified Only</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-2 rounded focus:outline-none focus:border-[#8A2BE2]"
              >
                <option value="">All Types</option>
                {TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={attentionFilter}
                onChange={(e) => setAttentionFilter(e.target.value)}
                className="bg-[#1e1e3a] border border-[#333] text-white px-4 py-2 rounded focus:outline-none focus:border-[#8A2BE2]"
              >
                <option value="">All Attention States</option>
                <option value="attention">Needs Attention</option>
                <option value="noImage">Missing Image</option>
                <option value="instructions">Short Instructions</option>
                <option value="missingMuscle">Missing Muscle Tags</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {filterCategory ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#8A2BE2]/10 text-[#c79cff] border-[#8A2BE2]/40">
                    Category: {filterCategory}
                  </span>
                ) : null}
                {filterDifficulty ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#8A2BE2]/10 text-[#c79cff] border-[#8A2BE2]/40">
                    Difficulty: {filterDifficulty}
                  </span>
                ) : null}
                {filterVerified ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#8A2BE2]/10 text-[#c79cff] border-[#8A2BE2]/40">
                    Verified: {filterVerified}
                  </span>
                ) : null}
                {filterType ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#8A2BE2]/10 text-[#c79cff] border-[#8A2BE2]/40">
                    Type: {filterType}
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
            label="Visible Exercises"
            value={filteredExercises.length}
            helperText={`${stats?.totalExercises || exercises.length} total in library`}
          />
          <StatCard
            label="Verified In View"
            value={visibleVerifiedCount}
            helperText="Exercises already approved in current result set"
          />
          <StatCard
            label="Needs Attention"
            value={attentionCount}
            helperText="Missing image, muscle tags, or short instructions"
          />
          <StatCard
            label="Difficulty Levels"
            value={stats?.difficulties || 0}
            helperText="Current difficulty coverage"
          />
        </div>

        <div className="mb-8 bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.2)]">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#f1f1f1]">Exercise Attention Center</h2>
            <p className="text-sm text-[#9f9f9f] mt-1">
              Quick summary of library quality issues that admins may want to fix.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-lg border border-[#8A2BE2]/30 bg-[#8A2BE2]/10 p-4">
              <p className="text-xs uppercase tracking-wide text-[#d4b2ff]">Missing Images</p>
              <p className="mt-2 text-2xl font-bold text-white">{noImageCount}</p>
            </div>
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-yellow-300">Short Instructions</p>
              <p className="mt-2 text-2xl font-bold text-white">{shortInstructionsCount}</p>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-red-300">Missing Muscle Tags</p>
              <p className="mt-2 text-2xl font-bold text-white">{missingMuscleCount}</p>
            </div>
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-yellow-300">Unverified</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {filteredExercises.filter((exercise) => !exercise.verified).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
          <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
            Exercise Library
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Exercise
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Category
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Difficulty
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Type / Muscles
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
                {filteredExercises.length > 0 ? (
                  filteredExercises.map((exercise) => {
                    const flags = getExerciseFlags(exercise);

                    return (
                      <tr
                        key={exercise._id}
                        className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                      >
                        <td className="p-3 text-[#f1f1f1] min-w-[220px]">
                          <div className="font-semibold">{exercise.name}</div>
                          <div className="mt-1 text-xs text-[#9f9f9f]">
                            {exercise.image ? "Image added" : "No image"}
                          </div>
                          <div className="mt-2 text-xs text-[#8f8f8f] line-clamp-2">
                            {exercise.instructions || "No instructions"}
                          </div>
                        </td>
                        <td className="p-3 text-[#f1f1f1] min-w-[200px]">
                          <div>{formatCategories(exercise.category)}</div>
                          <div className="mt-2">
                            <span
                              className={`inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full border ${getToneClasses(
                                exercise.verified ? "green" : "yellow"
                              )}`}
                            >
                              {exercise.verified ? "Verified" : "Unverified"}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border ${
                              exercise.difficulty === "Beginner"
                                ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]"
                                : exercise.difficulty === "Intermediate"
                                ? "bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]"
                                : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                            }`}
                          >
                            {exercise.difficulty}
                          </span>
                        </td>
                        <td className="p-3 text-[#f1f1f1] min-w-[220px]">
                          <div className="text-sm">{exercise.type || "N/A"}</div>
                          <div className="mt-1 text-xs text-[#9f9f9f]">
                            Primary: {exercise.primaryMuscle || "N/A"}
                          </div>
                          <div className="mt-1 text-xs text-[#9f9f9f]">
                            Target: {exercise.targetMuscles?.join(", ") || "N/A"}
                          </div>
                        </td>
                        <td className="p-3 min-w-[220px]">
                          <div className="flex flex-wrap gap-2">
                            {flags.length > 0 ? (
                              flags.map((flag) => (
                                <span
                                  key={`${exercise._id}-${flag.label}`}
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
                              onClick={() => handleEditClick(exercise)}
                              className="px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300 bg-[#8A2BE2]/20 text-[#8A2BE2] hover:bg-[#8A2BE2]/30"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(exercise._id)}
                              className="px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300 bg-[#ff6b6b]/20 text-[#ff6b6b] hover:bg-[#ff6b6b]/30"
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
                      <p className="text-lg font-medium">No exercises found.</p>
                      <p className="mt-2 text-sm text-[#8f8f8f]">
                        Try changing the filters or search term.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">Add New Exercise</h2>
              <form onSubmit={handleAddExercise}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Name*</label>
                    <input
                      type="text"
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={addFormData.name}
                      onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Category*</label>
                    <select
                      multiple
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={addFormData.category}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          category: Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          ),
                        })
                      }
                      required
                    >
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-[#999]">Hold Ctrl/Cmd to choose multiple categories.</p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Difficulty*</label>
                    <select
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={addFormData.difficulty}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, difficulty: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Difficulty</option>
                      {DIFFICULTY_OPTIONS.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Type*</label>
                    <select
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={addFormData.type}
                      onChange={(e) => setAddFormData({ ...addFormData, type: e.target.value })}
                      required
                    >
                      {TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Default Sets</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={addFormData.defaultSets}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, defaultSets: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Default Reps/Duration*</label>
                    <input
                      type="text"
                      placeholder="e.g., 10-12 reps or 30 sec"
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={addFormData.defaultRepsOrDuration}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          defaultRepsOrDuration: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Primary Muscle*</label>
                    <input
                      type="text"
                      placeholder="e.g., Chest, Back, Quadriceps"
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={addFormData.primaryMuscle}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, primaryMuscle: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Target Muscles*</label>
                    <input
                      type="text"
                      placeholder="comma separated (e.g., Chest, Triceps)"
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={addFormData.targetMuscles}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, targetMuscles: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Secondary Muscles</label>
                    <input
                      type="text"
                      placeholder="comma separated"
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={addFormData.secondaryMuscles}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          secondaryMuscles: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Equipment</label>
                    <input
                      type="text"
                      placeholder="comma separated"
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={addFormData.equipment}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, equipment: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">Instructions*</label>
                  <textarea
                    rows="3"
                    className="w-full bg-black border border-[#333] rounded p-3 text-white"
                    value={addFormData.instructions}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, instructions: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-black border border-[#333] rounded p-3 text-white"
                    value={addFormData.image}
                    onChange={(e) => setAddFormData({ ...addFormData, image: e.target.value })}
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">
                    Add Exercise
                  </button>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && editingExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">Edit Exercise</h2>
              <form onSubmit={handleUpdateExercise}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Name*</label>
                    <input
                      type="text"
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Category*</label>
                    <select
                      multiple
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={editFormData.category}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          category: Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          ),
                        })
                      }
                      required
                    >
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-[#999]">Hold Ctrl/Cmd to choose multiple categories.</p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Difficulty*</label>
                    <select
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={editFormData.difficulty}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, difficulty: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Difficulty</option>
                      {DIFFICULTY_OPTIONS.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Type*</label>
                    <select
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={editFormData.type}
                      onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                      required
                    >
                      {TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Default Sets</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={editFormData.defaultSets}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, defaultSets: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Default Reps/Duration*</label>
                    <input
                      type="text"
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={editFormData.defaultRepsOrDuration}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          defaultRepsOrDuration: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Primary Muscle*</label>
                    <input
                      type="text"
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={editFormData.primaryMuscle}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, primaryMuscle: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Target Muscles*</label>
                    <input
                      type="text"
                      placeholder="comma separated"
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={editFormData.targetMuscles}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, targetMuscles: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Secondary Muscles</label>
                    <input
                      type="text"
                      placeholder="comma separated"
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={editFormData.secondaryMuscles}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          secondaryMuscles: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#cccccc] mb-2">Equipment</label>
                    <input
                      type="text"
                      placeholder="comma separated"
                      className="w-full bg-black border border-[#333] rounded p-3 text-white"
                      value={editFormData.equipment}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, equipment: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">Instructions*</label>
                  <textarea
                    rows="3"
                    className="w-full bg-black border border-[#333] rounded p-3 text-white"
                    value={editFormData.instructions}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, instructions: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#cccccc] mb-2">Image URL</label>
                  <input
                    type="url"
                    className="w-full bg-black border border-[#333] rounded p-3 text-white"
                    value={editFormData.image}
                    onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
                  />
                </div>
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#cccccc]">
                    <input
                      type="checkbox"
                      checked={editFormData.verified}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, verified: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    Verified Exercise
                  </label>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">
                    Update Exercise
                  </button>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminExercises;
