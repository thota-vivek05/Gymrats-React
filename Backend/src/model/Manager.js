const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password_hash: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
    },
    permissions: [{
        type: String,
        enum: [
            'manage_exercises',
            'approve_trainers',
            'manage_users',
            'view_trainer_ratings'
        ]
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    role: {
        type: String,
        enum: ['admin', 'manager'],
        default: 'manager' // Anyone created normally defaults to a manager
    },
    // Running counters — fast to read on Admin's Manager overview card
    actionsPerformed: {
        trainers_approved: { type: Number, default: 0 },
        trainers_rejected: { type: Number, default: 0 },
        exercises_added:   { type: Number, default: 0 },
        exercises_edited:  { type: Number, default: 0 },
        users_reassigned:  { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Manager', managerSchema);