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

const AdminVerifiers = () => {
  const [verifiers, setVerifiers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerifiers = async () => {
      try {
        const response = await fetch('/api/admin/verifiers', { 
          credentials: 'include' 
        });
        const data = await response.json();
        if (data.success) {
          setVerifiers(data.verifiers);
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Error fetching verifiers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVerifiers();
  }, []);

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`/api/admin/verifiers/${id}/approve`, { 
        method: 'PUT', 
        credentials: 'include' 
      });
      const data = await response.json();
      if (data.success) {
        setVerifiers(verifiers.map(v => v._id === id ? { ...v, status: 'Approved' } : v));
      }
    } catch(err) { alert('Failed to approve'); }
  };

  const handleReject = async (id) => {
    if(!confirm('Reject this verifier application?')) return;
    try {
      await fetch(`/api/admin/verifiers/${id}/reject`, { 
        method: 'PUT', 
        credentials: 'include' 
      });
      setVerifiers(verifiers.map(v => v._id === id ? { ...v, status: 'Rejected' } : v));
    } catch(err) { alert('Failed to reject'); }
  };

  if (loading) return (
    <div className={styles.container}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading Verifiers...</p>
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
          <h1>Verifier Management</h1>
          <button className={styles.addButton}>+ Add Verifier</button>
        </div>

        {/* Stats Row */}
        <div className={styles.statsGrid}>
          <StatCard label="Total Verifiers" value={stats?.totalVerifiers || 0} color="blue" />
          <StatCard label="Pending Review" value={stats?.pendingReview || 0} color="orange" />
          <StatCard label="Approved" value={stats?.approvedVerifiers || 0} color="green" />
          <StatCard label="Rejected" value={stats?.rejectedVerifiers || 0} color="purple" />
        </div>

        {/* Verifiers Table */}
        <div className={styles.tableContainer}>
          <h2>Verifier Management</h2>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Certifications</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifiers.length > 0 ? (
                  verifiers.map(v => (
                    <tr key={v._id}>
                      <td>{v.name}</td>
                      <td>{v.email}</td>
                      <td>{v.specialization}</td>
                      <td>{v.certifications?.join(', ') || 'N/A'}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          v.status === 'Pending' ? styles.statusPending :
                          v.status === 'Approved' ? styles.statusApproved :
                          styles.statusRejected
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          {v.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => handleApprove(v._id)}
                                className={`${styles.actionButton} ${styles.approveButton}`}
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleReject(v._id)}
                                className={`${styles.actionButton} ${styles.rejectButton}`}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {v.status !== 'Pending' && (
                            <span style={{color: '#999', fontSize: '0.8rem'}}>No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className={styles.emptyState}>No verifiers found.</td>
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
