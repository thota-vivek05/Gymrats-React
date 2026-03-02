// pages/Admin/AdminUserDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";

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

// Calculate end date (assuming 6 months membership duration)
const calculateEndDate = (startDate) => {
  if (!startDate) return "N/A";
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 6);
  return formatDate(endDate);
};

// Check if membership is active
const isMembershipActive = (paymentDate) => {
  if (!paymentDate) return false;
  const endDate = new Date(paymentDate);
  endDate.setMonth(endDate.getMonth() + 6);
  return endDate > new Date();
};

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userPayments, setUserPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch user profile details
        const res = await fetch(`/api/admin/users/${id}/details`, { headers });
        const data = await res.json();

        if (data.success) {
          console.log("✅ User data loaded:", data);
          setUserData(data);
        } else {
          setError("Failed to load user details");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data");
      }
    };

    const fetchUserPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch payment history from revenue-per-user API
        const res = await fetch(`/api/admin/analytics/revenue-per-user/${id}`, { headers });
        const data = await res.json();

        if (data.success) {
          console.log("✅ Payments loaded:", data.data.payments);
          setUserPayments(data.data.payments || []);
        }
      } catch (err) {
        console.error("Failed to fetch payments:", err);
      } finally {
        setPaymentsLoading(false);
      }
    };

    Promise.all([
      fetchUserDetails(),
      fetchUserPayments()
    ]).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center flex-1 p-16">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading User Details...</p>
        </div>
      </div>
    );
  }

  if (error || !userData?.profile) {
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="p-5 text-center bg-[rgba(255,107,107,0.1)] border border-[#ff6b6b] rounded-lg text-[#ff6b6b] max-w-lg">
            <h2 className="mb-2 text-xl font-bold">Error</h2>
            <p>{error || "User not found"}</p>
            <button
              onClick={() => navigate("/admin/users")}
              className="mt-4 px-5 py-2 rounded bg-[#8A2BE2] text-white hover:bg-[#7020a0]"
            >
              Back to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { profile, membership, trainer, lifecycle } = userData;

  // Calculate total spent from payments
  const totalSpent = userPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Count renewals
  const renewalsCount = userPayments.filter(p => p.isRenewal).length;
  
  // Get current active payment (most recent payment that's still active)
  const activePayment = userPayments.find(p => isMembershipActive(p.paymentDate));
  
  // Sort payments by date (newest first)
  const sortedPayments = [...userPayments].sort((a, b) => 
    new Date(b.paymentDate) - new Date(a.paymentDate)
  );

  return (
    <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/admin/users")}
            className="text-[#8A2BE2] hover:text-[#a040ff] transition-colors"
          >
            ← Back to Users
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#f1f1f1]">
            {profile?.full_name || "User Details"}
          </h1>
          <div className="w-20"></div>
        </div>

        {/* Status Badge & Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#111] p-4 rounded-lg border border-[#8A2BE2]">
            <p className="text-gray-400 text-sm">Status</p>
            <span
              className={`inline-block px-3 py-1 mt-1 text-sm font-semibold rounded-full ${
                membership?.status === "Active" || activePayment
                  ? "bg-green-500/20 text-green-400 border border-green-500"
                  : "bg-red-500/20 text-red-400 border border-red-500"
              }`}
            >
              {membership?.status || (activePayment ? "Active" : "Inactive")}
            </span>
          </div>
          
          <div className="bg-[#111] p-4 rounded-lg border border-[#8A2BE2]">
            <p className="text-gray-400 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-[#8A2BE2]">{formatCurrency(totalSpent)}</p>
          </div>
          
          <div className="bg-[#111] p-4 rounded-lg border border-[#8A2BE2]">
            <p className="text-gray-400 text-sm">Total Payments</p>
            <p className="text-2xl font-bold text-white">{userPayments.length}</p>
          </div>
          
          <div className="bg-[#111] p-4 rounded-lg border border-[#8A2BE2]">
            <p className="text-gray-400 text-sm">Renewals</p>
            <p className="text-2xl font-bold text-white">{renewalsCount}</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Left Column: Personal Info */}
          <div className="bg-[#111] p-6 rounded-lg border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-[#8A2BE2]">
              Personal Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{profile?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white">{profile?.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Join Date</p>
                <p className="text-white">
                  {lifecycle?.joinDate ? formatDate(lifecycle.joinDate) : 
                   profile?.created_at ? formatDate(profile.created_at) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Gender</p>
                <p className="text-white">{profile?.gender || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">BMI</p>
                <p className="text-white">{profile?.BMI || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Workout Type</p>
                <p className="text-white">{profile?.workout_type || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Trainer Info */}
          <div className="bg-[#111] p-6 rounded-lg border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-[#8A2BE2]">
              Assigned Trainer
            </h2>
            {trainer ? (
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Name</p>
                  <p className="text-white font-semibold">{trainer.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{trainer.email}</p>
                </div>
                {trainer.specializations && trainer.specializations.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm">Specializations</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {trainer.specializations.map((spec, idx) => (
                        <span
                          key={idx}
                          className="bg-[#8A2BE2]/20 text-[#8A2BE2] px-2 py-1 rounded text-xs border border-[#8A2BE2]/50"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No trainer assigned.</p>
            )}
          </div>

          {/* Current Membership - Full width */}
          <div className="md:col-span-2 bg-[#111] p-6 rounded-lg border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-[#8A2BE2]">
              Current Membership
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="bg-[#1e1e3a] p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm mb-1">Plan Type</p>
                <p className="text-2xl font-bold text-white capitalize">
                  {activePayment?.membershipPlan || membership?.currentType || profile?.membershipType || "N/A"}
                </p>
              </div>
              <div className="bg-[#1e1e3a] p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm mb-1">Days Remaining</p>
                <p className="text-2xl font-bold text-[#8A2BE2]">
                  {membership?.daysRemaining || 
                   (activePayment ? Math.ceil((new Date(activePayment.paymentDate).setMonth(new Date(activePayment.paymentDate).getMonth() + 6) - new Date()) / (1000 * 60 * 60 * 24)) : 0)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Start Date</p>
                <p className="text-white">
                  {activePayment ? formatDate(activePayment.paymentDate) :
                   membership?.startDate ? formatDate(membership.startDate) : 
                   profile?.membershipDuration?.start_date ? formatDate(profile.membershipDuration.start_date) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Renewal Date</p>
                <p className="text-white">
                  {activePayment ? calculateEndDate(activePayment.paymentDate) :
                   membership?.endDate ? formatDate(membership.endDate) : 
                   profile?.membershipDuration?.end_date ? formatDate(profile.membershipDuration.end_date) : "N/A"}
                </p>
              </div>
            </div>

            {profile?.membershipDuration?.auto_renew && (
              <div className="mt-4 text-sm text-[#90ee90]">
                ⚡ Auto-renewal enabled
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="md:col-span-2 bg-[#111] p-6 rounded-lg border border-[#8A2BE2] shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-[#8A2BE2]">
              Payment History {!paymentsLoading && `(${userPayments.length} transactions)`}
            </h2>
            
            {paymentsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block w-6 h-6 border-2 border-[#8A2BE2] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-400">Loading payments...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                      <th className="p-3 text-left text-sm font-semibold">Date</th>
                      <th className="p-3 text-left text-sm font-semibold">Plan</th>
                      <th className="p-3 text-left text-sm font-semibold">Amount</th>
                      <th className="p-3 text-left text-sm font-semibold">End Date</th>
                      <th className="p-3 text-left text-sm font-semibold">Status</th>
                      <th className="p-3 text-left text-sm font-semibold">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPayments.length > 0 ? (
                      sortedPayments.map((payment, idx) => {
                        const active = isMembershipActive(payment.paymentDate);
                        return (
                          <tr key={idx} className="border-b border-[#333] hover:bg-[#8A2BE2]/10">
                            <td className="p-3">{formatDate(payment.paymentDate)}</td>
                            <td className="p-3 capitalize">{payment.membershipPlan || "N/A"}</td>
                            <td className="p-3 font-mono">{formatCurrency(payment.amount)}</td>
                            <td className="p-3">{calculateEndDate(payment.paymentDate)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                active
                                  ? "bg-green-500/20 text-green-400 border border-green-500"
                                  : "bg-red-500/20 text-red-400 border border-red-500"
                              }`}>
                                {active ? "Active" : "Expired"}
                              </span>
                            </td>
                            <td className="p-3">
                              {payment.isRenewal ? (
                                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                                  Renewal
                                </span>
                              ) : (
                                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                                  New
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-400">
                          No payment history available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {sortedPayments.length > 0 && (
              <div className="mt-4 text-sm text-gray-400 border-t border-[#333] pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-gray-500">First Payment:</span>
                    <p className="text-white">{formatDate(sortedPayments[sortedPayments.length - 1]?.paymentDate)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Payment:</span>
                    <p className="text-white">{formatDate(sortedPayments[0]?.paymentDate)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg. Payment:</span>
                    <p className="text-white">{formatCurrency(totalSpent / sortedPayments.length)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Renewal Rate:</span>
                    <p className="text-white">{((renewalsCount / sortedPayments.length) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUserDetail;