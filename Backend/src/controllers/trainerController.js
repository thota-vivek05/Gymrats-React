const bcrypt = require('bcryptjs');
const TrainerApplication = require('../model/TrainerApplication');
const Trainer = require('../model/Trainer');
const User = require('../model/User');
const WorkoutHistory = require('../model/WorkoutHistory');
const NutritionHistory = require('../model/NutritionHistory');
const Exercise = require('../model/Exercise'); 
const UserExerciseRating = require('../model/UserExerciseRating'); // ADD THIS LINE
const moment = require('moment');
const multer = require('multer');

// ADD THESE HELPER FUNCTIONS AT THE TOP OF trainerController.js
// ========================================
// HELPER: Get Trainer ID from either Session or JWT
// ========================================
const getTrainerId = (req) => {
    // Try JWT first (from protect middleware)
    if (req.user && req.user._id) {
        return req.user._id;
    }
    // Fall back to session (for EJS routes)
    if (req.session && req.session.trainer && req.session.trainer.id) {
        return req.session.trainer.id;
    }
    return null;
};

// ========================================
// HELPER: Check if request is authorized
// ========================================
const isAuthorized = (req) => {
    return getTrainerId(req) !== null;
};


const signupTrainer = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            phone,
            experience,
            specializations,
            termsAgree
        } = req.body;

        // Parse specializations - they come as JSON string from frontend
        let parsedSpecializations;
        if (typeof specializations === 'string') {
            try {
                // Try to parse as JSON first
                parsedSpecializations = JSON.parse(specializations);
            } catch (e) {
                // Fall back to comma-separated string
                parsedSpecializations = specializations.split(',').map(s => s.trim());
            }
        } else if (Array.isArray(specializations)) {
            parsedSpecializations = specializations;
        } else {
            parsedSpecializations = [];
        }

        // console.log('Parsed specializations:', parsedSpecializations);

        const isTermsAgreed = termsAgree === 'true' || termsAgree === true;

        // Check if resume file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'Resume file is required' });
        }

        // Validate file type
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ error: 'Only PDF and Word documents are allowed' });
        }

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !phone ||
            !experience ||
            parsedSpecializations.length === 0 ||
            !isTermsAgreed
        ) {
            console.log('Validation failed: Missing fields');
            return res.status(400).json({ error: 'All fields are required, including terms agreement' });
        }

        if (password !== confirmPassword) {
            //console.log('Validation failed: Passwords do not match');
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            //console.log('Validation failed: Invalid email:', email);
            return res.status(400).json({ error: 'Invalid email address' });
        }

        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phone)) {
            //console.log('Validation failed: Invalid phone number:', phone);
            return res.status(400).json({ error: 'Invalid phone number' });
        }

        const validExperience = ['1-2', '3-5', '5-10', '10+'];
        if (!validExperience.includes(experience)) {
            //console.log('Validation failed: Invalid experience:', experience);
            return res.status(400).json({ error: 'Invalid experience selection' });
        }

        const validSpecializations = [
            'Calisthenics',
            'Weight Loss',
            'HIIT',
            'Competitive',
            'Strength Training',
            'Cardio',
            'Flexibility',
            'Bodybuilding'
        ];
        
        if (!Array.isArray(parsedSpecializations) || parsedSpecializations.length === 0) {
            console.log('Validation failed: No specializations selected');
            return res.status(400).json({ error: 'At least one specialization must be selected' });
        }
        
        for (const spec of parsedSpecializations) {
            if (!validSpecializations.includes(spec)) {
                console.log('Validation failed: Invalid specialization:', spec);
                return res.status(400).json({ error: `Invalid specialization: ${spec}` });
            }
        }

        const existingApplication = await TrainerApplication.findOne({ email });
        if (existingApplication) {
            console.log('Validation failed: Email already registered:', email);
            return res.status(400).json({ error: 'Email already registered' });
        }

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        console.log('Password hashed for:', email);

        // Create the resume file path
        const resumePath = `uploads/trainer-resumes/${req.file.filename}`;

        const newApplication = new TrainerApplication({
            firstName,
            lastName,
            email,
            password_hash,
            phone,
            experience,
            specializations: parsedSpecializations, // Use parsedSpecializations, not normalizedSpecs
            resume: resumePath,
            status: 'Pending'
        });
        
        console.log('New trainer application created:', newApplication);

        await newApplication.save();
        console.log('Trainer application saved to MongoDB:', email);

        if (req.session) {
            req.session.trainerApplication = {
                id: newApplication._id,
                email: newApplication.email,
                firstName: newApplication.firstName,
                lastName: newApplication.lastName
            };
            console.log('Session set for trainer application:', email);
        }

        res.status(201).json({ 
            message: 'Trainer application submitted successfully', 
            redirect: '/login', // Changed from '/trainer_login' to '/login'
            resumePath: resumePath // Optional: return the path if needed
        });
    } catch (error) {
        console.error('Trainer signup error:', error);
        
        // Handle Multer errors
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
            }
            return res.status(400).json({ error: 'File upload error: ' + error.message });
        }
        
        if (error.code === 11000) {
            console.log('MongoDB error: Duplicate email');
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            console.log('MongoDB validation errors:', messages);
            return res.status(400).json({ error: messages.join(', ') });
        }
        
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};

// const loginTrainer = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // console.log('Trainer login request received:', { email });

//         if (!email || !password) {
//             // console.log('Validation failed: Missing email or password');
//             return res.status(400).render('trainer_login', {
//                 errorMessage: 'Email and password are required',
//                 email
//             });
//         }

//         const trainer = await Trainer.findOne({ email });
//         if (!trainer) {
//             // console.log('Trainer not found:', email);
//             return res.status(401).render('trainer_login', {
//                 errorMessage: 'Invalid email or password',
//                 email
//             });
//         }

//         if (trainer.status !== 'Active') {
//             // console.log('Trainer account not active:', email, trainer.status);
//             return res.status(403).render('trainer_login', {
//                 errorMessage: `Your account is ${trainer.status.toLowerCase()}. Please contact support.`,
//                 email
//             });
//         }

//         const isMatch = await bcrypt.compare(password, trainer.password_hash);
//         if (!isMatch) {
//             // console.log('Invalid password for:', email);
//             return res.status(401).render('trainer_login', {
//                 errorMessage: 'Invalid email or password',
//                 email
//             });
//         }

//         req.session.trainer = {
//             id: trainer._id,
//             email: trainer.email,
//             name: trainer.full_name || 'Trainer'
//         };
//         //  console.log('Session set for trainer:', email);

//         res.redirect('/trainer');
//     } catch (error) {
//         console.error('Trainer login error:', error);
//         res.status(500).render('trainer_login', {
//             errorMessage: 'Server error. Please try again later.',
//             email: req.body.email || ''
//         });
//     }
// };

// const renderTrainerLogin = (req, res) => {
//     res.render('trainer_login', {
//         errorMessage: null,
//         successMessage: null,
//         email: ''
//     });
// };

const renderTrainerDashboard = async (req, res) => {
    try {
        if (!req.session.trainer) {
            //  console.log('Unauthorized access to trainer dashboard');
            return res.redirect('/trainer_login');
        }

        const trainerId = req.session.trainer.id;
        //  console.log('Fetching ALL users for trainer:', trainerId);

        // Fetch trainer details
        const trainer = await Trainer.findById(trainerId);
      
        // Fetch ALL users assigned to this trainer (Basic, Gold, Platinum)
        const users = await User.find({ 
            trainer: trainerId, 
            status: 'Active'
        })
            .select('full_name dob weight height BMI fitness_goals class_schedules membershipType') // ADD membershipType here
            .lean();

        //  console.log('Found users:', users.length);
        //  console.log('Membership breakdown:', users.map(u => u.membershipType));
        // Add this //  console.log in both functions to debug
//         console.log('User membership data:', users.map(u => ({
//     name: u.full_name,
//     membership: u.membershipType
// })));

        const clients = users.map(user => {
            const progress = 0;

            const nextSession = user.class_schedules && user.class_schedules.length > 0
                ? user.class_schedules.find(schedule => new Date(schedule.date) >= new Date())
                : null;
            const nextSessionDate = nextSession
                ? new Date(nextSession.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'None';

            const dob = new Date(user.dob);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            const fitnessGoal = user.fitness_goals?.weight_goal
                ? `${user.fitness_goals.weight_goal} kg`
                : user.fitness_goals?.calorie_goal
                ? `${user.fitness_goals.calorie_goal} kcal`
                : 'Not set';

            return {
                id: user._id,
                name: user.full_name || 'Unknown',
                membershipType: user.membershipType || 'Basic', // FIX: Use actual membershipType
                progress,
                nextSession: nextSessionDate,
                age: isNaN(age) ? 'N/A' : age,
                weight: user.weight ? `${user.weight} kg` : 'N/A',
                height: user.height ? `${user.height} cm` : 'N/A',
                bodyFat: user.BMI ? `${user.BMI.toFixed(1)} (BMI)` : 'N/A',
                goal: fitnessGoal
            };
        });

         const requestedClientId = req.query.clientId;

         let selectedClient = null;
        if (requestedClientId) {
            selectedClient = clients.find(client => client.id === requestedClientId);
        }
        if (!selectedClient && clients.length > 0) {
            selectedClient = clients[0]; // Fallback to first client
        }


        // ... rest of the function remains the same

        // Fetch data for the first client (if available) - FIXED VERSION
        // let selectedClient = clients.length > 0 ? clients[0] : null;
        let nutritionData = null;
        let workoutData = null;

        // Replace the nutrition data fetching section with this:

if (selectedClient) {
    try {
        // ✅ FIXED: Use same week calculation as nutrition saving
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekStart = new Date(today);
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        weekStart.setDate(today.getDate() + diffToMonday);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        // ✅ FIXED: Fetch weekly nutrition data (not daily)
        const weeklyNutrition = await NutritionHistory.findOne({
            userId: selectedClient.id,
            date: { $gte: weekStart, $lt: weekEnd }
        }).lean();

        // ✅ FIXED: Get today's nutrition from the weekly data
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[today.getDay()];
        
        let todayNutrition = null;
        if (weeklyNutrition && weeklyNutrition.daily_nutrition) {
            todayNutrition = weeklyNutrition.daily_nutrition[todayName];
        }

        nutritionData = {
            nutrition: {
                protein_goal: users.find(u => u._id.toString() === selectedClient.id)?.fitness_goals?.protein_goal || 'N/A',
                calorie_goal: users.find(u => u._id.toString() === selectedClient.id)?.fitness_goals?.calorie_goal || 'N/A',
                foods: todayNutrition ? todayNutrition.foods : [],
                macros: todayNutrition ? todayNutrition.macros : { protein: 0, carbs: 0, fats: 0 }
            }
        };

        // ... rest of your workout data code remains the same
    } catch (dataError) {
        console.error('Error fetching client data:', dataError);
    }
}

        res.render('trainer', {
            trainer: req.session.trainer,
            clients,
            selectedClient,
            workoutData,
            nutritionData
        });
    } catch (error) {
        console.error('Error rendering trainer dashboard:', error);
        res.status(500).render('trainer_login', {
            errorMessage: 'Server error. Please try again later.',
            email: ''
        });
    }
};

const renderEditWorkoutPlan = async (req, res) => {
    try {
        if (!req.session.trainer) {
            //  console.log('Unauthorized access to edit workout plan');
            return res.redirect('/trainer_login');
        }

        const userId = req.params.userId;
        const trainerId = req.session.trainer.id;

        const user = await User.findOne({ 
            _id: userId, 
            trainer: trainerId,
            // membershipType: 'Platinum'
            membershipType: { $in: ['Platinum', 'Gold', 'Basic'] }
        })
            .select('full_name fitness_goals')
            .lean();

        if (!user) {
            //  console.log('Platinum user not found or not assigned to trainer:', userId);
            return res.status(404).render('trainer', {
                errorMessage: 'Client not found, not a Platinum member, or not assigned to you'
            });
        }

        // ✅ FIX: Fetch all exercises from database
        const exercises = await Exercise.find({ verified: true })
            .select('name category difficulty targetMuscles type defaultSets defaultRepsOrDuration')
            .sort({ name: 1 })
            .lean();

        // ✅ FIXED: Consistent date calculation with saveWorkoutPlan
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekStart = new Date(today);
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        weekStart.setDate(today.getDate() + diffToMonday);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const currentWorkout = await WorkoutHistory.findOne({
            userId: userId,
            date: { $gte: weekStart, $lt: weekEnd }
        }).lean() || null;

        const workoutPlan = currentWorkout ? {
            Monday: currentWorkout.exercises.filter(ex => ex.day === 'Monday'),
            Tuesday: currentWorkout.exercises.filter(ex => ex.day === 'Tuesday'),
            Wednesday: currentWorkout.exercises.filter(ex => ex.day === 'Wednesday'),
            Thursday: currentWorkout.exercises.filter(ex => ex.day === 'Thursday'),
            Friday: currentWorkout.exercises.filter(ex => ex.day === 'Friday'),
            Saturday: currentWorkout.exercises.filter(ex => ex.day === 'Saturday'),
            Sunday: currentWorkout.exercises.filter(ex => ex.day === 'Sunday')
        } : {};

        res.render('workoutplanedit', {
            trainer: req.session.trainer,
            id: user._id,
            name: user.full_name,
            goal: user.fitness_goals.weight_goal ? `${user.fitness_goals.weight_goal} kg` : user.fitness_goals.calorie_goal ? `${user.fitness_goals.calorie_goal} kcal` : 'Strength Training',
            workoutPlan,
            notes: currentWorkout ? currentWorkout.notes : '',
            exercises: exercises
        });
    } catch (error) {
        console.error('Error rendering edit workout plan:', error);
        res.redirect('/trainer?error=Failed to load workout plan editor');
    }
};

const saveWorkoutPlan = async (req, res) => {
    try {
        // 1. Get Trainer ID using the helper (works for both Session & JWT)
        const trainerId = getTrainerId(req);
        
        // Debugging logs to see exactly what is happening
        console.log('=== SAVE WORKOUT PLAN DEBUG ===');
        console.log('Request Headers Auth:', req.headers.authorization ? 'Present' : 'Missing');
        console.log('req.user:', req.user);
        console.log('req.session.trainer:', req.session ? req.session.trainer : 'No Session');
        console.log('Resolved Trainer ID:', trainerId);

        if (!trainerId) {
            console.log('❌ Unauthorized: No trainer ID found in request');
            return res.status(401).json({ error: 'Unauthorized: You must be logged in to save plans.' });
        }

        const { clientId, notes, currentWeek } = req.body;

        if (!clientId || !currentWeek) {
            return res.status(400).json({ error: 'Client ID and current week data are required' });
        }

        // 2. Verify the client belongs to this trainer
        const user = await User.findOne({ 
            _id: clientId, 
            trainer: trainerId,
            membershipType: { $in: ['Platinum', 'Gold', 'Basic'] }
        });
        
        if (!user) {
            console.log(`❌ Client ${clientId} not found or not assigned to trainer ${trainerId}`);
            return res.status(404).json({ error: 'Client not found or not assigned to you' });
        }

        // ... (Rest of your date calculation and saving logic remains exactly the same) ...
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekStart = new Date(today);
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        weekStart.setDate(today.getDate() + diffToMonday);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        // Process exercises
        const currentWeekExercises = [];
        for (const [day, exercises] of Object.entries(currentWeek)) {
            if (Array.isArray(exercises)) {
                exercises.forEach(ex => {
                    if (ex.name && ex.name.trim()) {
                        currentWeekExercises.push({
                            day,
                            name: ex.name,
                            sets: ex.sets ? parseInt(ex.sets) : null,
                            reps: ex.reps || null,
                            weight: ex.weight ? parseFloat(ex.weight) : null,
                            duration: ex.duration ? parseInt(ex.duration) : null,
                            completed: false
                        });
                    }
                });
            }
        }

        // Find or create workout
        let workout = await WorkoutHistory.findOne({
            userId: clientId,
            date: { $gte: weekStart, $lt: weekEnd }
        });

        if (workout) {
            workout.exercises = currentWeekExercises;
            workout.notes = notes || '';
            workout.updatedAt = new Date();
        } else {
            workout = new WorkoutHistory({
                userId: clientId,
                date: weekStart,
                exercises: currentWeekExercises,
                progress: 0,
                completed: false,
                notes: notes || ''
            });
        }
        
        await workout.save();

        // Update user workout history if needed
        if (!user.workout_history.includes(workout._id)) {
            user.workout_history.push(workout._id);
            await user.save();
        }

        res.json({ 
            success: true,
            message: 'Workout plan saved successfully',  
            redirect: `/trainer?clientId=${clientId}`
        });

    } catch (error) {
        console.error('Error saving workout plan:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};


const renderEditNutritionPlan = async (req, res) => {
    try {
        if (!req.session.trainer) {
            //  console.log('Unauthorized access to edit nutrition plan');
            return res.redirect('/trainer_login');
        }

        const userId = req.params.userId;
        const trainerId = req.session.trainer.id;

        const user = await User.findOne({ 
            _id: userId, 
            trainer: trainerId,
           // membershipType: 'Platinum'
           membershipType: { $in: ['Platinum', 'Gold'] }
        })
            .select('full_name fitness_goals')
            .lean();

        if (!user) {
            //  console.log('Platinum user not found or not assigned to trainer:', userId);
            return res.status(404).render('trainer', {
                errorMessage: 'Client not found, not a Platinum member, or not assigned to you'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const latestNutrition = await NutritionHistory.findOne({
            userId: userId,
            date: { $gte: today, $lt: tomorrow }
        }).lean() || null;

        res.render('edit_nutritional_plan', {
            trainer: req.session.trainer,
            client: {
                id: user._id,
                name: user.full_name,
                proteinGoal: user.fitness_goals.protein_goal || 90,
                calorieGoal: user.fitness_goals.calorie_goal || 2000,
                foods: latestNutrition ? latestNutrition.foods : []
            }
        });
    } catch (error) {
        console.error('Error rendering edit nutrition plan:', error);
        res.status(500).render('trainer', {
            errorMessage: 'Server error. Please try again later.'
        });
    }
};

const editNutritionPlan = async (req, res) => {
    try {
        // 1. Get Trainer ID
        const trainerId = getTrainerId(req);

        console.log('=== SAVE NUTRITION PLAN DEBUG ===');
        console.log('Resolved Trainer ID:', trainerId);
        
        if (!trainerId) {
            return res.status(401).json({ error: 'Unauthorized: You must be logged in.' });
        }

        const { userId, proteinGoal, calorieGoal, foods, day } = req.body;

        if (!userId || !day) {
            return res.status(400).json({ error: 'User ID and Day are required' });
        }

        const user = await User.findOne({ 
            _id: userId, 
            trainer: trainerId,
            membershipType: { $in: ['Platinum', 'Gold'] }
        });
        
        if (!user) {
            return res.status(404).json({ error: 'Client not found or not assigned to you' });
        }

        // ... (Rest of logic remains the same) ...
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekStart = new Date(today);
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        weekStart.setDate(today.getDate() + diffToMonday);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        // Calculate nutrition data for that day
        const dayProtein = foods.reduce((sum, food) => sum + (parseInt(food.protein) || 0), 0);
        const dayCarbs = foods.reduce((sum, food) => sum + (parseInt(food.carbs) || 0), 0);
        const dayFats = foods.reduce((sum, food) => sum + (parseInt(food.fats) || 0), 0);

        const dayNutritionData = {
            calories_consumed: 0,
            protein_consumed: 0,
            foods: foods.map(food => ({
                name: food.name,
                protein: parseInt(food.protein) || 0,
                calories: parseInt(food.calories) || 0,
                carbs: parseInt(food.carbs) || 0,
                fats: parseInt(food.fats) || 0,
                consumed: false
            })),
            macros: {
                protein: dayProtein,
                carbs: dayCarbs,
                fats: dayFats
            }
        };

        // Find or create weekly nutrition
        let weeklyNutrition = await NutritionHistory.findOne({
            userId: userId,
            date: { $gte: weekStart, $lt: weekEnd }
        });

        const defaultDayData = { 
            calories_consumed: 0, 
            protein_consumed: 0, 
            foods: [], 
            macros: { protein: 0, carbs: 0, fats: 0 } 
        };

        if (weeklyNutrition) {
            // Update the specific day
            weeklyNutrition.daily_nutrition[day] = dayNutritionData;
            
            // Also update goals if changed
            weeklyNutrition.protein_goal = parseInt(proteinGoal);
            weeklyNutrition.calorie_goal = parseInt(calorieGoal);
        } else {
            weeklyNutrition = new NutritionHistory({
                userId: userId,
                date: weekStart,
                protein_goal: parseInt(proteinGoal),
                calorie_goal: parseInt(calorieGoal),
                daily_nutrition: {
                    Monday: day === 'Monday' ? dayNutritionData : defaultDayData,
                    Tuesday: day === 'Tuesday' ? dayNutritionData : defaultDayData,
                    Wednesday: day === 'Wednesday' ? dayNutritionData : defaultDayData,
                    Thursday: day === 'Thursday' ? dayNutritionData : defaultDayData,
                    Friday: day === 'Friday' ? dayNutritionData : defaultDayData,
                    Saturday: day === 'Saturday' ? dayNutritionData : defaultDayData,
                    Sunday: day === 'Sunday' ? dayNutritionData : defaultDayData
                }
            });
        }

        // Mark modified to ensure Mongoose saves the nested object update
        weeklyNutrition.markModified('daily_nutrition');
        await weeklyNutrition.save();

        // Update user record goals
        user.fitness_goals.protein_goal = parseInt(proteinGoal);
        user.fitness_goals.calorie_goal = parseInt(calorieGoal);
        
        // Link history if not linked
        if (!user.nutrition_history.includes(weeklyNutrition._id)) {
            user.nutrition_history.push(weeklyNutrition._id);
        }
        await user.save();

        res.json({ 
            success: true,
            message: 'Nutrition plan saved successfully', 
            redirect: `/trainer?clientId=${userId}`
        });
    } catch (error) {
        console.error('Error saving nutrition plan:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};

const getClientData = async (req, res) => {
    try {
        const userId = req.params.id;
        // FIX: Use the new helper function for consistency
        const trainerId = getTrainerId(req); 
        
        if (!trainerId) {
            return res.status(401).json({ error: 'Unauthorized access' });
        }
        
        const user = await User.findOne({ 
            _id: userId, 
            trainer: trainerId
        })
            .select('full_name dob weight height BMI bodyFat goal workout_type fitness_goals membershipType gender phone email')
            .lean();
            
        if (!user) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        // Calculate age
        const dob = new Date(user.dob);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        
        // ✅ Return ALL fields needed by React frontend
        res.json({
            _id: user._id,
            full_name: user.full_name,
            dob: user.dob,
            age: isNaN(age) ? 'N/A' : age,
            gender: user.gender || 'N/A',
            weight: user.weight,
            height: user.height,
            BMI: user.BMI,
            bodyFat: user.bodyFat,
            goal: user.goal,
            workout_type: user.workout_type,
            fitness_goals: user.fitness_goals,
            membershipType: user.membershipType || 'Basic',
            email: user.email,
            phone: user.phone
        });
    } catch (error) {
        console.error('Error fetching client data:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// REPLACE the existing getClients function in trainerController.js
const getClients = async (req, res) => {
    try {
        const trainerId = getTrainerId(req);
        
        if (!trainerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Fetch users assigned to this trainer with specific fields
        const clients = await User.find({ 
            trainer: trainerId 
        }).select('full_name email membershipType status created_at membershipDuration phone');

        const formattedClients = clients.map(client => ({
            _id: client._id,
            full_name: client.full_name,
            email: client.email,
            phone: client.phone || 'N/A',
            membershipType: client.membershipType || 'Basic',
            status: client.status,
            // Format dates for the frontend table
            joinedDate: client.created_at, 
            renewalDate: client.membershipDuration?.end_date || 'N/A',
            monthsRemaining: client.membershipDuration?.months_remaining || 0
        }));

        res.status(200).json(formattedClients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Server error fetching clients' });
    }
};

const getWorkoutData = async (req, res) => {
    try {
        // FIX: Check authorization using the new helper
        const trainerId = getTrainerId(req); 

        if (!trainerId) {
            // Replaced req.session.trainer check with more robust check
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = req.params.userId;
        
        const user = await User.findOne({ 
            _id: userId, 
            trainer: trainerId, // Use trainerId from helper
            membershipType: { $in: ['Platinum', 'Gold', 'Basic'] }
        }).lean();

        if (!user) {
            return res.status(404).json({ error: 'Client not found or not assigned to you' });
        }

        // Calculate week range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekStart = new Date(today);
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        weekStart.setDate(today.getDate() + diffToMonday);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const currentWorkout = await WorkoutHistory.findOne({
            userId: userId,
            date: { $gte: weekStart, $lt: weekEnd }
        }).lean();

        // Format response
        const weeklySchedule = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
        };

        if (currentWorkout && currentWorkout.exercises) {
            currentWorkout.exercises.forEach(exercise => {
                if (weeklySchedule[exercise.day]) {
                    weeklySchedule[exercise.day].push({
                        name: exercise.name,
                        sets: exercise.sets,
                        reps: exercise.reps,
                        weight: exercise.weight,
                        duration: exercise.duration,
                        completed: exercise.completed
                    });
                }
            });
        }

        res.json({ 
            weeklySchedule,
            success: true 
        });
    } catch (error) {
        console.error('Error fetching workout data:', error);
        res.status(500).json({ error: 'Server error' });
    }
};



// Add this function to trainerController.js
// Add this function to trainerController.js
const getClientExerciseRatings = async (req, res) => {
    try {
        // ✅ Get trainer ID from either source
        const trainerId = getTrainerId(req);
        
        if (!trainerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = req.params.userId;

        const user = await User.findOne({ 
            _id: userId, 
            trainer: trainerId
        }).lean();

        if (!user) {
            return res.status(404).json({ error: 'Client not found or not assigned to you' });
        }

        const exerciseRatings = await UserExerciseRating.find({ userId: userId })
            .populate('exerciseId', 'name category difficulty targetMuscles')
            .sort({ rating: -1, createdAt: -1 })
            .lean();

        const formattedRatings = exerciseRatings.map(rating => ({
            exerciseName: rating.exerciseId?.name || 'Unknown Exercise',
            category: rating.exerciseId?.category || 'Unknown',
            difficulty: rating.exerciseId?.difficulty || 'Unknown',
            targetMuscles: rating.exerciseId?.targetMuscles || [],
            rating: rating.rating,
            effectiveness: rating.effectiveness,
            workoutType: rating.workoutType,
            notes: rating.notes,
            lastRated: rating.updatedAt
        }));

        res.json({
            success: true,
            ratings: formattedRatings
        });
    } catch (error) {
        console.error('Error fetching exercise ratings:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


const getNutritionData = async (req, res) => {
    try {
        // ✅ Get trainer ID from either source
        const trainerId = getTrainerId(req);
        
        if (!trainerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = req.params.userId;

        const user = await User.findOne({ 
            _id: userId, 
            trainer: trainerId,
            membershipType: { $in: ['Platinum', 'Gold'] }
        })
            .select('fitness_goals')
            .lean();

        if (!user) {
            return res.status(404).json({ error: 'Client not found or not assigned to you' });
        }

        // Calculate week range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekStart = new Date(today);
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        weekStart.setDate(today.getDate() + diffToMonday);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const weeklyNutrition = await NutritionHistory.findOne({
            userId: userId,
            date: { $gte: weekStart, $lt: weekEnd }
        }).lean();

        // Get today's nutrition
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[today.getDay()];
        
        let todayNutrition = null;
        if (weeklyNutrition && weeklyNutrition.daily_nutrition) {
            todayNutrition = weeklyNutrition.daily_nutrition[todayName];
        }

        res.json({
            nutrition: {
                protein_goal: user.fitness_goals?.protein_goal || 'N/A',
                calorie_goal: user.fitness_goals?.calorie_goal || 'N/A',
                foods: todayNutrition ? todayNutrition.foods : [],
                macros: todayNutrition ? todayNutrition.macros : { protein: 0, carbs: 0, fats: 0 }
            }
        });
    } catch (error) {
        console.error('Error fetching nutrition data:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


// REYNA
// Render trainer assignment page
const renderTrainerAssignment = async (req, res) => {
    try {
        if (!req.session.trainer) {
            //  console.log('Unauthorized access to trainer assignment');
            return res.redirect('/trainer_login');
        }

        const trainerId = req.session.trainer.id;
        const trainer = await Trainer.findById(trainerId);
        
        if (!trainer) {
            //  console.log('Trainer not found:', trainerId);
            return res.status(404).render('trainer', {
                errorMessage: 'Trainer not found'
            });
        }

        // Find unassigned users (trainer field is null) that match trainer's specializations
        const unassignedUsers = await User.find({
            trainer: null,
            workout_type: { $in: trainer.specializations },
            status: 'Active'
        }).select('full_name email workout_type dob weight height BMI fitness_goals created_at membershipType'); // ADD membershipType

        //  console.log('Unassigned users found:', unassignedUsers.length);
        //  console.log('Membership types:', unassignedUsers.map(u => u.membershipType));
        // Add this //  console.log in both functions to debug
//  console.log('User membership data:', unassignedUsers.map(u => ({
//     name: u.full_name,
//     membership: u.membershipType
// })));

        res.render('trainer_assignment', {
            trainer: req.session.trainer,
            unassignedUsers: unassignedUsers || [],
            trainerSpecializations: trainer.specializations
        });
    } catch (error) {
        console.error('Error rendering trainer assignment page:', error);
        res.status(500).render('trainer', {
            errorMessage: 'Server error. Please try again later.'
        });
    }
};

// Assign user to trainer
const assignUserToTrainer = async (req, res) => {
    try {
        if (!req.session.trainer) {
            //  console.log('Unauthorized access to assign user');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { userId } = req.body;
        const trainerId = req.session.trainer.id;

        if (!userId) {
            //  console.log('Validation failed: User ID is required');
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Find user and trainer
        const user = await User.findById(userId);
        const trainer = await Trainer.findById(trainerId);

        if (!user) {
            //  console.log('User not found:', userId);
            return res.status(404).json({ error: 'User not found' });
        }

        if (!trainer) {
            //  console.log('Trainer not found:', trainerId);
            return res.status(404).json({ error: 'Trainer not found' });
        }

        // Check if user is already assigned
        if (user.trainer) {
            //  console.log('User already assigned to a trainer:', userId);
            return res.status(400).json({ error: 'User is already assigned to a trainer' });
        }

        // Check if workout type matches trainer's specializations
        if (!trainer.specializations.includes(user.workout_type)) {
            //  console.log('Workout type mismatch:', user.workout_type, trainer.specializations);
            return res.status(400).json({ error: 'User workout type does not match your specializations' });
        }

        // Assign user to trainer
        user.trainer = trainerId;
        await user.save();

        // Add user to trainer's clients array if not already there
        if (!trainer.clients.includes(userId)) {
            trainer.clients.push(userId);
            await trainer.save();
        }

        //  console.log('User assigned to trainer successfully:', userId, trainerId);
        res.json({ 
            success: true, 
            message: 'User assigned successfully',
            user: {
                id: user._id,
                name: user.full_name,
                workout_type: user.workout_type
            }
        });
    } catch (error) {
        console.error('Error assigning user to trainer:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get unassigned users by workout type

const getUnassignedUsers = async (req, res) => {
    try {
        if (!req.session.trainer) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const trainerId = req.session.trainer.id;
        const trainer = await Trainer.findById(trainerId);
        
        if (!trainer) {
            return res.status(404).json({ error: 'Trainer not found' });
        }

        const { workoutType } = req.query;
        let query = { trainer: null, status: 'Active' };

        if (workoutType && workoutType !== 'all') {
            query.workout_type = workoutType;
        } else {
            query.workout_type = { $in: trainer.specializations };
        }

        const unassignedUsers = await User.find(query)
            .select('full_name email workout_type dob weight height BMI fitness_goals created_at membershipType') // ADD membershipType
            .sort({ created_at: -1 });

        //  console.log('API - Unassigned users:', unassignedUsers.length);
        //  console.log('API - Membership types:', unassignedUsers.map(u => u.membershipType));

        res.json({ success: true, users: unassignedUsers });
    } catch (error) {
        console.error('Error fetching unassigned users:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getClientProgress = async (req, res) => {
    try {
        const clientId = req.params.clientId; // Get ID from URL param

        // 1. Fetch last 6 weeks of history for this client
        const history = await WorkoutHistory.find({ userId: clientId })
            .sort({ date: -1 }) // Newest first
            .limit(6);

        // 2. Reverse to chronological order (Oldest -> Newest)
        const chronologicalHistory = history.reverse();

        // 3. Generate Labels
        const labels = chronologicalHistory.map(entry => 
            moment(entry.date).format('MMM Do')
        );

        // 4. Helper to find max weight with fuzzy matching
        // This allows "Squat" to match "Barbell Squat"
        const getMaxWeight = (entry, searchTerm) => {
            if (!entry.exercises || entry.exercises.length === 0) return 0;
            
            // Filter for exercises that include the search term (e.g., "squat")
            const relevantExercises = entry.exercises.filter(ex => 
                ex.name && ex.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (relevantExercises.length === 0) return 0;

            // Return the highest weight lifted for that exercise type in that session
            return Math.max(...relevantExercises.map(ex => ex.weight || 0));
        };

        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Bench Press',
                    data: chronologicalHistory.map(h => getMaxWeight(h, 'bench')), // Matches "Bench Press", "Dumbbell Bench", etc.
                    borderColor: '#20B2AA', // Teal (matching user side)
                    backgroundColor: 'rgba(32, 178, 170, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Squat',
                    data: chronologicalHistory.map(h => getMaxWeight(h, 'squat')), // Matches "Barbell Squat"
                    borderColor: '#8A2BE2', // Purple (matching user side)
                    backgroundColor: 'rgba(138, 43, 226, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Deadlift',
                    data: chronologicalHistory.map(h => getMaxWeight(h, 'deadlift')),
                    borderColor: '#FF6347', // Tomato (matching user side)
                    backgroundColor: 'rgba(255, 99, 71, 0.1)',
                    tension: 0.3,
                    fill: true
                },
            ],
        };

        res.json(data);
    } catch (error) {
        console.error('Error fetching client progress:', error);
        res.status(500).json({ error: 'Server error fetching progress' });
    }
};

// END REYNA

const getTrainerStats = async (req, res) => {
    try {
        const trainerId = getTrainerId(req);
        if (!trainerId) return res.status(401).json({ error: 'Unauthorized' });

        // Pricing logic (You can adjust these values)
        const PRICES = {
            'Basic': 30,
            'Gold': 50,
            'Platinum': 80
        };

        const clients = await User.find({ trainer: trainerId })
            .select('membershipType status membershipDuration full_name');

        let totalRevenue = 0;
        let activeUsers = 0;
        const expiringSoon = [];

        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        clients.forEach(client => {
            // Calculate Revenue for Active Users only
            if (client.status === 'Active') {
                activeUsers++;
                totalRevenue += (PRICES[client.membershipType] || 0);
            }

            // Identify users expiring in the next 7 days
            if (client.status === 'Active' && client.membershipDuration?.end_date) {
                const endDate = new Date(client.membershipDuration.end_date);
                if (endDate > today && endDate <= sevenDaysFromNow) {
                    expiringSoon.push({
                        id: client._id,
                        name: client.full_name,
                        endDate: endDate,
                        membershipType: client.membershipType
                    });
                }
            }
        });

        res.json({
            success: true,
            totalRevenue,
            activeUsers,
            expiringSoon
        });

    } catch (error) {
        console.error('Error fetching trainer stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 2. Get Client History (Subscription Details)
const getClientHistory = async (req, res) => {
    try {
        const trainerId = getTrainerId(req);
        const { userId } = req.params;

        if (!trainerId) return res.status(401).json({ error: 'Unauthorized' });

        // Ensure the user actually belongs to this trainer
        const user = await User.findOne({ _id: userId, trainer: trainerId })
            .select('membershipType membershipDuration status created_at full_name');

        if (!user) return res.status(404).json({ error: 'Client not found or not assigned to you' });

        const history = {
            currentSubscription: {
                plan: user.membershipType,
                status: user.status,
                startDate: user.membershipDuration?.start_date,
                endDate: user.membershipDuration?.end_date,
                autoRenew: user.membershipDuration?.auto_renew,
                lastRenewal: user.membershipDuration?.last_renewal_date
            },
            joinedDate: user.created_at
        };

        res.json({ success: true, history });

    } catch (error) {
        console.error('Error fetching client history:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { 
    signupTrainer,
    getClients,
    getTrainerId,
    // loginTrainer, 
    // renderTrainerLogin, 
    renderTrainerDashboard, 
    renderEditWorkoutPlan, 
    saveWorkoutPlan, 
    renderEditNutritionPlan, 
    editNutritionPlan, 
    getClientData,
    getWorkoutData,
    getNutritionData,
    renderTrainerAssignment,    
    assignUserToTrainer,        
    getUnassignedUsers,          
    getClientExerciseRatings,
    getClientProgress,
    getTrainerStats,
    getClientHistory
};