const mongoose = require('mongoose');

const trainerReviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    feedback: {
        type: String,
        default: null
    },
    reviewedAt: {
        type: Date,
        default: Date.now
    },
    // Manager flags this when rating is poor — triggers reassignment flow
    flaggedForReassignment: {
        type: Boolean,
        default: false
    },
    reassignedBy: {
        managerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Manager',
            default: null
        },
        reassignedAt: {
            type: Date,
            default: null
        }
    }
}, { timestamps: true });

// One review per user per trainer
trainerReviewSchema.index({ userId: 1, trainerId: 1 }, { unique: true });

module.exports = mongoose.model('TrainerReview', trainerReviewSchema);