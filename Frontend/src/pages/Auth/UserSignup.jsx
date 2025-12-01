import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import Modal from "./Modal";
import Header from "../../components/common/Header/Header";
import Footer from "../../components/common/Footer/Footer";

const UserSignup = () => {
  const [formData, setFormData] = useState({
    userFullName: "",
    dateOfBirth: "",
    gender: "",
    userEmail: "",
    phoneNumber: "",
    userPassword: "",
    userConfirmPassword: "",
    membershipPlan: "",
    membershipDuration: "1",
    cardType: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    weight: "",
    height: "",
    workoutType: "",
    weightGoal: "",
    terms: false,
  });
  const [bmi, setBmi] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modal, setModal] = useState({ visible: false, type: "", message: "" });

  const navigate = useNavigate();

  // Modal Handlers
  const showModal = (type, message) => {
    setModal({ visible: true, type, message });
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModal({ visible: false, type: "", message: "" });
    document.body.style.overflow = "auto";
  };

  // Price configuration
  const priceConfig = {
    basic: { 1: 299, 3: 750, 6: 1350, 12: 2400 },
    gold: { 1: 599, 3: 1550, 6: 2700, 12: 4800 },
    platinum: { 1: 999, 3: 2500, 6: 4500, 12: 8000 },
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const calculateBMI = () => {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);

    if (height && weight && height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const calculatedBMI = (
        weight /
        (heightInMeters * heightInMeters)
      ).toFixed(1);
      setBmi(calculatedBMI);
    } else {
      setBmi("");
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
    const requiredFields = [
      "userFullName",
      "dateOfBirth",
      "gender",
      "userEmail",
      "phoneNumber",
      "userPassword",
      "userConfirmPassword",
      "membershipPlan",
      "membershipDuration",
      "cardType",
      "cardNumber",
      "expirationDate",
      "cvv",
      "weight",
      "workoutType",
      "weightGoal",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        showModal("error", `Please fill in all fields`);
        return false;
      }
    }

    if (!/^[A-Za-z\s]{2,50}$/.test(formData.userFullName)) {
      showModal(
        "error",
        "Please enter a valid full name (2-50 letters and spaces only)"
      );
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      showModal("error", "Please enter a valid email address");
      return false;
    }

    if (formData.userPassword.length < 3) {
      showModal("error", "Password must be at least 3 characters long");
      return false;
    }

    if (formData.userPassword !== formData.userConfirmPassword) {
      showModal("error", "Passwords do not match");
      return false;
    }

    const cleanedPhone = formData.phoneNumber.replace(/\D/g, "");
    if (!/^\d{10}$/.test(cleanedPhone)) {
      showModal("error", "Please enter a valid 10-digit phone number");
      return false;
    }

    const cleanedCard = formData.cardNumber.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(cleanedCard)) {
      showModal("error", "Please enter a valid 16-digit card number");
      return false;
    }

    if (formData.expirationDate) {
      const currentDate = new Date();
      const [year, month] = formData.expirationDate.split("-").map(Number);
      const expiryDate = new Date(year, month - 1);

      if (expiryDate < currentDate) {
        showModal(
          "error",
          "Please enter a valid expiration date that is not in the past"
        );
        return false;
      }
    }

    if (
      isNaN(formData.weight) ||
      formData.weight < 20 ||
      formData.weight > 300
    ) {
      showModal("error", "Please enter a valid weight between 20 and 300 kg");
      return false;
    }

    if (
      isNaN(formData.weightGoal) ||
      formData.weightGoal < 20 ||
      formData.weightGoal > 300
    ) {
      showModal(
        "error",
        "Please enter a valid weight goal between 20 and 300 kg"
      );
      return false;
    }

    if (!formData.terms) {
      showModal("error", "You must agree to the terms and conditions");
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
      const response = await fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          cardNumber: formData.cardNumber.replace(/\s+/g, ""),
          phoneNumber: formData.phoneNumber.replace(/\D/g, ""),
        }),
      });

      const data = await response.json();

      if (data.message === "Signup successful") {
        showModal("success", "Registration successful! Welcome to GymRats!");
        setTimeout(() => {
          closeModal();
          navigate("/login");
        }, 1000);
      } else {
        showModal(
          "error",
          data.error || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      showModal("error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 16) return value.substring(0, 19);

    let formatted = "";
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += " ";
      formatted += cleaned[i];
    }
    return formatted;
  };

  const price = calculatePrice();
  const savePercentage =
    formData.membershipDuration === "3"
      ? 15
      : formData.membershipDuration === "6"
      ? 25
      : formData.membershipDuration === "12"
      ? 33
      : 0;

  // Shared Tailwind Styles
  const inputClasses =
    "w-full p-[12px] bg-white/10 border border-[#333] rounded text-white text-[1rem] focus:border-[#8A2BE2] focus:outline-none transition-colors";
  const labelClasses = "block mb-[8px] text-[#f1f1f1]";
  const sectionTitleClasses =
    "text-[#f1f1f1] text-[1.2rem] mt-[20px] mb-[15px] border-b border-[#333] pb-[5px]";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Background Wrapper */}
      <div className="flex-1 flex justify-center items-center py-[40px] px-[20px] bg-[linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7)),url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1740&auto=format&fit=crop')] bg-cover bg-center bg-fixed bg-no-repeat">
        <Modal
          type={modal.type}
          message={modal.message}
          visible={modal.visible}
          onClose={closeModal}
        />

        {/* Form Container */}
        <div className="w-[600px] max-w-full bg-[#111]/95 rounded-[10px] p-[40px] shadow-[0_0_20px_rgba(138,43,226,0.3)] border border-[#8A2BE2] max-[768px]:p-[30px]">
          <div className="text-center mb-[30px]">
            <h2 className="text-[2rem] mb-[10px] text-[#f1f1f1] font-bold">
              Create Member Account
            </h2>
            <p className="text-[#cccccc]">Join our fitness community today</p>
          </div>

          <form onSubmit={handleSubmit}>
            <h3 className={sectionTitleClasses}>Personal Details</h3>
            <div className="mb-[20px]">
              <label htmlFor="userFullName" className={labelClasses}>
                Full Name *
              </label>
              <input
                type="text"
                id="userFullName"
                name="userFullName"
                className={inputClasses}
                value={formData.userFullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="mb-[20px]">
              <label htmlFor="dateOfBirth" className={labelClasses}>
                Date of Birth *
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                className={`${inputClasses} [color-scheme:dark]`}
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-[20px]">
              <label htmlFor="gender" className={labelClasses}>
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                className={inputClasses}
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="" className="text-black">
                  Select
                </option>
                <option value="male" className="text-black">
                  Male
                </option>
                <option value="female" className="text-black">
                  Female
                </option>
                <option value="other" className="text-black">
                  Other
                </option>
              </select>
            </div>

            <div className="flex gap-4 max-[600px]:flex-col">
              <div className="mb-[20px] flex-1">
                <label htmlFor="height" className={labelClasses}>
                  Height (cm) *
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  className={inputClasses}
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

              <div className="mb-[20px] flex-1">
                <label htmlFor="weight" className={labelClasses}>
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  className={inputClasses}
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
            </div>

            <div className="mb-[20px]">
              <label htmlFor="bmi" className={labelClasses}>
                BMI
              </label>
              <input
                type="text"
                id="bmi"
                className={`${inputClasses} bg-white/5 cursor-not-allowed`}
                value={bmi}
                readOnly
                placeholder="Auto-calculated"
              />
            </div>

            <h3 className={sectionTitleClasses}>Fitness Goals</h3>
            <div className="mb-[20px]">
              <label htmlFor="workoutType" className={labelClasses}>
                Preferred Workout Type *
              </label>
              <select
                id="workoutType"
                name="workoutType"
                className={inputClasses}
                value={formData.workoutType}
                onChange={handleChange}
                required
              >
                <option value="" className="text-black">
                  Select workout type
                </option>
                <option value="Calisthenics" className="text-black">
                  Calisthenics
                </option>
                <option value="Weight Loss" className="text-black">
                  Weight Loss
                </option>
                <option value="HIIT" className="text-black">
                  HIIT
                </option>
                <option value="Competitive" className="text-black">
                  Competitive
                </option>
                <option value="Strength Training" className="text-black">
                  Strength Training
                </option>
                <option value="Cardio" className="text-black">
                  Cardio
                </option>
                <option value="Flexibility" className="text-black">
                  Flexibility & Mobility
                </option>
                <option value="Bodybuilding" className="text-black">
                  Bodybuilding
                </option>
              </select>
            </div>

            <div className="mb-[20px]">
              <label htmlFor="weightGoal" className={labelClasses}>
                Weight Goal (kg) *
              </label>
              <input
                type="number"
                id="weightGoal"
                name="weightGoal"
                className={inputClasses}
                value={formData.weightGoal}
                onChange={handleChange}
                placeholder="Target weight"
                min="20"
                max="300"
                required
              />
            </div>

            <h3 className={sectionTitleClasses}>Contact Information</h3>
            <div className="mb-[20px]">
              <label htmlFor="userEmail" className={labelClasses}>
                Email Address *
              </label>
              <input
                type="email"
                id="userEmail"
                name="userEmail"
                className={inputClasses}
                value={formData.userEmail}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-[20px]">
              <label htmlFor="phoneNumber" className={labelClasses}>
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                className={inputClasses}
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="10-digit phone number"
                required
              />
            </div>

            <div className="mb-[20px]">
              <label htmlFor="userPassword" className={labelClasses}>
                Password *
              </label>
              <input
                type="password"
                id="userPassword"
                name="userPassword"
                className={inputClasses}
                value={formData.userPassword}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
            </div>

            <div className="mb-[20px]">
              <label htmlFor="userConfirmPassword" className={labelClasses}>
                Confirm Password *
              </label>
              <input
                type="password"
                id="userConfirmPassword"
                name="userConfirmPassword"
                className={inputClasses}
                value={formData.userConfirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>

            <h3 className={sectionTitleClasses}>Membership Details</h3>
            <div className="mb-[20px]">
              <label htmlFor="membershipPlan" className={labelClasses}>
                Membership Plan *
              </label>
              <select
                id="membershipPlan"
                name="membershipPlan"
                className={inputClasses}
                value={formData.membershipPlan}
                onChange={handleChange}
                required
              >
                <option value="" className="text-black">
                  Select a plan
                </option>
                <option value="basic" className="text-black">
                  Basic Plan
                </option>
                <option value="gold" className="text-black">
                  Gold Plan
                </option>
                <option value="platinum" className="text-black">
                  Platinum Plan
                </option>
              </select>
            </div>

            <div className="mb-[20px]">
              <label htmlFor="membershipDuration" className={labelClasses}>
                Duration *
              </label>
              <select
                id="membershipDuration"
                name="membershipDuration"
                className={inputClasses}
                value={formData.membershipDuration}
                onChange={handleChange}
                required
              >
                <option value="1" className="text-black">
                  1 Month
                </option>
                <option value="3" className="text-black">
                  3 Months
                </option>
                <option value="6" className="text-black">
                  6 Months
                </option>
                <option value="12" className="text-black">
                  12 Months
                </option>
              </select>
            </div>

            {price > 0 && (
              <div className="bg-white/10 border border-[#333] rounded p-[15px] text-center mt-[10px] mb-[20px] transition-all hover:bg-white/15 hover:border-[#8A2BE2] hover:shadow-[0_0_10px_rgba(138,43,226,0.2)]">
                <p className="text-[1.5rem] font-bold text-[#8A2BE2] m-0 drop-shadow-[0_0_10px_rgba(138,43,226,0.3)] animate-[priceUpdate_0.3s_ease]">
                  ₹{price}
                </p>
                {savePercentage > 0 && (
                  <p className="text-[0.9rem] m-[5px_0_0_0] text-[#4ecdc4] font-semibold">
                    Save {savePercentage}%
                  </p>
                )}
              </div>
            )}

            <h3 className={sectionTitleClasses}>Payment Information</h3>
            <div className="mb-[20px]">
              <label htmlFor="cardType" className={labelClasses}>
                Card Type *
              </label>
              <select
                id="cardType"
                name="cardType"
                className={inputClasses}
                value={formData.cardType}
                onChange={handleChange}
                required
              >
                <option value="" className="text-black">
                  Select card type
                </option>
                <option value="visa" className="text-black">
                  Visa
                </option>
                <option value="mastercard" className="text-black">
                  Mastercard
                </option>
                <option value="amex" className="text-black">
                  American Express
                </option>
              </select>
            </div>

            <div className="mb-[20px]">
              <label htmlFor="cardNumber" className={labelClasses}>
                Card Number *
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                className={inputClasses}
                value={formData.cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  setFormData((prev) => ({ ...prev, cardNumber: formatted }));
                }}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                required
              />
            </div>

            <div className="flex gap-4 max-[600px]:flex-col">
              <div className="mb-[20px] flex-1">
                <label htmlFor="expirationDate" className={labelClasses}>
                  Expiration Date *
                </label>
                <input
                  type="month"
                  id="expirationDate"
                  name="expirationDate"
                  className={`${inputClasses} [color-scheme:dark]`}
                  value={formData.expirationDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-[20px] flex-1">
                <label htmlFor="cvv" className={labelClasses}>
                  CVV *
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  className={inputClasses}
                  value={formData.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  maxLength="4"
                  required
                />
              </div>
            </div>

            <div className="mb-[20px]">
              <label className="flex items-center gap-[8px] font-normal cursor-pointer text-[#f1f1f1]">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  required
                  className="accent-[#8A2BE2]"
                />
                <span>
                  I agree to the{" "}
                  <a
                    href="/terms"
                    className="text-[#8A2BE2] no-underline hover:underline"
                  >
                    terms and conditions
                  </a>{" "}
                  *
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full p-[12px] bg-[#8A2BE2] text-white border-none rounded font-bold text-[1rem] cursor-pointer transition-all duration-300 hover:bg-[#7B25C9] disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="text-center mt-[20px] text-[#cccccc]">
              <p className="mb-2">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#8A2BE2] font-bold ml-[5px] no-underline hover:text-[#7B25C9]"
                >
                  Login here
                </Link>
              </p>
              <p>
                Are you a trainer?{" "}
                <Link
                  to="/signup/trainer"
                  className="text-[#8A2BE2] font-bold ml-[5px] no-underline hover:text-[#7B25C9]"
                >
                  Become a Trainer
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserSignup;
