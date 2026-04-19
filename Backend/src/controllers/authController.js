// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const Trainer = require('../model/Trainer');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = 'gymrats-secret-key'; // In production, use environment variable

const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validate input
        if (!email || !password || !role) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email, password, and role are required' 
            });
        }

        let user;
        let userType;

        // Find user based on role
        if (role === 'user') {
            user = await User.findOne({ email });
            userType = 'user';
        } else if (role === 'trainer') {
            user = await Trainer.findOne({ email });
            userType = 'trainer';
        } else {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid role. Must be "user" or "trainer"' 
            });
        }

        // Check if user exists
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }

        // Check account status
        if (user.status !== 'Active') {
            return res.status(403).json({ 
                success: false, 
                error: `Your account is ${user.status.toLowerCase()}. Please contact support.` 
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: userType,
                name: user.full_name || user.name 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Prepare response data
        let responseData = {
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.full_name || user.name,
                role: userType
            }
        };

        // Add role-specific data
        if (userType === 'user') {
            responseData.user.membershipType = user.membershipType;
            responseData.redirect = `/userdashboard_${user.membershipType.charAt(0).toLowerCase()}`;
        } else if (userType === 'trainer') {
            responseData.redirect = '/trainer';
        }

        res.json(responseData);

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error. Please try again later.' 
        });
    }
};

// ==========================================
// GOOGLE OAUTH LOGIN
// ==========================================
const googleLogin = async (req, res) => {
  try {
    const { token, role } = req.body;

    if (!role || (role !== 'user' && role !== 'trainer')) {
        return res.status(400).json({ success: false, message: 'Invalid or missing role.' });
    }

    // 1. Verify the Google Token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    // 2. Extract the user's Google details
    const { email } = ticket.getPayload();

    // 3. Check if the user already exists in GymRats based on role
    let user;
    if (role === 'user') {
        user = await User.findOne({ email });
    } else {
        user = await Trainer.findOne({ email });
    }

    // 4. Reject if account does not exist (Enforces standard signup)
    if (!user) {
        return res.status(404).json({ 
            success: false, 
            message: `Account not found as a ${role}. Please complete the standard signup process first.` 
        });
    }

    // 5. Check account status (Matches standard login logic)
    if (user.status !== 'Active') {
        return res.status(403).json({ 
            success: false, 
            message: `Your account is ${user.status ? user.status.toLowerCase() : 'inactive'}. Please contact support.` 
        });
    }

    // 6. EXACT MATCH: Create JWT token identically to standard login
    const jwtToken = jwt.sign(
        { 
            id: user._id, 
            email: user.email, 
            role: role,
            name: user.full_name || user.name 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    // 7. EXACT MATCH: Send the exact same user object back to React
    const userData = {
        id: user._id,
        email: user.email,
        name: user.full_name || user.name,
        role: role
    };

    if (role === 'user') {
        userData.membershipType = user.membershipType; // Critical for routing and dashboard rendering
    }

    res.status(200).json({
        success: true,
        message: 'Google Login Successful',
        token: jwtToken,
        user: userData
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ success: false, message: "Server error during Google Authentication" });
  }
};

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            error: 'Access denied. No token provided.' 
        });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: 'Invalid token' 
        });
    }
};

const getProfile = (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
};

module.exports = {
    login,
    verifyToken,
    getProfile,
    googleLogin
};