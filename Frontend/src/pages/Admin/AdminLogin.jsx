import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Eye icon component - shows/hides password
const EyeIcon = ({ isVisible }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="w-5 h-5"
    >
        {isVisible ? (
            <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </>
        ) : (
            <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </>
        )}
    </svg>
);

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loginMessage, setLoginMessage] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper function for email validation
    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    // Handle real-time input and validation
    useEffect(() => {
        if (email.trim() && !isValidEmail(email.trim())) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    }, [email]);

    useEffect(() => {
        if (password && password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
        } else {
            setPasswordError('');
        }
    }, [password]);

    const validateForm = () => {
        let isValid = true;
        let newEmailError = '';
        let newPasswordError = '';

        if (!email.trim()) {
            newEmailError = 'Email is required';
            isValid = false;
        } else if (!isValidEmail(email.trim())) {
            newEmailError = 'Please enter a valid email address';
            isValid = false;
        }

        if (!password) {
            newPasswordError = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            newPasswordError = 'Password must be at least 6 characters';
            isValid = false;
        }

        setEmailError(newEmailError);
        setPasswordError(newPasswordError);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginMessage({ type: '', message: '' });

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: email.trim(),
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                login(data.user, data.user.id);
                setLoginMessage({ type: 'success', message: 'Login successful. Redirecting...' });
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 500);
            } else {
                setLoginMessage({ type: 'error', message: data.message || 'Invalid credentials. Please try again.' });
            }

        } catch (error) {
            console.error('Login error:', error);
            setLoginMessage({ type: 'error', message: 'An error occurred. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // Container
        <div className="min-h-screen flex justify-center items-center bg-black p-6 md:p-12 relative overflow-hidden font-sans text-[#f1f1f1]">
            
            {/* Custom Animation Style Block */}
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>

            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#8A2BE2]/10 to-transparent opacity-30 pointer-events-none"></div>
            
            {/* Login Card */}
            <div className="
                w-full max-w-[420px] 
                p-6 md:p-12 
                rounded-lg 
                bg-[#1e1e1e]/60 
                backdrop-blur-md 
                shadow-[0_20px_60px_rgba(0,0,0,0.5)] 
                border border-[#8A2BE2]/30 
                relative z-10 
                animate-[slideUp_0.8s_ease-out]
            ">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="
                        inline-flex items-center justify-center 
                        w-14 h-14 
                        rounded-full 
                        bg-[#8A2BE2]/10 
                        border border-[#8A2BE2]/30 
                        mb-5
                    ">
                        <svg className="w-8 h-8 text-[#8A2BE2]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#f1f1f1] mb-3 tracking-tight">
                        Admin Portal
                    </h1>
                    <p className="text-sm md:text-[0.95rem] text-[#aaaaaa] leading-relaxed">
                        Secure access to manage your fitness platform
                    </p>
                </div>

                {/* Message Display */}
                {loginMessage.message && (
                    <div 
                        className={`
                            p-4 rounded-lg mb-6 text-center text-sm font-medium transition-all duration-300
                            ${loginMessage.type === 'error' 
                                ? 'bg-red-600/15 text-red-500 border border-red-600/30' 
                                : 'bg-green-500/15 text-green-400 border border-green-500/30'}
                        `}
                        role="alert"
                    >
                        {loginMessage.message}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} noValidate>
                    {/* Email Field */}
                    <div className="mb-6">
                        <label htmlFor="email" className="block mb-3 font-semibold text-sm text-[#f1f1f1] uppercase tracking-wide">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="admin@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                            className="
                                w-full px-4 py-3 
                                border border-[#8A2BE2]/30 rounded-lg 
                                bg-black/80 text-[#f1f1f1] 
                                text-[0.95rem] 
                                placeholder-[#666]
                                outline-none transition-all duration-300
                                focus:border-[#8A2BE2] focus:ring-[3px] focus:ring-[#8A2BE2]/20 focus:bg-black/90
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        />
                        {emailError && (
                            <span className="block mt-2 text-xs text-red-500 font-medium">
                                ✕ {emailError}
                            </span>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="mb-6">
                        <label htmlFor="password" className="block mb-3 font-semibold text-sm text-[#f1f1f1] uppercase tracking-wide">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                                className="
                                    w-full px-4 py-3 pr-12
                                    border border-[#8A2BE2]/30 rounded-lg 
                                    bg-black/80 text-[#f1f1f1] 
                                    text-[0.95rem] 
                                    placeholder-[#666]
                                    outline-none transition-all duration-300
                                    focus:border-[#8A2BE2] focus:ring-[3px] focus:ring-[#8A2BE2]/20 focus:bg-black/90
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                "
                            />
                            <button
                                type="button"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                className="
                                    absolute right-4 top-1/2 -translate-y-1/2
                                    bg-transparent border-none cursor-pointer
                                    text-[#999] hover:text-[#8A2BE2]
                                    transition-colors duration-300
                                    p-1 flex items-center justify-center
                                "
                                tabIndex="-1"
                            >
                                <EyeIcon isVisible={isPasswordVisible} />
                            </button>
                        </div>
                        {passwordError && (
                            <span className="block mt-2 text-xs text-red-500 font-medium">
                                ✕ {passwordError}
                            </span>
                        )}
                    </div>
                    
                    <input type="hidden" name="redirectUrl" value="/admin/dashboard" />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="
                            w-full py-3.5 mt-8 
                            bg-[#8A2BE2] text-white 
                            font-bold text-base 
                            border-2 border-[#8A2BE2] rounded-lg 
                            uppercase tracking-widest 
                            cursor-pointer transition-all duration-300
                            hover:bg-transparent hover:text-[#8A2BE2] hover:shadow-[0_0_20px_rgba(138,43,226,0.4)]
                            focus:outline-none focus:shadow-[0_0_0_3px_rgba(138,43,226,0.3)]
                            disabled:opacity-60 disabled:cursor-not-allowed
                        "
                    >
                        <span className="flex items-center justify-center gap-2">
                            {isSubmitting ? (
                                <>
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </span>
                    </button>
                </form>

                {/* Footer Section */}
                <div className="text-center mt-8 pt-6 border-t border-[#8A2BE2]/10">
                    <p className="text-xs text-[#888] uppercase tracking-widest">
                        🔒 Authorized Personnel Only
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;