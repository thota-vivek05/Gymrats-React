import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TrainerProfile = () => {
  const [trainer, setTrainer] = useState({ name: 'Trainer' });
  const [kpis, setKpis] = useState({
    activeClients: 0,
    mrr: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [expiringClients, setExpiringClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const API_BASE = '/api/trainer';

  useEffect(() => {
    // Get basic trainer info from local storage
    const trainerData = JSON.parse(localStorage.getItem('user') || '{}');
    if (trainerData.name || trainerData.firstName) {
        setTrainer({ name: trainerData.name || `${trainerData.firstName} ${trainerData.lastName}` });
    }
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch both APIs simultaneously for speed
      const [kpiRes, expiringRes] = await Promise.all([
        fetch(`${API_BASE}/business-kpis`, { headers }),
        fetch(`${API_BASE}/expiring-clients`, { headers })
      ]);

      if (kpiRes.ok) {
        const kpiData = await kpiRes.json();
        setKpis(kpiData);
      }
      
      if (expiringRes.ok) {
        const expiringData = await expiringRes.json();
        setExpiringClients(expiringData.expiringClients || []);
      }
    } catch (error) {
      console.error("Error fetching business data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-[#8A2BE2] text-xl font-bold">
        Loading Business Intelligence...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-[#f1f1f1] text-sm font-['Outfit',_sans-serif]">
      {/* Inject Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
      `}</style>

      {/* Top Navigation Bar */}
      <div className="bg-[#111] border-b border-[#333] p-[20px] sticky top-0 z-[100]">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center w-[90%]">
            <h1 className="text-[1.5rem] font-bold text-white">Business <span className="text-[#8A2BE2]">Profile</span></h1>
            <button 
                onClick={() => navigate('/trainer')}
                className="px-4 py-2 bg-transparent border border-[#8A2BE2] text-[#8A2BE2] rounded hover:bg-[#8A2BE2] hover:text-white transition-colors"
            >
                Back to Dashboard
            </button>
        </div>
      </div>

      <div className="max-w-[1200px] w-[90%] mx-auto mt-[30px] flex-1">
        
        {/* Profile Header */}
        <div className="bg-[#1e1e3a] p-[30px] rounded-lg mb-[30px] border border-[#8A2BE2] shadow-[0_4px_15px_rgba(138,43,226,0.15)] flex flex-col md:flex-row justify-between items-center gap-[20px]">
            <div>
                <h2 className="text-[2rem] font-bold text-white mb-[5px]">{trainer.name}'s Business Hub</h2>
                <div className="flex items-center gap-[10px] text-[#cccccc]">
                    <span className="text-[#ffc107] text-[1.2rem]">★ {kpis.averageRating}</span>
                    <span>({kpis.totalReviews} Platform Reviews)</span>
                </div>
            </div>
            <button 
                onClick={() => window.print()}
                className="px-6 py-3 bg-[#8A2BE2] text-white rounded font-bold hover:bg-[#7020a0] transition-colors shadow-[0_4px_10px_rgba(138,43,226,0.4)]"
            >
                Export Report
            </button>
        </div>

        {/* 4-Card KPI Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px] mb-[30px]">
            <div className="bg-[#111] p-[20px] rounded-lg border border-[#333] hover:border-[#8A2BE2] transition-colors">
                <h3 className="text-[#888] uppercase tracking-wider text-[0.8rem] mb-[10px]">Active Clients</h3>
                <p className="text-[2.5rem] font-bold text-white">{kpis.activeClients}</p>
            </div>
            
            <div className="bg-[#111] p-[20px] rounded-lg border border-[#333] hover:border-[#8A2BE2] transition-colors">
                <h3 className="text-[#888] uppercase tracking-wider text-[0.8rem] mb-[10px]">Monthly Recurring Rev</h3>
                <p className="text-[2.5rem] font-bold text-green-400">₹{kpis.mrr}</p>
            </div>

            <div className="bg-[#111] p-[20px] rounded-lg border border-[#333] hover:border-[#8A2BE2] transition-colors">
                <h3 className="text-[#888] uppercase tracking-wider text-[0.8rem] mb-[10px]">Total Lifetime Earnings</h3>
                <p className="text-[2.5rem] font-bold text-white">₹{kpis.totalEarnings}</p>
            </div>

            <div className="bg-[#111] p-[20px] rounded-lg border border-[#333] hover:border-[#8A2BE2] transition-colors">
                <h3 className="text-[#888] uppercase tracking-wider text-[0.8rem] mb-[10px]">Avg Revenue Per User</h3>
                <p className="text-[2.5rem] font-bold text-[#8A2BE2]">
                    ₹{kpis.activeClients > 0 ? Math.round(kpis.mrr / kpis.activeClients) : 0}
                </p>
            </div>
        </div>

        {/* Data Tables & Reputation Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[30px] mb-[30px]">
          
          {/* Expiring Clients Table (Takes up 2/3 width) */}
          <div className="lg:col-span-2 bg-[#111] p-[25px] rounded-lg border border-[#333] shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
            <h3 className="text-[1.2rem] font-bold text-white mb-[15px] border-b border-[#333] pb-[10px] flex justify-between items-center">
              <span>Attention Needed: Expiring Soon</span>
              <span className="bg-[#ff6347] text-white text-[0.7rem] px-[8px] py-[3px] rounded-full">
                {expiringClients.length}
              </span>
            </h3>
            
            <div className="overflow-x-auto">
              {expiringClients.length === 0 ? (
                <div className="text-[#888] py-[30px] text-center flex flex-col items-center">
                    <span className="text-[2rem] mb-[10px]">🎉</span>
                    <p>No clients expiring in the next 14 days. Great retention!</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[#888] border-b border-[#333]">
                      <th className="py-[10px] px-[10px] font-medium">Client Name</th>
                      <th className="py-[10px] px-[10px] font-medium">Email</th>
                      <th className="py-[10px] px-[10px] font-medium">Expiration Date</th>
                      <th className="py-[10px] px-[10px] font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiringClients.map((client) => (
                      <tr key={client._id} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
                        <td className="py-[12px] px-[10px] text-white font-medium">
    {client.user_id?.full_name || client.user_id?.email || 'Client'}
</td>
<td className="py-[12px] px-[10px] text-[#cccccc]">{client.user_id?.email}</td>
                        <td className="py-[12px] px-[10px] text-[#ff6347] font-semibold">
                            {new Date(client.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-[12px] px-[10px] text-right">
                          <button 
                            onClick={() => window.location.href = `mailto:${client.userId?.email}?subject=Your GymRats Membership is Expiring Soon!`}
                            className="bg-transparent border border-[#8A2BE2] text-[#8A2BE2] px-[12px] py-[6px] rounded hover:bg-[#8A2BE2] hover:text-white transition-colors text-[0.8rem]"
                          >
                            Send Reminder
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Reputation & Ratings Card (Takes up 1/3 width) */}
          <div className="bg-[#111] p-[25px] rounded-lg border border-[#333] shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
            <h3 className="text-[1.2rem] font-bold text-white mb-[15px] border-b border-[#333] pb-[10px]">Reputation Score</h3>
            <div className="flex flex-col items-center justify-center py-[20px]">
                <div className="text-[4rem] font-bold text-[#ffc107] leading-none mb-[10px]">
                    {kpis.averageRating}
                </div>
                <div className="flex text-[#ffc107] text-[1.5rem] mb-[10px]">
                    {'★'.repeat(Math.round(kpis.averageRating)) + '☆'.repeat(5 - Math.round(kpis.averageRating))}
                </div>
                <p className="text-[#888] text-center">Based on {kpis.totalReviews} client reviews</p>
                
                <div className="w-full mt-[30px] pt-[20px] border-t border-[#333]">
                    <h4 className="text-white font-bold mb-[10px]">Business Health</h4>
                    <div className="flex justify-between items-center mb-[5px]">
                        <span className="text-[#cccccc]">Client Retention</span>
                        <span className="text-green-400 font-bold">Excellent</span>
                    </div>
                    <div className="w-full bg-[#333] rounded-full h-[6px]">
                        <div className="bg-green-400 h-[6px] rounded-full w-[92%] shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                    </div>
                </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TrainerProfile;