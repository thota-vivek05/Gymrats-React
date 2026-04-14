const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
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
    password_hash: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
    },
    experience: {
        type: String,
        required: true,
        enum: ['1-2', '3-5', '5-10', '10+']
    },
    meetingLink: {
        type: String,
        default: ""
    },
    specializations: [{
        type: String,
        enum: ['Calisthenics', 'Weight Loss', 'HIIT', 'Competitive', 'Strength Training', 'Cardio', 'Flexibility', 'Bodybuilding']
    }],
    verifierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Verifier',
        default: null
    },
    clients: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        isActive: {
            type: Boolean,
            default: true
        },
        droppedAt: {
            type: Date,
            default: null
        }
    }],
    sessions: [{
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: { type: Date, required: true },
        time: { type: String, required: true },
        meetLink: { type: String }
    }],
    workoutPlans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutPlan'
    }],
    nutritionPlans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NutritionPlan'
    }],
    totalRevenue: {
        type: Number,
        default: 0
    },
    totalClients: {
        type: Number,
        default: 0
    },
    // Cap for Platinum assignments — Manager checks this before assigning
    maxClients: {
        type: Number,
        default: 20
    },
    monthly_revenue: [{
        month: { type: String },
        amount: { type: Number, default: 0 },
        new_clients: { type: Number, default: 0 },
        dropped_clients: { type: Number, default: 0 }
    }],
    joined_users_count: {
        type: Number,
        default: 0
    },
    dropped_users_count: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended', 'Expired'],
        default: 'Active'
    }
}, { timestamps: true });

// Virtual — tells Manager instantly if trainer can take more Platinum users
trainerSchema.virtual('isAvailable').get(function () {
    const activeCount = (this.clients || []).filter(c => c.isActive).length;
    return activeCount < this.maxClients;
});

trainerSchema.set('toJSON', { virtuals: true });
trainerSchema.set('toObject', { virtuals: true });

// Indexing for faster queries
trainerSchema.index({ name: "text", email: "text" });
trainerSchema.index({ status: 1 });

module.exports = mongoose.model('Trainer', trainerSchema);