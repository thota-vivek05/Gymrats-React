import React, { useEffect, useState } from 'react';

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/trainers', { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
          setTrainers(data.trainers);
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Error fetching trainers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  const handleDelete = async (id) => {
    if(!confirm('Delete this trainer?')) return;
    try {
      await fetch(`http://localhost:3000/api/admin/trainers/${id}`, { 
        method: 'DELETE', 
        credentials: 'include' 
      });
      setTrainers(trainers.filter(t => t._id !== id));
    } catch(err) { alert('Failed to delete'); }
  };

  if (loading) return <div>Loading Trainers...</div>;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
         {/* You can display stats.totalTrainers, stats.pendingApprovals here similar to Users page */}
         <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-xs font-bold">Total Trainers</h3>
            <p className="text-2xl font-bold text-blue-600">{stats?.totalTrainers || 0}</p>
         </div>
         <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-xs font-bold">Pending Approvals</h3>
            <p className="text-2xl font-bold text-orange-500">{stats?.pendingApprovals || 0}</p>
         </div>
      </div>

      <div className="bg-white rounded border border-gray-200 p-4">
        <h2 className="text-lg font-bold mb-4">Trainer Directory</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Specializations</th>
                        <th className="p-3">Experience</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {trainers.map(t => (
                        <tr key={t._id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium">{t.name}</td>
                            <td className="p-3">
                                <div className="flex flex-wrap gap-1">
                                    {t.specializations.map((s, i) => (
                                        <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-xs">{s}</span>
                                    ))}
                                </div>
                            </td>
                            <td className="p-3">{t.experience} years</td>
                            <td className="p-3">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                    t.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {t.status}
                                </span>
                            </td>
                            <td className="p-3">
                                <button onClick={() => handleDelete(t._id)} className="text-red-500 hover:text-red-700">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTrainers;