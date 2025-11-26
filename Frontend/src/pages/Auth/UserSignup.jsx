// src/pages/Auth/UserSignup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './LoginSignup.module.css'; 

const UserSignup = () => {
    const [formData, setFormData] = useState({
        userFullName: '',
        dateOfBirth: '',
        gender: '',
        userEmail: '',
        phoneNumber: '',
        userPassword: '',
        userConfirmPassword: '',
        membershipPlan: '',
        membershipDuration: '1',
        cardType: '',
        cardNumber: '',
        expirationDate: '',
        cvv: '',
        weight: '',
        height: '',
        workoutType: '',
        weightGoal: '',
        terms: false
    });
    const [bmi, setBmi] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Price configuration
    const priceConfig = {
        basic: { 1: 299, 3: 750, 6: 1350, 12: 2400 },
        gold: { 1: 599, 3: 1550, 6: 2700, 12: 4800 },
        platinum: { 1: 999, 3: 2500, 6: 4500, 12: 8000 }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const calculateBMI = () => {
        const height = parseFloat(formData.height);
        const weight = parseFloat(formData.weight);

        if (height && weight && height > 0 && weight > 0) {
            const heightInMeters = height / 100;
            const calculatedBMI = (weight / (heightInMeters * heightInMeters)).toFixed(1);
            setBmi(calculatedBMI);
        } else {
            setBmi('');
        }
    };

    const calculatePrice = () => {
        const { membershipPlan, membershipDuration } = formData;
        if (membershipPlan && membershipDuration) {
            return priceConfig[membershipPlan]?.[parseInt(membershipDuration)] || 0;
        }
        return 0;
    };

    const validateForm = () => {
        // Required fields validation
        const requiredFields = [
            'userFullName', 'dateOfBirth', 'gender', 'userEmail', 'phoneNumber',
            'userPassword', 'userConfirmPassword', 'membershipPlan', 'membershipDuration',
            'cardType', 'cardNumber', 'expirationDate', 'cvv', 'weight', 'workoutType', 'weightGoal'
        ];

        for (let field of requiredFields) {
            if (!formData[field]) {
                setError(`Please fill in all fields`);
                return false;
            }
        }

        // Name validation
        if (!/^[A-Za-z\s]{2,50}$/.test(formData.userFullName)) {
            setError('Please enter a valid full name (2-50 letters and spaces only)');
            return false;
        }

        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
            setError('Please enter a valid email address');
            return false;
        }

        // Password validation
        if (formData.userPassword.length < 3) {
            setError('Password must be at least 3 characters long');
            return false;
        }

        // Password match
        if (formData.userPassword !== formData.userConfirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        // Phone validation
        const cleanedPhone = formData.phoneNumber.replace(/\D/g, '');
        if (!/^\d{10}$/.test(cleanedPhone)) {
            setError('Please enter a valid 10-digit phone number');
            return false;
        }

        // Card number validation
        const cleanedCard = formData.cardNumber.replace(/\s+/g, '');
        if (!/^\d{16}$/.test(cleanedCard)) {
            setError('Please enter a valid 16-digit card number');
            return false;
        }

        // Expiry date validation
        if (formData.expirationDate) {
            const currentDate = new Date();
            const [year, month] = formData.expirationDate.split('-').map(Number);
            const expiryDate = new Date(year, month - 1);
            
            if (expiryDate < currentDate) {
                setError('Please enter a valid expiration date that is not in the past');
                return false;
            }
        }

        // Weight validation
        if (isNaN(formData.weight) || formData.weight < 20 || formData.weight > 300) {
            setError('Please enter a valid weight between 20 and 300 kg');
            return false;
        }

        // Weight goal validation
        if (isNaN(formData.weightGoal) || formData.weightGoal < 20 || formData.weightGoal > 300) {
            setError('Please enter a valid weight goal between 20 and 300 kg');
            return false;
        }

        // Terms agreement
        if (!formData.terms) {
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
            const response = await fetch('/api/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    cardNumber: formData.cardNumber.replace(/\s+/g, ''),
                    phoneNumber: formData.phoneNumber.replace(/\D/g, '')
                }),
            });

            const data = await response.json();

            if (data.message === 'Signup successful') {
                navigate('/login', { 
                    state: { message: 'Registration successful! Please login.' } 
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

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length > 16) return value.substring(0, 19);
        
        let formatted = '';
        for (let i = 0; i < cleaned.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += ' ';
            formatted += cleaned[i];
        }
        return formatted;
    };

    const price = calculatePrice();
    const savePercentage = formData.membershipDuration === '3' ? 15 : 
                          formData.membershipDuration === '6' ? 25 : 
                          formData.membershipDuration === '12' ? 33 : 0;

    return (
        <div className={styles.authContainer}>
            <div className={styles.authHeader}>
                <h2>Create Member Account</h2>
                <p>Join our fitness community today</p>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <h3>Personal Details</h3>
                <div className={styles.formGroup}>
                    <label htmlFor="userFullName">Full Name *</label>
                    <input
                        type="text"
                        id="userFullName"
                        name="userFullName"
                        className={styles.formControl}
                        value={formData.userFullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="dateOfBirth">Date of Birth *</label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        className={styles.formControl}
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="gender">Gender *</label>
                    <select
                        id="gender"
                        name="gender"
                        className={styles.formControl}
                        value={formData.gender}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="height">Height (cm) *</label>
                    <input
                        type="number"
                        id="height"
                        name="height"
                        className={styles.formControl}
                        value={formData.height}
                        onChange={(e) => {
                            handleChange(e);
                            calculateBMI();
                        }}
                        placeholder="Height in cm"
                        min="50"
                        max="250"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="weight">Weight (kg) *</label>
                    <input
                        type="number"
                        id="weight"
                        name="weight"
                        className={styles.formControl}
                        value={formData.weight}
                        onChange={(e) => {
                            handleChange(e);
                            calculateBMI();
                        }}
                        placeholder="Weight in kg"
                        min="20"
                        max="300"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="bmi">BMI</label>
                    <input
                        type="text"
                        id="bmi"
                        className={styles.formControl}
                        value={bmi}
                        readOnly
                        placeholder="Auto-calculated"
                    />
                </div>

                <h3>Fitness Goals</h3>
                <div className={styles.formGroup}>
                    <label htmlFor="workoutType">Preferred Workout Type *</label>
                    <select
                        id="workoutType"
                        name="workoutType"
                        className={styles.formControl}
                        value={formData.workoutType}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select workout type</option>
                        <option value="Calisthenics">Calisthenics</option>
                        <option value="Weight Loss">Weight Loss</option>
                        <option value="HIIT">HIIT</option>
                        <option value="Competitive">Competitive</option>
                        <option value="Strength Training">Strength Training</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Flexibility">Flexibility & Mobility</option>
                        <option value="Bodybuilding">Bodybuilding</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="weightGoal">Weight Goal (kg) *</label>
                    <input
                        type="number"
                        id="weightGoal"
                        name="weightGoal"
                        className={styles.formControl}
                        value={formData.weightGoal}
                        onChange={handleChange}
                        placeholder="Target weight"
                        min="20"
                        max="300"
                        required
                    />
                </div>

                <h3>Contact Information</h3>
                <div className={styles.formGroup}>
                    <label htmlFor="userEmail">Email Address *</label>
                    <input
                        type="email"
                        id="userEmail"
                        name="userEmail"
                        className={styles.formControl}
                        value={formData.userEmail}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="phoneNumber">Phone Number *</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        className={styles.formControl}
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="10-digit phone number"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="userPassword">Password *</label>
                    <input
                        type="password"
                        id="userPassword"
                        name="userPassword"
                        className={styles.formControl}
                        value={formData.userPassword}
                        onChange={handleChange}
                        placeholder="Create a password"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="userConfirmPassword">Confirm Password *</label>
                    <input
                        type="password"
                        id="userConfirmPassword"
                        name="userConfirmPassword"
                        className={styles.formControl}
                        value={formData.userConfirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                    />
                </div>

                <h3>Membership Details</h3>
                <div className={styles.formGroup}>
                    <label htmlFor="membershipPlan">Membership Plan *</label>
                    <select
                        id="membershipPlan"
                        name="membershipPlan"
                        className={styles.formControl}
                        value={formData.membershipPlan}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a plan</option>
                        <option value="basic">Basic Plan</option>
                        <option value="gold">Gold Plan</option>
                        <option value="platinum">Platinum Plan</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="membershipDuration">Duration *</label>
                    <select
                        id="membershipDuration"
                        name="membershipDuration"
                        className={styles.formControl}
                        value={formData.membershipDuration}
                        onChange={handleChange}
                        required
                    >
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                    </select>
                </div>

                {price > 0 && (
                    <div className={styles.priceDisplay}>
                        <p className={styles.priceAmount}>₹{price}</p>
                        {savePercentage > 0 && (
                            <p className={styles.saveInfo}>Save {savePercentage}%</p>
                        )}
                    </div>
                )}

                <h3>Payment Information</h3>
                <div className={styles.formGroup}>
                    <label htmlFor="cardType">Card Type *</label>
                    <select
                        id="cardType"
                        name="cardType"
                        className={styles.formControl}
                        value={formData.cardType}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select card type</option>
                        <option value="visa">Visa</option>
                        <option value="mastercard">Mastercard</option>
                        <option value="amex">American Express</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="cardNumber">Card Number *</label>
                    <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        className={styles.formControl}
                        value={formData.cardNumber}
                        onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            setFormData(prev => ({ ...prev, cardNumber: formatted }));
                        }}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="expirationDate">Expiration Date *</label>
                    <input
                        type="month"
                        id="expirationDate"
                        name="expirationDate"
                        className={styles.formControl}
                        value={formData.expirationDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="cvv">CVV *</label>
                    <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        className={styles.formControl}
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        maxLength="4"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            name="terms"
                            checked={formData.terms}
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
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className={styles.alternateAction}>
                    <p>
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                    <p>
                        Are you a trainer? <Link to="/signup/trainer">Become a Trainer</Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default UserSignup;