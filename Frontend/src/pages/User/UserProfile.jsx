import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import DashboardHeader from './components/DashboardHeader';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const UserProfile = () => {
    // 1. Auth & User State
    const { user, logout } = useAuth();
    const [dbUser, setDbUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // NEW STATES: Purchase History & Account Settings
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

    // TRAINER MANAGEMENT STATES
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingData, setRatingData] = useState({ rating: 5, feedback: '' });
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [changeReason, setChangeReason] = useState('');

    // 2. Real Graph Data State
    const [graphData, setGraphData] = useState({
        workoutLabels: [],
        workoutValues: [],
        weightLabels: [],
        weightValues: []
    });

    // 3. Form State
    const [formData, setFormData] = useState({
        full_name: '', email: '', phone: '', dob: '', height: '', weight: '', BMI: '', weight_goal: '', calorie_goal: '', protein_goal: ''
    });

    // 4. Payment/Modal States
    const [showMembershipModal, setShowMembershipModal] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState({ cardNumber: '', expiryDate: '', cvv: '' });
    const [paymentErrors, setPaymentErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchAllData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                
                // Fetch User Profile, Stats, and Purchase History
                const [userRes, progressRes, statsRes, purchasesRes] = await Promise.all([
                    fetch('/api/user/profile', { headers }),
                    fetch('/api/exercise/progress', { headers }), 
                    fetch('/api/workout/weekly-stats', { headers }),
                    fetch('/api/user/purchases', { headers })
                ]);

                const userData = await userRes.json();
                const statsData = await statsRes.json();
                const purchasesData = purchasesRes.ok ? await purchasesRes.json() : { history: [] };

                // 1. Set User Data
                if (userData.success) {
                    setDbUser(userData.user);
                    setFormData({
                        full_name: userData.user.full_name || '',
                        email: userData.user.email || '',
                        phone: userData.user.phone || '',
                        dob: userData.user.dob ? new Date(userData.user.dob).toISOString().split('T')[0] : '',
                        height: userData.user.height || '',
                        weight: userData.user.weight || '',
                        BMI: userData.user.BMI || '',
                        weight_goal: userData.user.fitness_goals?.weight_goal || '',
                        calorie_goal: userData.user.fitness_goals?.calorie_goal || '',
                        protein_goal: userData.user.fitness_goals?.protein_goal || '',
                    });
                }

                // 2. Set Purchase History
                if (purchasesData.success) {
                    setPurchaseHistory(purchasesData.history);
                }

                // 3. Process Graph Data
                const newGraphData = { workoutLabels: [], workoutValues: [], weightLabels: [], weightValues: [] };

                if (statsData.success && statsData.weeklyStats) {
                    newGraphData.workoutLabels = statsData.weeklyStats.map(d => d.day);
                    newGraphData.workoutValues = statsData.weeklyStats.map(d => d.percentage);
                }

                if (statsData.success && statsData.weightHistory && statsData.weightHistory.length > 0) {
                    newGraphData.weightLabels = statsData.weightHistory.map(w => new Date(w.date).toLocaleDateString());
                    newGraphData.weightValues = statsData.weightHistory.map(w => w.weight);
                } else {
                    newGraphData.weightLabels = ['Current'];
                    newGraphData.weightValues = [userData.user?.weight || 0];
                }

                setGraphData(newGraphData);

            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };

        fetchAllData();
    }, []);

    // --- NEW ACCOUNT HANDLERS ---
    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(passwords)
            });
            const data = await res.json();
            if (data.success) {
                alert('Password updated successfully!');
                setShowPasswordModal(false);
                setPasswords({ currentPassword: '', newPassword: '' });
            } else {
                alert(data.error || 'Failed to update password');
            }
        } catch (err) { alert('Error updating password'); }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to deactivate your account? This action cannot be undone immediately.")) {
            try {
                const res = await fetch('/api/user/account', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                    alert("Account has been deactivated.");
                    logout();
                }
            } catch (err) { alert("Error deleting account"); }
        }
    };

    // --- TRAINER HANDLERS ---
    const isPlatinum = dbUser?.membershipType?.toLowerCase() === 'platinum';

    const submitTrainerRating = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/user/trainer/rate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ trainerId: dbUser?.trainer?._id, ...ratingData })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Trainer rated successfully! Thank you for your feedback.");
                setShowRatingModal(false);
                setRatingData({ rating: 5, feedback: '' });
            } else {
                alert(data.error || "Failed to submit rating");
            }
        } catch (err) { alert("Error submitting rating"); }
    };

    const handleRequestTrainerChange = async (e) => {
        e.preventDefault();
        if (changeReason.trim().length < 5) {
            alert("Please provide a valid reason (minimum 5 characters).");
            return;
        }
        try {
            const res = await fetch('/api/user/trainer/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ reason: changeReason })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                setShowChangeModal(false);
                setChangeReason('');
                // Refresh profile data
                const token = localStorage.getItem('token');
                const userRes = await fetch('/api/user/profile', { headers: { 'Authorization': `Bearer ${token}` } });
                const userData = await userRes.json();
                if (userData.success) setDbUser(userData.user);
            } else {
                alert(data.error || "Failed to request trainer change");
            }
        } catch (err) { alert("Error requesting trainer change"); }
    };

    // --- EXISTING HELPERS & HANDLERS ---
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const parts = [];
        for (let i = 0; i < v.length; i += 4) parts.push(v.substring(i, i + 4));
        return parts.length > 1 ? parts.join(' ') : value;
    };

    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        return v;
    };

    const calculateAge = (dob) => {
        if (!dob) return 'Not provided';
        try {
            const today = new Date();
            const birthDate = new Date(dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
            return `${age} years`;
        } catch { return 'Invalid Date'; }
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'cardNumber') formattedValue = formatCardNumber(value);
        if (name === 'expiryDate') formattedValue = formatExpiryDate(value);
        setPaymentDetails(prev => ({ ...prev, [name]: formattedValue }));
    };

    const validatePayment = () => {
        const errors = {};
        const { cardNumber, expiryDate, cvv } = paymentDetails;
        if (cardNumber.replace(/\s/g, '').length !== 16) errors.cardNumber = 'Card number must be 16 digits';
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) errors.expiryDate = 'Format must be MM/YY';
        if (cvv.length < 3) errors.cvv = 'Invalid CVV';
        setPaymentErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!selectedPlan) { alert("Please select a duration plan."); return; }
        setIsProcessing(true);
        setPaymentErrors({});

        if (!validatePayment()) { setIsProcessing(false); return; }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/membership/extend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ additionalMonths: selectedDuration, autoRenew: false })
            });

            const data = await response.json();

            if (data.success) {
                setShowMembershipModal(false); 
                setShowPayment(false); 
                setDbUser(prev => ({
                    ...prev,
                    membershipDuration: data.user.membershipDuration,
                    status: data.user.status
                }));
                alert(`Membership extended successfully! New end date: ${new Date(data.user.membershipDuration.end_date).toLocaleDateString()}`);
            } else { alert(data.message || 'Payment failed'); }
        } catch (error) { alert('Something went wrong. Please try again.'); } finally { setIsProcessing(false); }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if ((name === 'height' || name === 'weight') && newData.height && newData.weight) {
                const h = parseFloat(newData.height) / 100;
                const w = parseFloat(newData.weight);
                if (h > 0) newData.BMI = (w / (h * h)).toFixed(1);
            }
            return newData;
        });
    };

   const handleSaveProfile = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        
        try {
            // Force strict Number formatting and INCLUDE the email
            const payload = {
                full_name: formData.full_name,
                email: formData.email, // <--- THIS WAS MISSING
                phone: formData.phone,
                dob: formData.dob,
                height: Number(formData.height) || null,
                weight: Number(formData.weight) || null,
                fitness_goals: { 
                    weight_goal: Number(formData.weight_goal) || null, 
                    calorie_goal: Number(formData.calorie_goal) || null, 
                    protein_goal: Number(formData.protein_goal) || null 
                }
            };

            // Using the correct backend route
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            
            if (data.success || res.ok) {
                alert('Profile updated successfully!');
                // Update the UI with the fresh data from the backend
                if (data.user) setDbUser(data.user);
                setIsEditing(false);
            } else { 
                alert(data.message || data.error || 'Failed to update profile.'); 
            }
        } catch (error) { 
            console.error("Profile Save Error: ", error);
            alert('Error updating profile. Make sure the backend server is running.'); 
        } finally { 
            setLoading(false); 
        }
    };

    const chartOptions = {
        responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#aaa' } },
            x: { grid: { display: false }, ticks: { color: '#aaa' } }
        }
    };

    return (
        <div className="min-h-screen bg-black text-[#f1f1f1] font-sans pb-20">
            <DashboardHeader user={dbUser || user} currentPage="profile" />
            
            <section className="relative h-[250px] flex items-center justify-center text-center px-5 bg-cover bg-center" 
                style={{backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?q=80&w=2070&auto=format&fit=crop')"}}>
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">My Profile</h1>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">View and manage your personal information and statistics</p>
                </div>
            </section>

            <div className="max-w-[1200px] mx-auto px-5 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mb-8">
                    
                    {/* User Info Card */}
                    <div className="bg-[#161616] rounded-xl overflow-hidden shadow-lg border border-[#333]/50">
                        <div className="p-5 flex justify-between items-center border-b border-[#333]">
                            <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-gradient-to-br from-[#8A2BE2] to-[#4A00E0] text-white px-4 py-2 rounded-md text-sm font-medium hover:scale-105 transition-transform shadow-lg shadow-purple-900/20">
                                    <i className="fas fa-edit"></i> Edit
                                </button>
                            )}
                        </div>
                        
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <span className="inline-block bg-gradient-to-br from-[#8A2BE2] to-[#9400D3] text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-md shadow-purple-900/30">
                                    {dbUser?.status || 'Active Member'}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { label: 'Name', key: 'full_name', type: 'text' },
                                    { label: 'Email', key: 'email', type: 'email', readOnly: true },
                                    { label: 'Phone', key: 'phone', type: 'tel' },
                                    { label: 'Age', key: 'dob', type: 'date', display: (val) => calculateAge(val) },
                                    { label: 'Height', key: 'height', type: 'number', suffix: 'cm' },
                                    { label: 'Weight', key: 'weight', type: 'number', suffix: 'kg' },
                                    { label: 'BMI', key: 'BMI', type: 'number', readOnly: true },
                                    ...(isEditing ? [
                                        { label: 'Goal Weight', key: 'weight_goal', type: 'number', suffix: 'kg' },
                                        { label: 'Calorie Goal', key: 'calorie_goal', type: 'number', suffix: 'kcal' },
                                        { label: 'Protein Goal', key: 'protein_goal', type: 'number', suffix: 'g' }
                                    ] : [])
                                ].map((field) => (
                                    <div key={field.key} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors duration-300">
                                        <span className="block text-xs uppercase tracking-wider text-[#8A2BE2] font-semibold mb-1">{field.label}:</span>
                                        {!isEditing ? (
                                            <span className="text-lg font-medium text-gray-100">
                                                {field.display ? field.display(formData[field.key]) : (formData[field.key] || 'Not provided')} 
                                                {formData[field.key] && field.suffix ? ` ${field.suffix}` : ''}
                                            </span>
                                        ) : (
                                            <input 
                                                type={field.type} 
                                                name={field.key} 
                                                value={formData[field.key]} 
                                                onChange={handleInputChange}
                                                readOnly={field.readOnly}
                                                className={`w-full bg-[#222] border border-[#444] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#8A2BE2] transition-all ${field.readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {isEditing && (
                                <div className="flex gap-3 mt-6 justify-end">
                                    <button onClick={handleSaveProfile} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-medium transition-colors disabled:opacity-50">
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="bg-transparent border border-gray-600 text-gray-300 hover:bg-white/10 px-5 py-2 rounded-md font-medium transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Membership Details & Account Actions */}
                    <div className="flex flex-col gap-6">
                        {/* Membership Details Card */}
                        <div className="bg-[#161616] rounded-xl overflow-hidden shadow-lg border border-[#333]/50 h-fit">
                            <div className="p-5 border-b border-[#333]">
                                <h2 className="text-xl font-semibold text-white">Membership Details</h2>
                            </div>
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className="inline-block bg-gradient-to-r from-[#daa520] to-[#ffd700] text-black px-6 py-2 rounded-lg font-bold text-lg mb-2 shadow-lg shadow-yellow-900/20 capitalize">
                                        {dbUser?.membershipType || 'Basic'} Member
                                    </div>
                                    <p className="text-sm text-[#aaa]">
                                        Expires: {dbUser?.membershipDuration?.end_date ? new Date(dbUser.membershipDuration.end_date).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <button onClick={() => setShowMembershipModal(true)} className="w-full bg-[#8A2BE2] hover:bg-[#7a1bd2] text-white py-2 rounded mt-2 transition">Extend Membership</button>
                            </div>
                        </div>

                        {/* Account Settings Card */}
                        <div className="bg-[#161616] rounded-xl overflow-hidden shadow-lg border border-[#333]/50 h-fit">
                            <div className="p-5 border-b border-[#333]">
                                <h2 className="text-xl font-semibold text-white">Account Settings</h2>
                            </div>
                            <div className="p-6 flex flex-col gap-4">
                                <button onClick={() => setShowPasswordModal(true)} className="w-full bg-[#333] hover:bg-[#444] text-white py-2 rounded transition border border-gray-600">
                                    <i className="fas fa-key mr-2"></i> Change Password
                                </button>
                                <button onClick={handleDeleteAccount} className="w-full bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/50 py-2 rounded transition">
                                    <i className="fas fa-trash-alt mr-2"></i> Deactivate Account
                                </button>
                            </div>
                        </div>

                        {/* My Personal Trainer Card (Platinum Only) */}
                        {isPlatinum && (
                            <div className="bg-[#161616] rounded-xl overflow-hidden shadow-lg border border-[#333]/50 h-fit">
                                <div className="p-5 border-b border-[#333] flex items-center gap-3">
                                    <i className="fas fa-user-tie text-[#8A2BE2] text-xl"></i>
                                    <h2 className="text-xl font-semibold text-white">My Personal Trainer</h2>
                                </div>
                                <div className="p-6">
                                    {dbUser?.trainer ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8A2BE2] to-[#4A00E0] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-900/30">
                                                    {dbUser.trainer.name?.charAt(0)?.toUpperCase() || 'T'}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-semibold text-[#daa520]">{dbUser.trainer.name}</h4>
                                                    <p className="text-sm text-gray-400">{dbUser.trainer.email}</p>
                                                    {dbUser.trainer.specializations && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            <i className="fas fa-star text-yellow-500 mr-1"></i>
                                                            {dbUser.trainer.specializations.join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Pending change request notice */}
                                            {dbUser.trainer_change_request?.requested && (
                                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-400 text-sm flex items-center gap-2">
                                                    <i className="fas fa-hourglass-half"></i>
                                                    <span>Trainer change request pending. Awaiting admin approval.</span>
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => setShowRatingModal(true)}
                                                    className="w-full px-4 py-2.5 bg-[#8A2BE2]/20 border border-[#8A2BE2]/50 text-[#8A2BE2] hover:bg-[#8A2BE2] hover:text-white rounded-lg text-sm font-medium transition-all"
                                                >
                                                    <i className="fas fa-star mr-2"></i>Rate Trainer
                                                </button>
                                                {!dbUser.trainer_change_request?.requested && (
                                                    <button
                                                        onClick={() => setShowChangeModal(true)}
                                                        className="w-full px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-all"
                                                    >
                                                        <i className="fas fa-exchange-alt mr-2"></i>Request Trainer Change
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <div className="inline-block p-3 rounded-full bg-[#222] mb-3">
                                                <i className="fas fa-hourglass-half text-[#daa520] text-xl"></i>
                                            </div>
                                            <p className="text-gray-300 font-medium">No trainer assigned yet.</p>
                                            <p className="text-gray-500 text-sm mt-1">Our managers are pairing you with the perfect coach!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      <div className="bg-[#222] rounded-xl p-6 h-[350px] border border-[#333] shadow-md hover:border-[#8A2BE2]/30 transition-colors">
                        <h3 className="text-center text-lg font-medium mb-4 text-gray-200">Workout Frequency</h3>
                        <div className="h-[250px] w-full">
                            <Bar data={{
                                labels: graphData.workoutLabels,
                                datasets: [{ label: 'Completion (%)', data: graphData.workoutValues, backgroundColor: '#8A2BE2', borderRadius: 4 }]
                            }} options={chartOptions} />
                        </div>
                      </div>
                      <div className="bg-[#222] rounded-xl p-6 h-[350px] border border-[#333] shadow-md hover:border-[#8A2BE2]/30 transition-colors">
                        <h3 className="text-center text-lg font-medium mb-4 text-gray-200">Weight Progress</h3>
                        <div className="h-[250px] w-full">
                            <Line data={{
                                labels: graphData.weightLabels,
                                datasets: [{ label: 'Weight (kg)', data: graphData.weightValues, borderColor: '#2ecc71', backgroundColor: 'rgba(46, 204, 113, 0.2)', tension: 0.4, pointBackgroundColor: '#2ecc71' }]
                            }} options={chartOptions} />
                        </div>
                      </div>
                </div>

                {/* Purchase History Table */}
                <div className="bg-[#161616] rounded-xl overflow-hidden shadow-lg border border-[#333]/50 mb-8">
                    <div className="p-5 border-b border-[#333]">
                        <h2 className="text-xl font-semibold text-white">Purchase History</h2>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        {purchaseHistory.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-4">No recent purchases found.</p>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-[#333] text-[#8A2BE2]">
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Plan / Description</th>
                                        <th className="p-3">Amount</th>
                                        <th className="p-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchaseHistory.map((item) => (
                                        <tr key={item.id} className="border-b border-[#222] hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-gray-300">{new Date(item.date).toLocaleDateString()}</td>
                                            <td className="p-3 text-gray-300 capitalize">{item.plan} {item.type}</td>
                                            <td className="p-3 font-semibold text-white">₹{item.amount}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs ${item.status === 'Success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#161616] p-6 rounded-xl shadow-2xl border border-[#333] w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Change Password</h2>
                            <button onClick={() => setShowPasswordModal(false)} className="text-[#aaa] hover:text-[#8A2BE2] text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Current Password</label>
                                <input type="password" required value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} className="w-full bg-[#222] p-3 rounded border border-[#444] text-white focus:border-[#8A2BE2] focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">New Password</label>
                                <input type="password" required value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} className="w-full bg-[#222] p-3 rounded border border-[#444] text-white focus:border-[#8A2BE2] focus:outline-none" />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition">Cancel</button>
                                <button type="submit" className="bg-[#8A2BE2] hover:bg-[#7a1bd2] px-6 py-2 rounded text-white font-medium transition">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Membership Extension Modal */}
            {showMembershipModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={(e) => e.target === e.currentTarget && setShowMembershipModal(false)}
                >
                    <div className="bg-[#161616] w-full max-w-4xl rounded-xl shadow-2xl border border-[#333] max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-5 border-b border-[#333]">
                            <h2 className="text-2xl font-bold text-white">Change Membership Plan</h2>
                            <button onClick={() => setShowMembershipModal(false)} className="text-[#aaa] hover:text-[#8A2BE2] text-3xl leading-none">&times;</button>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                                {['basic', 'gold', 'platinum'].map(plan => (
                                    <div 
                                        key={plan}
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`cursor-pointer border-2 rounded-xl p-5 transition-all duration-300 hover:border-[#8A2BE2] bg-[#222] ${selectedPlan === plan ? 'border-[#8A2BE2] bg-[#8A2BE2]/10' : 'border-[#333]'}`}
                                    >
                                        <h4 className="text-[#daa520] text-xl font-bold capitalize mb-4">{plan} Plan</h4>
                                        <ul className="space-y-2 text-sm text-[#ccc]">
                                            <li className="flex items-center gap-2"><i className="fas fa-check text-green-500"></i> Exercise Guide</li>
                                            <li className="flex items-center gap-2"><i className="fas fa-check text-green-500"></i> Workout Plans</li>
                                            {plan !== 'basic' && <li className="flex items-center gap-2"><i className="fas fa-check text-green-500"></i> Personal Coach</li>}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            
                            {selectedPlan && (
                                <div className="mb-8 animate-in slide-in-from-bottom-2 duration-300">
                                    <h3 className="text-xl font-semibold mb-4 text-white">Select Duration</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[1, 3, 6].map(months => (
                                            <div 
                                                key={months} 
                                                onClick={() => { setSelectedDuration(months); setShowPayment(true); }}
                                                className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all bg-[#222] hover:border-[#8A2BE2] ${selectedDuration === months ? 'border-[#8A2BE2] bg-[#8A2BE2]/10' : 'border-[#333]'}`}
                                            >
                                                <h4 className="text-[#daa520] font-bold text-lg mb-1">{months} Month{months > 1 ? 's' : ''}</h4>
                                                {months > 1 && <span className="text-xs text-green-400 font-bold">Save {months === 3 ? '15%' : '25%'}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                          {showPayment && (
                              <div className="border-t border-[#333] pt-6 animate-in slide-in-from-bottom-4 duration-500">
                                  <h3 className="text-xl font-semibold mb-4 text-white">Payment Details</h3>
                                  <div className="bg-[#333] p-4 rounded-lg mb-6 text-gray-200">
                                      <p className="flex justify-between mb-1"><span>Plan:</span> <span className="capitalize font-bold">{selectedPlan}</span></p>
                                      <p className="flex justify-between"><span>Duration:</span> <span className="font-bold">{selectedDuration} Months</span></p>
                                  </div>
                                  
                                  <form onSubmit={handlePayment} className="space-y-4">
                                      <div>
                                          <label className="block text-gray-400 mb-1 text-sm">Card Number</label>
                                          <input 
                                              type="text" 
                                              name="cardNumber"
                                              value={paymentDetails.cardNumber}
                                              onChange={handlePaymentChange}
                                              placeholder="1234 5678 9012 3456" 
                                              maxLength="19" 
                                              className={`w-full bg-[#222] border ${paymentErrors.cardNumber ? 'border-red-500' : 'border-[#444]'} rounded p-3 text-white focus:outline-none focus:border-[#8A2BE2] transition-colors`}
                                          />
                                          {paymentErrors.cardNumber && <p className="text-red-500 text-xs mt-1">{paymentErrors.cardNumber}</p>}
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                          <div>
                                              <label className="block text-gray-400 mb-1 text-sm">Expiry</label>
                                              <input 
                                                  type="text" 
                                                  name="expiryDate"
                                                  value={paymentDetails.expiryDate}
                                                  onChange={handlePaymentChange}
                                                  placeholder="MM/YY" 
                                                  maxLength="5"
                                                  className={`w-full bg-[#222] border ${paymentErrors.expiryDate ? 'border-red-500' : 'border-[#444]'} rounded p-3 text-white focus:outline-none focus:border-[#8A2BE2]`} 
                                              />
                                              {paymentErrors.expiryDate && <p className="text-red-500 text-xs mt-1">{paymentErrors.expiryDate}</p>}
                                          </div>
                                          <div>
                                              <label className="block text-gray-400 mb-1 text-sm">CVV</label>
                                              <input 
                                                  type="text" 
                                                  name="cvv"
                                                  value={paymentDetails.cvv}
                                                  onChange={handlePaymentChange}
                                                  placeholder="123" 
                                                  maxLength="3" 
                                                  className={`w-full bg-[#222] border ${paymentErrors.cvv ? 'border-red-500' : 'border-[#444]'} rounded p-3 text-white focus:outline-none focus:border-[#8A2BE2]`} 
                                              />
                                              {paymentErrors.cvv && <p className="text-red-500 text-xs mt-1">{paymentErrors.cvv}</p>}
                                          </div>
                                      </div>

                                      <button 
                                          type="submit"
                                          disabled={isProcessing}
                                          className="w-full bg-[#8A2BE2] hover:bg-[#7a1bd2] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg mt-4 transition-all transform active:scale-[0.99] shadow-lg shadow-purple-900/40 flex justify-center items-center gap-2"
                                      >
                                          {isProcessing ? <><i className="fas fa-circle-notch fa-spin"></i> Processing...</> : 'Process Payment'}
                                      </button>
                                  </form>
                              </div>
                          )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- TRAINER RATING MODAL --- */}
            {showRatingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#161616] p-6 rounded-xl border border-[#333] shadow-2xl w-full max-w-sm">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-white">Rate Your Trainer</h2>
                            <button onClick={() => setShowRatingModal(false)} className="text-[#aaa] hover:text-white text-xl">&times;</button>
                        </div>
                        <form onSubmit={submitTrainerRating} className="space-y-5">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Rating (1 to 5 Stars)</label>
                                <div className="flex items-center gap-2 mb-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRatingData({...ratingData, rating: star})}
                                            className={`text-3xl focus:outline-none transition-colors duration-200 ${
                                                ratingData.rating >= star ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-gray-600 hover:text-gray-400'
                                            }`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 italic">Ratings of 2 stars or below will notify management for a review.</p>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Feedback / Comments</label>
                                <textarea
                                    rows="3"
                                    required
                                    value={ratingData.feedback}
                                    onChange={(e) => setRatingData({...ratingData, feedback: e.target.value})}
                                    className="w-full bg-[#222] border border-[#444] rounded-lg p-3 text-white focus:outline-none focus:border-[#8A2BE2] transition-colors"
                                    placeholder="Tell us about your experience..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowRatingModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-[#8A2BE2] hover:bg-[#7a1bd2] text-white rounded font-medium transition-colors">Submit Rating</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- TRAINER CHANGE REQUEST MODAL --- */}
            {showChangeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#161616] p-6 rounded-xl border border-[#333] shadow-2xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-white">Request Trainer Change</h2>
                            <button onClick={() => setShowChangeModal(false)} className="text-[#aaa] hover:text-white text-xl">&times;</button>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-5 text-yellow-400 text-sm">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            This will submit a request to admin. A new trainer will be assigned after approval.
                        </div>

                        <form onSubmit={handleRequestTrainerChange} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Reason for Change <span className="text-red-400">*</span></label>
                                <textarea
                                    rows="4"
                                    required
                                    minLength={5}
                                    value={changeReason}
                                    onChange={(e) => setChangeReason(e.target.value)}
                                    className="w-full bg-[#222] border border-[#444] rounded-lg p-3 text-white focus:outline-none focus:border-[#8A2BE2] transition-colors resize-none"
                                    placeholder="Please describe why you'd like a different trainer (min 5 characters)..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowChangeModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors">
                                    <i className="fas fa-paper-plane mr-2"></i>Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;