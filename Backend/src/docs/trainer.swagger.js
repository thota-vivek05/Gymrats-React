// =============================================
// TRAINER SWAGGER DOCS
// Prefix: /api/trainer
// =============================================

// ═══════════════ TRAINER SIGNUP ═══════════════

/**
 * @swagger
 * /api/trainer/signup:
 *   post:
 *     summary: Trainer signup / application
 *     description: Submit a trainer application with resume upload
 *     tags: [Trainer]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - confirmPassword
 *               - phone
 *               - specializations
 *               - experience
 *               - termsAgree
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Mike
 *               lastName:
 *                 type: string
 *                 example: Johnson
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mike@gymrats.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: trainerPass123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: trainerPass123
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               specializations:
 *                 type: string
 *                 example: Strength Training, HIIT
 *                 description: Comma-separated list
 *               experience:
 *                 type: string
 *                 example: "3-5"
 *                 description: Must be one of 1-2, 3-5, 5-10, 10+
 *               termsAgree:
 *                 type: boolean
 *                 example: true
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Trainer application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Trainer application submitted successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

// ═══════════════ CLIENTS ═══════════════

/**
 * @swagger
 * /api/trainer/clients:
 *   get:
 *     summary: Get all assigned clients
 *     description: Returns the list of clients assigned to the authenticated trainer.
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of client objects
 *         content:
 *           application/json:
 *             example:
 *               - _id: "60d5ec49f1b2c72b7c8e4a3f"
 *                 full_name: "John Doe"
 *                 email: "john@example.com"
 *                 membershipType: "Gold"
 *                 workout_type: "Strength"
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/trainer/client/{id}:
 *   get:
 *     summary: Get detailed client data
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client (User) ID
 *     responses:
 *       200:
 *         description: Detailed client profile
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Client not found
 */

/**
 * @swagger
 * /api/trainer/client-progress/{clientId}:
 *   get:
 *     summary: Get client progress data
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Client (User) ID
 *     responses:
 *       200:
 *         description: Client workout / nutrition progress
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Client not found
 */

// ═══════════════ WORKOUT PLANS ═══════════════

/**
 * @swagger
 * /api/trainer/workout/{userId}:
 *   get:
 *     summary: Get workout data for a client
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Client (User) ID
 *     responses:
 *       200:
 *         description: Workout plan data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/trainer/save-workout-plan:
 *   post:
 *     summary: Save / update a client's workout plan
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - currentWeek
 *             properties:
 *               clientId:
 *                 type: string
 *                 example: "68ebb8c34657d1d8dac05856"
 *               currentWeek:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Barbell Squat"
 *                     day:
 *                       type: string
 *                       example: "Monday"
 *                     sets:
 *                       type: integer
 *                       example: 4
 *                     reps:
 *                       type: string
 *                       example: "8-12"
 *                     weight:
 *                       type: number
 *                       example: 60
 *                     restTime:
 *                       type: string
 *                       example: "90s"
 *     responses:
 *       200:
 *         description: Workout plan saved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Workout plan saved successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

// ═══════════════ NUTRITION PLANS ═══════════════

/**
 * @swagger
 * /api/trainer/nutrition/{userId}:
 *   get:
 *     summary: Get nutrition data for a client
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Client (User) ID
 *     responses:
 *       200:
 *         description: Nutrition plan data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/trainer/edit_nutritional_plan:
 *   post:
 *     summary: Save / update a client's nutrition plan (ONE DAY at a time)
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - day
 *               - foods
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "68ebb8c34657d1d8dac05856"
 *               day:
 *                 type: string
 *                 enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                 example: "Monday"
 *               calorieGoal:
 *                 type: integer
 *                 example: 2200
 *               proteinGoal:
 *                 type: integer
 *                 example: 90
 *               foods:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Oatmeal with Banana"
 *                     calories:
 *                       type: number
 *                       example: 350
 *                     protein:
 *                       type: number
 *                       example: 12
 *                     carbs:
 *                       type: number
 *                       example: 55
 *                     fats:
 *                       type: number
 *                       example: 8
 *     responses:
 *       200:
 *         description: Nutrition plan saved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Nutrition plan saved successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

// ═══════════════ EXERCISE RATINGS ═══════════════

/**
 * @swagger
 * /api/trainer/exercise-ratings/{userId}:
 *   get:
 *     summary: Get a client's exercise ratings
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Client (User) ID
 *     responses:
 *       200:
 *         description: Exercise ratings for the client
 *       401:
 *         description: Unauthorized
 */

// ═══════════════ EXERCISES LIST ═══════════════

/**
 * @swagger
 * /api/trainer/exercises/list:
 *   get:
 *     summary: Get all verified exercises
 *     description: Returns a list of all verified exercises (name, category, difficulty, etc.) for building workout plans.
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of exercises
 *         content:
 *           application/json:
 *             example:
 *               - _id: "60d5ec49f1b2c72b7c8e5a11"
 *                 name: "Barbell Squat"
 *                 category: "Strength"
 *                 difficulty: "Intermediate"
 *                 targetMuscles: "Quads, Glutes"
 *                 type: "compound"
 *                 defaultSets: 4
 *                 defaultRepsOrDuration: "8-12 reps"
 *       401:
 *         description: Unauthorized
 */

// ═══════════════ RESUME ═══════════════

/**
 * @swagger
 * /api/trainer/resume/{filename}:
 *   get:
 *     summary: Download a trainer's resume
 *     tags: [Trainer]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume filename
 *     responses:
 *       200:
 *         description: Resume file download
 *       404:
 *         description: File not found
 */
