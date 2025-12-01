import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/Home/HomePage';
import Login from './pages/Auth/Login';
import UserSignup from './pages/Auth/UserSignup';
import TrainerSignup from './pages/Auth/TrainerSignup';

// Proteted Routes
import ProtectedRoute from './components/common/ProtectedRoute'

// import UserDashboard from './pages/User/UserDashboard';
import TrainerDashboard from './pages/Trainer/TrainerDashboard';

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

          {/* PROTECTED ROUTES - Requires Login */}
            {/* This wrapper ensures the user is logged in before rendering child routes */}
            
            {/* 1. Member Routes */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
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

        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;