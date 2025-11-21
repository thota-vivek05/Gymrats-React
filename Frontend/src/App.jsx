// import { BrowserRouter as Router, Routes, Route } from 'react-router';
// import HomePage from './pages/Home/HomePage';
// import LoginSignup from './pages/Auth/LoginSignup';

// function App() {
//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/home" element={<HomePage />} />
//           <Route path="/auth" element={<LoginSignup />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/HomePage';
import LoginSignup from './pages/Auth/LoginSignup';
import UserDashboard from './pages/User/UserDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/auth" element={<LoginSignup />} />
          
          {/* User Dashboard Routes - similar to home and auth */}
          <Route path="/userdashboard_b" element={<UserDashboard />} />
          <Route path="/userdashboard_g" element={<UserDashboard />} />
          <Route path="/userdashboard_p" element={<UserDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;