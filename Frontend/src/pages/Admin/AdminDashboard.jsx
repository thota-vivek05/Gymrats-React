// pages/Admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Growth Indicator Component
const GrowthIndicator = ({ value }) => {
  if (value > 0) {
    return (
      <span className="flex items-center text-[#90ee90]">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
        +{value.toFixed(1)}%
      </span>
    );
  } else if (value < 0) {
    return (
      <span className="flex items-center text-[#ff6b6b]">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
        </svg>
        {value.toFixed(1)}%
      </span>
    );
  }
  return <span className="text-gray-400">0%</span>;
};

// Stat Card Component with Growth
const StatCard = ({ label, value, change, icon, trend = 0 }) => (
  <div className="bg-[#111] rounded-lg p-5 border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(138,43,226,0.4)]">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-[#cccccc] text-sm font-semibold uppercase tracking-wide mb-2">
          {label}
        </h3>
        <p className="text-[#8A2BE2] text-3xl font-bold">{value}</p>
        {change && (
          <div className="flex items-center mt-2 text-sm">
            <GrowthIndicator value={trend} />
            <span className="text-gray-400 ml-2">{change}</span>
          </div>
        )}
      </div>
      {icon && <span className="text-3xl opacity-50">{icon}</span>}
    </div>
  </div>
);

// Top Item Component
const TopItem = ({ rank, name, value, subtitle, trend }) => (
  <div className="flex items-center justify-between p-3 bg-[#1e1e3a] rounded-lg border border-[#8A2BE2]/30 hover:border-[#8A2BE2] transition-colors">
    <div className="flex items-center gap-3">
      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
        rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
        rank === 2 ? 'bg-gray-400/20 text-gray-300' :
        rank === 3 ? 'bg-orange-500/20 text-orange-400' :
        'bg-[#8A2BE2]/20 text-[#8A2BE2]'
      }`}>
        {rank}
      </span>
      <div>
        <p className="font-semibold text-white">{name}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-bold text-[#8A2BE2]">{value}</p>
      {trend !== undefined && (
        <div className="text-xs">
          <GrowthIndicator value={trend} />
        </div>
      )}
    </div>
  </div>
);

// Monthly Comparison Badge
const MonthlyBadge = ({ current, previous }) => {
  const change = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
  const isPositive = change > 0;
  
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
      isPositive ? 'bg-green-500/20 text-green-400' : change < 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
    }`}>
      {isPositive ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(change).toFixed(1)}%
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    monthlyGrowth: 0,
    activeUsers: 0,
    totalTrainers: 0,
    monthlyRevenue: [],
    membershipRevenue: [],
    trainers: [],
    topUsers: [],
    previousMonthRevenue: 0,
    currentMonthRevenue: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all required data in parallel
        const [
          totalRes,
          growthRes,
          activeRes,
          trainerPerfRes,
          monthlyRes,
          membershipRes,
          usersRes,
        ] = await Promise.all([
          fetch("/api/admin/analytics/total-revenue", { headers }),
          fetch("/api/admin/analytics/monthly-growth", { headers }),
          fetch("/api/admin/analytics/users/active", { headers }),
          fetch("/api/admin/analytics/trainer-performance", { headers }),
          fetch("/api/admin/analytics/monthly-revenue", { headers }),
          fetch("/api/admin/analytics/membership-revenue", { headers }),
          fetch("/api/admin/analytics/revenue-per-user", { headers }),
        ]);

        const total = await totalRes.json();
        const growth = await growthRes.json();
        const active = await activeRes.json();
        const trainerPerf = await trainerPerfRes.json();
        const monthly = await monthlyRes.json();
        const membership = await membershipRes.json();
        const users = await usersRes.json();

        if (
          total.success &&
          growth.success &&
          active.success &&
          trainerPerf.success &&
          monthly.success &&
          membership.success &&
          users.success
        ) {
          // Get current and previous month revenue
          const monthlyData = monthly.data || [];
          const currentMonth = monthlyData[monthlyData.length - 1]?.revenue || 0;
          const previousMonth = monthlyData[monthlyData.length - 2]?.revenue || 0;

          // Get top 5 users by spending
          const topUsers = (users.data || [])
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5)
            .map(user => ({
              name: user.userName,
              email: user.userEmail,
              totalSpent: user.totalSpent,
              transactions: user.transactionCount,
            }));

          // Get top 5 trainers by revenue
          const topTrainers = (trainerPerf.data || [])
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5)
            .map(trainer => ({
              name: trainer.name,
              revenue: trainer.totalRevenue,
              clients: trainer.activeClients,
              specializations: trainer.specializations,
            }));

          setDashboardData({
            totalRevenue: total.data.totalRevenue,
            monthlyGrowth: growth.data.monthlyGrowth,
            activeUsers: active.data.length,
            totalTrainers: trainerPerf.data.length,
            monthlyRevenue: monthly.data,
            membershipRevenue: membership.data,
            trainers: trainerPerf.data,
            topUsers,
            topTrainers,
            previousMonthRevenue: previousMonth,
            currentMonthRevenue: currentMonth,
          });
        } else {
          setError("Failed to load some data");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare chart data
  const lineChartData = {
    labels: dashboardData.monthlyRevenue.map((item) => item.month),
    datasets: [
      {
        label: "Revenue (₹)",
        data: dashboardData.monthlyRevenue.map((item) => item.revenue),
        borderColor: "#8A2BE2",
        backgroundColor: "rgba(138,43,226,0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        callbacks: { 
          label: (ctx) => `₹${ctx.raw.toLocaleString()}`,
          afterLabel: (ctx) => {
            const month = ctx.label;
            const monthData = dashboardData.monthlyRevenue.find(m => m.month === month);
            if (monthData) {
              return [
                `Transactions: ${monthData.transactions || 0}`,
                `Renewals: ${monthData.renewals || 0}`,
              ];
            }
            return [];
          }
        } 
      },
    },
    scales: {
      y: { 
        ticks: { callback: (value) => `₹${value}` },
        grid: { color: "rgba(255,255,255,0.1)" }
      },
      x: { grid: { display: false } }
    },
  };

  const pieChartData = {
    labels: dashboardData.membershipRevenue.map((item) => 
      `${item.plan} (${item.percentage}%)`
    ),
    datasets: [
      {
        data: dashboardData.membershipRevenue.map((item) => item.revenue),
        backgroundColor: ["#8A2BE2", "#FFA500", "#00CED1", "#FF6B6B"],
        borderWidth: 0,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "bottom", 
        labels: { 
          color: "#f1f1f1",
          font: { size: 12 }
        } 
      },
      tooltip: { 
        callbacks: { 
          label: (ctx) => {
            const value = ctx.raw;
            const total = dashboardData.membershipRevenue.reduce((sum, item) => sum + item.revenue, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${ctx.label}: ₹${value.toLocaleString()} (${percentage}%)`;
          }
        } 
      },
    },
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center flex-1 p-16">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="p-5 text-center bg-[rgba(255,107,107,0.1)] border border-[#ff6b6b] rounded-lg text-[#ff6b6b] max-w-lg">
            <h2 className="mb-2 text-xl font-bold">Error</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2 rounded bg-[#8A2BE2] text-white hover:bg-[#7020a0]"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {/* Page Header */}
        <div className="p-8 mb-8 rounded-lg bg-gradient-to-br from-[#1e1e3a] to-[#111] border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
          <h1 className="mb-2 text-2xl md:text-3xl font-bold text-[#f1f1f1]">
            Analytics Dashboard
          </h1>
          <p className="text-[#cccccc] text-base">
            Revenue, users, and trainer performance at a glance
          </p>
          <div className="flex gap-4 mt-4">
            <MonthlyBadge 
              current={dashboardData.currentMonthRevenue} 
              previous={dashboardData.previousMonthRevenue} 
            />
            <span className="text-sm text-gray-400">
              vs previous month
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(dashboardData.totalRevenue)}
            change="all time"
            trend={dashboardData.monthlyGrowth}
            icon="💰"
          />
          <StatCard
            label="Monthly Revenue"
            value={formatCurrency(dashboardData.currentMonthRevenue)}
            change="this month"
            trend={dashboardData.monthlyGrowth}
            icon="📈"
          />
          <StatCard
            label="Active Users"
            value={dashboardData.activeUsers}
            change="currently active"
            trend={5.2} // You can calculate this from user growth data
            icon="👥"
          />
          <StatCard
            label="Total Trainers"
            value={dashboardData.totalTrainers}
            change="active trainers"
            trend={2.1} // You can calculate this from trainer growth data
            icon="💪"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Revenue Line Chart */}
          <div className="lg:col-span-2 bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#f1f1f1]">
                Monthly Revenue Trend
              </h2>
              <div className="flex gap-2">
                {dashboardData.monthlyRevenue.slice(-3).map((month, idx) => (
                  <div key={idx} className="text-xs bg-[#1e1e3a] px-2 py-1 rounded">
                    <span className="text-gray-400">{month.month}:</span>
                    <span className="text-[#8A2BE2] ml-1">₹{month.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-64">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          {/* Membership Pie Chart */}
          <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
            <h2 className="text-xl font-semibold mb-4 text-[#f1f1f1]">
              Revenue by Membership
            </h2>
            <div className="h-64 flex items-center justify-center">
              {dashboardData.membershipRevenue.length > 0 ? (
                <Pie data={pieChartData} options={pieChartOptions} />
              ) : (
                <p className="text-gray-400">No data</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Performers Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top 5 Paying Users */}
          <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
            <h2 className="text-xl font-semibold mb-4 text-[#f1f1f1] flex items-center">
              🏆 Top 5 Paying Users
              <span className="ml-2 text-sm text-gray-400 font-normal">
                by lifetime value
              </span>
            </h2>
            <div className="space-y-2">
              {dashboardData.topUsers.length > 0 ? (
                dashboardData.topUsers.map((user, idx) => (
                  <TopItem
                    key={idx}
                    rank={idx + 1}
                    name={user.name}
                    subtitle={`${user.transactions} transactions`}
                    value={formatCurrency(user.totalSpent)}
                  />
                ))
              ) : (
                <p className="text-center text-gray-400 py-4">No user data available</p>
              )}
            </div>
          </div>

          {/* Top 5 Trainers */}
          <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
            <h2 className="text-xl font-semibold mb-4 text-[#f1f1f1] flex items-center">
              ⭐ Top 5 Trainers
              <span className="ml-2 text-sm text-gray-400 font-normal">
                by revenue generated
              </span>
            </h2>
            <div className="space-y-2">
              {dashboardData.topTrainers.length > 0 ? (
                dashboardData.topTrainers.map((trainer, idx) => (
                  <TopItem
                    key={idx}
                    rank={idx + 1}
                    name={trainer.name}
                    subtitle={`${trainer.clients} active clients`}
                    value={formatCurrency(trainer.revenue)}
                    trend={trainer.revenue * 0.1} // Example trend - replace with actual growth data
                  />
                ))
              ) : (
                <p className="text-center text-gray-400 py-4">No trainer data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Trainer Performance Table */}
        <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#f1f1f1]">
              Trainer Performance
            </h2>
            <div className="text-sm text-gray-400">
              Click on any row for detailed view
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                  <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide text-[#f1f1f1]">
                    Trainer
                  </th>
                  <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide text-[#f1f1f1]">
                    Total Revenue
                  </th>
                  <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide text-[#f1f1f1]">
                    Active Clients
                  </th>
                  <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide text-[#f1f1f1]">
                    Monthly Growth
                  </th>
                  <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide text-[#f1f1f1]">
                    Performance
                  </th>
                  <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide text-[#f1f1f1]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.trainers.length > 0 ? (
                  dashboardData.trainers.map((trainer) => {
                    // Calculate monthly growth from trainer's monthlyRevenue array
                    const monthlyRev = trainer.monthlyRevenue || [];
                    let growth = 0;
                    if (monthlyRev.length >= 2) {
                      const last = monthlyRev[monthlyRev.length - 1].amount || 0;
                      const prev = monthlyRev[monthlyRev.length - 2].amount || 0;
                      if (prev > 0) growth = ((last - prev) / prev) * 100;
                      else if (last > 0) growth = 100;
                    }

                    // Determine performance tier
                    const performanceTier = 
                      growth > 20 ? "🔥 Hot" :
                      growth > 10 ? "📈 Growing" :
                      growth > 0 ? "✅ Stable" :
                      growth < 0 ? "⚠️ Declining" : "⏸️ Flat";

                    const tierColor = 
                      growth > 20 ? "text-orange-400" :
                      growth > 10 ? "text-green-400" :
                      growth > 0 ? "text-blue-400" :
                      growth < 0 ? "text-red-400" : "text-gray-400";

                    return (
                      <tr
                        key={trainer._id}
                        className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10 cursor-pointer"
                        onClick={() => navigate(`/admin/trainer/${trainer._id}`)}
                      >
                        <td className="p-3">
                          <div>
                            <p className="font-semibold text-white">{trainer.name}</p>
                            <p className="text-xs text-gray-400">
                              {trainer.specializations?.slice(0, 2).join(", ")}
                              {trainer.specializations?.length > 2 && " ..."}
                            </p>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[#8A2BE2]">
                          {formatCurrency(trainer.totalRevenue || 0)}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-white">
                            {trainer.activeClients || 0}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">
                            / {trainer.maxClients || 20}
                          </span>
                        </td>
                        <td className="p-3">
                          <GrowthIndicator value={growth} />
                        </td>
                        <td className="p-3">
                          <span className={`text-xs font-medium ${tierColor}`}>
                            {performanceTier}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/trainer/${trainer._id}`);
                            }}
                            className="px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300 bg-[#8A2BE2]/20 text-[#8A2BE2] hover:bg-[#8A2BE2]/30"
                          >
                            View Details →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-[#cccccc]">
                      No trainers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
          <div>
            <span className="block font-semibold text-white">Total Transactions</span>
            {dashboardData.monthlyRevenue.reduce((sum, m) => sum + (m.transactions || 0), 0)}
          </div>
          <div>
            <span className="block font-semibold text-white">Total Renewals</span>
            {dashboardData.monthlyRevenue.reduce((sum, m) => sum + (m.renewals || 0), 0)}
          </div>
          <div>
            <span className="block font-semibold text-white">Renewal Rate</span>
            {((dashboardData.monthlyRevenue.reduce((sum, m) => sum + (m.renewals || 0), 0) / 
               dashboardData.monthlyRevenue.reduce((sum, m) => sum + (m.transactions || 0), 1)) * 100).toFixed(1)}%
          </div>
          <div>
            <span className="block font-semibold text-white">Avg. Transaction</span>
            {formatCurrency(dashboardData.totalRevenue / 
              dashboardData.monthlyRevenue.reduce((sum, m) => sum + (m.transactions || 0), 1))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;