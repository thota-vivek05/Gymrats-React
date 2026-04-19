import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import Modal from './Modal';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';

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
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fileError, setFileError] = useState('');
    
    // Modal State
    const [modal, setModal] = useState({ visible: false, type: '', message: '' });

    const navigate = useNavigate();

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
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFileError('');
        
        if (!file) {
            setResumeFile(null);
            return;
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            setFileError('Only PDF and Word documents are allowed');
            setResumeFile(null);
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            setFileError('File size must be less than 5MB');
            setResumeFile(null);
            return;
        }

        setResumeFile(file);
    };

    const validateForm = () => {
        const requiredFields = [
            'firstName', 'lastName', 'email', 'password', 'confirmPassword',
            'phone', 'experience'
        ];

        for (let field of requiredFields) {
            if (!formData[field]) {
                showModal('error', `Please fill in all fields`);
                return false;
            }
        }

        if (!/^[A-Za-z\s]{2,50}$/.test(formData.firstName)) {
            showModal('error', 'Please enter a valid first name');
            return false;
        }

        if (!/^[A-Za-z\s]{2,50}$/.test(formData.lastName)) {
            showModal('error', 'Please enter a valid last name');
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            showModal('error', 'Please enter a valid email address');
            return false;
        }

        if (formData.password.length < 6) {
            showModal('error', 'Password must be at least 6 characters long');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            showModal('error', 'Passwords do not match');
            return false;
        }

        const cleanedPhone = formData.phone.replace(/\D/g, '');
        if (!/^\d{10}$/.test(cleanedPhone)) {
            showModal('error', 'Please enter a valid 10-digit phone number');
            return false;
        }

        if (!resumeFile) {
            showModal('error', 'Please upload your resume (PDF or Word document)');
            return false;
        }

        if (formData.specializations.length === 0) {
            showModal('error', 'Please select at least one specialization');
            return false;
        }

        if (!formData.termsAgree) {
            showModal('error', 'You must agree to the terms and conditions');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            // Create FormData object for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('firstName', formData.firstName);
            formDataToSend.append('lastName', formData.lastName);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('confirmPassword', formData.confirmPassword);
            formDataToSend.append('phone', formData.phone.replace(/\D/g, ''));
            formDataToSend.append('experience', formData.experience);
            formDataToSend.append('specializations', JSON.stringify(formData.specializations));
            formDataToSend.append('termsAgree', formData.termsAgree);
            formDataToSend.append('resume', resumeFile); // Append the file

            // Note: Don't set Content-Type header when using FormData
            const response = await fetch('/api/trainer/signup', {
                method: 'POST',
                body: formDataToSend,
                // Browser will automatically set the Content-Type with boundary
            });

            const data = await response.json();

            if (data.message === 'Trainer application submitted successfully') {
                showModal('success', 'Trainer application submitted successfully! Please wait for verification.');
                setTimeout(() => {
                    closeModal();
                    navigate('/login');
                }, 1500);
            } else {
                showModal('error', data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            showModal('error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const specializationsList = [
        'Calisthenics', 'Weight Loss', 'HIIT', 'Competitive',
        'Strength Training', 'Cardio', 'Flexibility', 'Bodybuilding'
    ];

    // Format file size for display
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    // Shared Tailwind Styles
    const inputClasses = "w-full p-[12px] bg-white/10 border border-[#333] rounded text-white text-[1rem] focus:border-[#8A2BE2] focus:outline-none transition-colors";
    const labelClasses = "block mb-[8px] text-[#f1f1f1]";
    const sectionTitleClasses = "text-[#f1f1f1] text-[1.2rem] mt-[20px] mb-[15px] border-b border-[#333] pb-[5px]";
    const fileInputClasses = "w-full p-[12px] bg-white/10 border border-[#333] rounded text-white text-[1rem] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#8A2BE2] file:text-white hover:file:bg-[#7B25C9]";

    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden">
            <Header />
            
            {/* Background Wrapper */}
            <div className="flex-1 flex justify-center items-start sm:items-center py-8 px-4 sm:py-[40px] sm:px-[20px] bg-[linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7)),url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1740&auto=format&fit=crop')] bg-cover bg-center bg-fixed bg-no-repeat">
                
                <Modal 
                    type={modal.type}
                    message={modal.message}
                    visible={modal.visible}
                    onClose={closeModal}
                />

                {/* Form Container */}
                <div className="w-full max-w-[600px] bg-[#111]/95 rounded-[10px] p-5 sm:p-8 md:p-[40px] shadow-[0_0_20px_rgba(138,43,226,0.3)] border border-[#8A2BE2]">
                    
                    <div className="text-center mb-[30px]">
                        <h2 className="text-[1.5rem] sm:text-[2rem] mb-[10px] text-[#f1f1f1] font-bold">Become a Trainer</h2>
                        <p className="text-[#cccccc]">Join our team of fitness professionals</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <h3 className={sectionTitleClasses}>Personal Information</h3>
                        
                        <div className="flex gap-4 max-[600px]:flex-col">
                            <div className="mb-[20px] flex-1">
                                <label htmlFor="firstName" className={labelClasses}>First Name *</label>
                                <input type="text" id="firstName" name="firstName" className={inputClasses}
                                    value={formData.firstName} onChange={handleChange} placeholder="Enter your first name" required />
                            </div>

                            <div className="mb-[20px] flex-1">
                                <label htmlFor="lastName" className={labelClasses}>Last Name *</label>
                                <input type="text" id="lastName" name="lastName" className={inputClasses}
                                    value={formData.lastName} onChange={handleChange} placeholder="Enter your last name" required />
                            </div>
                        </div>

                        <div className="mb-[20px]">
                            <label htmlFor="email" className={labelClasses}>Email Address *</label>
                            <input type="email" id="email" name="email" className={inputClasses}
                                value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
                        </div>

                        <div className="mb-[20px]">
                            <label htmlFor="phone" className={labelClasses}>Phone Number *</label>
                            <input type="tel" id="phone" name="phone" className={inputClasses}
                                value={formData.phone} onChange={handleChange} placeholder="10-digit phone number" required />
                        </div>

                        <div className="mb-[20px]">
                            <label htmlFor="password" className={labelClasses}>Password *</label>
                            <input type="password" id="password" name="password" className={inputClasses}
                                value={formData.password} onChange={handleChange} placeholder="Create a password" required />
                        </div>

                        <div className="mb-[20px]">
                            <label htmlFor="confirmPassword" className={labelClasses}>Confirm Password *</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" className={inputClasses}
                                value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required />
                        </div>

                        <h3 className={sectionTitleClasses}>Professional Details</h3>
                        
                        <div className="mb-[20px]">
                            <label htmlFor="resume" className={labelClasses}>
                                Resume / CV *
                                <span className="text-sm text-[#cccccc] ml-2">(PDF or Word document, max 5MB)</span>
                            </label>
                            <input 
                                type="file" 
                                id="resume" 
                                name="resume"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className={fileInputClasses}
                                onChange={handleFileChange}
                                required
                            />
                            {fileError && (
                                <p className="text-red-500 text-sm mt-2">{fileError}</p>
                            )}
                            {resumeFile && !fileError && (
                                <div className="mt-2 p-3 bg-[#222] rounded border border-[#333]">
                                    <p className="text-[#8A2BE2] font-medium">
                                        ✓ File selected: {resumeFile.name}
                                    </p>
                                    <p className="text-[#cccccc] text-sm">
                                        Size: {formatFileSize(resumeFile.size)} • Type: {resumeFile.type}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mb-[20px]">
                            <label htmlFor="experience" className={labelClasses}>Years of Experience *</label>
                            <select id="experience" name="experience" className={inputClasses}
                                value={formData.experience} onChange={handleChange} required >
                                <option value="" className="text-black">Select experience</option>
                                <option value="1-2" className="text-black">1-2 years</option>
                                <option value="3-5" className="text-black">3-5 years</option>
                                <option value="5-10" className="text-black">5-10 years</option>
                                <option value="10+" className="text-black">10+ years</option>
                            </select>
                        </div>

                        <div className="mb-[20px]">
                            <label className={labelClasses}>Specializations *</label>
                            <div className="grid grid-cols-2 gap-[10px] max-[500px]:grid-cols-1">
                                {specializationsList.map(spec => (
                                    <label key={spec} className="flex items-center gap-[8px] font-normal cursor-pointer text-[#cccccc] hover:text-[#8A2BE2] transition-colors">
                                        <input type="checkbox" name="specializations" value={spec}
                                            checked={formData.specializations.includes(spec)} onChange={handleChange} className="accent-[#8A2BE2]" />
                                        {spec}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-[20px]">
                            <label className="flex items-center gap-[8px] font-normal cursor-pointer text-[#f1f1f1]">
                                <input type="checkbox" name="termsAgree" checked={formData.termsAgree} onChange={handleChange} required className="accent-[#8A2BE2]" />
                                <span>I agree to the <a href="/terms" className="text-[#8A2BE2] no-underline hover:underline">terms and conditions</a> *</span>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full p-[12px] bg-[#8A2BE2] text-white border-none rounded font-bold text-[1rem] cursor-pointer transition-all duration-300 hover:bg-[#7B25C9] disabled:opacity-70 disabled:cursor-not-allowed" 
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting Application...
                                </span>
                            ) : 'Apply as Trainer'}
                        </button>

                        <div className="text-center mt-[20px] text-[#cccccc]">
                            <p className="mb-2">Already have an account? <Link to="/login" className="text-[#8A2BE2] font-bold ml-[5px] no-underline hover:text-[#7B25C9]">Login here</Link></p>
                            <p>Want to join as a member? <Link to="/signup/user" className="text-[#8A2BE2] font-bold ml-[5px] no-underline hover:text-[#7B25C9]">Sign up as Member</Link></p>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TrainerSignup;