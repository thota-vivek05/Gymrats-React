import { BrowserRouter as Router, Routes, Route } from 'react-router';
import HomePage from './pages/Home/HomePage';
import LoginSignup from './pages/Auth/LoginSignup';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/auth" element={<LoginSignup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;