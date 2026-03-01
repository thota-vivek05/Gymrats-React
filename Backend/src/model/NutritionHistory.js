const mongoose = require('mongoose');

const daySchema = {
    calories_consumed: { type: Number, min: 0, default: 0 },
    protein_consumed: { type: Number, min: 0, default: 0 },
    foods: [{
        name: { type: String },
        protein: { type: Number, min: 0 },
        calories: { type: Number, min: 0 },
        carbs: { type: Number, min: 0 },
        fats: { type: Number, min: 0 },
        consumed: { type: Boolean, default: false },
        consumedAt: { type: Date }
    }],
    macros: {
        protein: { type: Number, min: 0, default: 0 },
        carbs: { type: Number, min: 0, default: 0 },
        fats: { type: Number, min: 0, default: 0 }
    }
};

const nutritionHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    protein_goal: { type: Number, min: 0 },
    calorie_goal: { type: Number, min: 0 },
    daily_nutrition: {
        Monday: daySchema,
        Tuesday: daySchema,
        Wednesday: daySchema,
        Thursday: daySchema,
        Friday: daySchema,
        Saturday: daySchema,
        Sunday: daySchema
    },
    weekly_macros: {
        protein: { type: Number, min: 0 },
        carbs: { type: Number, min: 0 },
        fats: { type: Number, min: 0 }
    },

    // ── NEW FIELDS ──────────────────────────────────────────────────

    // Set true when user logs all meals for the week
    isComplete: {
        type: Boolean,
        default: false
    },
    // Reason if week was missed / incomplete
    missed_reason: {
        type: String,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('NutritionHistory', nutritionHistorySchema);