<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPages.module.css';

// Simple card component for stats
const StatCard = ({ label, value, change, color = "blue" }) => (
  <div className={styles.statCard}>
    <h3>{label}</h3>
    <div className={styles.statValue}>{value}</div>
    {change && (
      <div className={change.includes('+') ? styles.statChange : `${styles.statChange} ${styles.negative}`}>
=======
import React, { useEffect, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Simple card component for stats with Tailwind styles
const StatCard = ({ label, value, change }) => (
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
    <div className="text-[#8A2BE2] text-3xl font-bold mb-2">{value}</div>
    {change && (
      <div
        className={`text-sm ${
          change.includes("+") ? "text-[#90ee90]" : "text-[#ff6b6b]"
        }`}
      >
>>>>>>> rahul-final
        {change}
      </div>
    )}
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
<<<<<<< HEAD
        const response = await fetch('/api/admin/dashboard', {
          method: 'GET',
          credentials: 'include', // Important for session auth
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized - redirect to admin login
            navigate('/admin/login');
=======
        const response = await fetch("/api/admin/dashboard", {
          method: "GET",
          credentials: "include", // Important for session auth
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized - redirect to admin login
            navigate("/admin/login");
>>>>>>> rahul-final
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
<<<<<<< HEAD
        
=======

>>>>>>> rahul-final
        const result = await response.json();

        if (result.success) {
          setData(result);
          setError(null);
        } else {
<<<<<<< HEAD
          setError(result.message || 'Failed to load dashboard data');
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
        setError('Failed to fetch dashboard data. Please try again.');
=======
          setError(result.message || "Failed to load dashboard data");
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
        setError("Failed to fetch dashboard data. Please try again.");
>>>>>>> rahul-final
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

<<<<<<< HEAD
  if (loading) {
    return (
      <div className={styles.container}>
        <AdminSidebar />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
=======
  // Shared container styles
  const containerClasses =
    "min-h-screen bg-black text-[#f1f1f1] font-sans flex flex-col";

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center flex-1 p-16 text-[#cccccc]">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
>>>>>>> rahul-final
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }
<<<<<<< HEAD
  
  if (error) {
    return (
      <div className={styles.container}>
        <AdminSidebar />
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
=======

  if (error) {
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div
            className="
          p-5 text-center
          bg-[rgba(255,107,107,0.1)] 
          border border-[#ff6b6b] 
          rounded-lg 
          text-[#ff6b6b] 
          max-w-lg
        "
          >
            <h2 className="mb-2 text-xl font-bold">Error</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="
              mt-4 px-5 py-2 rounded 
              bg-[#8A2BE2] text-white 
              hover:bg-[#7020a0] 
              transition-colors duration-300
            "
            >
              Retry
            </button>
          </div>
>>>>>>> rahul-final
        </div>
      </div>
    );
  }
<<<<<<< HEAD
  
  if (!data) {
    return (
      <div className={styles.container}>
        <AdminSidebar />
        <div className={styles.loading}>
=======

  if (!data) {
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex items-center justify-center flex-1 text-[#cccccc]">
>>>>>>> rahul-final
          <p>No data available.</p>
        </div>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className={styles.container}>
      <AdminSidebar />
      
      <main className={styles.mainContent}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1>Dashboard Overview</h1>
          <p style={{color: '#999', fontSize: '0.9rem'}}>Welcome to the Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <StatCard 
            label="Total Users" 
            value={data.stats.totalUsers}
          />
          <StatCard 
            label="Active Members" 
            value={data.stats.activeMembers}
          />
          <StatCard 
            label="Total Revenue" 
            value={`₹${data.stats.totalRevenue}`}
          />
          <StatCard 
            label="New Signups" 
            value={data.stats.newSignups}
          />
          <StatCard 
            label="Personal Trainers" 
            value={data.stats.personalTrainers}
          />
          <StatCard 
            label="Content Verifiers" 
=======
    <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {/* Page Header */}
        <div
          className="
          p-8 mb-8 rounded-lg 
          bg-gradient-to-br from-[#1e1e3a] to-[#111] 
          border border-[#8A2BE2] 
          shadow-[0_4px_8px_rgba(138,43,226,0.3)]
        "
        >
          <h1 className="mb-2 text-2xl md:text-3xl font-bold text-[#f1f1f1]">
            Dashboard Overview
          </h1>
          <p className="text-[#cccccc] text-base">Welcome to the Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-auto-fit">
          <StatCard label="Total Users" value={data.stats.totalUsers} />
          <StatCard label="Active Members" value={data.stats.activeMembers} />
          <StatCard
            label="Total Revenue"
            value={`₹${data.stats.totalRevenue}`}
          />
          <StatCard label="New Signups" value={data.stats.newSignups} />
          <StatCard
            label="Personal Trainers"
            value={data.stats.personalTrainers}
          />
          <StatCard
            label="Content Verifiers"
>>>>>>> rahul-final
            value={data.stats.contentVerifiers}
          />
        </div>

<<<<<<< HEAD
        {/* Recent Users Table */}
        <div className={styles.tableContainer}>
          <h2>Recent Users</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Plan Type</th>
                </tr>
              </thead>
              <tbody>
                {data.users && data.users.length > 0 ? (
                  data.users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.full_name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          u.status === 'Active' ? styles.statusApproved :
                          u.status === 'Inactive' ? styles.statusRejected :
                          styles.statusPending
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td>{u.membershipType}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.emptyState}>No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Trainers Table */}
        <div className={styles.tableContainer}>
          <h2>Recent Trainers</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Experience</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.trainers && data.trainers.length > 0 ? (
                  data.trainers.map((t) => (
                    <tr key={t.name}>
                      <td>{t.name}</td>
                      <td>{t.email}</td>
                      <td>{t.experience}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          t.status === 'Active' ? styles.statusApproved :
                          styles.statusPending
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.emptyState}>No trainers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
=======
        {/* Tables Container */}
        <div className="grid grid-cols-1 gap-8 mt-8 xl:grid-cols-2">
          {/* Recent Users Table */}
          <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
            <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
              Recent Users
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                    <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                      Name
                    </th>
                    <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                      Email
                    </th>
                    <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                      Status
                    </th>
                    <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                      Plan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.users && data.users.length > 0 ? (
                    data.users.map((u) => (
                      <tr
                        key={u._id}
                        className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                      >
                        <td className="p-3 text-[#f1f1f1] text-sm">
                          {u.full_name}
                        </td>
                        <td className="p-3 text-[#f1f1f1] text-sm">
                          {u.email}
                        </td>
                        <td className="p-3">
                          <span
                            className={`
                            inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border
                            ${
                              u.status === "Active"
                                ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]"
                                : u.status === "Inactive"
                                ? "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                                : "bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]"
                            }
                          `}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3 text-[#f1f1f1] text-sm">
                          {u.membershipType}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-8 text-center text-[#cccccc]"
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Trainers Table */}
          <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
            <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
              Recent Trainers
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                    <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                      Name
                    </th>
                    <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                      Email
                    </th>
                    <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                      Exp
                    </th>
                    <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.trainers && data.trainers.length > 0 ? (
                    data.trainers.map((t) => (
                      <tr
                        key={t.name}
                        className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                      >
                        <td className="p-3 text-[#f1f1f1] text-sm">{t.name}</td>
                        <td className="p-3 text-[#f1f1f1] text-sm">
                          {t.email}
                        </td>
                        <td className="p-3 text-[#f1f1f1] text-sm">
                          {t.experience}
                        </td>
                        <td className="p-3">
                          <span
                            className={`
                            inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border
                            ${
                              t.status === "Active"
                                ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]"
                                : "bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]"
                            }
                          `}
                          >
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-8 text-center text-[#cccccc]"
                      >
                        No trainers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Verifiers Table (Spans full width on large screens if desired, or shares grid) */}
          <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)] xl:col-span-2">
            <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
              Recent Verifiers
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                    <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                      Name
                    </th>
                    <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                      Email
                    </th>
                    <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.verifiers && data.verifiers.length > 0 ? (
                    data.verifiers.map((v) => (
                      <tr
                        key={v.name}
                        className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                      >
                        <td className="p-3 text-[#f1f1f1] text-sm">{v.name}</td>
                        <td className="p-3 text-[#f1f1f1] text-sm">
                          {v.email || "N/A"}
                        </td>
                        <td className="p-3">
                          <span
                            className="
                            inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border
                            bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]
                          "
                          >
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="p-8 text-center text-[#cccccc]"
                      >
                        No verifiers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
>>>>>>> rahul-final
        </div>

        {/* Recent Verifiers Table */}
        <div className={styles.tableContainer}>
          <h2>Recent Verifiers</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.verifiers && data.verifiers.length > 0 ? (
                  data.verifiers.map((v) => (
                    <tr key={v.name}>
                      <td>{v.name}</td>
                      <td>{v.email || 'N/A'}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className={styles.emptyState}>No verifiers found</td>
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

export default AdminDashboard;
