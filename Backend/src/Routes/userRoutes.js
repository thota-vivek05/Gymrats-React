const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const membershipController = require('../controllers/membershipController');
const NutritionHistory = require('../model/NutritionHistory');
const WorkoutHistory = require('../model/WorkoutHistory');
const User = require('../model/User');

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.status(401).json({ error: 'Authentication required' });
};

// Existing EJS routes (keep these for now)
router.get('/login_signup', (req, res) => {
    res.render('login_signup', { form: req.query.form || 'login' });
});

router.get('/userdashboard_:type', userController.checkMembershipActive, (req, res, next) => {
    const dashboardType = req.params.type;
    userController.getUserDashboard(req, res, dashboardType);
});

// ========== NEW JSON API ENDPOINTS FOR REACT ==========

// Get user profile data
router.get('/api/user/profile', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id)
            .populate('trainer', 'name email specializations experience')
            .select('-password_hash');
        
        res.json({
            success: true,
            user: {
                ...user.toObject(),
                // Add session data
                membershipType: req.session.user.membershipType,
                membershipDuration: req.session.user.membershipDuration
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get today's workout data
router.get('/api/workout/today', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const todayWorkoutData = await userController.getTodaysWorkout(userId);
        
        res.json({
            success: true,
            ...todayWorkoutData
        });
    } catch (error) {
        console.error('Error fetching today workout:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get today's nutrition data
router.get('/api/nutrition/today', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const todaysConsumedFoods = await userController.getTodaysFoods(userId);
        
        // Get user for goals
        const user = await User.findById(userId);
        
        // Calculate today's nutrition from weekly plan
        const today = new Date();
        const weekStart = new Date(today);
        const dayOfWeek = today.getDay();
        weekStart.setDate(today.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        const weeklyNutrition = await NutritionHistory.findOne({
            userId: userId,
            date: { $gte: weekStart, $lt: weekEnd }
        });
        
        let todayNutrition = { 
            calories_consumed: 0, 
            protein_consumed: 0,
            calorie_goal: user.fitness_goals.calorie_goal,
            protein_goal: user.fitness_goals.protein_goal,
            macros: { protein: 0, carbs: 0, fats: 0 }
        };
        
        if (weeklyNutrition) {
            const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
            const todayData = weeklyNutrition.daily_nutrition[todayDayName];
            
            if (todayData) {
                todayNutrition = {
                    calories_consumed: todayData.calories_consumed || 0,
                    protein_consumed: todayData.protein_consumed || 0,
                    calorie_goal: weeklyNutrition.calorie_goal || user.fitness_goals.calorie_goal,
                    protein_goal: weeklyNutrition.protein_goal || user.fitness_goals.protein_goal,
                    macros: todayData.macros || { protein: 0, carbs: 0, fats: 0 }
                };
            }
        }
        
        res.json({
            success: true,
            todayNutrition,
            todaysConsumedFoods
        });
    } catch (error) {
        console.error('Error fetching today nutrition:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get weekly workout stats
router.get('/api/workout/weekly-stats', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dayOfWeek = today.getDay();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        const weeklyWorkoutHistory = await WorkoutHistory.find({
            userId: userId,
            date: { $gte: weekStart, $lt: weekEnd }
        });
        
        const workoutsCompleted = weeklyWorkoutHistory.filter(w => w.completed).length;
        const workoutsTotal = weeklyWorkoutHistory.length;
        
        res.json({
            success: true,
            weeklyWorkouts: {
                completed: workoutsCompleted,
                total: workoutsTotal
            }
        });
    } catch (error) {
        console.error('Error fetching weekly stats:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get exercise progress data
router.get('/api/exercise/progress', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        // Get all workout history to find max weights
        const allWorkouts = await WorkoutHistory.find({ userId: userId });
        
        const exerciseMaxWeights = {
            'Bench Press': 0,
            'Squat': 0,
            'Deadlift': 0
        };
        
        allWorkouts.forEach(workout => {
            if (workout.exercises && workout.exercises.length > 0) {
                workout.exercises.forEach(exercise => {
                    const exerciseName = exercise.name.toLowerCase();
                    const weight = exercise.weight || 0;
                    
                    if (exerciseName.includes('bench') || exerciseName.includes('press')) {
                        if (weight > exerciseMaxWeights['Bench Press']) {
                            exerciseMaxWeights['Bench Press'] = weight;
                        }
                    }
                    else if (exerciseName.includes('squat')) {
                        if (weight > exerciseMaxWeights['Squat']) {
                            exerciseMaxWeights['Squat'] = weight;
                        }
                    }
                    else if (exerciseName.includes('deadlift')) {
                        if (weight > exerciseMaxWeights['Deadlift']) {
                            exerciseMaxWeights['Deadlift'] = weight;
                        }
                    }
                });
            }
        });
        
        const exerciseProgress = [
            { 
                name: 'Bench Press', 
                progress: exerciseMaxWeights['Bench Press'] > 0 ? Math.round((exerciseMaxWeights['Bench Press'] / 100) * 100) : 0, 
                currentWeight: exerciseMaxWeights['Bench Press'], 
                goalWeight: 100 
            },
            { 
                name: 'Squat', 
                progress: exerciseMaxWeights['Squat'] > 0 ? Math.round((exerciseMaxWeights['Squat'] / 120) * 100) : 0, 
                currentWeight: exerciseMaxWeights['Squat'], 
                goalWeight: 120 
            },
            { 
                name: 'Deadlift', 
                progress: exerciseMaxWeights['Deadlift'] > 0 ? Math.round((exerciseMaxWeights['Deadlift'] / 130) * 100) : 0, 
                currentWeight: exerciseMaxWeights['Deadlift'], 
                goalWeight: 130 
            }
        ];
        
        res.json({
            success: true,
            exerciseProgress
        });
    } catch (error) {
        console.error('Error fetching exercise progress:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get upcoming class
router.get('/api/class/upcoming', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const user = await User.findById(userId).populate('class_schedules.trainerId', 'name');
        
        const upcomingClass = user.class_schedules && user.class_schedules.length > 0
            ? user.class_schedules
                .filter(cls => {
                    const classDate = new Date(cls.date);
                    const now = new Date();
                    return classDate >= now;
                })
                .sort((a, b) => new Date(a.date) - new Date(b.date))[0]
            : null;
        
        // Format class data
        const formattedClass = upcomingClass ? {
            ...upcomingClass.toObject(),
            trainerName: upcomingClass.trainerId?.name || 'Coach'
        } : null;
        
        res.json({
            success: true,
            upcomingClass: formattedClass
        });
    } catch (error) {
        console.error('Error fetching upcoming class:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// ========== EXISTING ROUTES (KEEP THESE) ==========

router.post('/login', userController.loginUser);
router.post('/signup', userController.signupUser);
router.get('/profile', userController.getUserProfile);
router.post('/complete-workout', userController.completeWorkout);
router.post('/api/workout/complete', userController.markWorkoutCompleted);
router.post('/api/exercise/complete', userController.checkMembershipActive, isAuthenticated, userController.markExerciseCompleted);

// Debug routes
router.get('/api/debug/workout/:id', async (req, res) => {
    try {
        const workout = await WorkoutHistory.findById(req.params.id);
        res.json({
            workout: workout,
            exercises: workout?.exercises?.map(ex => ({
                name: ex.name,
                completed: ex.completed,
                _id: ex._id
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/api/debug/workouts', userController.checkMembershipActive, isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const workouts = await WorkoutHistory.find({ userId: userId });
        
        const today = new Date();
        const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getUTCDay()];
        
        res.json({
            userId: userId,
            today: todayDayName,
            totalWorkouts: workouts.length,
            workouts: workouts.map(w => ({
                id: w._id,
                date: w.date,
                exercises: w.exercises ? w.exercises.map(e => ({
                    name: e.name,
                    day: e.day,
                    completed: e.completed
                })) : [],
                exercisesForToday: w.exercises ? w.exercises.filter(e => e.day === todayDayName) : []
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Membership routes
router.post('/membership/extend', membershipController.extendMembership);
router.get('/membership/status', membershipController.getMembershipStatus);
router.post('/membership/auto-renew', membershipController.toggleAutoRenew);
router.post('/user/membership/change', isAuthenticated, userController.changeMembership);
router.get('/membership_renewal', isAuthenticated, (req, res) => {
    res.render('membership_renewal', { 
        user: req.session.user 
    });
});

// Page routes
router.get('/user_nutrition', userController.checkMembershipActive, isAuthenticated, (req, res) => {
    res.render('user_nutrition', { 
        user: req.session.user,
        currentPage: 'nutrition'
    });
});

router.get('/user_exercises', userController.checkMembershipActive, isAuthenticated, async (req, res) => {
    try {
        const User = require('../model/User');
        const user = await User.findById(req.session.user.id);
        
        res.render('user_exercises', { 
            user: {
                ...req.session.user,
                workout_type: user?.workout_type
            },
            currentPage: 'exercises'
        });
    } catch (error) {
        console.error('Error loading exercises page:', error);
        res.render('user_exercises', { 
            user: req.session.user,
            currentPage: 'exercises'
        });
    }
});

// Nutrition mark consumed
router.post('/api/nutrition/mark-consumed', userController.checkMembershipActive, isAuthenticated, async (req, res) => {
    try {
        const { foodName, calories, protein, carbs, fats, day } = req.body;
        const userId = req.session.user.id;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekStart = new Date(today);
        const dayOfWeek = today.getDay();
        weekStart.setDate(today.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        let nutritionEntry = await NutritionHistory.findOne({
            userId: userId,
            date: { $gte: weekStart, $lt: weekEnd }
        });
        
        if (!nutritionEntry) {
            return res.status(404).json({
                success: false,
                message: 'No nutrition plan found for this week'
            });
        }

        const targetDay = day || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
        const dayData = nutritionEntry.daily_nutrition[targetDay];
        
        if (!dayData) {
            return res.status(400).json({
                success: false,
                message: 'Day not found in nutrition plan: ' + targetDay
            });
        }

        const foodIndex = dayData.foods.findIndex(food => 
            food.name === foodName && food.consumed === false
        );

        if (foodIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Food not found or already consumed: ' + foodName
            });
        }

        dayData.foods[foodIndex].consumed = true;
        dayData.foods[foodIndex].consumedAt = new Date();

        dayData.calories_consumed = (dayData.calories_consumed || 0) + parseInt(calories);
        dayData.protein_consumed = (dayData.protein_consumed || 0) + parseInt(protein);
        
        dayData.macros.protein = (dayData.macros.protein || 0) + parseInt(protein);
        dayData.macros.carbs = (dayData.macros.carbs || 0) + parseInt(carbs);
        dayData.macros.fats = (dayData.macros.fats || 0) + parseInt(fats);

        nutritionEntry.markModified('daily_nutrition');
        await nutritionEntry.save();
        
        res.json({
            success: true,
            message: 'Food marked as consumed successfully',
            updatedNutrition: {
                calories_consumed: dayData.calories_consumed,
                protein_consumed: dayData.protein_consumed,
                calorie_goal: nutritionEntry.calorie_goal,
                protein_goal: nutritionEntry.protein_goal
            }
        });
        
    } catch (error) {
        console.error('Error marking food as consumed:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking food as consumed: ' + error.message
        });
    }
});

// Update profile
router.put('/user/profile/update', isAuthenticated, userController.updateUserProfile);

module.exports = router;