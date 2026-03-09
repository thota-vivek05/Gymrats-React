const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const multer = require('multer');
const path = require('path');

const { protect } = require('../middleware/authMiddleware');

// Configure Multer specifically for trainer applications
const trainerStorage = multer.diskStorage({
    destination: 'uploads/trainer-resumes/', // Separate folder for resumes
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to accept only PDF and document files
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and Word documents are allowed'), false);
    }
};

const uploadResume = multer({
    storage: trainerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Serve uploaded resumes (add this after your routes)
router.get('/resume/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/trainer-resumes', filename);
    
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(404).json({ error: 'File not found' });
        }
    });
});

// ========================================
// PUBLIC ROUTES (No Auth Required)
// ========================================

router.get('/client-progress/:clientId', protect, trainerController.getClientProgress);

// Handle trainer signup submission WITH file upload
router.post('/signup', uploadResume.single('resume'), trainerController.signupTrainer);

// ========================================
// EJS ROUTES (Session-based, Keep for backward compatibility)
// ========================================

// Route for Revenue and Expiring Users Stats
router.get('/stats', protect, trainerController.getTrainerStats);

// Route for specific Client History
router.get('/client-history/:userId', protect, trainerController.getClientHistory);

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