// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const timeoutRef = useRef(null);

    // 1. GLOBAL FETCH INTERCEPTOR (For Subscription Logic)
    useEffect(() => {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            // Check for our custom 403 Membership Expired response
            if (response.status === 403) {
                const cloned = response.clone();
                try {
                    const data = await cloned.json();
                    if (data.action === 'redirect_renewal') {
    // If they aren't already on the profile page, force them there
    if (window.location.pathname !== '/userprofile') {
        alert("Your membership has expired. Please renew to access the dashboard.");
        window.location.href = '/userprofile'; 
    }
}
                } catch (e) { /* ignore parse errors */ }
            }
            return response;
        };
        return () => { window.fetch = originalFetch; };
    }, []);

    // 2. IDLE TIMEOUT LOGIC
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const resetTimer = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        // Set idle timeout to 15 minutes (900000 ms)
        timeoutRef.current = setTimeout(() => {
            alert("You have been logged out due to inactivity.");
            logout();
        }, 900000); 
    };

    useEffect(() => {
        // Listen for user activity to reset the timer
        const events = ['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress'];
        const handleEvent = () => resetTimer();
        
        if (user) {
            events.forEach(e => window.addEventListener(e, handleEvent));
            resetTimer(); // Start timer initially
        }

        return () => {
            events.forEach(e => window.removeEventListener(e, handleEvent));
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [user]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const value = { user, login, logout, loading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};