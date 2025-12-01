const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');

const { protect } = require('../middleware/authMiddleware');

// ========================================
// PUBLIC ROUTES (No Auth Required)
// ========================================

// Handle trainer signup submission
router.post('/signup', trainerController.signupTrainer);

// ========================================
// EJS ROUTES (Session-based, Keep for backward compatibility)
// ========================================

// Render trainer dashboard (EJS version - session based)
router.get('/trainer', trainerController.renderTrainerDashboard);

// Render edit workout plan (EJS - session based)
router.get('/edit_workout_plan/:userId', trainerController.renderEditWorkoutPlan);

// Render edit nutrition plan (EJS - session based)
router.get('/edit_nutritional_plan/:userId', trainerController.renderEditNutritionPlan);

// REYNA - Trainer Assignment (EJS - session based)
router.get('/trainer/assignment', trainerController.renderTrainerAssignment);
router.post('/trainer/assign-user', trainerController.assignUserToTrainer);
router.get('/trainer/unassigned-users', trainerController.getUnassignedUsers);

// ========================================
// HYBRID ROUTES (Work with both session AND JWT)
// ========================================

// FIX: Added 'protect' middleware here. 
// This ensures req.user is populated when React sends the Bearer token.
router.post('/save-workout-plan', protect, trainerController.saveWorkoutPlan);
router.post('/edit_nutritional_plan', protect, trainerController.editNutritionPlan);

// ========================================
// REACT API ROUTES (JWT-based with /api prefix)
// ========================================

router.get('/clients', protect, trainerController.getClients);
router.get('/client/:id', protect, trainerController.getClientData);
router.get('/workout/:userId', protect, trainerController.getWorkoutData);
router.get('/nutrition/:userId', protect, trainerController.getNutritionData);
router.get('/exercise-ratings/:userId', protect, trainerController.getClientExerciseRatings);

// Get exercises list
router.get('/exercises/list', protect, async (req, res) => {
    try {
        const Exercise = require('../model/Exercise');
        const exercises = await Exercise.find({ verified: true })
            .select('name category difficulty targetMuscles type defaultSets defaultRepsOrDuration')
            .sort({ name: 1 })
            .lean();
        res.json(exercises);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});

module.exports = router;