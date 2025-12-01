import React, { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import styles from './AdminPages.module.css';
import { useNavigate } from 'react-router-dom';

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
        const res = await fetch('/api/admin/trainer-assignment-data', { credentials: 'include' });
        if (!res.ok) {
          if (res.status === 401) return navigate('/admin/login');
          throw new Error('Failed to fetch assignment data');
        }
        const json = await res.json();
        if (json.success) {
          setTrainers(json.trainers || []);
          setUsers(json.unassignedUsers || []);
        } else {
          setError(json.message || 'Failed to load');
        }
      } catch (err) {
        console.error(err);
        setError('Server error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleAssign = async (userId, trainerId) => {
    if (!trainerId) return alert('Select a trainer');
    try {
      const res = await fetch('/api/admin/trainer-assign', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, trainerId })
      });
      if (!res.ok) {
        if (res.status === 401) return navigate('/admin/login');
        const err = await res.json();
        return alert(err.message || 'Assignment failed');
      }
      const json = await res.json();
      if (json.success) {
        alert('Assigned successfully');
        setUsers(prev => prev.filter(u => u._id !== userId));
      } else {
        alert(json.message || 'Assignment failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  if (loading) return (
    <div className={styles.container}>
      <AdminSidebar />
      <div className={styles.loading}><div className={styles.loadingSpinner}></div><p>Loading...</p></div>
    </div>
  );

  return (
    <div className={styles.container}>
      <AdminSidebar />
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1>Trainer Assignment</h1>
          <p style={{color: '#999'}}>Assign available trainers to unassigned users</p>
        </div>

        <div className={styles.tableContainer}>
          <h2>Unassigned Users</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Workout Type</th>
                  <th>Assign Trainer</th>
                </tr>
              </thead>
              <tbody>
                {users.length ? users.map(user => (
                  <tr key={user._id}>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>{user.workout_type || 'N/A'}</td>
                    <td>
                      {/* Only include trainers that match user's workout_type */}
                      {user.workout_type ? (
                        <>
                          <select
                            className={styles.selectInput}
                            value={selectedTrainers[user._id] || ''}
                            onChange={(e) => setSelectedTrainers(prev => ({ ...prev, [user._id]: e.target.value }))}
                          >
                            <option value="">Select trainer</option>
                            {trainers
                              .filter(tr => Array.isArray(tr.specializations) && tr.specializations.includes(user.workout_type))
                              .map(tr => (
                                <option key={tr._id || tr.id} value={tr._id || tr.id}>{`${tr.name} — ${tr.specializations?.join(', ')}`}</option>
                              ))}
                          </select>
                          <button
                            className={styles.assignButton}
                            disabled={!selectedTrainers[user._id]}
                            onClick={() => handleAssign(user._id, selectedTrainers[user._id])}
                            style={{ marginLeft: 8 }}
                          >Assign</button>
                        </>
                      ) : (
                        <span className={styles.emptyState}>No workout type specified</span>
                      )}
                      {/* If there are no matching trainers show message */}
                      {user.workout_type && trainers.filter(tr => Array.isArray(tr.specializations) && tr.specializations.includes(user.workout_type)).length === 0 && (
                        <div style={{ color: '#ccc', marginTop: 8 }}>No trainers with matching specialization</div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className={styles.emptyState}>No unassigned users found</td>
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
