import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import DashboardHeader from './components/DashboardHeader';
// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const UserProfile = () => {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        dob: '',
        height: '',
        weight: '',
        BMI: ''
    });

    // Modal States
    const [showMembershipModal, setShowMembershipModal] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    // Membership Selection State
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(null);

    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const [paymentErrors, setPaymentErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    // Helper: Format Card Number (Adds space every 4 digits)
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const parts = [];
        for (let i = 0; i < v.length; i += 4) {
            parts.push(v.substring(i, i + 4));
        }
        return parts.length > 1 ? parts.join(' ') : value;
    };

    // Helper: Format Expiry Date (Adds slash after 2 digits)
    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }
        return v;
    };

    // Handle Payment Input Changes
    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cardNumber') {
            formattedValue = formatCardNumber(value);
        } else if (name === 'expiryDate') {
            if (value.length < paymentDetails.expiryDate.length) {
                formattedValue = value; 
            } else {
                formattedValue = formatExpiryDate(value);
            }
        } else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').slice(0, 4);
        }

        setPaymentDetails(prev => ({ ...prev, [name]: formattedValue }));
        
        if (paymentErrors[name]) {
            setPaymentErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate Payment Fields
    const validatePayment = () => {
        const errors = {};
        const { cardNumber, expiryDate, cvv } = paymentDetails;

        const cleanCardNum = cardNumber.replace(/\s/g, '');
        if (cleanCardNum.length !== 16) {
            errors.cardNumber = 'Card number must be 16 digits';
        }

        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            errors.expiryDate = 'Format must be MM/YY';
        } else {
            const [month, year] = expiryDate.split('/').map(Number);
            const now = new Date();
            const currentYear = now.getFullYear() % 100;
            const currentMonth = now.getMonth() + 1;

            if (month < 1 || month > 12) {
                errors.expiryDate = 'Invalid month';
            } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                errors.expiryDate = 'Card has expired';
            }
        }

        if (cvv.length < 3) {
            errors.cvv = 'Invalid CVV';
        }

        setPaymentErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle Payment Submission
    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        
        if (validatePayment()) {
            setIsProcessing(true);
            setTimeout(() => {
                setIsProcessing(false);
                alert('Payment Successful!');
                setShowMembershipModal(false);
                setShowPayment(false);
                setPaymentDetails({ cardNumber: '', expiryDate: '', cvv: '' });
            }, 2000);
        }
    };

    // Initialize data
    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                height: user.height || '',
                weight: user.weight || '',
                BMI: user.BMI || ''
            });
        }
    }, [user]);

    // Input Handler
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

    // Save Profile Handler
    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            // Mock API call simulation
            await new Promise(resolve => setTimeout(resolve, 1000));
            // login({ ...user, ...formData }, localStorage.getItem('token')); 
            alert('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
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
        } catch {
            return 'Invalid Date';
        }
    };

    // Chart Options & Data
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#aaa' } },
            x: { grid: { display: false }, ticks: { color: '#aaa' } }
        }
    };

    const workoutData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
            label: 'Workouts',
            data: [10, 12, 8, 12],
            backgroundColor: '#8A2BE2',
            borderRadius: 4,
        }]
    };

    const weightData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
            label: 'Weight (kg)',
            data: [77, 76.5, 75.8, 75],
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            tension: 0.4,
            pointBackgroundColor: '#2ecc71'
        }]
    };

    return (
        <div className="min-h-screen bg-black text-[#f1f1f1] font-sans pb-20">
         <DashboardHeader user={user} currentPage="profile" />
            {/* Profile Hero */}
            <section className="relative h-[250px] flex items-center justify-center text-center px-5 bg-cover bg-center" 
                style={{backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?q=80&w=2070&auto=format&fit=crop')"}}>
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">My Profile</h1>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">View and manage your personal information and statistics</p>
                </div>
            </section>

            {/* Main Content Container */}
            <div className="max-w-[1200px] mx-auto px-5 py-10">
                
                {/* Top Section: Info & Membership */}
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mb-8">
                    
                    {/* User Information Card */}
                    <div className="bg-[#161616] rounded-xl overflow-hidden shadow-lg border border-[#333]/50">
                        <div className="p-5 flex justify-between items-center border-b border-[#333]">
                            <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                            {!isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 bg-gradient-to-br from-[#8A2BE2] to-[#4A00E0] text-white px-4 py-2 rounded-md text-sm font-medium hover:scale-105 transition-transform shadow-lg shadow-purple-900/20"
                                >
                                    <i className="fas fa-edit"></i> Edit
                                </button>
                            )}
                        </div>
                        
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <span className="inline-block bg-gradient-to-br from-[#8A2BE2] to-[#9400D3] text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-md shadow-purple-900/30">
                                    {user?.status || 'Active Member'}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Form Fields Generator */}
                                {[
                                    { label: 'Name', key: 'full_name', type: 'text' },
                                    { label: 'Email', key: 'email', type: 'email' },
                                    { label: 'Phone', key: 'phone', type: 'tel' },
                                    { label: 'Age', key: 'dob', type: 'date', display: (val) => calculateAge(val) },
                                    { label: 'Height', key: 'height', type: 'number', suffix: 'cm' },
                                    { label: 'Weight', key: 'weight', type: 'number', suffix: 'kg' },
                                    { label: 'BMI', key: 'BMI', type: 'number', readOnly: true }
                                ].map((field) => (
                                    <div key={field.key} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors duration-300">
                                        <span className="block text-xs uppercase tracking-wider text-[#8A2BE2] font-semibold mb-1">
                                            {field.label}:
                                        </span>
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
                                                className={`w-full bg-[#222] border border-[#444] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#8A2BE2] focus:ring-1 focus:ring-[#8A2BE2] transition-all ${field.readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                placeholder={!field.readOnly && `Enter ${field.label}`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Edit Action Buttons */}
                            {isEditing && (
                                <div className="flex gap-3 mt-6 justify-end animate-fade-in">
                                    <button 
                                        onClick={handleSaveProfile} 
                                        disabled={loading}
                                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button 
                                        onClick={() => setIsEditing(false)}
                                        className="bg-transparent border border-gray-600 text-gray-300 hover:bg-white/10 px-5 py-2 rounded-md font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Membership Card */}
                    <div className="bg-[#161616] rounded-xl overflow-hidden shadow-lg border border-[#333]/50 h-fit">
                        <div className="p-5 border-b border-[#333]">
                            <h2 className="text-xl font-semibold text-white">Membership Details</h2>
                        </div>
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <div className="inline-block bg-gradient-to-r from-[#daa520] to-[#ffd700] text-black px-6 py-2 rounded-lg font-bold text-lg mb-2 shadow-lg shadow-yellow-900/20">
                                    {user?.membershipType || 'Basic'} Member
                                </div>
                                <p className="text-sm text-[#aaa]">
                                    Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Mar 15, 2023'}
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b border-[#333]">
                                    <span className="text-[#aaa]">Plan:</span>
                                    <span className="font-semibold">{user?.membershipType || 'Basic'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-[#333]">
                                    <span className="text-[#aaa]">Status:</span>
                                    <span className="font-semibold text-[#4CAF50]">{user?.status || 'Active'}</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="font-medium text-white mb-3">Features Included:</h3>
                                <ul className="space-y-2 text-sm text-[#ccc]">
                                    <li className="flex items-center gap-2">
                                        <i className="fas fa-check text-[#4CAF50]"></i> Access to Exercise Guide
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <i className="fas fa-check text-[#4CAF50]"></i> {user?.membershipType === 'Basic' ? 'Basic' : 'Advanced'} Workout Plans
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <i className={`fas ${user?.membershipType === 'Platinum' ? 'fa-check text-[#4CAF50]' : 'fa-times text-red-400'}`}></i> Personal Training
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                     <div className="bg-[#222] rounded-xl p-6 h-[350px] border border-[#333] shadow-md hover:border-[#8A2BE2]/30 transition-colors">
                        <h3 className="text-center text-lg font-medium mb-4 text-gray-200">Workout Frequency</h3>
                        <div className="h-[250px] w-full">
                            <Bar data={workoutData} options={chartOptions} />
                        </div>
                     </div>
                     <div className="bg-[#222] rounded-xl p-6 h-[350px] border border-[#333] shadow-md hover:border-[#8A2BE2]/30 transition-colors">
                        <h3 className="text-center text-lg font-medium mb-4 text-gray-200">Weight Progress</h3>
                        <div className="h-[250px] w-full">
                            <Line data={weightData} options={chartOptions} />
                        </div>
                     </div>
                </div>

                {/* Membership Extension Card */}
                <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl overflow-hidden shadow-lg border-0">
                    <div className="p-5 border-b border-white/10">
                        <h2 className="text-xl font-semibold text-white">Extend Membership</h2>
                    </div>
                    <div className="p-6 text-center">
                        <p className="text-white/90 mb-6 text-lg">Extend your membership to continue enjoying all premium features!</p>
                        <button 
                            onClick={() => setShowMembershipModal(true)}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#FFA000] text-[#333] px-8 py-3 rounded-full font-bold text-base hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-500/20 transition-all active:translate-y-0"
                        >
                            <i className="fas fa-credit-card"></i> Extend / Change Membership
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
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
                            {/* Plan Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                                {['basic', 'gold', 'platinum'].map(plan => (
                                    <div 
                                        key={plan}
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`cursor-pointer border-2 rounded-xl p-5 transition-all duration-300 hover:border-[#8A2BE2] bg-[#222] ${selectedPlan === plan ? 'border-[#8A2BE2] bg-[#8A2BE2]/10' : 'border-[#333]'}`}
                                    >
                                        <h4 className="text-[#daa520] text-xl font-bold capitalize mb-4">{plan} Plan</h4>
                                        <ul className="space-y-2 text-sm text-[#ccc]">
                                            <li className="flex items-center gap-2"><i className="fas fa-check text-green-500"></i> Feature 1</li>
                                            <li className="flex items-center gap-2"><i className="fas fa-check text-green-500"></i> Feature 2</li>
                                            {plan === 'basic' && <li className="flex items-center gap-2"><i className="fas fa-times text-red-500"></i> No Coach</li>}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Duration Selection */}
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

                          {/* Payment Section */}
                          {showPayment && (
                              <div className="border-t border-[#333] pt-6 animate-in slide-in-from-bottom-4 duration-500">
                                  <h3 className="text-xl font-semibold mb-4 text-white">Payment Details</h3>
                                  <div className="bg-[#333] p-4 rounded-lg mb-6 text-gray-200">
                                      <p className="flex justify-between mb-1"><span>Plan:</span> <span className="capitalize font-bold">{selectedPlan}</span></p>
                                      <p className="flex justify-between"><span>Duration:</span> <span className="font-bold">{selectedDuration} Months</span></p>
                                  </div>
                                  
                                  {/* UPDATED FORM: Connected to state and validation functions */}
                                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
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
                                          {isProcessing ? (
                                              <>
                                                  <i className="fas fa-circle-notch fa-spin"></i> Processing...
                                              </>
                                          ) : (
                                              'Process Payment'
                                          )}
                                      </button>
                                  </form>
                              </div>
                          )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;