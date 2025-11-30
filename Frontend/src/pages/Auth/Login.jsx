import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import Modal from './Modal'; // This is already Tailwind-ready

import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'user'
    });
    const [loading, setLoading] = useState(false);
    
    // Modal State
    const [modal, setModal] = useState({ visible: false, type: '', message: '' });

    const navigate = useNavigate();
    const { login } = useAuth();

    // Modal Handlers
    const showModal = (type, message) => {
        setModal({ visible: true, type, message });
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setModal({ visible: false, type: '', message: '' });
        document.body.style.overflow = 'auto';
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                // Update auth state
                login(data.user, data.token);
                
                // Show Success Modal
                showModal('success', 'Login successful! Redirecting...');
                
                // Delay navigation to let user see the modal
                setTimeout(() => {
                    closeModal();
                    if (data.redirect) {
                        window.location.href = data.redirect;
                    } else {
                        navigate(data.user.role === 'user' ? '/dashboard' : '/trainer/dashboard');
                    }
                }, 1000);
            } else {
                showModal('error', data.error || 'Login failed');
            }
        } catch (error) {
            showModal('error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Shared Styles
    const inputClasses = "w-full p-[12px] bg-white/10 border border-[#333] rounded text-white text-[1rem] focus:border-[#8A2BE2] focus:outline-none transition-colors";
    const labelClasses = "block mb-[8px] text-[#f1f1f1]";

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            
            {/* Main Background Wrapper (Replaces .app and .mainContent) */}
            <div className="flex-1 flex justify-center items-center py-[40px] px-[20px] bg-[linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7)),url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1740&auto=format&fit=crop')] bg-cover bg-center bg-fixed bg-no-repeat">
                
                <Modal 
                    type={modal.type}
                    message={modal.message}
                    visible={modal.visible}
                    onClose={closeModal}
                />

                {/* Auth Card Container */}
                <div className="w-[400px] max-w-full bg-[#111]/95 rounded-[10px] p-[40px] shadow-[0_0_20px_rgba(138,43,226,0.3)] border border-[#8A2BE2] max-[768px]:p-[30px]">
                    
                    <div className="text-center mb-[30px]">
                        <h2 className="text-[2rem] mb-[10px] text-[#f1f1f1] font-bold">Welcome Back</h2>
                        <p className="text-[#cccccc]">Sign in to access your account</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-[20px]">
                            <label htmlFor="role" className={labelClasses}>I am a</label>
                            <select
                                id="role"
                                name="role"
                                className={inputClasses}
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="user" className="text-black">Member</option>
                                <option value="trainer" className="text-black">Trainer</option>
                            </select>
                        </div>

                        <div className="mb-[20px]">
                            <label htmlFor="email" className={labelClasses}>Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={inputClasses}
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="mb-[20px]">
                            <label htmlFor="password" className={labelClasses}>Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className={inputClasses}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full p-[12px] bg-[#8A2BE2] text-white border-none rounded font-bold text-[1rem] cursor-pointer transition-all duration-300 hover:bg-[#7B25C9] disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="text-center mt-[20px] text-[#cccccc]">
                        <p className="mb-2">
                            Don't have an account?{' '}
                            {formData.role === 'user' ? (
                                <Link to="/signup/user" className="text-[#8A2BE2] font-bold ml-[5px] no-underline hover:text-[#7B25C9]">
                                    Sign up as Member
                                </Link>
                            ) : (
                                <Link to="/signup/trainer" className="text-[#8A2BE2] font-bold ml-[5px] no-underline hover:text-[#7B25C9]">
                                    Become a Trainer
                                </Link>
                            )}
                        </p>
                        <p>
                            <Link to="/forgot-password" className="text-[#8A2BE2] text-sm hover:underline">
                                Forgot your password?
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default Login;