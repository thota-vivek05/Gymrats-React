import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Use the full backend URL
      const response = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        // Important: this allows the session cookie to be set
        credentials: 'include' 
      });

      const data = await response.json();

      if (data.success) {
        // Pass the user object to your context
        // We use a dummy token because AuthContext expects one, but auth is actually cookie-based
        login(data.user, 'session-token'); 
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Is the backend running?');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-500">GymRats Admin</h1>
          <p className="text-gray-400 mt-2">Secure Access Portal</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-3 focus:outline-none focus:border-red-500"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-3 focus:outline-none focus:border-red-500"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition duration-300"
          >
            Login to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;