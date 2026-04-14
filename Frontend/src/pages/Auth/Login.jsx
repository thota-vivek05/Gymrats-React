import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Updated import to 'react-router-dom' for best practice
// REMOVE: import { useAuth } from '../../context/AuthContext'; 
import { useDispatch, useSelector } from 'react-redux'; //
import { loginUser, clearError, googleAuthSuccess } from '../../redux/slices/authSlice'; // Import Redux actions
import { FaEye, FaEyeSlash } from 'react-icons/fa';


import Modal from './Modal';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';

import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'user'
    });

    // --- 1. REPLACE LOCAL LOADING STATE WITH REDUX STATE ---
    // REMOVED: const [loading, setLoading] = useState(false); 
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);
    // -------------------------------------------------------

    const [modal, setModal] = useState({ visible: false, type: '', message: '' });
    const navigate = useNavigate();

    // Modal Handlers
    const showModal = (type, message) => {
        setModal({ visible: true, type, message });
        document.body.style.overflow = 'hidden';
    };
    
    const [showPassword, setShowPassword] = useState(false);

    const closeModal = () => {
        // Clear Redux errors when closing modal if strictly needed, or just close modal
        dispatch(clearError()); 
        setModal({ visible: false, type: '', message: '' });
        document.body.style.overflow = 'auto';
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

       // ==========================================
  // GOOGLE LOGIN HANDLER
  // ==========================================
const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        // 1. Dispatch to Redux to globally establish the session
        dispatch(googleAuthSuccess({ user: data.user, token: data.token }));
        
        showModal('success', 'Google Login successful! Redirecting...');
        
        setTimeout(() => {
            closeModal();

            // 2. Route directly to the appropriate dashboard based on role
            if (data.user.role === 'admin') navigate('/admin/dashboard');
            else if (data.user.role === 'trainer') navigate('/trainer');
            else navigate('/dashboard'); 
        }, 1000);
      } else {
        // If the user doesn't exist (the 404 we set up on the backend)
        showModal('error', data.message || 'Account not found. Please sign up first.');
      }
    } catch (err) {
      showModal('error', 'An error occurred during Google Login.');
      console.error(err);
    }
  };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // --- 2. REMOVE MANUAL LOADING TOGGLES (Redux does this) ---
        // REMOVED: setLoading(true); 

        // Dispatch the login action
        const resultAction = await dispatch(loginUser(formData));

        if (loginUser.fulfilled.match(resultAction)) {
            const user = resultAction.payload.user;
            
            showModal('success', 'Login successful! Redirecting...');
            
            setTimeout(() => {
                setModal({ visible: false, type: '', message: '' }); // Close modal without dispatching clearError to keep state clean during redirect
                document.body.style.overflow = 'auto';

                if (user.role === 'trainer') {
                    navigate('/trainer');
                } else {
                    navigate('/dashboard');
                }
            }, 1000);
        } else {
            // Login failed
            showModal('error', resultAction.payload || 'Login failed');
        }
        
        // REMOVED: setLoading(false); (Redux sets loading to false automatically on failure)
    };

    // Shared Styles
    // Suggested update to your existing shared style
const inputClasses = "w-full p-[12px] bg-[#222222] border border-[#444444] rounded-[5px] text-white text-[1rem] focus:border-[#8A2BE2] focus:outline-none transition-colors pr-[45px]";
const labelClasses = "block mb-[8px] text-[#f1f1f1]";

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            
            <div className="flex-1 flex justify-center items-center py-[40px] px-[20px] bg-[linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7)),url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1740&auto=format&fit=crop')] bg-cover bg-center bg-fixed bg-no-repeat">
                
                <Modal 
                    type={modal.type}
                    message={modal.message}
                    visible={modal.visible}
                    onClose={closeModal}
                />

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

                        <div className="mb-[20px] relative"> {/* Add relative here for icon positioning */}
                            <label className="block text-[#cccccc] mb-[8px] font-bold">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Enter your password"
                                    className="w-full p-[12px] bg-[#222222] border border-[#444444] rounded-[5px] text-white focus:outline-none focus:border-[#8A2BE2] pr-[45px]" // Added padding-right for icon
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-[12px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8A2BE2] transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash size={18}/> : <FaEye size={18}/>}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full p-[12px] bg-[#8A2BE2] text-white border-none rounded font-bold text-[1rem] cursor-pointer transition-all duration-300 hover:bg-[#7B25C9] disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={loading} 
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    {/* ADD THE GOOGLE BUTTON HERE */}
                    <div className="flex justify-center mt-[20px]">
                       <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.log('Google Login Failed');
                }}
                theme="filled_black"
                shape="pill"
              />
                    </div>
                    {/* END GOOGLE BUTTON */}

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