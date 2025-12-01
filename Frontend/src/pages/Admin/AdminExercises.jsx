import React, { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import styles from './AdminPages.module.css';

const StatCard = ({ label, value, color }) => {
  return (
    <div className={styles.statCard}>
      <h3>{label}</h3>
      <p className={styles.statValue}>{value}</p>
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
        const response = await fetch('/api/admin/exercises', { 
          credentials: 'include' 
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
                </tr>
              </thead>
              <tbody>
                {exercises.length > 0 ? (
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
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className={styles.emptyState}>No exercises found.</td>
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
