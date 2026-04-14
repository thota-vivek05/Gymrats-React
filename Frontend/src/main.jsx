import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Redux Imports
import { Provider } from 'react-redux'; 
import { store } from './redux/store';

// Auth & Google Imports
import { AuthProvider } from './context/AuthContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 1. Redux Provider wraps everything */}
    <Provider store={store}>
      {/* 2. Google OAuth Provider */}
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        {/* 3. Your custom Auth Provider */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>
);