/**
 * Swagger definitions for Admin & Admin-Analytics routes
 * Prefix: /api/admin  and  /api/admin/analytics
 */

const schemas = {
  // ── Admin Auth ──
  AdminLoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "admin@gymrats.com" },
      password: { type: "string", format: "password", example: "admin123" },
    },
  },

  // ── User CRUD ──
  AdminCreateUserRequest: {
    type: "object",
    required: ["full_name", "email", "password", "membershipType"],
    properties: {
      full_name: { type: "string", example: "Jane Smith" },
      email: { type: "string", format: "email", example: "jane@example.com" },
      password: { type: "string", example: "securePass123" },
      phone: { type: "string", example: "9876543210" },
      age: { type: "integer", example: 28 },
      gender: { type: "string", enum: ["Male", "Female", "Other"], example: "Female" },
      height: { type: "number", example: 165 },
      weight: { type: "number", example: 60 },
      membershipType: { type: "string", enum: ["Silver", "Gold", "Platinum"], example: "Gold" },
      membershipDuration: { type: "string", enum: ["1", "3", "6", "12"], example: "6" },
      workout_type: { type: "string", example: "Cardio" },
    },
  },
  AdminUpdateUserRequest: {
    type: "object",
    properties: {
      full_name: { type: "string", example: "Jane Smith Updated" },
      email: { type: "string", format: "email" },
      phone: { type: "string" },
      age: { type: "integer" },
      gender: { type: "string", enum: ["Male", "Female", "Other"] },
      height: { type: "number" },
      weight: { type: "number" },
      membershipType: { type: "string", enum: ["Silver", "Gold", "Platinum"] },
      status: { type: "string", enum: ["Active", "Inactive", "Suspended"] },
    },
  },

  // ── Trainer CRUD ──
  AdminCreateTrainerRequest: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string", example: "Mike Trainer" },
      email: { type: "string", format: "email", example: "mike@gymrats.com" },
      password: { type: "string", example: "trainerPass123" },
      specializations: {
        type: "array",
        items: { type: "string" },
        example: ["Strength Training", "HIIT"],
      },
      experience: { type: "integer", example: 5 },
      maxClients: { type: "integer", example: 20 },
    },
  },
  AdminUpdateTrainerRequest: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      specializations: { type: "array", items: { type: "string" } },
      experience: { type: "integer" },
      maxClients: { type: "integer" },
      status: { type: "string", enum: ["Active", "Inactive"] },
    },
  },

  // ── Exercise CRUD ──
  AdminCreateExerciseRequest: {
    type: "object",
    required: ["name", "category"],
    properties: {
      name: { type: "string", example: "Barbell Squat" },
      category: { type: "string", example: "Strength" },
      difficulty: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"], example: "Intermediate" },
      targetMuscles: { type: "string", example: "Quads, Glutes, Hamstrings" },
      primaryMuscle: { type: "string", example: "Quads" },
      movementPattern: { type: "string", example: "Squat" },
      type: { type: "string", example: "compound" },
      defaultSets: { type: "integer", example: 4 },
      defaultRepsOrDuration: { type: "string", example: "8-12 reps" },
      verified: { type: "boolean", example: true },
    },
  },
  AdminUpdateExerciseRequest: {
    type: "object",
    properties: {
      name: { type: "string" },
      category: { type: "string" },
      difficulty: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"] },
      targetMuscles: { type: "string" },
      primaryMuscle: { type: "string" },
      movementPattern: { type: "string" },
      defaultSets: { type: "integer" },
      defaultRepsOrDuration: { type: "string" },
      verified: { type: "boolean" },
    },
  },

  // ── Membership CRUD ──
  AdminCreateMembershipRequest: {
    type: "object",
    required: ["name", "price"],
    properties: {
      name: { type: "string", example: "Gold Plan" },
      price: { type: "number", example: 2999 },
      duration: { type: "integer", example: 3, description: "Duration in months" },
      features: { type: "array", items: { type: "string" }, example: ["Personal Trainer", "Diet Plan"] },
    },
  },
  AdminUpdateMembershipRequest: {
    type: "object",
    properties: {
      name: { type: "string" },
      price: { type: "number" },
      duration: { type: "integer" },
      features: { type: "array", items: { type: "string" } },
    },
  },

  // ── Verifier CRUD ──
  AdminCreateVerifierRequest: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string", example: "Verifier One" },
      email: { type: "string", format: "email", example: "ver1@gymrats.com" },
      password: { type: "string", example: "verifierPass123" },
    },
  },
  AdminUpdateVerifierRequest: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      status: { type: "string", enum: ["Active", "Inactive"] },
    },
  },

  // ── Trainer Assignment ──
  AdminAssignTrainerRequest: {
    type: "object",
    required: ["userId", "trainerId"],
    properties: {
      userId: { type: "string", example: "60d5ec49f1b2c72b7c8e4a3f" },
      trainerId: { type: "string", example: "60d5ec49f1b2c72b7c8e4b2a" },
    },
  },

  // ── Reassignment ──
  ReassignUserRequest: {
    type: "object",
    required: ["userId", "newTrainerId"],
    properties: {
      userId: { type: "string", example: "60d5ec49f1b2c72b7c8e4a3f" },
      newTrainerId: { type: "string", example: "60d5ec49f1b2c72b7c8e4c11" },
      reason: { type: "string", example: "Poor rating from user" },
    },
  },
};

// ────────────────── Helper to build CRUD paths ──────────────────

function idParam(description) {
  return {
    name: "id",
    in: "path",
    required: true,
    schema: { type: "string" },
    description,
  };
}

const adminSecurity = [{ bearerAuth: [] }];
const jsonContent = (schema) => ({
  content: { "application/json": { schema } },
});

const paths = {
  // ═══════════════ ADMIN AUTH ═══════════════

  "/api/admin/login": {
    get: {
      tags: ["Admin"],
      summary: "Get admin login page data",
      responses: { 200: { description: "Login page data" } },
    },
    post: {
      tags: ["Admin"],
      summary: "Admin / Manager login",
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/AdminLoginRequest" }),
      },
      responses: {
        200: { description: "Login successful – JWT token returned" },
        401: { description: "Invalid credentials" },
      },
    },
  },
  "/api/admin/logout": {
    get: {
      tags: ["Admin"],
      summary: "Admin logout",
      security: adminSecurity,
      responses: { 200: { description: "Logged out" } },
    },
  },

  // ═══════════════ DASHBOARD ═══════════════

  "/api/admin/dashboard": {
    get: {
      tags: ["Admin"],
      summary: "Get admin dashboard stats",
      security: adminSecurity,
      responses: {
        200: { description: "Dashboard statistics" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden – admin role required" },
      },
    },
  },

  // ═══════════════ USERS ═══════════════

  "/api/admin/users": {
    get: {
      tags: ["Admin"],
      summary: "List all users",
      security: adminSecurity,
      responses: { 200: { description: "Array of users" } },
    },
    post: {
      tags: ["Admin"],
      summary: "Create a new user",
      security: adminSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/AdminCreateUserRequest" }),
      },
      responses: {
        201: { description: "User created" },
        400: { description: "Validation error" },
      },
    },
  },
  "/api/admin/users/dropped": {
    get: {
      tags: ["Admin"],
      summary: "List dropped / deleted users",
      security: adminSecurity,
      responses: { 200: { description: "Array of dropped users" } },
    },
  },
  "/api/admin/users/{id}": {
    put: {
      tags: ["Admin"],
      summary: "Update a user",
      security: adminSecurity,
      parameters: [idParam("User ID")],
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/AdminUpdateUserRequest" }),
      },
      responses: {
        200: { description: "User updated" },
        404: { description: "User not found" },
      },
    },
    delete: {
      tags: ["Admin"],
      summary: "Delete a user",
      security: adminSecurity,
      parameters: [idParam("User ID")],
      responses: {
        200: { description: "User deleted" },
        404: { description: "User not found" },
      },
    },
  },
  "/api/admin/users/{id}/details": {
    get: {
      tags: ["Admin"],
      summary: "Get full user details",
      security: adminSecurity,
      parameters: [idParam("User ID")],
      responses: {
        200: { description: "Detailed user object" },
        404: { description: "User not found" },
      },
    },
  },

  // ═══════════════ TRAINERS ═══════════════

  "/api/admin/trainers": {
    get: {
      tags: ["Admin"],
      summary: "List all trainers",
      security: adminSecurity,
      responses: { 200: { description: "Array of trainers" } },
    },
    post: {
      tags: ["Admin"],
      summary: "Create a new trainer",
      security: adminSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/AdminCreateTrainerRequest" }),
      },
      responses: {
        201: { description: "Trainer created" },
        400: { description: "Validation error" },
      },
    },
  },
  "/api/admin/trainers/{id}": {
    put: {
      tags: ["Admin"],
      summary: "Update a trainer",
      security: adminSecurity,
      parameters: [idParam("Trainer ID")],
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/AdminUpdateTrainerRequest" }),
      },
      responses: {
        200: { description: "Trainer updated" },
        404: { description: "Trainer not found" },
      },
    },
    delete: {
      tags: ["Admin"],
      summary: "Delete a trainer",
      security: adminSecurity,
      parameters: [idParam("Trainer ID")],
      responses: {
        200: { description: "Trainer deleted" },
        404: { description: "Trainer not found" },
      },
    },
  },
  "/api/admin/trainers/search": {
    get: {
      tags: ["Admin"],
      summary: "Search trainers",
      security: adminSecurity,
      parameters: [
        { name: "query", in: "query", schema: { type: "string" }, description: "Search keyword" },
      ],
      responses: { 200: { description: "Matching trainers" } },
    },
  },
  "/api/admin/trainer-stats": {
    get: {
      tags: ["Admin"],
      summary: "Get trainer statistics",
      security: adminSecurity,
      responses: { 200: { description: "Trainer stats" } },
    },
  },

  // ═══════════════ TRAINER APPLICATIONS ═══════════════

  "/api/admin/trainer-applications": {
    get: {
      tags: ["Admin"],
      summary: "List pending trainer applications",
      security: adminSecurity,
      responses: { 200: { description: "Array of applications" } },
    },
  },
  "/api/admin/trainer-applications/{id}/approve": {
    put: {
      tags: ["Admin"],
      summary: "Approve a trainer application",
      security: adminSecurity,
      parameters: [idParam("Application ID")],
      responses: {
        200: { description: "Application approved" },
        404: { description: "Application not found" },
      },
    },
  },
  "/api/admin/trainer-applications/{id}/reject": {
    put: {
      tags: ["Admin"],
      summary: "Reject a trainer application",
      security: adminSecurity,
      parameters: [idParam("Application ID")],
      responses: {
        200: { description: "Application rejected" },
        404: { description: "Application not found" },
      },
    },
  },

  // ═══════════════ TRAINER ASSIGNMENT ═══════════════

  "/api/admin/trainer-assignment-data": {
    get: {
      tags: ["Admin"],
      summary: "Get data for trainer assignment UI",
      security: adminSecurity,
      responses: { 200: { description: "Users and trainers available for assignment" } },
    },
  },
  "/api/admin/assign-trainer-admin": {
    post: {
      tags: ["Admin"],
      summary: "Assign a trainer to a user",
      security: adminSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/AdminAssignTrainerRequest" }),
      },
      responses: {
        200: { description: "Trainer assigned" },
        400: { description: "Invalid request" },
      },
    },
  },

  // ═══════════════ EXERCISES ═══════════════

  "/api/admin/exercises": {
    get: {
      tags: ["Admin"],
      summary: "List all exercises",
      security: adminSecurity,
      responses: { 200: { description: "Array of exercises" } },
    },
    post: {
      tags: ["Admin"],
      summary: "Create a new exercise",
      security: adminSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/AdminCreateExerciseRequest" }),
      },
      responses: {
        201: { description: "Exercise created" },
        400: { description: "Validation error" },
      },
    },
  },
  "/api/admin/exercises/search": {
    get: {
      tags: ["Admin"],
      summary: "Search exercises",
      security: adminSecurity,
      parameters: [
        { name: "query", in: "query", schema: { type: "string" }, description: "Search keyword" },
      ],
      responses: { 200: { description: "Matching exercises" } },
    },
  },
  "/api/admin/exercises/{id}": {
    put: {
      tags: ["Admin"],
      summary: "Update an exercise",
      security: adminSecurity,
      parameters: [idParam("Exercise ID")],
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/AdminUpdateExerciseRequest" }),
      },
      responses: {
        200: { description: "Exercise updated" },
        404: { description: "Exercise not found" },
      },
    },
    delete: {
      tags: ["Admin"],
      summary: "Delete an exercise",
      security: adminSecurity,
      parameters: [idParam("Exercise ID")],
      responses: {
        200: { description: "Exercise deleted" },
        404: { description: "Exercise not found" },
      },
    },
  },

  // ═══════════════ MEMBERSHIPS ═══════════════

  "/api/admin/memberships": {
    get: {
      tags: ["Admin"],
      summary: "List all memberships",
      security: adminSecurity,
      responses: { 200: { description: "Array of memberships" } },
    },
    post: {
      tags: ["Admin"],
      summary: "Create a new membership plan",
      security: adminSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/AdminCreateMembershipRequest" }),
      },
      responses: {
        201: { description: "Membership created" },
        400: { description: "Validation error" },
      },
    },
  },
  "/api/admin/memberships/{id}": {
    put: {
      tags: ["Admin"],
      summary: "Update a membership plan",
      security: adminSecurity,
      parameters: [idParam("Membership ID")],
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/AdminUpdateMembershipRequest" }),
      },
      responses: {
        200: { description: "Membership updated" },
        404: { description: "Membership not found" },
      },
    },
    delete: {
      tags: ["Admin"],
      summary: "Delete a membership plan",
      security: adminSecurity,
      parameters: [idParam("Membership ID")],
      responses: {
        200: { description: "Membership deleted" },
        404: { description: "Membership not found" },
      },
    },
  },

  // ═══════════════ VERIFIERS ═══════════════

  "/api/admin/verifiers": {
    get: {
      tags: ["Admin"],
      summary: "List all verifiers",
      security: adminSecurity,
      responses: { 200: { description: "Array of verifiers" } },
    },
    post: {
      tags: ["Admin"],
      summary: "Create a new verifier",
      security: adminSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/AdminCreateVerifierRequest" }),
      },
      responses: {
        201: { description: "Verifier created" },
        400: { description: "Validation error" },
      },
    },
  },
  "/api/admin/verifiers/{id}": {
    put: {
      tags: ["Admin"],
      summary: "Update a verifier",
      security: adminSecurity,
      parameters: [idParam("Verifier ID")],
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/AdminUpdateVerifierRequest" }),
      },
      responses: {
        200: { description: "Verifier updated" },
        404: { description: "Verifier not found" },
      },
    },
    delete: {
      tags: ["Admin"],
      summary: "Delete a verifier",
      security: adminSecurity,
      parameters: [idParam("Verifier ID")],
      responses: {
        200: { description: "Verifier deleted" },
        404: { description: "Verifier not found" },
      },
    },
  },
  "/api/admin/verifiers/{id}/approve": {
    put: {
      tags: ["Admin"],
      summary: "Approve a verifier",
      security: adminSecurity,
      parameters: [idParam("Verifier ID")],
      responses: {
        200: { description: "Verifier approved" },
        404: { description: "Verifier not found" },
      },
    },
  },
  "/api/admin/verifiers/{id}/reject": {
    put: {
      tags: ["Admin"],
      summary: "Reject a verifier",
      security: adminSecurity,
      parameters: [idParam("Verifier ID")],
      responses: {
        200: { description: "Verifier rejected" },
        404: { description: "Verifier not found" },
      },
    },
  },

  // ═══════════════ RATINGS INTELLIGENCE ═══════════════

  "/api/admin/ratings/top-exercises": {
    get: {
      tags: ["Admin"],
      summary: "Get top-rated exercises",
      security: adminSecurity,
      responses: { 200: { description: "Top rated exercises list" } },
    },
  },
  "/api/admin/ratings/trainer-leaderboard": {
    get: {
      tags: ["Admin"],
      summary: "Trainer rating leaderboard",
      security: adminSecurity,
      responses: { 200: { description: "Trainers ranked by rating" } },
    },
  },
  "/api/admin/ratings/trainer/{trainerId}/reviews": {
    get: {
      tags: ["Admin"],
      summary: "Get reviews for a specific trainer",
      security: adminSecurity,
      parameters: [
        { name: "trainerId", in: "path", required: true, schema: { type: "string" }, description: "Trainer ID" },
      ],
      responses: { 200: { description: "Trainer reviews" } },
    },
  },
  "/api/admin/ratings/flag-review/{reviewId}": {
    put: {
      tags: ["Admin"],
      summary: "Flag a review for reassignment",
      security: adminSecurity,
      parameters: [
        { name: "reviewId", in: "path", required: true, schema: { type: "string" }, description: "Review ID" },
      ],
      responses: { 200: { description: "Review flagged" } },
    },
  },

  // ═══════════════ TRAINER REASSIGNMENT ═══════════════

  "/api/admin/reassignment/poorly-rated-trainers": {
    get: {
      tags: ["Admin"],
      summary: "Get poorly rated trainers",
      security: adminSecurity,
      responses: { 200: { description: "List of poorly rated trainers" } },
    },
  },
  "/api/admin/reassignment/potential-trainers/{userId}": {
    get: {
      tags: ["Admin"],
      summary: "Get potential trainers for reassignment",
      security: adminSecurity,
      parameters: [
        { name: "userId", in: "path", required: true, schema: { type: "string" }, description: "User ID" },
      ],
      responses: { 200: { description: "Potential trainers" } },
    },
  },
  "/api/admin/reassignment/assign": {
    post: {
      tags: ["Admin"],
      summary: "Reassign a user to a new trainer",
      security: adminSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/ReassignUserRequest" }),
      },
      responses: {
        200: { description: "User reassigned" },
        400: { description: "Invalid request" },
      },
    },
  },
  "/api/admin/reassignment/pending-flags": {
    get: {
      tags: ["Admin"],
      summary: "Get pending reassignment flags",
      security: adminSecurity,
      responses: { 200: { description: "Pending flags" } },
    },
  },

  // ═══════════════════════════════════════════
  // ADMIN ANALYTICS  (prefix: /api/admin/analytics)
  // ═══════════════════════════════════════════

  "/api/admin/analytics/total-revenue": {
    get: {
      tags: ["Admin Analytics"],
      summary: "Get total revenue",
      security: adminSecurity,
      responses: { 200: { description: "Total revenue figure" } },
    },
  },
  "/api/admin/analytics/monthly-revenue": {
    get: {
      tags: ["Admin Analytics"],
      summary: "Get monthly revenue breakdown",
      security: adminSecurity,
      responses: { 200: { description: "Monthly revenue data" } },
    },
  },
  "/api/admin/analytics/monthly-growth": {
    get: {
      tags: ["Admin Analytics"],
      summary: "Get month-over-month growth",
      security: adminSecurity,
      responses: { 200: { description: "Growth percentage data" } },
    },
  },
  "/api/admin/analytics/trainer-revenue": {
    get: {
      tags: ["Admin Analytics"],
      summary: "Get revenue per trainer",
      security: adminSecurity,
      responses: { 200: { description: "Trainer revenue breakdown" } },
    },
  },
  "/api/admin/analytics/membership-revenue": {
    get: {
      tags: ["Admin Analytics"],
      summary: "Get revenue by membership type",
      security: adminSecurity,
      responses: { 200: { description: "Membership revenue breakdown" } },
    },
  },
  "/api/admin/analytics/revenue-per-user": {
    get: {
      tags: ["Admin Analytics"],
      summary: "Get revenue per user (all users)",
      security: adminSecurity,
      responses: { 200: { description: "Per-user revenue list" } },
    },
  },
  "/api/admin/analytics/revenue-per-user/{userId}": {
    get: {
      tags: ["Admin Analytics"],
      summary: "Get revenue for a specific user",
      security: adminSecurity,
      parameters: [
        { name: "userId", in: "path", required: true, schema: { type: "string" }, description: "User ID" },
      ],
      responses: { 200: { description: "Revenue data for user" } },
    },
  },
  "/api/admin/analytics/trainer-performance": {
    get: {
      tags: ["Admin Analytics"],
      summary: "Get trainer performance metrics",
      security: adminSecurity,
      responses: { 200: { description: "Trainer performance data" } },
    },
  },
  "/api/admin/analytics/trainer/{trainerId}/user-revenue": {
    get: {
      tags: ["Admin Analytics"],
      summary: "Get user-revenue for a specific trainer",
      security: adminSecurity,
      parameters: [
        { name: "trainerId", in: "path", required: true, schema: { type: "string" }, description: "Trainer ID" },
      ],
      responses: { 200: { description: "Trainer's user revenue" } },
    },
  },
  "/api/admin/analytics/trainer/{trainerId}/monthly-trend": {
    get: {
      tags: ["Admin Analytics"],
      summary: "Get monthly revenue trend for a trainer",
      security: adminSecurity,
      parameters: [
        { name: "trainerId", in: "path", required: true, schema: { type: "string" }, description: "Trainer ID" },
      ],
      responses: { 200: { description: "Trainer monthly trend" } },
    },
  },
  "/api/admin/analytics/users/active": {
    get: {
      tags: ["Admin Analytics"],
      summary: "Get all active users",
      security: adminSecurity,
      responses: { 200: { description: "Active users list" } },
    },
  },
  "/api/admin/analytics/users/expired": {
    get: {
      tags: ["Admin Analytics"],
      summary: "Get all expired users",
      security: adminSecurity,
      responses: { 200: { description: "Expired users list" } },
    },
  },
  "/api/admin/analytics/users/dropped": {
    get: {
      tags: ["Admin Analytics"],
      summary: "Get all dropped / deleted users",
      security: adminSecurity,
      responses: { 200: { description: "Dropped users list" } },
    },
  },
  "/api/admin/analytics/users/renewals": {
    get: {
      tags: ["Admin Analytics"],
      summary: "Get renewal tracking data",
      security: adminSecurity,
      responses: { 200: { description: "Upcoming and recent renewals" } },
    },
  },
};

module.exports = { schemas, paths };
