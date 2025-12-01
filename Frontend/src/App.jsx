import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/Home/HomePage';
import Login from './pages/Auth/Login';
import UserSignup from './pages/Auth/UserSignup';
import TrainerSignup from './pages/Auth/TrainerSignup';
// import UserDashboard from './pages/User/UserDashboard';
import TrainerDashboard from './pages/Trainer/TrainerDashboard';
import UserDashboard from './pages/User/UserDashboard';  
// Proteted Routes
import ProtectedRoute from './components/common/ProtectedRoute'

import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminLayout from './pages/Admin/components/AdminLayout'; 
import AdminUsers from './pages/Admin/AdminUsers';
import AdminTrainers from './pages/Admin/AdminTrainers';
import AdminMemberships from './pages/Admin/AdminMemberships';
import AdminExercises from './pages/Admin/AdminExercises';
import AdminVerifiers from './pages/Admin/AdminVerifiers';
import AdminTrainerAssignment from './pages/Admin/AdminTrainerAssignment';


function App() {
  return (
    <AuthProvider>
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup/user" element={<UserSignup />} />
          <Route path="/signup/trainer" element={<TrainerSignup />} />
          
          {/* Admin Login - Public Route (Not Protected) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* PROTECTED ROUTES - Requires Login */}
            {/* This wrapper ensures the user is logged in before rendering child routes */}
            
            {/* 1. Member Routes */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            {/* <Route path="/userdashboard_b" element={<UserDashboard />} />
          <Route path="/userdashboard_g" element={<UserDashboard />} /> */}
          <Route path="/dashboard" element={<UserDashboard />} />

               {/* <Route path="/dashboard" element={<UserDashboard />} /> */}
               {/* Add pages here like /profile, /workouts */}
            </Route>

          {/* 2. Trainer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['trainer']} />}>
             <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
             {/* Add other trainer pages here */}
          </Route>

          {/* 3. Admin Routes - Protected */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/trainers" element={<AdminTrainers />} />
            <Route path="/admin/memberships" element={<AdminMemberships />} />
            <Route path="/admin/exercises" element={<AdminExercises />} />
            <Route path="/admin/verifiers" element={<AdminVerifiers />} />
            <Route path="/admin/trainer-assignment" element={<AdminTrainerAssignment />} />
          </Route>

        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;