const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    membershipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Membership",
        default: null
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trainer",
        default: null
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    paymentFor: {
        type: String,
        enum: ["Membership", "TrainerUpgrade", "DietPlan", "Other"],
        default: "Membership"
    },
    paymentMethod: {
        type: String,
        enum: ["Card", "UPI", "NetBanking", "Cash"]
    },
    status: {
        type: String,
        enum: ["Success", "Failed", "Refunded"],
        default: "Success"
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    revenueMonth: {
        type: String,
        default: () => {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        }
    },
    membershipPlan: {
        type: String,
        enum: ['basic', 'gold', 'platinum'],
        default: null
    },
    isRenewal: {
        type: Boolean,
        default: false
    },
    // Links to the payment this renewed — enables CLV and churn queries
    // null for first-time purchases, set to previous Payment._id on renewal
    previousPaymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);