import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/Home/HomePage';
import Login from './pages/Auth/Login';
import UserSignup from './pages/Auth/UserSignup';
import TrainerSignup from './pages/Auth/TrainerSignup';
import ExercisePage from "./pages/Home/related/ExercisePage";
import NutritionPage from "./pages/Home/related/NutritionPage";
import AboutPage from "./pages/Home/related/AboutPage";
import ContactPage from "./pages/Home/related/ContactPage";

// import UserDashboard from './pages/User/UserDashboard';
import TrainerDashboard from './pages/Trainer/TrainerDashboard';

// Protected Routes
import ProtectedRoute from './components/common/ProtectedRoute'

import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminLayout from './pages/Admin/components/AdminLayout'; 
import AdminUsers from './pages/Admin/AdminUsers';
import AdminTrainers from './pages/Admin/AdminTrainers';

// ✅ 1. IMPORT THE VERIFICATIONS COMPONENT
import AdminVerifications from './pages/Admin/AdminVerifications'; 

import UserDashboard from './pages/User/UserDashboard';
import UserProfile from './pages/User/UserProfile'; 
import UserExercises from './pages/User/UserExercises';
import UserNutrition from './pages/User/UserNutrition';

import EditWorkoutPlan from './pages/Trainer/EditWorkoutPlan.jsx';
import EditNutritionPlan from './pages/Trainer/EditNutritionPlan.jsx';

function App() {
  return (
    <AuthProvider>
    <Router>
      <div className="App">
        <Routes>
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

          {/* PROTECTED ROUTES - Requires Login */}
            {/* This wrapper ensures the user is logged in before rendering child routes */}
            
            {/* 1. Member Routes */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            {/* <Route path="/userdashboard_b" element={<UserDashboard />} />
          <Route path="/userdashboard_g" element={<UserDashboard />} /> */}
          <Route path="/dashboard" element={<UserDashboard />} />

            <Route path="/userprofile" element={<UserProfile />} />
            <Route path="/user_exercises" element={<UserExercises />} />
            <Route path="/user_nutrition" element={<UserNutrition />} />
               {/* <Route path="/dashboard" element={<UserDashboard />} /> */}
               {/* Add pages here like /profile, /workouts */}
            </Route>

            {/* 2. Trainer Routes */}
            {/* 2. Trainer Routes */}
<Route element={<ProtectedRoute allowedRoles={['trainer']} />}>
    {/* Update path from "/trainer/dashboard" to "/trainer" */}
    <Route path="/trainer" element={<TrainerDashboard />} />

               {/* 2b. Edit Workout Plan Route */}
                <Route 
                    path="/trainer/workout/edit/:clientId" 
                    element={<EditWorkoutPlan />} 
                />

                {/* 2c. Edit Nutrition Plan Route */}
                <Route 
                    path="/trainer/nutrition/edit/:clientId" 
                    element={<EditNutritionPlan />} 
                />
                
                {/* Add other trainer pages here */}
            </Route>

            {/* 3. Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/trainers" element={<AdminTrainers />} />
                    
                    {/* ✅ 2. ADD THIS ROUTE HERE */}
                    <Route path="/admin/verifiers" element={<AdminVerifications />} />
                    
                </Route>
            </Route>  

        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;