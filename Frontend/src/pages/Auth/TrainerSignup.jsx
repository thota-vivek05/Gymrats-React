// src/pages/Auth/TrainerSignup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './LoginSignup.module.css';

const TrainerSignup = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        experience: '',
        specializations: [],
        termsAgree: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox' && name === 'specializations') {
            const updatedSpecializations = checked
                ? [...formData.specializations, value]
                : formData.specializations.filter(spec => spec !== value);
            
            setFormData(prev => ({
                ...prev,
                specializations: updatedSpecializations
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
        setError('');
    };

    const validateForm = () => {
        const requiredFields = [
            'firstName', 'lastName', 'email', 'password', 'confirmPassword',
            'phone', 'experience'
        ];

        for (let field of requiredFields) {
            if (!formData[field]) {
                setError(`Please fill in all fields`);
                return false;
            }
        }

        // Name validation
        if (!/^[A-Za-z\s]{2,50}$/.test(formData.firstName)) {
            setError('Please enter a valid first name');
            return false;
        }

        if (!/^[A-Za-z\s]{2,50}$/.test(formData.lastName)) {
            setError('Please enter a valid last name');
            return false;
        }

        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        // Password validation
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        // Password match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        // Phone validation
        const cleanedPhone = formData.phone.replace(/\D/g, '');
        if (!/^\d{10}$/.test(cleanedPhone)) {
            setError('Please enter a valid 10-digit phone number');
            return false;
        }

        // Specializations validation
        if (formData.specializations.length === 0) {
            setError('Please select at least one specialization');
            return false;
        }

        // Terms agreement
        if (!formData.termsAgree) {
            setError('You must agree to the terms and conditions');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/trainer/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    phone: formData.phone.replace(/\D/g, '')
                }),
            });

            const data = await response.json();

            if (data.message === 'Trainer application submitted successfully') {
                navigate('/login', { 
                    state: { 
                        message: 'Trainer application submitted successfully! Please wait for verification.' 
                    } 
                });
            } else {
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const specializationsList = [
        'Calisthenics',
        'Weight Loss',
        'HIIT',
        'Competitive',
        'Strength Training',
        'Cardio',
        'Flexibility',
        'Bodybuilding'
    ];

    return (
        <div className={styles.authContainer}>
            <div className={styles.authHeader}>
                <h2>Become a Trainer</h2>
                <p>Join our team of fitness professionals</p>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <h3>Personal Information</h3>
                <div className={styles.formGroup}>
                    <label htmlFor="firstName">First Name *</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className={styles.formControl}
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className={styles.formControl}
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address *</label>
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
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className={styles.formControl}
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit phone number"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password">Password *</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className={styles.formControl}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword">Confirm Password *</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className={styles.formControl}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                    />
                </div>

                <h3>Professional Details</h3>
                <div className={styles.formGroup}>
                    <label htmlFor="experience">Years of Experience *</label>
                    <select
                        id="experience"
                        name="experience"
                        className={styles.formControl}
                        value={formData.experience}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select experience</option>
                        <option value="1-2">1-2 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Specializations *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {specializationsList.map(spec => (
                            <label key={spec} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="specializations"
                                    value={spec}
                                    checked={formData.specializations.includes(spec)}
                                    onChange={handleChange}
                                />
                                {spec}
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            name="termsAgree"
                            checked={formData.termsAgree}
                            onChange={handleChange}
                            required
                        />
                        I agree to the <a href="/terms" className={styles.termsLink}>terms and conditions</a> *
                    </label>
                </div>

                <button 
                    type="submit" 
                    className={styles.btn}
                    disabled={loading}
                >
                    {loading ? 'Submitting Application...' : 'Apply as Trainer'}
                </button>

                <div className={styles.alternateAction}>
                    <p>
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                    <p>
                        Want to join as a member? <Link to="/signup/user">Sign up as Member</Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default TrainerSignup;