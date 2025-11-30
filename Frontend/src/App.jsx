import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/Home/HomePage';
import Login from './pages/Auth/Login';
import UserSignup from './pages/Auth/UserSignup';
import TrainerSignup from './pages/Auth/TrainerSignup';
// import UserDashboard from './pages/User/UserDashboard';
import TrainerDashboard from './pages/Trainer/TrainerDashboard';

// Proteted Routes
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
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup/user" element={<UserSignup />} />
          <Route path="/signup/trainer" element={<TrainerSignup />} />
          
          <Route path="/admin/login" element={<AdminLogin />} />
          


          {/* PROTECTED ROUTES - Requires Login */}
            {/* This wrapper ensures the user is logged in before rendering child routes */}
            
            {/* 1. Member Routes */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
               {/* <Route path="/dashboard" element={<UserDashboard />} /> */}
               {/* Add pages here like /profile, /workouts */}
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
                {/* You will add memberships, exercises, verifiers here next */}
            </Route>
            </Route>  

        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;