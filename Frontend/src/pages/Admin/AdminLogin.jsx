// src/pages/Admin/AdminLogin.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminLogin.module.css';

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
    >
        {isVisible ? (
            // Eye-off icon
            <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </>
        ) : (
            // Eye icon
            <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </>
        )}
    </svg>
);


const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // Use AuthContext to store user data

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loginMessage, setLoginMessage] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper function for email validation
    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    // Handle real-time input and validation (as seen in the original JS)
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
            // Make actual API call to backend
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for session
                body: JSON.stringify({
                    email: email.trim(),
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store user data in AuthContext and localStorage
                // The login function from AuthContext handles localStorage automatically
                login(data.user, data.user.id); // Store user data and a token-like value
                
                setLoginMessage({ type: 'success', message: 'Login successful. Redirecting...' });
                
                // Navigate to admin dashboard after a short delay
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 500); // Reduced delay since we're setting state immediately
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
    
    
    // Background and text colors are matched to HomePage.module.css
    // Body: #000000
    // Card: rgba(30, 30, 30, 0.6)
    // Accent: #8A2BE2
    // Border: rgba(138, 43, 226, 0.3)

    return (
        <div className={styles.loginContainer}>
            <div className={styles.backgroundGradient}></div>
            
            <div className={styles.loginCard}>
                {/* Header Section */}
                <div className={styles.headerSection}>
                    <div className={styles.iconBadge}>
                        <svg className={styles.lockIcon} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className={styles.headerTitle}>Admin Portal</h1>
                    <p className={styles.headerSubtitle}>
                        Secure access to manage your fitness platform
                    </p>
                </div>

                {/* Message Display */}
                {loginMessage.message && (
                    <div 
                        className={`${styles.messageAlert} ${styles[loginMessage.type]}`}
                        role="alert"
                    >
                        {loginMessage.message}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} noValidate>
                    {/* Email Field */}
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>
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
                            className={styles.formInput}
                            disabled={isSubmitting}
                        />
                        {emailError && (
                            <span className={styles.errorMessage}>
                                ✕ {emailError}
                            </span>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Password
                        </label>
                        <div className={styles.passwordContainer}>
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.formInput}
                                disabled={isSubmitting}
                                style={{ paddingRight: '48px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                className={styles.passwordToggle}
                                tabIndex="-1"
                            >
                                <EyeIcon isVisible={isPasswordVisible} />
                            </button>
                        </div>
                        {passwordError && (
                            <span className={styles.errorMessage}>
                                ✕ {passwordError}
                            </span>
                        )}
                    </div>
                    
                    <input type="hidden" name="redirectUrl" value="/admin/dashboard" />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        <span className={styles.buttonContent}>
                            {isSubmitting ? (
                                <>
                                    <span className={styles.loadingDot}></span>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </span>
                    </button>
                </form>

                {/* Footer Section */}
                <div className={styles.footerSection}>
                    <p className={styles.footerText}>
                        🔒 Authorized Personnel Only
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;