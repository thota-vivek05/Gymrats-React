import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginSignup.module.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'user'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

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
                login(data.user, data.token);
                
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    navigate(data.user.role === 'user' ? '/dashboard' : '/trainer/dashboard');
                }
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authHeader}>
                <h2>Welcome Back</h2>
                <p>Sign in to access your account</p>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="role">I am a</label>
                    <select
                        id="role"
                        name="role"
                        className={styles.formControl}
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="user">Member</option>
                        <option value="trainer">Trainer</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className={styles.formControl}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className={styles.formControl}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    className={styles.btn}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div className={styles.alternateAction}>
                <p>
                    Don't have an account?{' '}
                    {formData.role === 'user' ? (
                        <Link to="/signup/user">Sign up as Member</Link>
                    ) : (
                        <Link to="/signup/trainer">Become a Trainer</Link>
                    )}
                </p>
                <p>
                    <Link to="/forgot-password">Forgot your password?</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;