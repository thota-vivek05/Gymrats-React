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
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/admin/trainer-applications', { 
          credentials: 'include' 
        });
        const data = await response.json();
        console.log('Trainer applications data:', data);
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
            rejectedApplications: 0
          });
        }
      } catch (error) {
        console.error("Error fetching trainer applications:", error);
        setApplications([]);
        setStats({
          totalApplications: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0
        });
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`/api/admin/trainer-applications/${id}/approve`, { 
        method: 'PUT', 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      console.log('Approve response:', data, 'Status:', response.status);
      
      if (response.ok && data.success) {
        setApplications(applications.map(app => 
          app._id === id ? { ...app, status: 'Approved' } : app
        ));
        if (stats) {
          setStats({
            ...stats,
            pendingApplications: Math.max(0, stats.pendingApplications - 1),
            approvedApplications: (stats.approvedApplications || 0) + 1
          });
        }
        alert('Trainer application approved successfully!');
      } else {
        alert('Failed to approve: ' + (data.message || 'Unknown error'));
      }
    } catch(err) { 
      alert('Failed to approve application: ' + err.message); 
      console.error('Approve error:', err);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason (optional):');
    if(reason === null) return; // User cancelled
    try {
      const response = await fetch(`/api/admin/trainer-applications/${id}/reject`, { 
        method: 'PUT', 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || '' })
      });
      const data = await response.json();
      console.log('Reject response:', data, 'Status:', response.status);
      
      if (response.ok && data.success) {
        setApplications(applications.map(app => 
          app._id === id ? { ...app, status: 'Rejected' } : app
        ));
        if (stats) {
          setStats({
            ...stats,
            pendingApplications: Math.max(0, stats.pendingApplications - 1),
            rejectedApplications: (stats.rejectedApplications || 0) + 1
          });
        }
        alert('Trainer application rejected successfully!');
      } else {
        alert('Failed to reject: ' + (data.message || 'Unknown error'));
      }
    } catch(err) { 
      alert('Failed to reject application: ' + err.message); 
      console.error('Reject error:', err);
    }
  };

  if (loading) return (
    <div className={styles.container}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading Trainer Applications...</p>
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
          <h1>Trainer Applications</h1>
          <p style={{color: '#999', fontSize: '0.9rem'}}>Review and manage trainer applications</p>
        </div>

        {/* Stats Row */}
        <div className={styles.statsGrid}>
          <StatCard label="Total Applications" value={stats?.totalApplications || 0} color="blue" />
          <StatCard label="Pending Review" value={stats?.pendingApplications || 0} color="orange" />
          <StatCard label="Approved" value={stats?.approvedApplications || 0} color="green" />
          <StatCard label="Rejected" value={stats?.rejectedApplications || 0} color="purple" />
        </div>

        {/* Applications Table */}
        <div className={styles.tableContainer}>
          <h2>Trainer Applications</h2>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Experience</th>
                  <th>Specializations</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.length > 0 ? (
                  applications.map(app => (
                    <tr key={app._id}>
                      <td>{app.name}</td>
                      <td>{app.email}</td>
                      <td>{app.phone}</td>
                      <td>{app.experience} years</td>
                      <td>{app.specializations?.join(', ') || 'None'}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          app.status === 'Pending' ? styles.statusPending :
                          app.status === 'Approved' ? styles.statusApproved :
                          styles.statusRejected
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          {app.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => handleApprove(app._id)}
                                className={`${styles.actionButton} ${styles.approveButton}`}
                                title="Approve this trainer application"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleReject(app._id)}
                                className={`${styles.actionButton} ${styles.rejectButton}`}
                                title="Reject this trainer application"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {app.status !== 'Pending' && (
                            <span style={{color: '#999', fontSize: '0.8rem'}}>
                              {app.status === 'Approved' ? 'Approved ✓' : 'Rejected ✗'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className={styles.emptyState}>No trainer applications found.</td>
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
