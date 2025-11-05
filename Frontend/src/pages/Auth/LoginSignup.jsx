import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import styles from './LoginSignup.module.css';

// --- Utility Functions ---
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 8;
const validateName = (name) => /^[A-Za-z\s]{2,50}$/.test(name);
const validatePhoneNumber = (phone) => /^\d{10}$/.test(phone.replace(/\D/g, ''));
const validateCardNumber = (cardNumber) => /^\d{16}$/.test(cardNumber.replace(/[\s-]/g, ''));

const validateExpiryDate = (expiryDate) => {
    if (!expiryDate) return false;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const [year, month] = expiryDate.split('-').map(Number);

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    if (month < 1 || month > 12) return false;
    return true;
};

// Price configuration
const priceConfig = {
    basic: {
        1: { price: 299, save: '' },
        3: { price: 750, save: 'Save 15%' },
        6: { price: 1350, save: 'Save 25%' },
        12: { price: 2400, save: 'Save 33%' }
    },
    gold: {
        1: { price: 599, save: '' },
        3: { price: 1550, save: 'Save 15%' },
        6: { price: 2700, save: 'Save 25%' },
        12: { price: 4800, save: 'Save 33%' }
    },
    platinum: {
        1: { price: 999, save: '' },
        3: { price: 2500, save: 'Save 15%' },
        6: { price: 4500, save: 'Save 25%' },
        12: { price: 8000, save: 'Save 33%' }
    }
};

// Modal Component
const Modal = ({ type, message, visible, onClose }) => {
    if (!visible) return null;
    
    const isError = type === 'error';
    const modalHeaderClass = isError ? `${styles.modalHeader} ${styles.error}` : `${styles.modalHeader} ${styles.success}`;
    const iconClass = isError ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';
    const title = isError ? 'Error' : 'Success';

    return (
        <div className={styles.modal} onClick={(e) => e.target.classList.contains(styles.modal) && onClose()}>
            <div className={styles.modalContent}>
                <div className={modalHeaderClass}>
                    <button className={styles.closeModal} onClick={onClose}>&times;</button>
                    <i className={iconClass}></i>
                    <h3>{title}</h3>
                </div>
                <div className={styles.modalBody}>
                    <p>{message}</p>
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.modalBtn} onClick={onClose}>OK</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const LoginSignup = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State for toggling between forms
    const [isLogin, setIsLogin] = useState(true);

    // State for modals
    const [modal, setModal] = useState({ visible: false, type: '', message: '' });

    // State for Login Form
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
    });

    // State for Signup Form
    const [signupForm, setSignupForm] = useState({
        userFullName: '',
        dateOfBirth: '',
        gender: '',
        height: '',
        weight: '',
        bmi: '',
        workoutType: '',
        weightGoal: '',
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
        terms: false,
    });
    
    // State for Price Display
    const [membershipPrice, setMembershipPrice] = useState({ price: '', save: '' });

    // --- Effects & Handlers ---

    // Toggle forms based on URL query parameter
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const formType = params.get('form');
        setIsLogin(formType !== 'signup');
    }, [location.search]);

    // Update BMI on weight or height change
    useEffect(() => {
        const height = parseFloat(signupForm.height);
        const weight = parseFloat(signupForm.weight);

        if (!height || !weight || height <= 0 || weight <= 0) {
            setSignupForm(prev => ({ ...prev, bmi: '' }));
            return;
        }

        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        setSignupForm(prev => ({ ...prev, bmi: bmi.toFixed(1) }));
    }, [signupForm.height, signupForm.weight]);

    // Calculate Price on plan or duration change
    const calculatePrice = useCallback(() => {
        const { membershipPlan, membershipDuration } = signupForm;
        const duration = parseInt(membershipDuration);
        
        if (!membershipPlan || !duration || !priceConfig[membershipPlan] || !priceConfig[membershipPlan][duration]) {
            setMembershipPrice({ price: 'Select plan and duration', save: '' });
            return;
        }

        const priceInfo = priceConfig[membershipPlan][duration];
        setMembershipPrice({ price: `₹${priceInfo.price}`, save: priceInfo.save });
    }, [signupForm.membershipPlan, signupForm.membershipDuration]);
    
    useEffect(() => {
        calculatePrice();
    }, [calculatePrice]);

    // Form Change Handlers
    const handleLoginChange = (e) => {
        const { id, value } = e.target;
        setLoginForm(prev => ({ ...prev, [id]: value }));
    };

    const handleSignupChange = (e) => {
        const { id, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : value;

        if (id === 'cardNumber') {
            let v = value.replace(/\D/g, '').substring(0, 16);
            let formattedValue = '';
            for (let i = 0; i < v.length; i++) {
                if (i > 0 && i % 4 === 0) formattedValue += ' ';
                formattedValue += v[i];
            }
            finalValue = formattedValue;
        }
        
        setSignupForm(prev => ({ ...prev, [id]: finalValue }));
    };

    // Modal Handlers
    const showModal = (type, message) => {
        setModal({ visible: true, type, message });
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setModal({ visible: false, type: '', message: '' });
        document.body.style.overflow = 'auto';
    };
    
    // Form Submission Handlers
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const { email, password } = loginForm;

        if (!email || !password) {
            showModal('error', 'Please fill in all fields');
            return;
        }
        if (!validateEmail(email)) {
            showModal('error', 'Please enter a valid email address');
            return;
        }
        if (!validatePassword(password)) {
            showModal('error', 'Password must be at least 8 characters long');
            return;
        }

        // Simulating API call
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (data.message === 'Login successful') {
                showModal('success', 'Login successful! Redirecting...');
                setTimeout(() => {
                    closeModal();
                    navigate(data.redirect || '/dashboard');
                }, 1000);
                setLoginForm({ email: '', password: '' });
            } else {
                showModal('error', data.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login Error:', error);
            showModal('error', 'An error occurred. Please try again later.');
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        const f = signupForm;
        
        // Validation
        if (!f.userFullName || !f.dateOfBirth || !f.gender || !f.userEmail || !f.phoneNumber || 
            !f.userPassword || !f.userConfirmPassword || !f.membershipPlan || !f.membershipDuration || 
            !f.cardType || !f.cardNumber || !f.expirationDate || !f.cvv) {
            showModal('error', 'Please fill in all required fields');
            return;
        }
        if (!validateName(f.userFullName)) return showModal('error', 'Please enter a valid full name (2-50 letters and spaces only)');
        if (!validateEmail(f.userEmail)) return showModal('error', 'Please enter a valid email address');
        if (!validatePassword(f.userPassword)) return showModal('error', 'Password must be at least 8 characters long');
        if (!validatePhoneNumber(f.phoneNumber)) return showModal('error', 'Please enter a valid 10-digit phone number');
        if (!f.workoutType) return showModal('error', 'Please select your preferred workout type');
        if (f.userPassword !== f.userConfirmPassword) return showModal('error', 'Passwords do not match');
        if (!validateCardNumber(f.cardNumber)) return showModal('error', 'Please enter a valid 16-digit card number');
        if (!validateExpiryDate(f.expirationDate)) return showModal('error', 'Please enter a valid expiration date that is not in the past');
        if (!f.terms) return showModal('error', 'You must agree to the terms and conditions');
        if (isNaN(f.weight) || f.weight < 20 || f.weight > 300) return showModal('error', 'Please enter a valid weight between 20 and 300 kg');
        if (f.height && (isNaN(f.height) || f.height < 50 || f.height > 250)) return showModal('error', 'Please enter a valid height between 50 and 250 cm');
        if (isNaN(f.weightGoal) || f.weightGoal < 20 || f.weightGoal > 300) return showModal('error', 'Please enter a valid weight goal between 20 and 300 kg');

        // Prepare data for API
        const formData = {
            ...f,
            cardNumber: f.cardNumber.replace(/[\s-]/g, ''),
            terms: f.terms,
        };
        delete formData.userConfirmPassword;
        delete formData.bmi;

        // Simulating API call
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (data.message === 'Signup successful') {
                showModal('success', 'Registration successful! Welcome to GymRats!');
                setTimeout(() => {
                    closeModal();
                    navigate(data.redirect || '/dashboard');
                }, 1000);
                // Reset form
                setSignupForm({
                    userFullName: '', dateOfBirth: '', gender: '', height: '', weight: '', bmi: '', workoutType: '', weightGoal: '',
                    userEmail: '', phoneNumber: '', userPassword: '', userConfirmPassword: '',
                    membershipPlan: '', membershipDuration: '1', cardType: '', cardNumber: '', expirationDate: '', cvv: '', terms: false,
                });
            } else if (data.error && data.error.includes('email')) {
                showModal('error', 'This email is already registered. Please use a different email or try logging in.');
            } else {
                showModal('error', data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Signup Error:', error);
            showModal('error', 'An error occurred. Please try again later.');
        }
    };

    // Determine header content based on form state
    const headerTitle = isLogin ? 'Welcome Back' : 'Create Account';
    const headerSubtitle = isLogin ? 'Sign in to access your account' : 'Sign up to join our community';

    return (
        <div className={styles.app}>
            <Modal
                type={modal.type}
                message={modal.message}
                visible={modal.visible}
                onClose={closeModal}
            />

            {/* Navigation Bar */}
            <div className={styles.navbar}>
                <header className={styles.header}>
                    <Link to="/home" className={styles.badge}>GymRats</Link>
                    <div className={styles.menu}>
                        <Link to="/home">Home</Link>
                        <Link to="/isolation">Exercises</Link>
                        <Link to="/nutrition">Nutrition</Link>
                        <Link to="/about">About</Link>
                        <Link to="/contact">Contact</Link>
                    </div>
                </header>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                <div className={styles.authContainer}>
                    <div className={styles.authHeader}>
                        <h2>{headerTitle}</h2>
                        <p>{headerSubtitle}</p>
                    </div>

                    {/* Login Form */}
                    <form id="loginForm" onSubmit={handleLoginSubmit} 
                          style={{ display: isLogin ? 'block' : 'none' }}>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email Address</label>
                            <input type="email" className={styles.formControl} id="email" 
                                   placeholder="Enter your email" required
                                   value={loginForm.email} onChange={handleLoginChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password</label>
                            <input type="password" className={styles.formControl} id="password" 
                                   placeholder="Enter your password" required
                                   value={loginForm.password} onChange={handleLoginChange} />
                        </div>

                        <button type="submit" className={styles.btn}>Login</button>

                        <div className={styles.alternateAction}>
                            Don't have an account? 
                            <Link to="/auth?form=signup" onClick={() => setIsLogin(false)}>Sign Up</Link>
                        </div>
                    </form>

                    {/* Signup Form */}
                    <form id="signupForm" onSubmit={handleSignupSubmit}
                          style={{ display: isLogin ? 'none' : 'block' }}>

                        {/* Personal Details */}
                        <h3>Personal Details</h3>
                        <div className={styles.formGroup}>
                            <label htmlFor="userFullName">Full Name</label>
                            <input type="text" className={styles.formControl} id="userFullName" name="userFullName"
                                placeholder="Enter your full name" required value={signupForm.userFullName} onChange={handleSignupChange} />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="dateOfBirth">Date of Birth</label>
                            <input type="date" className={styles.formControl} id="dateOfBirth" name="dateOfBirth" required 
                                value={signupForm.dateOfBirth} onChange={handleSignupChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="height">Height (cm)</label>
                            <input type="number" className={styles.formControl} id="height" name="height"
                                placeholder="Enter your height in cm" min="50" max="250" required
                                value={signupForm.height} onChange={handleSignupChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="weight">Weight (kg)</label>
                            <input type="number" className={styles.formControl} id="weight" name="weight"
                                placeholder="Enter your weight in kg" min="20" max="300" required
                                value={signupForm.weight} onChange={handleSignupChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="bmi">BMI</label>
                            <input type="number" className={styles.formControl} id="bmi" name="bmi" readOnly
                                value={signupForm.bmi} />
                        </div>
                        
                        {/* Fitness Goals */}
                        <h3>Fitness Goals</h3>
                        <div className={styles.formGroup}>
                            <label htmlFor="workoutType">Preferred Workout Type</label>
                            <select className={styles.formControl} id="workoutType" name="workoutType" required 
                                value={signupForm.workoutType} onChange={handleSignupChange}>
                                <option value="">Select your preferred workout type</option>
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
                            <label htmlFor="weightGoal">Weight Goal (kg)</label>
                            <input type="number" className={styles.formControl} id="weightGoal" name="weightGoal"
                                placeholder="Enter your target weight" min="20" max="300" required
                                value={signupForm.weightGoal} onChange={handleSignupChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="gender">Gender</label>
                            <select className={styles.formControl} id="gender" name="gender" required
                                value={signupForm.gender} onChange={handleSignupChange}>
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        {/* Contact Information */}
                        <h3>Contact Information</h3>
                        <div className={styles.formGroup}>
                            <label htmlFor="userEmail">Email Address</label>
                            <input type="email" className={styles.formControl} id="userEmail" name="userEmail"
                                placeholder="Enter your email" required value={signupForm.userEmail} onChange={handleSignupChange} />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <input type="tel" className={styles.formControl} id="phoneNumber" name="phoneNumber"
                                placeholder="Enter your phone number" required value={signupForm.phoneNumber} onChange={handleSignupChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="userPassword">Password</label>
                            <input type="password" className={styles.formControl} id="userPassword" name="userPassword"
                                placeholder="Create a password" required value={signupForm.userPassword} onChange={handleSignupChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="userConfirmPassword">Confirm Password</label>
                            <input type="password" className={styles.formControl} id="userConfirmPassword"
                                placeholder="Confirm your password" required value={signupForm.userConfirmPassword} onChange={handleSignupChange} />
                        </div>

                        {/* Membership Details */}
                        <h3>Membership Details</h3>
                        <div className={styles.formGroup}>
                            <label htmlFor="membershipPlan">Membership Plan</label>
                            <select className={styles.formControl} id="membershipPlan" name="membershipPlan" required 
                                value={signupForm.membershipPlan} onChange={handleSignupChange}>
                                <option value="">Select a plan</option>
                                <option value="basic">Basic Plan </option>
                                <option value="gold">Gold Plan </option>
                                <option value="platinum">Platinum Plan</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="membershipDuration">Membership Duration</label>
                            <select className={styles.formControl} id="membershipDuration" name="membershipDuration" required
                                value={signupForm.membershipDuration} onChange={handleSignupChange}>
                                <option value="1">1 Month</option>
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months</option>
                            </select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="membershipPrice">Membership Price</label>
                            <div className={`${styles.priceDisplay} ${membershipPrice.price.startsWith('₹') ? styles.hasPrice : ''}`} id="priceDisplay">
                                <p className={styles.priceAmount}>{membershipPrice.price}</p>
                                {membershipPrice.save && <p className={styles.saveInfo} id="saveInfo">{membershipPrice.save}</p>}
                            </div>
                        </div>

                        {/* Payment Information */}
                        <h3>Payment Information</h3>
                        <div className={styles.formGroup}>
                            <label htmlFor="cardType">Card Type</label>
                            <select className={styles.formControl} id="cardType" name="cardType" required
                                value={signupForm.cardType} onChange={handleSignupChange}>
                                <option value="">Select card type</option>
                                <option value="visa">Visa</option>
                                <option value="mastercard">Mastercard</option>
                                <option value="amex">American Express</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="cardNumber">Card Number</label>
                            <input type="text" className={styles.formControl} id="cardNumber" name="cardNumber"
                                placeholder="Enter 16-digit card number" required
                                value={signupForm.cardNumber} onChange={handleSignupChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="expirationDate">Expiration Date</label>
                            <input type="month" className={styles.formControl} id="expirationDate" name="expirationDate" required
                                value={signupForm.expirationDate} onChange={handleSignupChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="cvv">CVV</label>
                            <input type="text" className={styles.formControl} id="cvv" placeholder="Enter CVV" maxLength="4" required
                                value={signupForm.cvv} onChange={handleSignupChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input type="checkbox" id="terms" checked={signupForm.terms} 
                                    onChange={handleSignupChange} required />
                                I agree to the <a href="#" className={styles.termsLink}>terms and conditions</a>
                            </label>
                        </div>

                        <button type="submit" className={styles.btn}>Sign Up</button>

                        <div className={styles.alternateAction}>
                            Already have an account? 
                            <Link to="/auth?form=login" onClick={() => setIsLogin(true)}>Login</Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Footer Section */}
            <footer className={styles.siteFooter}>
                <div className={styles.footerContainer}>
                    <div className={styles.footerColumn}>
                        <h4>Trainer</h4>
                        <ul>
                            <li><Link to="/trainer_login">Trainer Login</Link></li>
                            <li><Link to="/trainer_form">Become a Trainer</Link></li>
                        </ul>
                    </div>
                    <div className={styles.footerColumn}>
                        <h4>Verifier</h4>
                        <ul>
                            <li><Link to="/verifier_login">Verifier Login</Link></li>
                        </ul>
                    </div>
                    <div className={styles.footerColumn}>
                        <h4>Connect</h4>
                        <ul>
                            <li><Link to="/contact">Contact Us</Link></li>
                        </ul>
                        <p className={styles.copyright}>GymRats © 2025. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LoginSignup;