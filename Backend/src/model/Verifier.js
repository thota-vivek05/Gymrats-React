const mongoose = require('mongoose');

// In Verifier.js - update the schema
const verifierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
    },
    password: {
        type: String,
        required: true
    },
    experienceYears: {
        type: Number,
        required: true,
        min: 1
    },
    specialization: {
        type: String,
        default: 'General'
    },
    certifications: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Verifier', verifierSchema);