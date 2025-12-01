import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/Home/HomePage';
import Login from './pages/Auth/Login';
import UserSignup from './pages/Auth/UserSignup';
import TrainerSignup from './pages/Auth/TrainerSignup';
import TrainerDashboard from './pages/Trainer/TrainerDashboard'; 

// Import public pages 
import ExercisePage from './pages/Home/related/ExercisePage.jsx'; 
import NutritionPage from './pages/Home/related/NutritionPage.jsx';
import AboutPage from './pages/Home/related/AboutPage.jsx'; 
import ContactPage from './pages/Home/related/ContactPage.jsx'; 

// Import user-specific protected pages
import UserDashboard from './pages/User/UserDashboard.jsx'; 
import UserNutritionPage from './pages/User/UserNutrition.jsx'; 
import UserExercisesPage from './pages/User/UserExercises.jsx'; 
import UserProfilePage from './pages/User/UserProfile.jsx';     

// Protected Routes
import ProtectedRoute from './components/common/ProtectedRoute'

import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminLayout from './pages/Admin/components/AdminLayout';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminTrainers from './pages/Admin/AdminTrainers';


function App() {
  return (
    <AuthProvider>
    <Router>
      {/* Set main container background to ensure full dark mode aesthetic */}
      <div className="App bg-gray-900 min-h-screen">
        <Routes>
          {/* --- PUBLIC AUTH & HOME ROUTES --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup/user" element={<UserSignup />} />
          <Route path="/signup/trainer" element={<TrainerSignup />} />
          
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* --- PUBLIC STATIC PAGES --- */}
          <Route path="/isolation" element={<ExercisePage />} />
          <Route path="/exercises" element={<ExercisePage />} />
          <Route path="/nutrition" element={<NutritionPage />} /> 
          <Route path="/about" element={<AboutPage />} /> 
          <Route path="/contact" element={<ContactPage />} /> 
          
          
          {/* --- PROTECTED ROUTES (Requires Login) --- */}
            
            {/* 1. Member Routes (User) */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
               {/* Dashboard Access Routes (All paths redirected to the main UserDashboard component) */}
               <Route path="/userdashboard_b" element={<UserDashboard />} />
               <Route path="/userdashboard_g" element={<UserDashboard />} />
               <Route path="/userdashboard_p" element={<UserDashboard />} />
               
               {/* Primary Dashboard Route */}
               <Route path="/userdashboard" element={<UserDashboard />} /> 
               
               {/* User Specific Feature Pages */}
               <Route 
                   path="/user/nutrition" 
                   element={<UserNutritionPage />} 
               /> 
               <Route 
                   path="/user/exercises" 
                   element={<UserExercisesPage />} 
               /> 
               <Route 
                   path="/user/profile" 
                   element={<UserProfilePage />} 
               />
            </Route>

            {/* 2. Trainer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['trainer']} />}>
               <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
               {/* Add other trainer pages here */}
            </Route>

            {/* 3. Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
             <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/trainers" element={<AdminTrainers />} />
                {/* Add memberships, exercises, verifiers here next */}
            </Route>
            </Route>  

        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;