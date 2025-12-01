import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Public Pages
import HomePage from "./pages/Home/HomePage";
import Login from "./pages/Auth/Login";
import UserSignup from "./pages/Auth/UserSignup";
import TrainerSignup from "./pages/Auth/TrainerSignup";
import ExercisePage from "./pages/Home/related/ExercisePage";
import NutritionPage from "./pages/Home/related/NutritionPage";
import AboutPage from "./pages/Home/related/AboutPage";
import ContactPage from "./pages/Home/related/ContactPage";

// Protected imports
import ProtectedRoute from "./components/common/ProtectedRoute";

// User Pages
import UserDashboard from "./pages/User/UserDashboard";
import UserProfile from "./pages/User/UserProfile";

// Trainer Pages
import TrainerDashboard from "./pages/Trainer/TrainerDashboard";

// Admin Pages
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminLayout from "./pages/Admin/components/AdminLayout";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminTrainers from "./pages/Admin/AdminTrainers";
import AdminVerifications from "./pages/Admin/AdminVerifications"; // ⬅ Added

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App bg-gray-900 min-h-screen">
          <Routes>

            {/* 🔹 PUBLIC ROUTES */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup/user" element={<UserSignup />} />
            <Route path="/signup/trainer" element={<TrainerSignup />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Static Info Pages */}
            <Route path="/isolation" element={<ExercisePage />} />
            <Route path="/exercises" element={<ExercisePage />} />
            <Route path="/nutrition" element={<NutritionPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />


            {/* 🔹 USER PROTECTED ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/userprofile" element={<UserProfile />} />
            </Route>

            {/* 🔹 TRAINER PROTECTED ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={["trainer"]} />}>
              <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
            </Route>

            {/* 🔹 ADMIN PROTECTED ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/trainers" element={<AdminTrainers />} />
                <Route path="/admin/verifiers" element={<AdminVerifications />} /> {/* ✅ Added */}
              </Route>
            </Route>

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
