/**
 * Swagger definitions for User-facing routes
 * These routes are defined in userRoutes.js and mounted at "/" in server.js
 */

const schemas = {
  // ── User Profile ──
  UserProfileResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      user: {
        type: "object",
        properties: {
          _id: { type: "string" },
          full_name: { type: "string", example: "John Doe" },
          email: { type: "string", example: "john@example.com" },
          phone: { type: "string" },
          age: { type: "integer" },
          gender: { type: "string" },
          height: { type: "number" },
          weight: { type: "number" },
          membershipType: { type: "string", example: "Gold" },
          membershipDuration: { type: "integer" },
          workout_type: { type: "string" },
          trainer: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
              specializations: { type: "array", items: { type: "string" } },
              experience: { type: "integer" },
            },
          },
        },
      },
    },
  },

  UpdateProfileRequest: {
    type: "object",
    properties: {
      full_name: { type: "string", example: "John Doe Updated" },
      phone: { type: "string", example: "9876543211" },
      age: { type: "integer", example: 26 },
      gender: { type: "string", enum: ["Male", "Female", "Other"] },
      height: { type: "number", example: 176 },
      weight: { type: "number", example: 72 },
      workout_type: { type: "string", example: "HIIT" },
    },
  },

  // ── Change Password ──
  ChangePasswordRequest: {
    type: "object",
    required: ["currentPassword", "newPassword"],
    properties: {
      currentPassword: { type: "string", format: "password", example: "oldPass123" },
      newPassword: { type: "string", format: "password", example: "newPass456" },
    },
  },

  // ── Rate Trainer ──
  RateTrainerRequest: {
    type: "object",
    required: ["rating"],
    properties: {
      rating: { type: "integer", minimum: 1, maximum: 5, example: 4 },
      review: { type: "string", example: "Great trainer, very motivating!" },
    },
  },

  // ── Trainer Change Request ──
  TrainerChangeRequest: {
    type: "object",
    required: ["reason"],
    properties: {
      reason: { type: "string", example: "Schedule conflict" },
      preferredTrainerId: { type: "string", example: "60d5ec49f1b2c72b7c8e4b2a" },
    },
  },

  // ── Mark Food Consumed ──
  MarkFoodConsumedRequest: {
    type: "object",
    required: ["foodName", "calories", "protein", "carbs", "fats"],
    properties: {
      foodName: { type: "string", example: "Grilled Chicken Breast" },
      calories: { type: "integer", example: 350 },
      protein: { type: "integer", example: 40 },
      carbs: { type: "integer", example: 5 },
      fats: { type: "integer", example: 10 },
      day: {
        type: "string",
        enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        description: "Optional – defaults to current day (Asia/Kolkata)",
      },
    },
  },

  // ── Rate Exercise ──
  RateExerciseRequest: {
    type: "object",
    required: ["rating"],
    properties: {
      rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
      effectiveness: {
        type: "string",
        enum: ["Very Effective", "Effective", "Neutral", "Ineffective"],
        example: "Very Effective",
      },
      notes: { type: "string", example: "Felt great burn in quads" },
    },
  },

  // ── Mark Exercise Completed ──
  MarkExerciseCompletedRequest: {
    type: "object",
    required: ["exerciseId"],
    properties: {
      exerciseId: { type: "string", example: "60d5ec49f1b2c72b7c8e5a11" },
      weight: { type: "number", example: 60 },
      reps: { type: "integer", example: 12 },
      sets: { type: "integer", example: 4 },
    },
  },

  // ── Mark Workout Completed ──
  MarkWorkoutCompletedRequest: {
    type: "object",
    properties: {
      workoutId: { type: "string", example: "60d5ec49f1b2c72b7c8e6b22" },
      duration: { type: "integer", description: "Duration in minutes", example: 45 },
    },
  },

  // ── Extend Membership ──
  ExtendMembershipRequest: {
    type: "object",
    required: ["duration"],
    properties: {
      duration: { type: "string", enum: ["1", "3", "6", "12"], example: "3", description: "Months" },
    },
  },

  // ── Change Membership ──
  ChangeMembershipRequest: {
    type: "object",
    required: ["newMembershipType"],
    properties: {
      newMembershipType: { type: "string", enum: ["Silver", "Gold", "Platinum"], example: "Platinum" },
    },
  },
};

const userSecurity = [{ bearerAuth: [] }];
const jsonContent = (schema) => ({
  content: { "application/json": { schema } },
});

const paths = {
  // ═══════════════ PROFILE ═══════════════

  "/api/user/profile": {
    get: {
      tags: ["User"],
      summary: "Get current user profile",
      description: "Returns full user profile with populated trainer info.",
      security: userSecurity,
      responses: {
        200: {
          description: "User profile",
          ...jsonContent({ $ref: "#/components/schemas/UserProfileResponse" }),
        },
        401: { description: "Unauthorized" },
        500: { description: "Server error" },
      },
    },
    put: {
      tags: ["User"],
      summary: "Update user profile",
      security: userSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/UpdateProfileRequest" }),
      },
      responses: {
        200: { description: "Profile updated" },
        401: { description: "Unauthorized" },
        500: { description: "Server error" },
      },
    },
  },

  // ═══════════════ USER MODULE FEATURES ═══════════════

  "/api/user/purchases": {
    get: {
      tags: ["User"],
      summary: "Get purchase history",
      security: userSecurity,
      responses: {
        200: { description: "List of purchases" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/api/user/trainer/rate": {
    post: {
      tags: ["User"],
      summary: "Rate your assigned trainer",
      security: userSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/RateTrainerRequest" }),
      },
      responses: {
        200: { description: "Rating saved" },
        400: { description: "Invalid rating" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/api/user/trainer/change": {
    post: {
      tags: ["User"],
      summary: "Request a trainer change",
      security: userSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/TrainerChangeRequest" }),
      },
      responses: {
        200: { description: "Change request submitted" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/api/user/password": {
    put: {
      tags: ["User"],
      summary: "Change password",
      security: userSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/ChangePasswordRequest" }),
      },
      responses: {
        200: { description: "Password changed" },
        400: { description: "Current password incorrect" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/api/user/account": {
    delete: {
      tags: ["User"],
      summary: "Delete own account",
      security: userSecurity,
      responses: {
        200: { description: "Account deleted" },
        401: { description: "Unauthorized" },
      },
    },
  },

  // ═══════════════ WORKOUTS ═══════════════

  "/api/workout/today": {
    get: {
      tags: ["User"],
      summary: "Get today's workout plan",
      description: "Returns exercises scheduled for today. Requires active membership.",
      security: userSecurity,
      responses: {
        200: { description: "Today's workout data" },
        401: { description: "Unauthorized" },
        403: { description: "Membership inactive" },
      },
    },
  },

  "/api/workout/weekly-stats": {
    get: {
      tags: ["User"],
      summary: "Get weekly workout statistics",
      security: userSecurity,
      responses: {
        200: { description: "Weekly stats (completed vs planned)" },
        401: { description: "Unauthorized" },
        403: { description: "Membership inactive" },
      },
    },
  },

  "/api/workout/complete": {
    post: {
      tags: ["User"],
      summary: "Mark entire workout as completed",
      security: userSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/MarkWorkoutCompletedRequest" }),
      },
      responses: {
        200: { description: "Workout marked completed" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/api/exercise/complete": {
    post: {
      tags: ["User"],
      summary: "Mark a single exercise as completed",
      security: userSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/MarkExerciseCompletedRequest" }),
      },
      responses: {
        200: { description: "Exercise marked completed" },
        401: { description: "Unauthorized" },
        403: { description: "Membership inactive" },
      },
    },
  },

  "/api/exercise/progress": {
    get: {
      tags: ["User"],
      summary: "Get exercise progress (Bench, Squat, Deadlift)",
      description: "Returns max weight progress for key compound lifts.",
      security: userSecurity,
      responses: {
        200: { description: "Exercise progress data" },
        401: { description: "Unauthorized" },
        403: { description: "Membership inactive" },
      },
    },
  },

  // ═══════════════ NUTRITION ═══════════════

  "/api/nutrition/today": {
    get: {
      tags: ["User"],
      summary: "Get today's nutrition data",
      description: "Returns calorie/protein goals, consumed foods, and macros for today.",
      security: userSecurity,
      responses: {
        200: { description: "Today's nutrition data" },
        401: { description: "Unauthorized" },
        403: { description: "Membership inactive" },
      },
    },
  },

  "/api/nutrition/mark-consumed": {
    post: {
      tags: ["User"],
      summary: "Mark a food item as consumed",
      description: "Marks a food from the nutrition plan as consumed and updates calorie/macro totals.",
      security: userSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/MarkFoodConsumedRequest" }),
      },
      responses: {
        200: {
          description: "Food marked as consumed",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Food marked as consumed successfully" },
                  updatedNutrition: {
                    type: "object",
                    properties: {
                      calories_consumed: { type: "integer", example: 650 },
                      protein_consumed: { type: "integer", example: 55 },
                      calorie_goal: { type: "integer", example: 2200 },
                      protein_goal: { type: "integer", example: 90 },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "Day not found in nutrition plan" },
        401: { description: "Unauthorized" },
        403: { description: "Membership inactive" },
        404: { description: "No nutrition plan found / Food not found" },
      },
    },
  },

  // ═══════════════ CLASS SCHEDULE ═══════════════

  "/api/class/upcoming": {
    get: {
      tags: ["User"],
      summary: "Get next upcoming class",
      security: userSecurity,
      responses: {
        200: { description: "Upcoming class data (or null)" },
        401: { description: "Unauthorized" },
        403: { description: "Membership inactive" },
      },
    },
  },

  // ═══════════════ EXERCISES (User-facing) ═══════════════

  "/api/exercises": {
    get: {
      tags: ["User"],
      summary: "Get exercises for user's workout type",
      description: "Returns verified exercises matching the user's chosen workout type, with personal ratings.",
      security: userSecurity,
      responses: {
        200: { description: "Exercise list with user ratings" },
        401: { description: "Unauthorized" },
        403: { description: "Membership inactive" },
      },
    },
  },

  "/api/exercises/recommended": {
    get: {
      tags: ["User"],
      summary: "Get recommended exercises",
      description: "AI-like recommendations based on user's past ratings and workout type.",
      security: userSecurity,
      responses: {
        200: { description: "Recommended exercises list" },
        401: { description: "Unauthorized" },
        403: { description: "Membership inactive" },
      },
    },
  },

  "/api/exercises/search": {
    get: {
      tags: ["User"],
      summary: "Search exercises",
      security: userSecurity,
      parameters: [
        {
          name: "query",
          in: "query",
          required: true,
          schema: { type: "string" },
          description: "Search keyword (name, muscle, category, movement pattern)",
          example: "squat",
        },
      ],
      responses: {
        200: { description: "Matching exercises" },
        401: { description: "Unauthorized" },
        403: { description: "Membership inactive" },
      },
    },
  },

  "/api/exercises/{exerciseId}": {
    get: {
      tags: ["User"],
      summary: "Get exercise details",
      security: userSecurity,
      parameters: [
        {
          name: "exerciseId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Exercise ID",
        },
      ],
      responses: {
        200: { description: "Exercise details with similar exercises" },
        401: { description: "Unauthorized" },
        403: { description: "Membership inactive" },
        404: { description: "Exercise not found" },
      },
    },
  },

  "/api/exercises/{exerciseId}/rate": {
    post: {
      tags: ["User"],
      summary: "Rate an exercise",
      security: userSecurity,
      parameters: [
        {
          name: "exerciseId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Exercise ID",
        },
      ],
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/RateExerciseRequest" }),
      },
      responses: {
        200: { description: "Rating saved & average updated" },
        400: { description: "Invalid rating value" },
        401: { description: "Unauthorized" },
        403: { description: "Membership inactive" },
        404: { description: "Exercise not found" },
      },
    },
  },

  // ═══════════════ MEMBERSHIP ═══════════════

  "/api/membership/extend": {
    post: {
      tags: ["User"],
      summary: "Extend current membership",
      security: userSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/ExtendMembershipRequest" }),
      },
      responses: {
        200: { description: "Membership extended" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/user/membership/change": {
    post: {
      tags: ["User"],
      summary: "Change membership type",
      security: userSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/ChangeMembershipRequest" }),
      },
      responses: {
        200: { description: "Membership type changed" },
        401: { description: "Unauthorized" },
      },
    },
  },
};

module.exports = { schemas, paths };
