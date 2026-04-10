// =============================================
// AUTH SWAGGER DOCS  (prefix: /api/auth + /signup + /api/logout)
// =============================================

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login (User or Trainer)
 *     description: Authenticate with email, password and role. Returns a JWT token valid for 24 hours.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mypassword123
 *               role:
 *                 type: string
 *                 enum: [user, trainer]
 *                 example: user
 *                 description: Login as user or trainer
 *     responses:
 *       200:
 *         description: Login successful – JWT token returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Login successful"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: "60d5ec49f1b2c72b7c8e4a3f"
 *                 email: "john@example.com"
 *                 name: "John Doe"
 *                 role: "user"
 *                 membershipType: "Gold"
 *               redirect: "/userdashboard_g"
 *       400:
 *         description: Missing fields or invalid role
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Email, password, and role are required"
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid email or password"
 *       403:
 *         description: Account not active
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Your account is inactive. Please contact support."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Server error. Please try again later."
 */

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     description: Returns the decoded JWT payload for the currently authenticated user.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               user:
 *                 id: "60d5ec49f1b2c72b7c8e4a3f"
 *                 email: "john@example.com"
 *                 role: "user"
 *                 name: "John Doe"
 *       401:
 *         description: No token / invalid token
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Access denied. No token provided."
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with membership details. No auth required.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - password
 *               - phone
 *               - membershipType
 *               - membershipDuration
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePass123"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               age:
 *                 type: integer
 *                 example: 25
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: "Male"
 *               height:
 *                 type: number
 *                 example: 175
 *               weight:
 *                 type: number
 *                 example: 70
 *               workout_type:
 *                 type: string
 *                 enum: [Strength, Cardio, Flexibility, HIIT, Yoga]
 *                 example: "Strength"
 *               membershipType:
 *                 type: string
 *                 enum: [Silver, Gold, Platinum]
 *                 example: "Gold"
 *               membershipDuration:
 *                 type: string
 *                 enum: ["1", "3", "6", "12"]
 *                 example: "3"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "User registered successfully"
 *       400:
 *         description: Validation error / email already exists
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Email already registered"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Server error"
 */

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout (destroy session)
 *     description: Destroys the server-side session.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Logged out successfully"
 *       500:
 *         description: Error logging out
 *         content:
 *           application/json:
 *             example:
 *               error: "Error logging out"
 */
