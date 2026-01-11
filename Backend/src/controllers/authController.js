// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const Trainer = require('../model/Trainer');

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
    getProfile
};