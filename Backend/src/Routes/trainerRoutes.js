const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');

const { protect } = require('../middleware/authMiddleware');

// Render trainer signup form
// router.get('/signup/trainer', (req, res) => {
//     res.render('trainer_form');
// });

// Handle trainer signup submission
router.post('/signup', trainerController.signupTrainer);

// The login functionality has been moved to authRoutes.js

// // Render trainer login form
// router.get('/trainer_login', trainerController.renderTrainerLogin);
// // Handle trainer login submission
// router.post('/trainer/login', trainerController.loginTrainer);

// Render trainer dashboard
router.get('/trainer', trainerController.renderTrainerDashboard);

// Render edit workout plan
router.get('/edit_workout_plan/:userId', trainerController.renderEditWorkoutPlan);

// Save workout plan
router.post('/save-workout-plan', trainerController.saveWorkoutPlan);

// Fetch workout data
router.get('/workout/:userId', protect, trainerController.getWorkoutData);

// Render edit nutrition plan
router.get('/edit_nutritional_plan/:userId', trainerController.renderEditNutritionPlan);

// Save nutrition plan
router.post('/edit_nutritional_plan', trainerController.editNutritionPlan);

// react
router.get('/clients', protect, trainerController.getClients);

// Fetch client data
router.get('/client/:id', protect, trainerController.getClientData);

// Fetch nutrition data
router.get('/nutrition/:userId', protect, trainerController.getNutritionData);

// Add this route to trainerRoutes.js
// BEFORE:
// router.get('/exercise-ratings/:userId', trainerController.getClientExerciseRatings);
// AFTER:
// router.get('/trainer/exercise-ratings/:userId', protect, trainerController.getClientExerciseRatings);
// Remove BOTH lines and replace with just this ONE:
router.get('/exercise-ratings/:userId', protect, trainerController.getClientExerciseRatings);

// REYNA


// Render trainer assignment page
router.get('/trainer/assignment', trainerController.renderTrainerAssignment);

// Assign user to trainer
router.post('/trainer/assign-user', trainerController.assignUserToTrainer);

// Get unassigned users (API endpoint)
router.get('/trainer/unassigned-users', trainerController.getUnassignedUsers);

// END REYNA

module.exports = router;