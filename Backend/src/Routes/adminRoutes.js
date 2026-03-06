const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { admin_Protect } = require('../middleware/authMiddleware');

// Public Admin Login Route (No protection needed)
// Public Admin Login Route (No protection needed)
router.get('/login', adminController.getAdminLogin);
router.post('/login', adminController.postAdminLogin);
router.get('/logout', adminController.adminLogout);

// Apply admin_Protect middleware to all routes below this line
router.use(admin_Protect);

// Apply admin_Protect middleware to all routes below this line
router.use(admin_Protect);

// Dashboard Route
router.get('/dashboard', adminController.getDashboard);
router.get('/', (req, res) => res.redirect('/admin/dashboard'));

// User Routes
router.get('/users', adminController.getUsers);
router.get('/users/dropped', adminController.getDroppedUsers); 
router.get('/users/:id/details', adminController.getUserDetails);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Trainer Routes
router.get('/trainers', adminController.getTrainers);
router.post('/trainers', adminController.createTrainer);
router.put('/trainers/:id', adminController.updateTrainer);
router.delete('/trainers/:id', adminController.deleteTrainer);
router.get('/trainers/search', adminController.searchTrainers);
router.get('/trainer-stats', adminController.getTrainerStats);
router.get('/trainers/search', adminController.searchTrainers);
router.get('/trainer-stats', adminController.getTrainerStats);

// Trainer Application Routes
// Trainer Application Routes
router.get('/trainer-applications', adminController.getTrainerApplications);
router.put('/trainer-applications/:id/approve', adminController.approveTrainerApplication);
router.put('/trainer-applications/:id/reject', adminController.rejectTrainerApplication);

// Trainer Assignment Routes
// Trainer Assignment Routes
router.get('/trainer-assignment-data', adminController.getTrainerAssignmentData);
router.post('/assign-trainer-admin', adminController.assignTrainerToUserAdmin);

// Exercise Routes
router.get('/exercises', adminController.getExercises);
router.get('/exercises/search', adminController.searchExercises);
router.post('/exercises', adminController.createExercise);
router.put('/exercises/:id', adminController.updateExercise);
router.delete('/exercises/:id', adminController.deleteExercise);
router.post('/assign-trainer-admin', adminController.assignTrainerToUserAdmin);

// Exercise Routes
router.get('/exercises', adminController.getExercises);
router.get('/exercises/search', adminController.searchExercises);
router.post('/exercises', adminController.createExercise);
router.put('/exercises/:id', adminController.updateExercise);
router.delete('/exercises/:id', adminController.deleteExercise);

// Membership Routes
router.get('/memberships', adminController.getMemberships);
router.post('/memberships', adminController.createMembership);
router.put('/memberships/:id', adminController.updateMembership);
router.delete('/memberships/:id', adminController.deleteMembership);

// Verifier Routes
router.get('/verifiers', adminController.getVerifiers);
router.post('/verifiers', adminController.createVerifier);
router.put('/verifiers/:id', adminController.updateVerifier);
router.delete('/verifiers/:id', adminController.deleteVerifier);
router.put('/verifiers/:id/approve', adminController.approveVerifier);
router.put('/verifiers/:id/reject', adminController.rejectVerifier);

// ============ RATINGS INTELLIGENCE ROUTES ============
router.get('/ratings/top-exercises', adminController.getTopRatedExercises);
router.get('/ratings/trainer-leaderboard', adminController.getTrainerRatingLeaderboard);
router.get('/ratings/trainer/:trainerId/reviews', adminController.getTrainerReviews);
router.put('/ratings/flag-review/:reviewId', adminController.flagReviewForReassignment);

// ============ TRAINER REASSIGNMENT ROUTES ============
router.get('/reassignment/poorly-rated-trainers', adminController.getPoorlyRatedTrainers);
router.get('/reassignment/potential-trainers/:userId', adminController.getPotentialTrainersForUser);
router.post('/reassignment/assign', adminController.reassignUserToTrainer);
router.get('/reassignment/pending-flags', adminController.getPendingReassignmentFlags);

module.exports = router;