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
    </div>
  );
};

const AdminMemberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await fetch("/api/admin/memberships", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setMemberships(data.memberships);
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Error fetching memberships:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMemberships();
  }, []);

  // Shared container classes
  const containerClasses =
    "min-h-screen bg-black text-[#f1f1f1] font-sans flex flex-col";

  if (loading)
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-[#cccccc]">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading Memberships...</p>
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
            Membership Management
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
            + Add Plan
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active Memberships"
            value={stats?.activeMembers || 0}
          />
          <StatCard
            label="Revenue (Monthly)"
            value={`₹${stats?.monthlyRevenue || 0}`}
          />
          <StatCard
            label="Renewals (30d)"
            value={stats?.upcomingRenewals || 0}
          />
          <StatCard
            label="Expiring Soon"
            value={stats?.expiringMemberships || 0}
          />
        </div>

        {/* Memberships Table */}
        <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
          <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
            Membership Plans
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    User
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Plan
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Start Date
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    End Date
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Status
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Amount
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {memberships.length > 0 ? (
                  memberships.map((m) => (
                    <tr
                      key={m._id}
                      className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                    >
                      <td className="p-3 text-[#f1f1f1]">{m.userName}</td>
                      <td className="p-3 text-[#f1f1f1]">{m.planType}</td>
                      <td className="p-3 text-[#f1f1f1]">
                        {new Date(m.startDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-[#f1f1f1]">
                        {new Date(m.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`
                          inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border
                          ${
                            m.status === "Active"
                              ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]"
                              : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                          }
                        `}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-[#f1f1f1]">₹{m.amount}</td>
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
                            className="
                            px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                            bg-[#ff6b6b]/20 text-[#ff6b6b] hover:bg-[#ff6b6b]/30
                          "
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-[#cccccc]">
                      No memberships found.
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

export default AdminMemberships;
