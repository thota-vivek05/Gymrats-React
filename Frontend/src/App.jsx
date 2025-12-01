import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/Home/HomePage';
import Login from './pages/Auth/Login';
import UserSignup from './pages/Auth/UserSignup';
import TrainerSignup from './pages/Auth/TrainerSignup';
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

          {/* PROTECTED ROUTES */}
            
            {/* 1. Member Routes */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            {/* <Route path="/userdashboard_b" element={<UserDashboard />} />
          <Route path="/userdashboard_g" element={<UserDashboard />} /> */}
          <Route path="/dashboard" element={<UserDashboard />} />

            <Route path="/userprofile" element={<UserProfile />} />
               {/* <Route path="/dashboard" element={<UserDashboard />} /> */}
               {/* Add pages here like /profile, /workouts */}
            </Route>

            {/* 2. Trainer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['trainer']} />}>
               <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
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