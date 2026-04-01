// =============================================
// ADMIN & ADMIN ANALYTICS SWAGGER DOCS
// Prefix: /api/admin  and  /api/admin/analytics
// =============================================

// ═══════════════ ADMIN AUTH ═══════════════

/**
 * @swagger
 * /api/admin/login:
 *   get:
 *     summary: Get admin login page data
 *     tags: [Admin Dashboard]
 *     responses:
 *       200:
 *         description: Login page data
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin / Manager login
 *     tags: [Admin Dashboard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@gymrats.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "admin123"
 *     responses:
 *       200:
 *         description: Login successful – JWT token returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               token: "eyJhbGciOiJIUzI1NiJ9..."
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid credentials"
 */

/**
 * @swagger
 * /api/admin/logout:
 *   get:
 *     summary: Log out the current admin
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Logged out"
 */

// ═══════════════ DASHBOARD ═══════════════

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard stats
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin role required
 */

// ═══════════════ USERS CRUD ═══════════════
// ═══════════════ USERS CRUD ═══════════════

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of users
 */

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - dob
 *               - gender
 *               - phone
 *               - height
 *               - weight
 *               - workoutType
 *               - membershipType
 *               - fitnessGoals
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Jane Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane@example.com"
 *               password:
 *                 type: string
 *                 example: "securePass123"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1998-06-12"
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: "Female"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               height:
 *                 type: number
 *                 example: 165
 *               weight:
 *                 type: number
 *                 example: 60
 *               workoutType:
 *                 type: string
 *                 enum:
 *                   - Calisthenics
 *                   - Weight Loss
 *                   - HIIT
 *                   - Competitive
 *                   - Strength Training
 *                   - Cardio
 *                   - Flexibility
 *                   - Bodybuilding
 *                 example: "Cardio"
 *               membershipType:
 *                 type: string
 *                 enum: [Basic, Gold, Platinum]
 *                 example: "Gold"
 *               membershipDuration:
 *                 type: object
 *                 properties:
 *                   monthsRemaining:
 *                     type: integer
 *                     example: 6
 *               fitnessGoals:
 *                 type: object
 *                 required:
 *                   - weightGoal
 *                 properties:
 *                   calorieGoal:
 *                     type: number
 *                     example: 2200
 *                   proteinGoal:
 *                     type: number
 *                     example: 90
 *                   weightGoal:
 *                     type: number
 *                     example: 65
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/admin/users/dropped:
 *   get:
 *     summary: List dropped / deleted users
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of dropped users
 */


/**
 * @swagger
 * /api/admin/users/{id}/details:
 *   get:
 *     summary: Get full user details
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Detailed user object
 *       404:
 *         description: User not found
 */


/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1998-05-20"
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: "Male"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               weight:
 *                 type: number
 *                 example: 75
 *               height:
 *                 type: number
 *                 example: 175
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Suspended, Expired]
 *                 example: "Active"
 *               membershipType:
 *                 type: string
 *                 enum: [Basic, Gold, Platinum]
 *                 example: "Gold"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */

// ═══════════════ TRAINERS CRUD ═══════════════

/**
 * @swagger
 * /api/admin/trainers:
 *   get:
 *     summary: List all trainers
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of trainers
 *   post:
 *     summary: Create a new trainer
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *               - experience
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Mike Trainer"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "mike@gymrats.com"
 *               password:
 *                 type: string
 *                 example: "trainerPass123"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               experience:
 *                 type: string
 *                 enum: ["1-2","3-5","5-10","10+"]
 *                 example: "3-5"
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum:
 *                     - Calisthenics
 *                     - Weight Loss
 *                     - HIIT
 *                     - Competitive
 *                     - Strength Training
 *                     - Cardio
 *                     - Flexibility
 *                     - Bodybuilding
 *                 example: ["Strength Training","HIIT"]
 *               maxClients:
 *                 type: integer
 *                 example: 20
 *     responses:
 *       201:
 *         description: Trainer created
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/admin/trainers/{id}:
 *   put:
 *     summary: Update a trainer
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trainer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Mike Trainer Updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "mike@gymrats.com"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum:
 *                     - Calisthenics
 *                     - Weight Loss
 *                     - HIIT
 *                     - Competitive
 *                     - Strength Training
 *                     - Cardio
 *                     - Flexibility
 *                     - Bodybuilding
 *                 example:
 *                   - Strength Training
 *                   - HIIT
 *               experience:
 *                 type: string
 *                 enum:
 *                   - "1-2"
 *                   - "3-5"
 *                   - "5-10"
 *                   - "10+"
 *                 example: "5-10"
 *               maxClients:
 *                 type: integer
 *                 example: 30
 *               status:
 *                 type: string
 *                 enum:
 *                   - Active
 *                   - Inactive
 *                   - Suspended
 *                   - Expired
 *                 example: "Active"
 *     responses:
 *       200:
 *         description: Trainer updated successfully
 *       404:
 *         description: Trainer not found
 */

/**
 * @swagger
 * /api/admin/trainers/search:
 *   get:
 *     summary: Search trainers
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: Matching trainers
 */

/**
 * @swagger
 * /api/admin/trainer-stats:
 *   get:
 *     summary: Get trainer statistics
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer stats
 */

// ═══════════════ TRAINER APPLICATIONS ═══════════════

/**
 * @swagger
 * /api/admin/trainer-applications:
 *   get:
 *     summary: List pending trainer applications
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of applications
 */

/**
 * @swagger
 * /api/admin/trainer-applications/{id}/approve:
 *   put:
 *     summary: Approve a trainer application
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application approved
 *       404:
 *         description: Application not found
 */

/**
 * @swagger
 * /api/admin/trainer-applications/{id}/reject:
 *   put:
 *     summary: Reject a trainer application
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application rejected
 *       404:
 *         description: Application not found
 */

// ═══════════════ TRAINER ASSIGNMENT ═══════════════

/**
 * @swagger
 * /api/admin/trainer-assignment-data:
 *   get:
 *     summary: Get data for trainer assignment UI
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users and trainers available for assignment
 */

/**
 * @swagger
 * /api/admin/assign-trainer-admin:
 *   post:
 *     summary: Assign a trainer to a user
 *     tags: [Admin Dashboard]
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
 *               - trainerId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "60d5ec49f1b2c72b7c8e4a3f"
 *               trainerId:
 *                 type: string
 *                 example: "60d5ec49f1b2c72b7c8e4b2a"
 *     responses:
 *       200:
 *         description: Trainer assigned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Trainer assigned successfully"
 *       400:
 *         description: Invalid request
 */

// ═══════════════ EXERCISES CRUD ═══════════════

/**
 * @swagger
 * /api/admin/exercises:
 *   get:
 *     summary: List all exercises
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of exercises
 *   post:
 *     summary: Create a new exercise
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Barbell Squat"
 *               category:
 *                 type: string
 *                 example: "Strength"
 *               difficulty:
 *                 type: string
 *                 enum: [Beginner, Intermediate, Advanced]
 *                 example: "Intermediate"
 *               targetMuscles:
 *                 type: string
 *                 example: "Quads, Glutes, Hamstrings"
 *               primaryMuscle:
 *                 type: string
 *                 example: "Quads"
 *               movementPattern:
 *                 type: string
 *                 example: "Squat"
 *               type:
 *                 type: string
 *                 example: "compound"
 *               defaultSets:
 *                 type: integer
 *                 example: 4
 *               defaultRepsOrDuration:
 *                 type: string
 *                 example: "8-12 reps"
 *               verified:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Exercise created
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/admin/exercises/search:
 *   get:
 *     summary: Search exercises
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: Matching exercises
 */

/**
 * @swagger
 * /api/admin/exercises/{id}:
 *   put:
 *     summary: Update an exercise
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [Beginner, Intermediate, Advanced]
 *               targetMuscles:
 *                 type: string
 *               primaryMuscle:
 *                 type: string
 *               movementPattern:
 *                 type: string
 *               defaultSets:
 *                 type: integer
 *               defaultRepsOrDuration:
 *                 type: string
 *               verified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Exercise updated
 *       404:
 *         description: Exercise not found
 *   delete:
 *     summary: Delete an exercise
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exercise ID
 *     responses:
 *       200:
 *         description: Exercise deleted
 *       404:
 *         description: Exercise not found
 */

// ═══════════════ MEMBERSHIPS CRUD ═══════════════

/**
 * @swagger
 * /api/admin/memberships:
 *   get:
 *     summary: List all memberships
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of memberships
 *   post:
 *     summary: Create a new membership plan
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Gold Plan"
 *               price:
 *                 type: number
 *                 example: 2999
 *               duration:
 *                 type: integer
 *                 example: 3
 *                 description: Duration in months
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Personal Trainer", "Diet Plan"]
 *     responses:
 *       201:
 *         description: Membership created
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/admin/memberships/{id}:
 *   put:
 *     summary: Update a membership plan
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Membership ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: integer
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Membership updated
 *       404:
 *         description: Membership not found
 *   delete:
 *     summary: Delete a membership plan
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Membership ID
 *     responses:
 *       200:
 *         description: Membership deleted
 *       404:
 *         description: Membership not found
 */

// ═══════════════ VERIFIERS CRUD ═══════════════

/**
 * @swagger
 * /api/admin/verifiers:
 *   get:
 *     summary: List all verifiers
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of verifiers
 *   post:
 *     summary: Create a new verifier
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Verifier One"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ver1@gymrats.com"
 *               password:
 *                 type: string
 *                 example: "verifierPass123"
 *               phone:
 *                 type: string
 *                 example: "+91 9876543210"
 *               experienceYears:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 example: 2
 *     responses:
 *       201:
 *         description: Verifier created
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/admin/verifiers/{id}:
 *   put:
 *     summary: Update a verifier
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Verifier ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *     responses:
 *       200:
 *         description: Verifier updated
 *       404:
 *         description: Verifier not found
 *   delete:
 *     summary: Delete a verifier
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Verifier ID
 *     responses:
 *       200:
 *         description: Verifier deleted
 *       404:
 *         description: Verifier not found
 */

/**
 * @swagger
 * /api/admin/verifiers/{id}/approve:
 *   put:
 *     summary: Approve a verifier
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Verifier ID
 *     responses:
 *       200:
 *         description: Verifier approved
 *       404:
 *         description: Verifier not found
 */

/**
 * @swagger
 * /api/admin/verifiers/{id}/reject:
 *   put:
 *     summary: Reject a verifier
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Verifier ID
 *     responses:
 *       200:
 *         description: Verifier rejected
 *       404:
 *         description: Verifier not found
 */

// ═══════════════ RATINGS INTELLIGENCE ═══════════════

/**
 * @swagger
 * /api/admin/ratings/top-exercises:
 *   get:
 *     summary: Get top-rated exercises
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top rated exercises list
 */

/**
 * @swagger
 * /api/admin/ratings/trainer-leaderboard:
 *   get:
 *     summary: Trainer rating leaderboard
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainers ranked by rating
 */

/**
 * @swagger
 * /api/admin/ratings/trainer/{trainerId}/reviews:
 *   get:
 *     summary: Get reviews for a specific trainer
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trainer ID
 *     responses:
 *       200:
 *         description: Trainer reviews
 */

/**
 * @swagger
 * /api/admin/ratings/flag-review/{reviewId}:
 *   put:
 *     summary: Flag a review for reassignment
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review flagged
 */

// ═══════════════ TRAINER REASSIGNMENT ═══════════════

/**
 * @swagger
 * /api/admin/reassignment/poorly-rated-trainers:
 *   get:
 *     summary: Get poorly rated trainers
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of poorly rated trainers
 */

/**
 * @swagger
 * /api/admin/reassignment/potential-trainers/{userId}:
 *   get:
 *     summary: Get potential trainers for reassignment
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Potential trainers
 */

/**
 * @swagger
 * /api/admin/reassignment/assign:
 *   post:
 *     summary: Reassign a user to a new trainer
 *     tags: [Admin Dashboard]
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
 *               - newTrainerId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "60d5ec49f1b2c72b7c8e4a3f"
 *               newTrainerId:
 *                 type: string
 *                 example: "60d5ec49f1b2c72b7c8e4c11"
 *               reason:
 *                 type: string
 *                 example: "Poor rating from user"
 *     responses:
 *       200:
 *         description: User reassigned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "User reassigned successfully"
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /api/admin/reassignment/pending-flags:
 *   get:
 *     summary: Get pending reassignment flags
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending flags
 */

// ═══════════════════════════════════════════
// ADMIN ANALYTICS  (prefix: /api/admin/analytics)
// ═══════════════════════════════════════════

/**
 * @swagger
 * /api/admin/analytics/total-revenue:
 *   get:
 *     summary: Get total revenue
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total revenue figure
 */

/**
 * @swagger
 * /api/admin/analytics/monthly-revenue:
 *   get:
 *     summary: Get monthly revenue breakdown
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly revenue data
 */

/**
 * @swagger
 * /api/admin/analytics/monthly-growth:
 *   get:
 *     summary: Get month-over-month growth
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Growth percentage data
 */

/**
 * @swagger
 * /api/admin/analytics/trainer-revenue:
 *   get:
 *     summary: Get revenue per trainer
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer revenue breakdown
 */

/**
 * @swagger
 * /api/admin/analytics/membership-revenue:
 *   get:
 *     summary: Get revenue by membership type
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Membership revenue breakdown
 */

/**
 * @swagger
 * /api/admin/analytics/revenue-per-user:
 *   get:
 *     summary: Get revenue per user (all users)
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Per-user revenue list
 */

/**
 * @swagger
 * /api/admin/analytics/revenue-per-user/{userId}:
 *   get:
 *     summary: Get revenue for a specific user
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Revenue data for user
 */

/**
 * @swagger
 * /api/admin/analytics/trainer-performance:
 *   get:
 *     summary: Get trainer performance metrics
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer performance data
 */

/**
 * @swagger
 * /api/admin/analytics/trainer/{trainerId}/user-revenue:
 *   get:
 *     summary: Get user-revenue for a specific trainer
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trainer ID
 *     responses:
 *       200:
 *         description: Trainer user revenue
 */

/**
 * @swagger
 * /api/admin/analytics/trainer/{trainerId}/monthly-trend:
 *   get:
 *     summary: Get monthly revenue trend for a trainer
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trainer ID
 *     responses:
 *       200:
 *         description: Trainer monthly trend
 */

/**
 * @swagger
 * /api/admin/analytics/users/active:
 *   get:
 *     summary: Get all active users
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active users list
 */

/**
 * @swagger
 * /api/admin/analytics/users/expired:
 *   get:
 *     summary: Get all expired users
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expired users list
 */

/**
 * @swagger
 * /api/admin/analytics/users/dropped:
 *   get:
 *     summary: Get all dropped / deleted users
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dropped users list
 */

/**
 * @swagger
 * /api/admin/analytics/users/renewals:
 *   get:
 *     summary: Get renewal tracking data
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upcoming and recent renewals
 */
