const mongoose = require('mongoose');

const workoutHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workoutPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutPlan'
    },
    date: {
        type: Date,
        default: Date.now
    },
    exercises: [{
        day: {
            type: String,
            required: true,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        name: { type: String, required: true },
        sets: { type: Number, min: 1 },
        reps: { type: Number, min: 1 },
        weight: { type: Number, min: 0 },
        duration: { type: Number, min: 0 },
        completed: { type: Boolean, default: false }
    }],
    progress: {
        type: Number,
        min: 0,
        max: 100
    },
    completed: {
        type: Boolean,
        default: false
    },

    // ── NEW FIELDS ──────────────────────────────────────────────────

    // Set true when user marks all exercises done
    isComplete: {
        type: Boolean,
        default: false
    },
    // Reason if skipped / inactive — e.g. "No activity logged", "User skipped"
    missed_reason: {
        type: String,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('WorkoutHistory', workoutHistorySchema);