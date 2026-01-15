<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import styles from './AdminPages.module.css';

const StatCard = ({ label, value, color }) => {
  return (
    <div className={styles.statCard}>
      <h3>{label}</h3>
      <p className={styles.statValue}>{value}</p>
=======
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
>>>>>>> rahul-final
    </div>
  );
};

const AdminExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
<<<<<<< HEAD
        const response = await fetch('/api/admin/exercises', { 
          credentials: 'include' 
=======
        const response = await fetch("/api/admin/exercises", {
          credentials: "include",
>>>>>>> rahul-final
        });
        const data = await response.json();
        if (data.success) {
          setExercises(data.exercises);
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  const handleDelete = async (id) => {
<<<<<<< HEAD
    if(!confirm('Delete this exercise?')) return;
    try {
      await fetch(`/api/admin/exercises/${id}`, { 
        method: 'DELETE', 
        credentials: 'include' 
      });
      setExercises(exercises.filter(e => e._id !== id));
    } catch(err) { alert('Failed to delete'); }
  };

  if (loading) return (
    <div className={styles.container}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading Exercises...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <AdminSidebar />
      
      <main className={styles.mainContent}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1>Exercise Management</h1>
          <button className={styles.addButton}>+ Add Exercise</button>
        </div>

        {/* Stats Row */}
        <div className={styles.statsGrid}>
          <StatCard label="Total Exercises" value={stats?.totalExercises || 0} color="blue" />
          <StatCard label="By Category" value={stats?.categories || 0} color="green" />
          <StatCard label="Difficulty Levels" value={stats?.difficulties || 0} color="purple" />
          <StatCard label="Last Updated" value={stats?.recentUpdates || 0} color="orange" />
        </div>

        {/* Exercises Table */}
        <div className={styles.tableContainer}>
          <h2>Exercise Library</h2>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Muscle Groups</th>
                  <th>Instructions</th>
                  <th>Actions</th>
=======
    if (!confirm("Delete this exercise?")) return;
    try {
      await fetch(`/api/admin/exercises/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setExercises(exercises.filter((e) => e._id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // Shared container classes
  const containerClasses =
    "min-h-screen bg-black text-[#f1f1f1] font-sans flex flex-col";

  if (loading)
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-[#cccccc]">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading Exercises...</p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {/* Page Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
          <h1 className="m-0 text-2xl font-bold md:text-3xl text-[#f1f1f1]">
            Exercise Management
          </h1>
          <button
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Exercises"
            value={stats?.totalExercises || 0}
          />
          <StatCard label="By Category" value={stats?.categories || 0} />
          <StatCard
            label="Difficulty Levels"
            value={stats?.difficulties || 0}
          />
          <StatCard label="Last Updated" value={stats?.recentUpdates || 0} />
        </div>

        {/* Exercises Table */}
        <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
          <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
            Exercise Library
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Name
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Category
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Difficulty
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Muscle Groups
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Instructions
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Actions
                  </th>
>>>>>>> rahul-final
                </tr>
              </thead>
              <tbody>
                {exercises.length > 0 ? (
<<<<<<< HEAD
                  exercises.map(e => (
                    <tr key={e._id}>
                      <td>{e.name}</td>
                      <td>{e.category}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          e.difficulty === 'Easy' ? styles.difficultyEasy : 
                          e.difficulty === 'Medium' ? styles.difficultyMedium : 
                          styles.difficultyHard
                        }`}>
                          {e.difficulty}
                        </span>
                      </td>
                      <td>{e.muscleGroups?.join(', ') || 'N/A'}</td>
                      <td style={{fontSize: '0.8rem'}}>{e.instructions?.substring(0, 50)}...</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button className={`${styles.actionButton} ${styles.editButton}`}>Edit</button>
                          <button 
                            onClick={() => handleDelete(e._id)}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
=======
                  exercises.map((e) => (
                    <tr
                      key={e._id}
                      className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                    >
                      <td className="p-3 text-[#f1f1f1]">{e.name}</td>
                      <td className="p-3 text-[#f1f1f1]">{e.category}</td>
                      <td className="p-3">
                        <span
                          className={`
                          inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border
                          ${
                            e.difficulty === "Easy"
                              ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]"
                              : e.difficulty === "Medium"
                              ? "bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]"
                              : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                          }
                        `}
                        >
                          {e.difficulty}
                        </span>
                      </td>
                      <td className="p-3 text-[#f1f1f1]">
                        {e.muscleGroups?.join(", ") || "N/A"}
                      </td>
                      <td className="p-3 text-xs text-[#f1f1f1]">
                        {e.instructions?.substring(0, 50)}...
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                          <button
                            className="
                            px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                            bg-[#8A2BE2]/20 text-[#8A2BE2] hover:bg-[#8A2BE2]/30
                          "
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(e._id)}
                            className="
                              px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                              bg-[#ff6b6b]/20 text-[#ff6b6b] hover:bg-[#ff6b6b]/30
                            "
>>>>>>> rahul-final
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
<<<<<<< HEAD
                    <td colSpan="6" className={styles.emptyState}>No exercises found.</td>
=======
                    <td colSpan="6" className="p-10 text-center text-[#cccccc]">
                      No exercises found.
                    </td>
>>>>>>> rahul-final
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

export default AdminExercises;
