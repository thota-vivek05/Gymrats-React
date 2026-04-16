const bcrypt = require('bcryptjs');
const User = require('../model/User');
const WorkoutPlan = require('../model/WorkoutPlan');
const WorkoutHistory = require('../model/WorkoutHistory');
const NutritionHistory = require('../model/NutritionHistory');
//brimstone
const Membership = require('../model/Membership'); // Add this line
const Payment = require('../model/Payment');
const moment = require('moment');
const TrainerReview = require('../model/TrainerReview');
const TrainerAvailability = require('../model/TrainerAvailability');
const Appointment = require('../model/Appointment');
//brimstone
// for membership management           REYNA
const Trainer = require('../model/Trainer');

const checkMembershipActive = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const user = await User.findById(req.user.id || req.user._id);
        
        if (user && !user.isMembershipActive()) {
            return res.status(403).json({ 
                success: false, 
                error: 'Membership expired', 
                action: 'redirect_renewal'
            });
        }

        next();
    } catch (error) {
        console.error('Membership check error:', error);
        res.status(500).json({ success: false, error: 'Server error during membership validation' });
    }
};
const rateTrainer = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { trainerId, rating, feedback } = req.body;

        if (!trainerId || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Valid trainer ID and rating (1-5) are required.' });
        }

        // Flag for reassignment if rating is critically low
        const flaggedForReassignment = rating <= 2;

        const review = await TrainerReview.findOneAndUpdate(
            { userId, trainerId },
            { 
                rating, 
                feedback, 
                reviewedAt: Date.now(),
                flaggedForReassignment 
            },
            { upsert: true, new: true } // Creates if it doesn't exist, updates if it does
        );

        res.json({ success: true, message: 'Trainer rated successfully', review });
    } catch (error) {
        console.error('Error rating trainer:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
const requestTrainerChange = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { reason } = req.body;

        const user = await User.findById(userId);

        // Check membership type
        if (user.membershipType.toLowerCase() !== 'platinum') {
            return res.status(403).json({ 
                success: false, 
                error: 'Trainer reassignment is a Platinum exclusive feature.' 
            });
        }

        // Check trainer exists
        if (!user.trainer) {
            return res.status(400).json({ 
                success: false, 
                error: 'No trainer is currently assigned.' 
            });
        }

        // Validate reason
        if (!reason || reason.trim().length < 5) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid reason (min 5 characters).'
            });
        }

        // Prevent duplicate requests
        if (user.trainer_change_request?.requested) {
            return res.status(400).json({
                success: false,
                error: 'Trainer change already requested. Please wait for admin approval.'
            });
        }

        // Save current trainer to history
        user.trainerHistory.push({
            trainerId: user.trainer,
            removedAt: new Date()
        });

        // Create change request
        user.trainer_change_request = {
            requested: true,
            reason,
            requestedAt: new Date(),
            resolvedAt: null,
            resolvedBy: null
        };

        await user.save();

        res.json({ 
            success: true, 
            message: 'Trainer change request submitted. Admin will assign a new trainer soon.' 
        });

    } catch (error) {
        console.error('Error requesting trainer change:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
const checkTrainerSubscription = async (req, res, next) => {
// ... (omitted for brevity)
    try {
        if (!req.trainer) {
            return next();
        }

        const trainer = await Trainer.findById(req.trainer.id);
        if (trainer && trainer.subscription.months_remaining === 0) {
            return res.status(403).json({ success: false, error: 'Trainer subscription expired' });
        }

        next();
    } catch (error) {
        console.error('Trainer subscription check error:', error);
        next();
    }
};
const getPurchaseHistory = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        
        // Fetch payments sorted by most recent
        const payments = await Payment.find({ userId })
            .populate('membershipId', 'plan duration end_date')
            .sort({ paymentDate: -1 });

        const formattedHistory = payments.map(payment => ({
            id: payment._id,
            plan: payment.membershipPlan || 'N/A',
            amount: payment.amount,
            currency: payment.currency,
            date: payment.paymentDate,
            status: payment.status,
            type: payment.paymentFor,
            isRenewal: payment.isRenewal
        }));

        res.json({ success: true, history: formattedHistory });
    } catch (error) {
        console.error('Error fetching purchase history:', error);
        res.status(500).json({ success: false, error: 'Failed to load purchase history' });
    }
};
const getUserId = (req) => {
    if (req.user) return req.user.id; // JWT Token
    if (req.session && req.session.user) return req.session.user.id; // Session Cookie
    return null;
};

const getUserProfile = async (req, res) => {
    try {
        const userId = getUserId(req);
        
        // 1. Check Authentication
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        
        // 2. Fetch User Data
        const user = await User.findById(userId).populate('trainer');
            
        if (!user) {
            return req.xhr || req.headers.accept.indexOf('json') > -1 
                ? res.status(404).json({ success: false, error: 'User not found' })
                : res.status(404).send('User not found');
        }

        // 3. Format Membership Data safely
        const membershipDuration = {
            months_remaining: user.membershipDuration?.months_remaining || 0,
            end_date: user.membershipDuration?.end_date || null,
            auto_renew: user.membershipDuration?.auto_renew || false
        };
        
        // 4. Fetch Workout History
        const workoutHistoryData = await WorkoutHistory.find({ userId })
            .populate('workoutPlanId')
            .sort({ date: -1 })
            .lean();
        
        // Format workout history for frontend
        const workoutHistory = workoutHistoryData.map(workout => ({
            id: workout._id,
            name: workout.workoutPlanId?.name || 'Unnamed Workout',
            date: workout.date,
            exercises: workout.exercises || [],
            progress: workout.progress || 0,
            completed: workout.completed || false,
            duration: workout.duration || 45,
            calories: Math.round((workout.duration || 45) * 8)
        }));
        
        // 5. Fetch Nutrition History
        const nutritionHistoryData = await NutritionHistory.find({ userId })
            .sort({ date: -1 })
            .lean();
        
        // 6. Calculate Fitness Stats (Last 30 Days)
        const today = new Date();
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        let workoutsCompleted = 0;
        let caloriesBurned = 0;
        let hoursActive = 0;
        let goalsAchieved = 0; // You can add logic to calculate this based on goals
        
        workoutHistoryData.forEach(workout => {
            if (new Date(workout.date) >= oneMonthAgo && workout.completed) {
                workoutsCompleted++;
                hoursActive += 1; // Approx 1 hour per workout
                
                // Calculate calories from exercises if available
                if (workout.exercises && workout.exercises.length > 0) {
                    workout.exercises.forEach(exercise => {
                        const reps = exercise.reps || 0;
                        const sets = exercise.sets || 0;
                        caloriesBurned += (reps * sets * 5); // Rough estimate
                    });
                } else {
                    caloriesBurned += 300; // Default estimate
                }
            }
        });

        // 7. Generate Chart Data
        // Weekly Workouts (Last 4 Weeks)
        const weeklyWorkoutData = [];
        const weekLabels = [];
        
        for (let i = 0; i < 4; i++) {
            const weekEnd = new Date(today);
            weekEnd.setDate(today.getDate() - (i * 7));
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekEnd.getDate() - 7);
            
            const count = workoutHistoryData.filter(w => 
                new Date(w.date) >= weekStart && new Date(w.date) < weekEnd && w.completed
            ).length;
            
            weeklyWorkoutData.unshift(count);
            weekLabels.unshift(`Week ${4-i}`);
        }
        
        // Weight Progress (Mock or Real)
        const weightProgress = [];
        const userWeight = user.weight || 70;
        
        // If you have weight history in DB, use it here. Otherwise, use mock/static data based on current weight.
        for (let i = 0; i < 4; i++) {
            weightProgress.push({ week: `Week ${i + 1}`, weight: userWeight });
        }
        
        const responseData = {
            success: true,
            user: {
                ...user.toObject(),
                membershipDuration
            },
            workoutHistory,
            fitnessStats: {
                workoutsCompleted,
                caloriesBurned,
                hoursActive,
                goalsAchieved
            },
            chartData: {
                weeklyWorkouts: weeklyWorkoutData,
                weekLabels,
                weightProgress
            },
            currentPage: 'profile'
        };

        // 8. Send Response
        // Always send JSON since EJS is removed
        return res.json(responseData);

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ success: false, error: 'Server error: ' + error.message });
    }
};
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { currentPassword, newPassword } = req.body;

        // 1. Basic validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'Please provide both current and new passwords' });
        }

        // 2. Fetch user and explicitly select password_hash in case the schema hides it
        const user = await User.findById(userId).select('+password_hash');
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (!user.password_hash) {
            return res.status(400).json({ success: false, error: 'No password found for this account. Did you sign up with Google?' });
        }

        // 3. Compare passwords
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Incorrect current password' });
        }

        // 4. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // 5. Use findByIdAndUpdate to avoid triggering strict Mongoose validations on other fields
        await User.findByIdAndUpdate(userId, { 
            password_hash: hashedPassword 
        });

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, error: 'Server error: ' + error.message });
    }
};
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        
        // Soft delete implementation
        await User.findByIdAndUpdate(userId, { 
            status: 'Inactive', 
            deletedAt: new Date() 
        });

        // Optionally, cancel their active membership
        await Membership.updateMany(
            { user_id: userId, status: 'Active' },
            { status: 'Cancelled' }
        );

        res.json({ success: true, message: 'Account has been deactivated.' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
// Removing the login function as it's now in authController.js
// const loginUser = async (req, res) => {
// // ... (omitted for brevity)
//     try {
//         const { email, password } = req.body;

//         //  console.log('Login request received:', { email});

//         if (!email || !password) {
//             //  console.log('Validation failed: Missing fields');
//             return res.status(400).json({ error: 'All fields are required' });
//         }

//         const user = await User.findOne({ email });
//         if (!user) {
//             //  console.log('User not found:', email);
//             return res.status(401).json({ error: 'Invalid email or password' });
//         }

//         const isMatch = await bcrypt.compare(password, user.password_hash);
//         if (!isMatch) {
//             //  console.log('Password mismatch for:', email);
//             return res.status(401).json({ error: 'Invalid email or password' });
//         }
//         //brimstone 1
//         // if (user.membershipType.toLowerCase() !== loginMembershipPlan.toLowerCase()) {
//         //     //  console.log('Membership plan mismatch:', { user: user.membershipType, input: loginMembershipPlan });
//         //     return res.status(400).json({ error: 'Selected membership plan does not match user membership' });
//         // }
//         // brimstone
//         if (!req) {
//             console.error('Session middleware not initialized');
//             return res.status(500).json({ error: 'Session not available. Please try again later.' });
//         }

//         req.user = {
//             id: user._id,
//             email: user.email,
//             full_name: user.full_name,
//             name: user.full_name,
//             membershipType: user.membershipType,
//             membership: user.membershipType.toLowerCase(),
//             phone: user.phone,
//             dob: user.dob,
//             gender: user.gender,
//             weight: user.weight,
//             height: user.height,
//             BMI: user.BMI,
//             status: user.status,
//             created_at: user.created_at,

//             // REYNA
//             workout_type: user.workout_type,
//             membershipDuration: {
//                 months_remaining: user.membershipDuration.months_remaining,
//                 end_date: user.membershipDuration.end_date,
//                 auto_renew: user.membershipDuration.auto_renew
//             },
//             fitness_goals: {
//                 calorie_goal: user.fitness_goals?.calorie_goal || 2200,
//                 protein_goal: user.fitness_goals?.protein_goal || 90,
//                 weight_goal: user.fitness_goals?.weight_goal || null
//             }
//         };

//         let redirectUrl;
//         switch (user.membershipType.toLowerCase()) {
//             case 'basic':
//                 redirectUrl = '/userdashboard_b';
//                 break;
//             case 'gold':
//                 redirectUrl = '/userdashboard_g';
//                 break;
//             case 'platinum':
//                 redirectUrl = '/userdashboard_p';
//                 break;
//             default:
//                 //  console.log('Unknown membership type:', user.membershipType);
//                 redirectUrl = '/userdashboard_b'; // Default to basic dashboard
//         }
//         //  console.log('Redirecting to:', redirectUrl);

//         res.status(200).json({ message: 'Login successful', redirect: redirectUrl });
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// };


const signupUser = async (req, res) => {
// ... (omitted for brevity)
    try {
        const body = req.body || {};
        const userFullName = body.userFullName || body.full_name;
        const dateOfBirth = body.dateOfBirth || body.dob;
        const age = body.age;
        const gender = body.gender;
        const userEmail = body.userEmail || body.email;
        const phoneNumber = body.phoneNumber || body.phone;
        const userPassword = body.userPassword || body.password;
        const userConfirmPassword = body.userConfirmPassword || body.confirmPassword || body.password;
        const membershipPlan = body.membershipPlan || body.membershipType;
        const membershipDuration = body.membershipDuration;
        const cardType = body.cardType;
        const cardNumber = body.cardNumber;
        const expirationDate = body.expirationDate;
        const cvv = body.cvv;
        const terms = body.terms;
        const weight = body.weight;
        const height = body.height;
        const workoutTypeRaw = body.workoutType || body.workout_type;
        const weightGoal = body.weightGoal ?? body?.fitness_goals?.weight_goal ?? body.weight;

        const workoutTypeMap = {
            strength: 'Strength Training',
            'strength training': 'Strength Training',
            cardio: 'Cardio',
            hiit: 'HIIT',
            calisthenics: 'Calisthenics',
            competitive: 'Competitive',
            'weight loss': 'Weight Loss',
            flexibility: 'Flexibility',
            bodybuilding: 'Bodybuilding'
        };
        const workoutType = workoutTypeRaw
            ? (workoutTypeMap[String(workoutTypeRaw).trim().toLowerCase()] || workoutTypeRaw)
            : workoutTypeRaw;

        const resolvedDob = dateOfBirth
            ? new Date(dateOfBirth)
            : (age !== undefined && age !== null && !isNaN(age)
                ? new Date(new Date().getFullYear() - Number(age), 0, 1)
                : null);

        //  console.log('Signup request received:', {
        //     userFullName, dateOfBirth, gender, userEmail, phoneNumber,
        //     membershipPlan, membershipDuration, cardType, cardNumber,
        //     expirationDate, cvv, terms, weight, height,workoutType, weightGoal
        // });

        if (
            !userFullName ||
            !resolvedDob ||
            !gender ||
            !userEmail ||
            !phoneNumber ||
            !userPassword ||
            !userConfirmPassword ||
            !membershipPlan ||
            !membershipDuration ||
            weight === undefined||
            height === undefined ||
            !workoutType ||        // ADD THIS VALIDATION
            weightGoal === undefined
        ) {
            //  console.log('Validation failed: Missing fields');
            return res.status(400).json({ error: 'Required fields are missing (name, email, password, phone, gender, dob/age, membership, workout_type, weight, height)' });
        }

        if (userPassword !== userConfirmPassword) {
            //  console.log('Validation failed: Passwords do not match');
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(userEmail)) {
            //  console.log('Validation failed: Invalid email:', userEmail);
            return res.status(400).json({ error: 'Invalid email address' });
        }

        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phoneNumber)) {
            //  console.log('Validation failed: Invalid phone number:', phoneNumber);
            return res.status(400).json({ error: 'Invalid phone number' });
        }

        if (isNaN(weight) || weight < 0) {
            //  console.log('Validation failed: Invalid weight:', weight);
            return res.status(400).json({ error: 'Weight must be a non-negative number' });
        }
        const validWorkoutTypes = ['Calisthenics', 'Weight Loss', 'HIIT', 'Competitive', 'Strength Training', 'Cardio', 'Flexibility', 'Bodybuilding'];
        if (!validWorkoutTypes.includes(workoutType)) {
            //  console.log('Validation failed: Invalid workout type:', workoutType);
            return res.status(400).json({ error: 'Please select a valid workout type' });
        }

        if (isNaN(weightGoal) || weightGoal < 20 || weightGoal > 300) {
            //  console.log('Validation failed: Invalid weight goal:', weightGoal);
            return res.status(400).json({ error: 'Weight goal must be between 20 and 300 kg' });
        }
        let calculatedBMI = null;
        if (height !== undefined) {
            if (isNaN(height) || height < 0) {
                //  console.log('Validation failed: Invalid height:', height);
                return res.status(400).json({ error: 'Height must be a non-negative number' });
            }
            const heightInMeters = Number(height) / 100;
            if (heightInMeters > 0) {
                calculatedBMI = Number(weight) / (heightInMeters * heightInMeters);
                calculatedBMI = Math.round(calculatedBMI * 10) / 10;
                //  console.log('Calculated BMI:', calculatedBMI);
            }
        }

        // REYNA
        // Add validation for workoutType
        if (!workoutType) {
            //  console.log('Validation failed: Workout type is required');
            return res.status(400).json({ error: 'Please select your preferred workout type' });
        }

        if (weightGoal === undefined) {
            //  console.log('Validation failed: Weight goal is required');
            return res.status(400).json({ error: 'Weight goal is required' });
        }

        if (isNaN(weightGoal) || weightGoal < 20 || weightGoal > 300) {
            //  console.log('Validation failed: Invalid weight goal:', weightGoal);
            return res.status(400).json({ error: 'Weight goal must be between 20 and 300 kg' });
        }
        // end REYNA

        const existingUser = await User.findOne({ email: userEmail });
        if (existingUser) {
            //  console.log('Validation failed: Email already registered:', userEmail);
            return res.status(400).json({ error: 'Email already registered' });
        }

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(userPassword, saltRounds);
        //  console.log('Password hashed for:', userEmail);


        // Calculate end date based on membership duration           REYNA
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + parseInt(membershipDuration));


        const newUser = new User({
            full_name: userFullName,
            email: userEmail,
            password_hash,
            dob: resolvedDob,
            gender: gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase(),
            phone: phoneNumber,
            membershipType: membershipPlan.charAt(0).toUpperCase() + membershipPlan.slice(1).toLowerCase(),
           
            // REYNA
            workout_type: workoutType,
            // ADD FITNESS GOALS WITH WEIGHT GOAL:
            fitness_goals: {
                calorie_goal: 2200,
                protein_goal: 90,
                weight_goal: Number(weightGoal)  // ADD THIS
            },

            // NEW: Add membership duration data          REYNA
            membershipDuration: {
                months_remaining: parseInt(membershipDuration),
                start_date: startDate,
                end_date: endDate,
                auto_renew: false,
                last_renewal_date: startDate
            },

            weight: Number(weight),
            height: height !== undefined ? Number(height) : null,
            BMI: calculatedBMI,
            //REYNA
            workout_type: workoutType
        });
        //  console.log('New user object created:', newUser);

        await newUser.save();
        //  console.log('User saved to MongoDB:', userEmail);

        if (!req) {
            console.error('Session middleware not initialized');
            //  console.log('Proceeding without session for user:', userEmail);
        } else {
            req.user = {
                id: newUser._id,
                email: newUser.email,
                full_name: newUser.full_name,
                name: newUser.full_name,
                membershipType: newUser.membershipType,
                membership: newUser.membershipType.toLowerCase()
            };
            //  console.log('Session set for user:', userEmail);
        }

        res.status(201).json({ message: 'Signup successful', redirect: '/login_signup' });
    } catch (error) {
        console.error('Signup error:', error);
        if (error.code === 11000) {
            //  console.log('MongoDB error: Duplicate email:', userEmail);
            return res.status(400).json({ error: 'Email already registered' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            //  console.log('MongoDB validation errors:', messages);
            return res.status(400).json({ error: messages.join(', ') });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

// Add this function to userController.js for individual exercise completion
const markExerciseCompleted = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Please log in to complete the exercise' });
        }

        const userId = req.user.id || req.user._id;
        const { workoutId, exerciseId, weight, reps, sets } = req.body;

        if (!workoutId || !exerciseId) {
            return res.status(400).json({ 
                error: 'Workout ID and exercise ID are required' 
            });
        }

        // Find workout
        const workout = await WorkoutHistory.findOne({ 
            _id: workoutId, 
            userId 
        });

        if (!workout) {
            return res.status(404).json({ 
                error: 'Workout not found. Please refresh your dashboard.' 
            });
        }

        // 🔥 Find exercise using Mongo subdocument ID
        const exercise = workout.exercises.id(exerciseId);

        if (!exercise) {
            return res.status(404).json({ 
                error: 'Exercise not found in this workout' 
            });
        }

        // Prevent duplicate completion
        if (exercise.completed) {
            return res.status(400).json({ 
                error: 'Exercise already completed' 
            });
        }

        // ✅ Mark as completed
        exercise.completed = true;

        // ✅ Optional updates (if sent)
        if (weight !== undefined) exercise.weight = weight;
        if (reps !== undefined) exercise.reps = reps;
        if (sets !== undefined) exercise.sets = sets;

        // 🔥 Recalculate progress (ALL exercises)
        const totalExercises = workout.exercises.length;
        const completedExercises = workout.exercises.filter(ex => ex.completed).length;

        const progress = Math.round((completedExercises / totalExercises) * 100);
        workout.progress = progress;

        // If all completed
        if (completedExercises === totalExercises) {
            workout.completed = true;
            workout.isComplete = true;
            workout.completedAt = new Date();
        }

        await workout.save();

        res.json({
            success: true,
            message: 'Exercise marked as completed',
            progress,
            completedExercises,
            totalExercises
        });

    } catch (error) {
        console.error('Error in markExerciseCompleted:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error: ' + error.message 
        });
    }
};

//brimstone
// Add this function to userController.js
const changeMembership = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const userId = req.user.id || req.user._id;
        const { newMembershipType, duration, cardLastFour } = req.body;

        // Validate input
        if (!newMembershipType || !duration) {
            return res.status(400).json({ success: false, message: 'Plan type and duration are required' });
        }

        // Validate membership type
        const validMembershipTypes = ['Basic', 'Gold', 'Platinum'];
        if (!validMembershipTypes.includes(newMembershipType)) {
            return res.status(400).json({ success: false, message: 'Invalid membership type' });
        }

        // Validate duration
        const validDurations = [1, 3, 6];
        if (!validDurations.includes(duration)) {
            return res.status(400).json({ success: false, message: 'Invalid duration' });
        }

        // ==========================================
        // DYNAMIC AMOUNT CALCULATION (SECURED)
        // ==========================================
        const planKey = newMembershipType.toLowerCase();
        const monthlyRates = {
            basic: 299,     // ₹299/month
            gold: 599,      // ₹599/month
            platinum: 999   // ₹999/month
        };

        const ratePerMonth = monthlyRates[planKey] || 299;
        let finalAmount = ratePerMonth * duration;

        // Apply Discounts
        if (duration === 3) {
            finalAmount = finalAmount * 0.85; // 15% Discount
        } else if (duration === 6) {
            finalAmount = finalAmount * 0.75; // 25% Discount
        }
        
        finalAmount = Math.round(finalAmount); // Round to whole rupee

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }


        // Calculate new membership duration
        const newMonthsRemaining = duration;

        // Update user membership - PRESERVE EXISTING FITNESS GOALS
        user.membershipType = newMembershipType;
        user.membershipDuration.months_remaining = newMonthsRemaining;
        user.membershipDuration.last_renewal_date = new Date();
        
        // Update end date
        const newEndDate = new Date();
        newEndDate.setMonth(newEndDate.getMonth() + newMonthsRemaining);
        user.membershipDuration.end_date = newEndDate;
        
        user.status = 'Active';

        // Ensure fitness_goals are preserved and not set to null
        if (!user.fitness_goals) {
            user.fitness_goals = {
                calorie_goal: 2200,
                protein_goal: 90,
                weight_goal: user.weight || 70 // Use current weight as default if no goal exists
            };
        } else if (user.fitness_goals.weight_goal === null || user.fitness_goals.weight_goal === undefined) {
            // Set a default weight goal if it's null/undefined
            user.fitness_goals.weight_goal = user.weight || 70;
        }

        // Create membership record
        // Create membership record
        const membershipRecord = new Membership({
            user_id: userId,
            plan: newMembershipType.toLowerCase(),
            duration: duration,
            start_date: new Date(),
            end_date: newEndDate,
            price: amount,
            payment_method: 'credit_card',
            card_last_four: cardLastFour,
            status: 'Active'
        });

        // ---> ADD THIS NEW PAYMENT RECORD <---
        const paymentRecord = new Payment({
            userId: userId,
            membershipId: membershipRecord._id, // Link it to the membership
            amount: amount,
            paymentFor: 'Membership',
            paymentMethod: 'Card', // Assuming Card from frontend
            status: 'Success',
            membershipPlan: newMembershipType.toLowerCase(),
            isRenewal: false
        });

        // ---> UPDATE PROMISE.ALL TO SAVE THE PAYMENT TOO <---
        await Promise.all([
            user.save(),
            membershipRecord.save(),
            paymentRecord.save() 
        ]);

        // Update session
        req.user.membershipType = newMembershipType;
        req.user.membership = newMembershipType.toLowerCase();
        req.user.membershipDuration = {
            months_remaining: newMonthsRemaining,
            end_date: newEndDate,
            auto_renew: user.membershipDuration.auto_renew
        };

        //  console.log('Membership changed successfully for user:', userId);

        res.json({
            success: true,
            message: 'Membership changed successfully',
            newMembershipType: newMembershipType,
            monthsRemaining: newMonthsRemaining,
            redirect: `/userdashboard_${newMembershipType.charAt(0).toLowerCase()}`
        });

    } catch (error) {
        console.error('Error changing membership:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


//brimstone
// brimstone
// Add this function to userController.js
// Add this function to userController.js
const updateUserProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        // Fix 1: Handle both .id and ._id depending on how the JWT/Session is structured
        const userId = req.user.id || req.user._id;
        
        // Fix 2: Accept fitness_goals from the frontend
        const { full_name, email, phone, dob, height, weight, fitness_goals } = req.body;

        // Fix 3: Remove the strict email check, only require full_name
        if (!full_name) {
            return res.status(400).json({ success: false, message: 'Name is a required field' });
        }
        
        // Prepare update data
        const updateData = {
            full_name,
            phone,
            height: height ? Number(height) : null,
            weight: weight ? Number(weight) : null
        };

        // Only update email if it was actually provided
        if (email) updateData.email = email;
        
        // Recalculate BMI if needed
        if (height && weight && height > 0) {
            const heightInMeters = height / 100;
            updateData.BMI = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        }

        if (dob) updateData.dob = new Date(dob);

        // Include fitness goals if provided
        if (fitness_goals) {
            updateData.fitness_goals = {
                weight_goal: fitness_goals.weight_goal ? Number(fitness_goals.weight_goal) : null,
                calorie_goal: fitness_goals.calorie_goal ? Number(fitness_goals.calorie_goal) : 2200,
                protein_goal: fitness_goals.protein_goal ? Number(fitness_goals.protein_goal) : 90
            };
        }

        // Remove undefined fields
        Object.keys(updateData).forEach(key => updateData[key] == null && delete updateData[key]);

        // --- Handle History ---
        let updateOperation = { $set: updateData };

        // If weight is being updated, push to weight_history
        if (weight) {
            updateOperation.$push = {
                weight_history: {
                    weight: Number(weight),
                    date: new Date()
                }
            };
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateOperation,
            { new: true, runValidators: true }
        ).select('-password_hash'); // Don't send password hash back to frontend

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update session/token data representation if needed
        req.user = { ...req.user, ...updateData, BMI: updateData.BMI };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser,
            BMI: updateData.BMI
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Email already exists' });
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

// Update the getUserDashboard function in userController.js to fetch nutrition data:
// brimstone
// Get user dashboard based on membership type
const getUserDashboard = async (req, res, membershipCode) => {
// ... (omitted for brevity)
    try {
        if (!req.user) {
            return res.redirect('/login_signup?form=login');
        }

        const userId = req.user.id;

        // ✅ PERMANENT FIX: Use local time consistently
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        //  console.log('✅ Local Today:', today.toString());

        const todaysConsumedFoods = await getTodaysFoods(userId);
        //  console.log('🎯 Final todaysConsumedFoods to display:', todaysConsumedFoods.length);

        const user = await User.findById(userId)
    .populate('trainer', 'name email specializations experience clients maxClients status')
    .populate('class_schedules.trainerId', 'name');
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if membership is active - REYNA
        if (!user.isMembershipActive()) {
            return res.redirect('/membership/renewal');
        }
        
        // Determine dashboard template based on membership code
        let dashboardTemplate;
        switch(membershipCode) {
            case 'p':
                dashboardTemplate = 'userdashboard_p';
                break;
            case 'g':
                dashboardTemplate = 'userdashboard_g';
                break;
            default:
                dashboardTemplate = 'userdashboard_b';
        }
        
        // --- START WORKOUTS COMPLETED FIX ---
        // 1. Define the current week range (Sunday to Saturday)
        const dayOfWeek = today.getDay();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        // console.log('✅ Local Week Range (Sunday to Saturday):', weekStart.toString(), 'to', weekEnd.toString());

        // 2. Query WorkoutHistory for the current week
        const weeklyWorkoutHistory = await WorkoutHistory.find({
            userId: userId,
            date: { $gte: weekStart, $lt: weekEnd }
        });
        
        // 3. Calculate completed and total for the overview card
        const workoutsCompletedCount = weeklyWorkoutHistory.filter(w => w.completed).length;
        const workoutsTotalCount = weeklyWorkoutHistory.length;
        
        const weeklyWorkouts = {
            completed: workoutsCompletedCount,
            total: workoutsTotalCount // This now represents the number of plans set for the week
        };
        
        const recentWorkouts = await WorkoutHistory.find({ userId: userId })
            .populate('workoutPlanId')
            .sort({ date: -1 })
            .limit(5);
            
        // ✅ PERMANENT FIX: Use local time for day calculation
        const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
        
        // Get the weekly nutrition data
        const weeklyNutritionEntry = await NutritionHistory.findOne({
            userId: userId,
            date: { $gte: weekStart, $lt: weekEnd }
        });

        // Extract today's nutrition data from the weekly plan
        let todayNutrition = { 
            calories_consumed: 0, 
            protein_consumed: 0,
            calorie_goal: user.fitness_goals.calorie_goal,
            protein_goal: user.fitness_goals.protein_goal,
            macros: { protein: 0, carbs: 0, fats: 0 }
        };

        if (weeklyNutritionEntry) {
            const todayData = weeklyNutritionEntry.daily_nutrition[todayDayName];
            
            if (todayData) {
                //  console.log('🔍 Today Data from DB:', {
                //     calories_consumed: todayData.calories_consumed,
                //     protein_consumed: todayData.protein_consumed,
                //     foods_count: todayData.foods ? todayData.foods.length : 0,
                //     consumed_foods: todayData.foods ? todayData.foods.filter(f => f.consumed).length : 0
                // });
                
                // ✅ FIX: Always use the stored consumed values from the database
                todayNutrition = {
                    calories_consumed: todayData.calories_consumed || 0,
                    protein_consumed: todayData.protein_consumed || 0,
                    calorie_goal: weeklyNutritionEntry.calorie_goal || user.fitness_goals.calorie_goal,
                    protein_goal: weeklyNutritionEntry.protein_goal || user.fitness_goals.protein_goal,
                    macros: todayData.macros || { protein: 0, carbs: 0, fats: 0 }
                };
                
                //  console.log('📊 Today Nutrition - Final:', {
                //     calories: todayNutrition.calories_consumed,
                //     protein: todayNutrition.protein_consumed,
                //     goalCalories: todayNutrition.calorie_goal,
                //     goalProtein: todayNutrition.protein_goal
                // });
            } else {
                //  console.log('❌ No data found for today:', todayDayName);
                //  console.log('Available days:', Object.keys(weeklyNutritionEntry.daily_nutrition || {}));
            }
        } else {
            //  console.log('❌ No weekly nutrition entry found for this week');
        }

        //  console.log('📊 Today Nutrition Data:', todayNutrition);
        //  console.log('📅 Today Day:', todayDayName);
        
        // Get last 7 days nutrition data for weekly stats (using local time)
        const weekStartDate = new Date(today);
        weekStartDate.setDate(today.getDate() - 7);
        
        const weeklyNutrition = await NutritionHistory.find({
            userId: userId,
            date: { $gte: weekStartDate }
        }).sort({ date: 1 });
        
        // Format nutrition data for the chart
        const nutritionChartData = {
            labels: [],
            calories: [],
            protein: []
        };
        
        // Create array of last 7 dates (local time)
        const dateLabels = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dateLabels.push(date);
        }
        
        // Format dates as labels and find matching nutrition data
        dateLabels.forEach(date => {
            const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            nutritionChartData.labels.push(dateString);
            
            const dayData = weeklyNutrition.find(entry => {
                const entryDate = new Date(entry.date);
                return entryDate.getDate() === date.getDate() && 
                       entryDate.getMonth() === date.getMonth() && 
                       entryDate.getFullYear() === date.getFullYear();
            });
            
            nutritionChartData.calories.push(dayData ? dayData.calories_consumed || 0 : 0);
            nutritionChartData.protein.push(dayData ? dayData.protein_consumed || 0 : 0);
        });
        
        // Get recent foods function
        const getRecentFoods = async (userId, limit = 10) => {
            try {
                //  console.log('🔍 Fetching recent foods for user:', userId);
                
                // Get nutrition entries from last 30 days (local time)
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                
                const nutritionEntries = await NutritionHistory.find({ 
                    userId: userId,
                    date: { $gte: thirtyDaysAgo }
                })
                .sort({ date: -1 })
                .limit(10);

                //  console.log('📊 Found nutrition entries:', nutritionEntries.length);

                let foods = [];
                
                nutritionEntries.forEach((entry, index) => {
                    //  console.log(`📅 Processing entry ${index + 1}:`, entry.date);
                    
                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    days.forEach(day => {
                        if (entry.daily_nutrition && 
                            entry.daily_nutrition[day] && 
                            entry.daily_nutrition[day].foods && 
                            entry.daily_nutrition[day].foods.length > 0) {
                            
                            //  console.log(`🍽️ Found ${entry.daily_nutrition[day].foods.length} foods for ${day}`);
                            
                            entry.daily_nutrition[day].foods.forEach(food => {
                                if (food.name && food.calories) {
                                    foods.push({
                                        name: food.name,
                                        calories: food.calories,
                                        protein: food.protein || 0,
                                        carbs: food.carbs || 0,
                                        fats: food.fats || 0,
                                        date: entry.date,
                                        day: day
                                    });
                                }
                            });
                        }
                    });
                });

                //  console.log('🎯 Total foods collected:', foods.length);
                
                // Sort by date (most recent first) and limit
                const sortedFoods = foods.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
                
                //  console.log('✅ Final recent foods to display:', sortedFoods.length);
                sortedFoods.forEach((food, index) => {
                    //  console.log(`${index + 1}. ${food.name} - ${food.calories} kcal - ${food.day} - ${new Date(food.date).toLocaleDateString()}`);
                });
                
                return sortedFoods;
            } catch (error) {
                console.error('❌ Error getting recent foods:', error);
                return [];
            }
        };

        const recentFoods = await getRecentFoods(userId, 10);
        
        // Calculate nutrition stats
        const calorieAvg = weeklyNutrition.length > 0 
            ? weeklyNutrition.reduce((sum, entry) => sum + (entry.calories_consumed || 0), 0) / weeklyNutrition.length 
            : 0;
            
        const proteinAvg = weeklyNutrition.length > 0 
            ? weeklyNutrition.reduce((sum, entry) => sum + (entry.protein_consumed || 0), 0) / weeklyNutrition.length 
            : 0;
        
        // Calculate macros percentages if available
        let macrosData = { protein: 0, carbs: 0, fats: 0 };
        if (todayNutrition.macros) {
            macrosData = todayNutrition.macros;
        } else if (weeklyNutrition.length > 0) {
            const macrosEntries = weeklyNutrition.filter(entry => entry.macros);
            if (macrosEntries.length > 0) {
                macrosData = {
                    protein: macrosEntries.reduce((sum, entry) => sum + (entry.macros.protein || 0), 0) / macrosEntries.length,
                    carbs: macrosEntries.reduce((sum, entry) => sum + (entry.macros.carbs || 0), 0) / macrosEntries.length,
                    fats: macrosEntries.reduce((sum, entry) => sum + (entry.macros.fats || 0), 0) / macrosEntries.length
                };
            }
        }

        // ✅ FIXED: Get today's workout (Week starts from Monday)
       // ✅ FIXED: Get today's workout with better debugging
// ✅ FIXED: Get today's workout with proper progress calculation for TODAY ONLY
// ✅ FIXED: Get today's workout with proper timezone handling


        // ✅ USE the function to get today's workout
        const todayWorkoutData = await getTodaysWorkout(userId);
        //  console.log('✅ Today workout data:', todayWorkoutData);


        // Update exercise progress with actual workout data
let exerciseProgress = [
    { name: 'Bench Press', progress: 0, currentWeight: 0, goalWeight: 100 },
    { name: 'Squat', progress: 0, currentWeight: 0, goalWeight: 120 },
    { name: 'Deadlift', progress: 0, currentWeight: 0, goalWeight: 130 }
];

// Get actual workout data to populate the progress
// Get actual workout data to populate the progress
try {
    // Get all workout history to find max weights for each exercise
    const allWorkouts = await WorkoutHistory.find({ userId: userId });
    
    // Find maximum weights for each exercise - with flexible name matching
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
                
                // Flexible name matching for different exercise variations
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
    
    //  console.log('🏋️ Found max weights:', exerciseMaxWeights);
    
    // Update exercise progress with real data
    exerciseProgress = exerciseProgress.map(exercise => {
        const maxWeight = exerciseMaxWeights[exercise.name] || 0;
        const progress = exercise.goalWeight > 0 ? Math.round((maxWeight / exercise.goalWeight) * 100) : 0;
        
        return {
            ...exercise,
            currentWeight: maxWeight,
            progress: progress
        };
    });
    
    //  console.log('📊 Final exercise progress:', exerciseProgress);
    
} catch (error) {
    console.error('❌ Error calculating exercise progress:', error);
}

        // Use today's workout data to update exercise progress
        if (todayWorkoutData.exercises.length > 0) {
            const exercises = todayWorkoutData.exercises;
            
            const benchPressExercises = exercises.filter(ex => ex.name && ex.name.toLowerCase().includes('bench'));
            if (benchPressExercises.length > 0) {
                const maxBench = Math.max(...benchPressExercises.map(ex => ex.weight || 0));
                exerciseProgress[0].currentWeight = maxBench;
                exerciseProgress[0].progress = Math.round((maxBench / 100) * 100);
            }
            
            const squatExercises = exercises.filter(ex => ex.name && ex.name.toLowerCase().includes('squat'));
            if (squatExercises.length > 0) {
                const maxSquat = Math.max(...squatExercises.map(ex => ex.weight || 0));
                exerciseProgress[1].currentWeight = maxSquat;
                exerciseProgress[1].progress = Math.round((maxSquat / 120) * 100);
            }
            
            const deadliftExercises = exercises.filter(ex => ex.name && ex.name.toLowerCase().includes('deadlift'));
            if (deadliftExercises.length > 0) {
                const maxDeadlift = Math.max(...deadliftExercises.map(ex => ex.weight || 0));
                exerciseProgress[2].currentWeight = maxDeadlift;
                exerciseProgress[2].progress = Math.round((maxDeadlift / 130) * 100);
            }
        }

        // ✅ UTC: Get upcoming class
        const upcomingClass = user.class_schedules && user.class_schedules.length > 0
            ? user.class_schedules
                .filter(cls => {
                    const classDate = new Date(cls.date);
                    const now = new Date();
                    return classDate >= now;
                })
                .sort((a, b) => new Date(a.date) - new Date(b.date))[0]
            : null;

        //  console.log('=== DEBUG DASHBOARD DATA ===');
        //  console.log('Recent workouts:', recentWorkouts.length);
        //  console.log('Today workout exercises:', todayWorkoutData.exercises.length);
        //  console.log('Recent foods:', recentFoods.length);
        // Debug section
        //  console.log('=== DEBUG WORKOUT DATA (LOCAL) ===');
        //  console.log('Local Today:', today.toString());
        //  console.log('Local Today Day Name:', todayDayName);
        //  console.log('Local Week Start:', weekStart.toString());
        //  console.log('Local Week End:', weekEnd.toString());
        

        //  console.log('=== DEBUG RECENT FOODS ===');
        //  console.log('Recent foods count:', recentFoods.length);

        // Common data for all membership types
        const commonData = {
            user: user,
            recentWorkouts: recentWorkouts,
            todayNutrition: todayNutrition,
            
            weeklyWorkouts: {
    completed: recentWorkouts.reduce((total, workout) => {
        return total + workout.exercises.filter(exercise => exercise.completed).length;
    }, 0),
    total: recentWorkouts.reduce((total, workout) => {
        return total + workout.exercises.length;
    }, 0)
},
            todayWorkout: todayWorkoutData,
            exerciseProgress: exerciseProgress,
            membershipInfo: {
                months_remaining: user.membershipDuration.months_remaining,
                end_date: user.membershipDuration.end_date,
                auto_renew: user.membershipDuration.auto_renew,
                is_active: user.isMembershipActive()
            },
            currentPage: 'dashboard',
            todaysConsumedFoods: todaysConsumedFoods
        };
        
        // Additional data for platinum members
        if (membershipCode === 'p') {
            const platinumData = {
                ...commonData,
                nutritionChartData: nutritionChartData,
                recentFoods: recentFoods,
                nutritionStats: {
                    calorieAvg: Math.round(calorieAvg),
                    proteinAvg: Math.round(proteinAvg),
                    macros: macrosData
                },
                upcomingClass: upcomingClass
            };
            
            res.render(dashboardTemplate, platinumData);
        } else {
            // FIX: Ensure todaysConsumedFoods is explicitly added to the data object for Gold/Basic
            const basicGoldData = {
                ...commonData,
                nutritionChartData: nutritionChartData,
                nutritionStats: {
                    calorieAvg: Math.round(calorieAvg),
                    proteinAvg: Math.round(proteinAvg),
                    macros: macrosData
                },
            };
            res.render(dashboardTemplate, basicGoldData);
        }
        
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).send(`
            <html>
                <body>
                    <h1>Error Loading Dashboard</h1>
                    <p>There was an error loading your dashboard. Please try again.</p>
                    <p>Error: ${error.message}</p>
                    <a href="/userdashboard_${membershipCode}">Try Again</a>
                </body>
            </html>
        `);
    }
};


const completeWorkout = async (req, res) => {
// ... (omitted for brevity)
    try {
        if (!req.user) {
            //  console.log('No user session found');
            return res.status(401).json({ error: 'Please log in to complete the workout' });
        }

        const userId = req.user.id;
        const { workoutPlanId } = req.body; // This is WorkoutHistory _id

        if (!workoutPlanId) {
            //  console.log('Missing workoutPlanId');
            return res.status(400).json({ error: 'Workout ID is required' });
        }

        //  console.log('Completing workout for user:', userId, 'Workout ID:', workoutPlanId);

        const workout = await WorkoutHistory.findOne({ _id: workoutPlanId, userId });
        if (!workout) {
            //  console.log('Workout not found:', workoutPlanId);
            return res.status(404).json({ error: 'Workout not found' });
        }

        if (workout.completed) {
            //  console.log('Workout already completed:', workoutPlanId);
            return res.status(400).json({ error: 'Workout already completed' });
        }

        workout.completed = true;
        workout.progress = 100;
        workout.exercises.forEach(exercise => {
            exercise.completed = true;
        });

        await workout.save();
        //  console.log('Workout completed successfully:', workoutPlanId);

        res.status(200).json({ message: 'Workout completed successfully' });
    } catch (error) {
        console.error('Error completing workout:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const markWorkoutCompleted = async (req, res) => {
    try {
        const { workoutId } = req.body;

        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const userId = req.user.id || req.user._id;

        // Find workout history directly
        const workoutEntry = await WorkoutHistory.findOne({
            _id: workoutId,
            userId
        });

        if (!workoutEntry) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        // Mark workout as completed
        workoutEntry.completed = true;
        workoutEntry.isComplete = true;
        workoutEntry.progress = 100;
        workoutEntry.completedAt = new Date();

        // Mark all exercises completed
        if (workoutEntry.exercises) {
            workoutEntry.exercises.forEach(exercise => {
                exercise.completed = true;
            });
        }

        await workoutEntry.save();

        res.json({
            success: true,
            message: 'Workout completed successfully'
        });

    } catch (error) {
        console.error('Error marking workout as completed:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Add this function to userController.js
// Replace the getTodaysFoods function in userController.js with this corrected version:
const getTodaysFoods = async (userId) => {
    try {
        const today = new Date();
        
        // === THE FIX: Force Timezone to match local time ===
        const localDate = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][localDate.getDay()];

        // FETCH LATEST PLAN
        const weeklyNutrition = await NutritionHistory.findOne({
            userId: userId
        }).sort({ date: -1 }); 

        if (weeklyNutrition) {
            const todayData = weeklyNutrition.daily_nutrition[todayDayName];
            
            if (todayData && todayData.foods) {
                return todayData.foods.map(food => ({
                    name: food.name,
                    calories: food.calories,
                    protein: food.protein,
                    carbs: food.carbs || 0,
                    fats: food.fats || 0,
                    consumed: food.consumed || false,
                    consumedAt: food.consumedAt
                }));
            }
        }
        return [];
        
    } catch (error) {
        console.error('Error in getTodaysFoods:', error);
        return [];
    }
};
// Add this as a standalone function AFTER getTodaysFoods:

const getTodaysWorkout = async (userId) => {
    try {
        // 1. Calculate the start and end of the CURRENT week
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
        // Calculate Monday of this week (assuming week starts Monday)
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; 
        
        const weekStart = new Date(today);
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(today.getDate() + diffToMonday);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        // 2. Determine "Today's" day name (e.g., "Monday")
        // Use local time (Asia/Kolkata) to match your other logic
        const localDate = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][localDate.getDay()];

        // 3. Find the workout history SPECIFICALLY for this week
        const currentWorkout = await WorkoutHistory.findOne({
            userId: userId
        }).sort({ date: -1 }).lean();

        if (!currentWorkout) {
             return {
                name: 'No Workout Scheduled',
                exercises: [],
                progress: 0,
                completed: false,
                completedExercises: 0,
                totalExercises: 0,
                duration: 0,
                workoutPlanId: null
            };
        }

        // 4. Extract exercises for today
        if (currentWorkout.exercises && currentWorkout.exercises.length > 0) {
            const exercisesForToday = currentWorkout.exercises.filter(ex => 
                ex.day === todayDayName
            );

            if (exercisesForToday.length > 0) {
                // Calculate progress
                const totalExercises = exercisesForToday.length;
                const completedExercises = exercisesForToday.filter(ex => ex.completed).length;
                const progress = totalExercises === 0 ? 0 : Math.round((completedExercises / totalExercises) * 100);

                return {
                    id: currentWorkout._id,
                    name: currentWorkout.workoutName || "Weekly Workout",
                    exercises: exercisesForToday,
                    progress: progress,
                    completed: completedExercises === totalExercises,
                    completedExercises: completedExercises,
                    totalExercises: totalExercises,
                    duration: exercisesForToday.reduce((total, ex) => total + (ex.duration || 0), 0),
                    workoutPlanId: currentWorkout.workoutPlanId
                };
            }
        }

        return {
            name: 'Rest Day', // If history exists but no exercises for today
            exercises: [],
            progress: 0,
            completed: false,
            completedExercises: 0,
            totalExercises: 0,
            duration: 0,
            workoutPlanId: currentWorkout.workoutPlanId
        };

    } catch (error) {
        console.error('❌ Error in getTodaysWorkout:', error);
        return {
            name: 'Error Loading Workout',
            exercises: [],
            progress: 0,
            completed: false,
            completedExercises: 0,
            totalExercises: 0,
            duration: 0,
            workoutPlanId: null
        };
    }
};

// const getUserProgress = async (req, res) => {
//     try {
//         // req.user is populated by the authMiddleware (protect)
//         const userId = req.user._id; 

//         const history = await WorkoutHistory.find({ userId: userId })
//             .sort({ date: -1 })
//             .limit(6);

//         const chronologicalHistory = history.reverse();

//         const labels = chronologicalHistory.map(entry => 
//             moment(entry.date).format('MMM Do')
//         );

//         const getMaxWeight = (entry, exerciseName) => {
//             if (!entry.exercises) return 0;
//             const exercise = entry.exercises.find(ex => 
//                 ex.name.toLowerCase() === exerciseName.toLowerCase()
//             );
//             return exercise ? (exercise.weight || 0) : 0;
//         };

//         const data = {
//             labels: labels,
//             datasets: [
//                 {
//                     label: 'Squat',
//                     data: chronologicalHistory.map(h => getMaxWeight(h, 'Squat')),
//                     borderColor: 'rgb(255, 99, 132)',
//                     backgroundColor: 'rgba(255, 99, 132, 0.5)',
//                     tension: 0.3
//                 },
//                 {
//                     label: 'Deadlift',
//                     data: chronologicalHistory.map(h => getMaxWeight(h, 'Deadlift')),
//                     borderColor: 'rgb(53, 162, 235)',
//                     backgroundColor: 'rgba(53, 162, 235, 0.5)',
//                     tension: 0.3
//                 },
//                 {
//                     label: 'Bench Press',
//                     data: chronologicalHistory.map(h => getMaxWeight(h, 'Bench Press')),
//                     borderColor: 'rgb(75, 192, 192)',
//                     backgroundColor: 'rgba(75, 192, 192, 0.5)',
//                     tension: 0.3
//                 },
//             ],
//         };

//         res.json(data);
//     } catch (error) {
//         console.error('Error fetching user progress:', error);
//         res.status(500).json({ error: 'Server error fetching progress' });
//     }
// };

const getUserProgressGraph = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Fetch Workout History (Last 6 entries/weeks)
        const history = await WorkoutHistory.find({ userId: userId })
            .sort({ date: -1 }) // Newest first
            .limit(6);

        // 2. Reverse to Chronological Order (Oldest -> Newest)
        const chronologicalHistory = history.reverse();

        // 3. Generate Labels (Dates)
        const labels = chronologicalHistory.map(entry => 
            moment(entry.date).format('MMM Do')
        );

        // 4. Helper to find max weight with fuzzy matching
        // This handles "Barbell Squat" by matching "squat"
        const getMaxWeight = (entry, searchTerm) => {
            if (!entry.exercises || entry.exercises.length === 0) return 0;
            
            const relevantExercises = entry.exercises.filter(ex => 
                ex.name && ex.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (relevantExercises.length === 0) return 0;

            // Find max weight among matches
            return Math.max(...relevantExercises.map(ex => ex.weight || 0));
        };

        // 5. Build Datasets
        const graphData = {
            labels: labels,
            datasets: [
                {
                    label: 'Bench Press',
                    data: chronologicalHistory.map(h => getMaxWeight(h, 'bench')),
                    borderColor: '#20B2AA', // Teal
                    backgroundColor: 'rgba(32, 178, 170, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Squat', // Will match "Barbell Squat" via helper
                    data: chronologicalHistory.map(h => getMaxWeight(h, 'squat')),
                    borderColor: '#8A2BE2', // Purple
                    backgroundColor: 'rgba(138, 43, 226, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Deadlift',
                    data: chronologicalHistory.map(h => getMaxWeight(h, 'deadlift')),
                    borderColor: '#FF6347', // Tomato
                    backgroundColor: 'rgba(255, 99, 71, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        };

        res.json({
            success: true,
            exerciseProgress: graphData // Return as exerciseProgress to match your frontend structure
        });

    } catch (error) {
        console.error('Error fetching user graph progress:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

const getWorkoutStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // --- A. Dashboard Logic (Weekly Totals) ---
        // (This remains unchanged for the dashboard card)
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

        // --- B. Profile Graph Logic (Daily Completion %) ---
        const dailyStats = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);

            // CHANGED: Find the actual document instead of just counting it
            const workout = await WorkoutHistory.findOne({
                userId: userId,
                date: { $gte: date, $lt: nextDay }
            });

            let percentage = 0;

            // Calculate percentage based on exercises inside the workout
            if (workout && workout.exercises && workout.exercises.length > 0) {
                const totalExercises = workout.exercises.length;
                const completedExercises = workout.exercises.filter(ex => ex.completed).length;
                percentage = Math.round((completedExercises / totalExercises) * 100);
            }

            dailyStats.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                percentage: percentage // Sending % instead of count
            });
        }
        
        // --- C. Weight History ---
        const user = await User.findById(userId).select('weight_history');
        const formattedWeightHistory = (user.weight_history || [])
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-10)
            .map(entry => ({
                date: entry.date,
                weight: entry.weight
            }));

        res.json({
            success: true,
            weeklyWorkouts: {
                completed: weeklyWorkoutHistory.filter(w => w.completed).length,
                total: weeklyWorkoutHistory.length
            },
            weeklyStats: dailyStats, 
            weightHistory: formattedWeightHistory 
        });

    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
};

// ==========================================
// SCHEDULING & APPOINTMENT CONTROLLERS
// ==========================================

// 1. Get a specific Trainer's Availability
const getTrainerAvailability = async (req, res) => {
  try {
    const trainerId = req.params.trainerId;
    const availability = await TrainerAvailability.findOne({ trainerId });
    
    if (!availability) {
      return res.status(404).json({ message: "Trainer has not set their availability yet." });
    }

    // We purposely DO NOT send the personalMeetLink here for privacy.
    // They only get the link once the appointment is approved.
    res.status(200).json({ workingHours: availability.workingHours });
  } catch (error) {
    console.error("Error fetching trainer availability:", error);
    res.status(500).json({ message: "Server error while fetching availability." });
  }
};

// 2. Request an Appointment with a Trainer
const requestAppointment = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { trainerId, date, startTime, endTime, notes } = req.body;

    const newAppointment = new Appointment({
      trainerId,
      userId,
      date,
      startTime,
      endTime,
      notes,
      status: 'pending' // Always starts as pending
    });

    await newAppointment.save();
    
    res.status(201).json({ 
      message: "Appointment requested successfully. Awaiting trainer approval.", 
      appointment: newAppointment 
    });
  } catch (error) {
    console.error("Error requesting appointment:", error);
    res.status(500).json({ message: "Server error while requesting appointment." });
  }
};

// 3. Get User's own appointments (to show on their dashboard)
const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    // Fetch appointments and populate trainer details so the user sees who it's with
    const appointments = await Appointment.find({ userId })
      .populate('trainerId', 'name email')
      .sort({ date: 1, startTime: 1 }); // Sort soonest first

    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    res.status(500).json({ message: "Server error while fetching appointments." });
  }
};

// 4. Cancel a Pending Appointment
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Ensure the logged-in user owns this appointment
    if (appointment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to cancel this appointment." });
    }

    // Only allow cancellation of pending appointments
    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: `Cannot cancel an appointment that is already ${appointment.status}.` });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled successfully.", appointment });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ message: "Server error while cancelling appointment." });
  }
};

module.exports = {
    //loginUser,
    signupUser,
    getUserDashboard,
    completeWorkout,
    getUserProfile,
    markWorkoutCompleted,
    checkMembershipActive,
    checkTrainerSubscription,
    updateUserProfile,
    changeMembership,
    getTodaysFoods,
    markExerciseCompleted,// Add this line
    getTodaysWorkout,
    changePassword,
    deleteAccount,
    requestTrainerChange,
    rateTrainer,
    getPurchaseHistory,
    // getUserProgress,
    getUserProgressGraph,
    getWorkoutStats,
    getTrainerAvailability,
    requestAppointment,
    getUserAppointments,
    cancelAppointment
};
