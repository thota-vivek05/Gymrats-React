// pages/Admin/AdminTrainerDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import { Line } from "react-chartjs-2";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const AdminTrainerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trainerData, setTrainerData] = useState({
    info: null,
    monthlyTrend: [],
    userRevenue: [],
  });

  useEffect(() => {
    const fetchTrainerDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [trendRes, usersRes] = await Promise.all([
          fetch(`/api/admin/analytics/trainer/${id}/monthly-trend`, { headers }),
          fetch(`/api/admin/analytics/trainer/${id}/user-revenue`, { headers }),
        ]);

        const trend = await trendRes.json();
        const users = await usersRes.json();

        if (trend.success && users.success) {
          setTrainerData({
            info: trend.data,
            monthlyTrend: trend.data.trend || [],
            userRevenue: users.data.users || [],
          });
        } else {
          setError("Failed to load trainer details");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerDetails();
  }, [id]);

  const chartData = {
    labels: trainerData.monthlyTrend.map((item) => item.month),
    datasets: [
      {
        label: "Revenue (₹)",
        data: trainerData.monthlyTrend.map((item) => item.revenue),
        borderColor: "#8A2BE2",
        backgroundColor: "rgba(138,43,226,0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "New Clients",
        data: trainerData.monthlyTrend.map((item) => item.newClients),
        borderColor: "#00CED1",
        backgroundColor: "rgba(0,206,209,0.1)",
        tension: 0.4,
        fill: true,
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}` } },
    },
    scales: {
      y: { type: "linear", display: true, position: "left", ticks: { callback: (v) => `₹${v}` } },
      y1: { type: "linear", display: true, position: "right", grid: { drawOnChartArea: false } },
    },
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center flex-1 p-16">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading Trainer Details...</p>
        </div>
      </div>
    );
  }

  if (error || !trainerData.info) {
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="p-5 text-center bg-[rgba(255,107,107,0.1)] border border-[#ff6b6b] rounded-lg text-[#ff6b6b]">
            <h2 className="mb-2 text-xl font-bold">Error</h2>
            <p>{error || "Trainer not found"}</p>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="mt-4 px-5 py-2 rounded bg-[#8A2BE2] text-white hover:bg-[#7020a0]"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { info } = trainerData;

  return (
    <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-[#8A2BE2] hover:text-[#a040ff] transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#f1f1f1]">
            {info.trainerName}
          </h1>
          <div></div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111] p-5 rounded-lg border border-[#8A2BE2]">
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-[#8A2BE2]">
              {formatCurrency(info.totalRevenue)}
            </p>
          </div>
          <div className="bg-[#111] p-5 rounded-lg border border-[#8A2BE2]">
            <p className="text-gray-400 text-sm">Monthly Growth</p>
            <p
              className={`text-2xl font-bold ${
                info.monthlyGrowth > 0
                  ? "text-[#90ee90]"
                  : info.monthlyGrowth < 0
                  ? "text-[#ff6b6b]"
                  : "text-white"
              }`}
            >
              {info.monthlyGrowth.toFixed(1)}%
            </p>
          </div>
          <div className="bg-[#111] p-5 rounded-lg border border-[#8A2BE2]">
            <p className="text-gray-400 text-sm">Active Clients</p>
            <p className="text-2xl font-bold text-white">
              {trainerData.userRevenue.filter((u) => u.isActiveClient).length}
            </p>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 mb-8">
          <h2 className="text-xl font-semibold mb-4">Monthly Trend</h2>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* User Revenue Table */}
        <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5">
          <h2 className="text-xl font-semibold mb-4">Clients & Revenue</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Total Paid</th>
                  <th className="p-3 text-left">Transactions</th>
                  <th className="p-3 text-left">Last Payment</th>
                </tr>
              </thead>
              <tbody>
                {trainerData.userRevenue.length > 0 ? (
                  trainerData.userRevenue.map((user) => (
                    <tr
                      key={user.userId}
                      className="border-b border-[#333] hover:bg-[#8A2BE2]/10 cursor-pointer"
                      onClick={() => navigate(`/admin/user/${user.userId}`)}
                    >
                      <td className="p-3">{user.userName}</td>
                      <td className="p-3">{user.userEmail}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.isActiveClient
                              ? "bg-green-500/20 text-green-400 border border-green-500"
                              : "bg-red-500/20 text-red-400 border border-red-500"
                          }`}
                        >
                          {user.isActiveClient ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3">{formatCurrency(user.totalPaid)}</td>
                      <td className="p-3">{user.transactionCount}</td>
                      <td className="p-3">
                        {user.lastPayment
                          ? new Date(user.lastPayment).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-gray-400">
                      No client data available.
                    </td>
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

export default AdminTrainerDetail;