// =============================================
// USER SWAGGER DOCS
// Routes defined in userRoutes.js, mounted at "/" in server.js
// =============================================

// ═══════════════ PROFILE ═══════════════

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Returns full user profile with populated trainer info.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               user:
 *                 _id: "60d5ec49f1b2c72b7c8e4a3f"
 *                 full_name: "John Doe"
 *                 email: "john@example.com"
 *                 phone: "9876543210"
 *                 age: 25
 *                 gender: "Male"
 *                 height: 175
 *                 weight: 70
 *                 membershipType: "Gold"
 *                 workout_type: "Strength"
 *                 trainer:
 *                   name: "Mike Trainer"
 *                   email: "mike@gymrats.com"
 *                   specializations: ["Strength Training"]
 *                   experience: 5
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "John Doe Updated"
 *               phone:
 *                 type: string
 *                 example: "9876543211"
 *               age:
 *                 type: integer
 *                 example: 26
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               height:
 *                 type: number
 *                 example: 176
 *               weight:
 *                 type: number
 *                 example: 72
 *               workout_type:
 *                 type: string
 *                 example: "HIIT"
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Profile updated successfully"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// ═══════════════ USER MODULE FEATURES ═══════════════

/**
 * @swagger
 * /api/user/trainer/rate:
 *   post:
 *     summary: Rate your assigned trainer
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trainerId
 *               - rating
 *             properties:
 *               trainerId:
 *                 type: string
 *                 example: "681baf7e0c7b054ee7df1860"
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               feedback:
 *                 type: string
 *                 example: "Great trainer, very motivating!"
 *     responses:
 *       200:
 *         description: Rating saved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Trainer rated successfully"
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/trainer/change:
 *   post:
 *     summary: Request a trainer change
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Schedule conflict"
 *               preferredTrainerId:
 *                 type: string
 *                 example: "681baf7e0c7b054ee7df1860"
 *     responses:
 *       200:
 *         description: Change request submitted
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Trainer change request submitted"
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/password:
 *   put:
 *     summary: Change password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: "123123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Password changed
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Password changed successfully"
 *       400:
 *         description: Current password incorrect
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/account:
 *   delete:
 *     summary: Delete own account
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Account deleted successfully"
 *       401:
 *         description: Unauthorized
 */

// ═══════════════ WORKOUTS ═══════════════

/**
 * @swagger
 * /api/workout/today:
 *   get:
 *     summary: Get today's workout plan
 *     description: Returns exercises scheduled for today. Requires active membership.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's workout data
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               dayName: "Monday"
 *               exercises:
 *                 - name: "Barbell Squat"
 *                   sets: 4
 *                   reps: "8-12"
 *                   weight: 60
 *                   completed: false
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Membership inactive
 */

/**
 * @swagger
 * /api/workout/weekly-stats:
 *   get:
 *     summary: Get weekly workout statistics
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly stats (completed vs planned)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Membership inactive
 */

/**
 * @swagger
 * /api/workout/complete:
 *   post:
 *     summary: Mark entire workout as completed
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workoutId:
 *                 type: string
 *                 example: "60d5ec49f1b2c72b7c8e6b22"
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *                 example: 45
 *     responses:
 *       200:
 *         description: Workout marked completed
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Workout completed"
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/exercise/complete:
 *   post:
 *     summary: Mark a single exercise as completed
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workoutId
 *               - exerciseId
 *             properties:
 *               workoutId:
 *                 type: string
 *                 example: "69aeaa9353f8e1561f856a72"
 *               exerciseId:
 *                 type: string
 *                 example: "69aeda76ad0ea1845acbcc2e"
 *               weight:
 *                 type: number
 *                 example: 60
 *               reps:
 *                 type: integer
 *                 example: 12
 *               sets:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       200:
 *         description: Exercise marked completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Membership inactive
 */

/**
 * @swagger
 * /api/exercise/progress:
 *   get:
 *     summary: Get exercise progress (Bench, Squat, Deadlift)
 *     description: Returns max weight progress for key compound lifts.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Exercise progress data
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               exerciseProgress:
 *                 - name: "Bench Press"
 *                   progress: 75
 *                   currentWeight: 75
 *                   goalWeight: 100
 *                 - name: "Squat"
 *                   progress: 60
 *                   currentWeight: 72
 *                   goalWeight: 120
 *                 - name: "Deadlift"
 *                   progress: 50
 *                   currentWeight: 65
 *                   goalWeight: 130
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Membership inactive
 */

// ═══════════════ NUTRITION ═══════════════

/**
 * @swagger
 * /api/nutrition/today:
 *   get:
 *     summary: Get today's nutrition data
 *     description: Returns calorie/protein goals, consumed foods, and macros for today.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's nutrition data
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               todayNutrition:
 *                 calories_consumed: 650
 *                 protein_consumed: 55
 *                 calorie_goal: 2200
 *                 protein_goal: 90
 *                 macros:
 *                   protein: 55
 *                   carbs: 80
 *                   fats: 25
 *               todaysConsumedFoods:
 *                 - name: "Oatmeal"
 *                   calories: 300
 *                   consumed: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Membership inactive
 */

/**
 * @swagger
 * /api/nutrition/mark-consumed:
 *   post:
 *     summary: Mark a food item as consumed
 *     description: Marks a food from the nutrition plan as consumed and updates calorie/macro totals.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - foodName
 *               - calories
 *               - protein
 *               - carbs
 *               - fats
 *             properties:
 *               foodName:
 *                 type: string
 *                 example: "Chicken Breast"
 *               calories:
 *                 type: integer
 *                 example: 350
 *               protein:
 *                 type: integer
 *                 example: 40
 *               carbs:
 *                 type: integer
 *                 example: 5
 *               fats:
 *                 type: integer
 *                 example: 10
 *               day:
 *                 type: string
 *                 enum: [Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday]
 *                 description: Optional – defaults to current day (Asia/Kolkata)
 *     responses:
 *       200:
 *         description: Food marked as consumed
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Food marked as consumed successfully"
 *               updatedNutrition:
 *                 calories_consumed: 650
 *                 protein_consumed: 55
 *                 calorie_goal: 2200
 *                 protein_goal: 90
 *       400:
 *         description: Day not found in nutrition plan
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Membership inactive
 *       404:
 *         description: No nutrition plan found / Food not found
 */

// ═══════════════ CLASS SCHEDULE ═══════════════

/**
 * @swagger
 * /api/class/upcoming:
 *   get:
 *     summary: Get next upcoming class
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upcoming class data (or null)
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               upcomingClass:
 *                 date: "2026-04-01T10:00:00.000Z"
 *                 trainerName: "Mike Trainer"
 *                 type: "HIIT Session"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Membership inactive
 */

// ═══════════════ EXERCISES (User-facing) ═══════════════

/**
 * @swagger
 * /api/exercises:
 *   get:
 *     summary: Get exercises for user's workout type
 *     description: Returns verified exercises matching the user's chosen workout type, with personal ratings.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Exercise list with user ratings
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               exercises:
 *                 - _id: "60d5ec49f1b2c72b7c8e5a11"
 *                   name: "Barbell Squat"
 *                   category: "Strength"
 *                   difficulty: "Intermediate"
 *                   userRating: 5
 *                   hasRated: true
 *               userWorkoutType: "Strength"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Membership inactive
 */

/**
 * @swagger
 * /api/exercises/recommended:
 *   get:
 *     summary: Get recommended exercises
 *     description: AI-like recommendations based on user's past ratings and workout type.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommended exercises list
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               exercises:
 *                 - name: "Romanian Deadlift"
 *                   category: "Strength"
 *                   averageRating: 4.5
 *               reason: "similar_to_your_high_rated_exercises"
 *               userWorkoutType: "Strength"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Membership inactive
 */

/**
 * @swagger
 * /api/exercises/search:
 *   get:
 *     summary: Search exercises
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword (name, muscle, category, movement pattern)
 *         example: "squat"
 *     responses:
 *       200:
 *         description: Matching exercises
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Membership inactive
 */

/**
 * @swagger
 * /api/exercises/{exerciseId}:
 *   get:
 *     summary: Get exercise details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Exercise ID
 *     responses:
 *       200:
 *         description: Exercise details with similar exercises
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               exercise:
 *                 name: "Barbell Squat"
 *                 category: "Strength"
 *                 difficulty: "Intermediate"
 *                 targetMuscles: "Quads, Glutes"
 *                 userRating: 5
 *               similarExercises:
 *                 - name: "Front Squat"
 *                   category: "Strength"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Membership inactive
 *       404:
 *         description: Exercise not found
 */

/**
 * @swagger
 * /api/exercises/{exerciseId}/rate:
 *   post:
 *     summary: Rate an exercise
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Exercise ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               effectiveness:
 *                 type: string
 *                 enum: [Very Effective, Effective, Neutral, Ineffective]
 *                 example: "Very Effective"
 *               notes:
 *                 type: string
 *                 example: "Felt great burn in quads"
 *     responses:
 *       200:
 *         description: Rating saved & average updated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Exercise rated successfully"
 *               exercise:
 *                 averageRating: 4.5
 *                 totalRatings: 12
 *       400:
 *         description: Invalid rating value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Membership inactive
 *       404:
 *         description: Exercise not found
 */

// ═══════════════ MEMBERSHIP ═══════════════

/**
 * @swagger
 * /api/membership/extend:
 *   post:
 *     summary: Extend current membership
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - duration
 *             properties:
 *               duration:
 *                 type: string
 *                 enum: ["1", "3", "6", "12"]
 *                 example: "3"
 *                 description: Duration in months
 *     responses:
 *       200:
 *         description: Membership extended
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Membership extended successfully"
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /user/membership/change:
 *   post:
 *     summary: Change membership type
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newMembershipType
 *             properties:
 *               newMembershipType:
 *                 type: string
 *                 enum: [Silver, Gold, Platinum]
 *                 example: "Platinum"
 *     responses:
 *       200:
 *         description: Membership type changed
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Membership changed to Platinum"
 *       401:
 *         description: Unauthorized
 */
