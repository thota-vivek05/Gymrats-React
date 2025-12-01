import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public Pages
import HomePage from './pages/Home/HomePage';
import Login from './pages/Auth/Login';
import UserSignup from './pages/Auth/UserSignup';
import TrainerSignup from './pages/Auth/TrainerSignup';

// Exercise Page
import ExercisePage from './pages/Home/related/ExercisePage';

// Nutrition Page (Public)
import NutritionPage from './pages/Home/related/NutritionPage';

// NEW — About Page
import AboutPage from './pages/Home/related/AboutPage';

// NEW — Contact Page
import ContactPage from './pages/Home/related/ContactPage';

// User Dashboard
import UserDashboard from './pages/User/UserDashboard';

// ⭐ NEW — User Nutrition Page
import UserNutritionPage from './pages/User/UserNutritionPage';

// Trainer Dashboard
import TrainerDashboard from './pages/Trainer/TrainerDashboard';

// Admin Pages
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminLayout from './pages/Admin/components/AdminLayout';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminTrainers from './pages/Admin/AdminTrainers';

// Protected Route
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>

            {/* PUBLIC ROUTES */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup/user" element={<UserSignup />} />
            <Route path="/signup/trainer" element={<TrainerSignup />} />

            {/* Exercise Page */}
            <Route path="/isolation" element={<ExercisePage />} />
            <Route path="/exercises" element={<ExercisePage />} />

            {/* Public Nutrition Page */}
            <Route path="/nutrition" element={<NutritionPage />} />

            {/* NEW — About Page */}
            <Route path="/about" element={<AboutPage />} />

            {/* NEW — Contact Page */}
            <Route path="/contact" element={<ContactPage />} />

            {/* ADMIN LOGIN */}
            <Route path="/admin/login" element={<AdminLogin />} />


            {/* ========= PROTECTED ROUTES ========= */}

            {/* USER ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="/userdashboard_b" element={<UserDashboard />} />
              <Route path="/userdashboard_g" element={<UserDashboard />} />
              <Route path="/userdashboard_p" element={<UserDashboard />} />

              {/* ⭐ User Nutrition Page (Protected) */}
              <Route path="/user/nutrition" element={<UserNutritionPage />} />
            </Route>

            {/* TRAINER ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['trainer']} />}>
              <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
            </Route>

            {/* ADMIN ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/trainers" element={<AdminTrainers />} />
              </Route>
            </Route>

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
