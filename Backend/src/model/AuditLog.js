const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager',
        required: true
    },
    action: {
        type: String,
        enum: [
            'APPROVE_TRAINER',
            'REJECT_TRAINER',
            'ADD_EXERCISE',
            'EDIT_EXERCISE',
            'DELETE_EXERCISE',
            'REASSIGN_TRAINER',
            'SUSPEND_USER',
            'FLAG_REVIEW'
        ],
        required: true
    },
    // Generic target — works for any entity type
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    targetModel: {
        type: String,
        enum: ['Trainer', 'TrainerApplication', 'Exercise', 'User', 'TrainerReview'],
        required: true
    },
    details: {
        type: String,
        default: null    // e.g. "Rejected: insufficient credentials"
    },
    performedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Fast lookup: all actions by one manager this month
auditLogSchema.index({ managerId: 1, performedAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);