import React, { useEffect, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import { useNavigate } from "react-router-dom";


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

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingTrainer, setEditingTrainer] = useState(null);
 const [editFormData, setEditFormData] = useState({ 
  name: "", 
  email: "", 
  phone: "", 
  experience: "", 
  specializations: [], 
  status: "Active", 
  meetingLink: "" 
});

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    experience: "",
    specializations: "",
    status: "Active"
  });

      useEffect(() => {
        fetchTrainers();
      }, []);
      
      useEffect(() => {
        const timer = setTimeout(() => {
          fetchTrainers(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
      }, [searchTerm]);


      const fetchTrainers = async (search = "") => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          let url = "/api/admin/trainers";
          if (search.trim()) {
            url = `/api/admin/trainers/search?search=${encodeURIComponent(search)}`;
          }
          
          const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success) {
            setTrainers(data.trainers || []);
            if (!search.trim() && data.stats) setStats(data.stats);
          }
        } catch (error) {
          console.error("Error fetching trainers:", error);
        } finally {
          setLoading(false);
        }
      };


  const handleDelete = async (id) => {
    if (!confirm("Delete this trainer?")) return;
    try {
      const token = localStorage.getItem("token");
      const token = localStorage.getItem("token");
      await fetch(`/api/admin/trainers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
        headers: { "Authorization": `Bearer ${token}` }
      });
      setTrainers(trainers.filter((t) => t._id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };



  // Shared container classes
  const containerClasses =
    "min-h-screen bg-black text-[#f1f1f1] font-sans flex flex-col";

  if (loading)
    return (
      <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
        <AdminSidebar />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-[#cccccc]">
          <div className="w-10 h-10 mb-5 border-4 border-[#333] border-t-[#8A2BE2] rounded-full animate-spin"></div>
          <p>Loading Trainers...</p>
        </div>
      </div>
    );


  const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    
    // Prepare specializations as array
    const specializationsArray = editFormData.specializations 
      ? (Array.isArray(editFormData.specializations) 
        ? editFormData.specializations 
        : editFormData.specializations.split(',').map(s => s.trim()))
      : [];
    
    const response = await fetch(`/api/admin/trainers/${editingTrainer._id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ 
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        experience: editFormData.experience,
        specializations: specializationsArray,
        status: editFormData.status,
        meetingLink: editFormData.meetingLink
      })
    });

    const data = await response.json();

    if (data.success) {
      setTrainers(trainers.map(t => 
        t._id === editingTrainer._id ? data.trainer : t
      ));
      setEditingTrainer(null);
      alert("Trainer updated successfully!");
    } else {
      alert("Server error: " + data.message);
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    alert("Failed to update trainer");
  }
};

const handleAddTrainer = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    
    const response = await fetch("/api/admin/trainers", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        ...addFormData,
        specializations: addFormData.specializations.split(',').map(s => s.trim())
      })
    });

    const data = await response.json();

    if (data.success) {
      setTrainers([data.trainer, ...trainers]);
      setIsAddModalOpen(false);
      setAddFormData({
        name: "", email: "", password: "", phone: "", 
        experience: "", specializations: "", status: "Active"
      });
      alert("Trainer added successfully!");
    } else {
      alert("Error: " + data.message);
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    alert("Failed to add trainer");
  }
};

  return (
    <div className="flex min-h-screen bg-black text-[#f1f1f1] font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {/* Page Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
          <h1 className="m-0 text-2xl font-bold md:text-3xl text-[#f1f1f1]">
            Trainer Management
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
            + Add Trainer
          </button>
        </div>
         {/* Search Bar */}
          <div className="mb-6 bg-[#111] p-4 rounded-lg border border-[#333]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search trainers by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1e1e3a] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#8A2BE2]"
              />
              <span className="absolute right-3 top-3 text-gray-500">🔍</span>
            </div>
          </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Trainers" value={stats?.totalTrainers || 0} />
          <StatCard
            label="Pending Approvals"
            value={stats?.pendingApprovals || 0}
          />
          <StatCard
            label="Active Trainers"
            value={stats?.activeTrainers || 0}
          />
          <StatCard
            label="Certifications"
            value={stats?.totalCertifications || 0}
          />
        </div>

        {/* Trainers Table */}
        <div className="bg-[#111] rounded-lg border border-[#8A2BE2] p-5 shadow-[0_4px_8px_rgba(138,43,226,0.3)]">
          <h2 className="pb-3 mb-5 text-xl font-semibold border-b border-[#8A2BE2] text-[#f1f1f1]">
            Trainer Directory
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-[#1e1e3a] border-b-2 border-[#8A2BE2]">
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Name
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Specializations
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Experience
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Status
                  </th>
                  <th className="p-3 text-sm font-semibold tracking-wider text-left uppercase text-[#f1f1f1]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {trainers.length > 0 ? (
                  trainers.map((t) => (
                    <tr
                      key={t._id}
                      className="border-b border-[#333] transition-colors duration-300 hover:bg-[#8A2BE2]/10"
                    >
                      <td className="p-3 text-[#f1f1f1]">{t.name}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1.5">
                          {t.specializations.map((s, i) => (
                            <span
                              key={i}
                              className="
                              bg-[#8A2BE2]/20 
                              text-[#8A2BE2] 
                              px-2 py-1 
                              rounded 
                              text-xs
                            "
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-[#f1f1f1]">
                        {t.experience} years
                      </td>
                      <td className="p-3">
                        <span
                          className={`
                          inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border
                          ${
                            t.status === "Active"
                              ? "bg-[#2e8b57]/20 text-[#90ee90] border-[#2e8b57]"
                              : "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]"
                          }
                        `}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                          <button
                            onClick={() => {
                              setEditingTrainer(t);
                              setEditFormData({ 
                                name: t.name || "",
                                email: t.email || "",
                                phone: t.phone || "",
                                experience: t.experience || "",
                                specializations: t.specializations || [],
                                status: t.status || "Active",
                                meetingLink: t.meetingLink || "" 
                              });
                            }}
                            className="px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300 bg-[#8A2BE2]/20 text-[#8A2BE2] hover:bg-[#8A2BE2]/30"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(t._id)}
                            className="
                              px-3 py-1.5 rounded text-sm font-semibold transition-all duration-300
                              bg-[#ff6b6b]/20 text-[#ff6b6b] hover:bg-[#ff6b6b]/30
                            "
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-[#cccccc]">
                      <p>No trainers found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
{editingTrainer && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-md shadow-2xl">
      <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">Edit {editingTrainer.name}</h2>
      <form onSubmit={handleUpdate}>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Name</label>
          <input
            type="text"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={editFormData.name}
            onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Email</label>
          <input
            type="email"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={editFormData.email}
            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Phone</label>
          <input
            type="text"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={editFormData.phone}
            onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Experience</label>
          <select
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={editFormData.experience}
            onChange={(e) => setEditFormData({...editFormData, experience: e.target.value})}
            required
          >
            <option value="">Select Experience</option>
            <option value="1-2">1-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Specializations (comma separated)</label>
          <input
            type="text"
            placeholder="e.g., Calisthenics, Strength Training"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={Array.isArray(editFormData.specializations) ? editFormData.specializations.join(', ') : editFormData.specializations}
            onChange={(e) => setEditFormData({...editFormData, specializations: e.target.value})}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Status</label>
          <select
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={editFormData.status}
            onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Meeting Link</label>
          <input
            type="url"
            placeholder="https://meet.google.com/..."
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={editFormData.meetingLink}
            onChange={(e) => setEditFormData({...editFormData, meetingLink: e.target.value})}
          />
        </div>
        <div className="flex gap-4">
          <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">
            Save Changes
          </button>
          <button type="button" onClick={() => setEditingTrainer(null)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
{isAddModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div className="bg-[#111] border border-[#8A2BE2] p-8 rounded-lg w-full max-w-md shadow-2xl">
      <h2 className="text-xl font-bold text-[#f1f1f1] mb-4">Add New Trainer</h2>
      <form onSubmit={handleAddTrainer}>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Name*</label>
          <input
            type="text"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={addFormData.name}
            onChange={(e) => setAddFormData({...addFormData, name: e.target.value})}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Email*</label>
          <input
            type="email"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={addFormData.email}
            onChange={(e) => setAddFormData({...addFormData, email: e.target.value})}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Password*</label>
          <input
            type="password"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={addFormData.password}
            onChange={(e) => setAddFormData({...addFormData, password: e.target.value})}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Phone*</label>
          <input
            type="text"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={addFormData.phone}
            onChange={(e) => setAddFormData({...addFormData, phone: e.target.value})}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Experience*</label>
          <select
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={addFormData.experience}
            onChange={(e) => setAddFormData({...addFormData, experience: e.target.value})}
            required
          >
            <option value="">Select Experience</option>
            <option value="1-2">1-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Specializations (comma separated)</label>
          <input
            type="text"
            placeholder="e.g., Calisthenics, Strength Training"
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={addFormData.specializations}
            onChange={(e) => setAddFormData({...addFormData, specializations: e.target.value})}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#cccccc] mb-2">Status</label>
          <select
            className="w-full bg-black border border-[#333] rounded p-3 text-white"
            value={addFormData.status}
            onChange={(e) => setAddFormData({...addFormData, status: e.target.value})}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
        <div className="flex gap-4">
          <button type="submit" className="flex-1 bg-[#8A2BE2] text-white py-2 rounded font-bold hover:bg-[#7020a0]">
            Add Trainer
          </button>
          <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-[#333] text-white py-2 rounded font-bold hover:bg-[#444]">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminTrainers;
