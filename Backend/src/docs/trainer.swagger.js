/**
 * Swagger definitions for Trainer routes
 * Prefix: /api/trainer
 */

const schemas = {
  // ── Trainer Signup ──
  TrainerSignupRequest: {
    type: "object",
    required: ["name", "email", "password", "specializations", "experience"],
    properties: {
      name: { type: "string", example: "Mike Johnson" },
      email: { type: "string", format: "email", example: "mike@gymrats.com" },
      password: { type: "string", format: "password", example: "trainerPass123" },
      phone: { type: "string", example: "9876543210" },
      specializations: {
        type: "string",
        example: "Strength Training, HIIT",
        description: "Comma-separated list of specializations",
      },
      experience: { type: "integer", example: 5, description: "Years of experience" },
      resume: {
        type: "string",
        format: "binary",
        description: "PDF or Word resume file (max 5MB)",
      },
    },
  },

  // ── Save Workout Plan ──
  SaveWorkoutPlanRequest: {
    type: "object",
    required: ["userId", "exercises"],
    properties: {
      userId: { type: "string", example: "60d5ec49f1b2c72b7c8e4a3f" },
      exercises: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", example: "Barbell Squat" },
            day: {
              type: "string",
              enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              example: "Monday",
            },
            sets: { type: "integer", example: 4 },
            reps: { type: "string", example: "8-12" },
            weight: { type: "number", example: 60 },
            duration: { type: "string", example: "" },
            restTime: { type: "string", example: "90s" },
          },
        },
        example: [
          { name: "Barbell Squat", day: "Monday", sets: 4, reps: "8-12", weight: 60, restTime: "90s" },
          { name: "Bench Press", day: "Monday", sets: 4, reps: "8-10", weight: 50, restTime: "90s" },
        ],
      },
    },
  },

  // ── Edit Nutrition Plan ──
  EditNutritionPlanRequest: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { type: "string", example: "60d5ec49f1b2c72b7c8e4a3f" },
      calorie_goal: { type: "integer", example: 2200 },
      protein_goal: { type: "integer", example: 90 },
      daily_nutrition: {
        type: "object",
        description: "Keyed by day name (Monday, Tuesday, etc.)",
        example: {
          Monday: {
            foods: [
              { name: "Oatmeal with Banana", calories: 350, protein: 12, carbs: 55, fats: 8 },
              { name: "Grilled Chicken Salad", calories: 450, protein: 40, carbs: 20, fats: 15 },
            ],
          },
        },
      },
    },
  },
};

const trainerSecurity = [{ bearerAuth: [] }];
const jsonContent = (schema) => ({
  content: { "application/json": { schema } },
});

const paths = {
  // ═══════════════ TRAINER AUTH ═══════════════

  "/api/trainer/signup": {
    post: {
      tags: ["Trainer"],
      summary: "Trainer signup / application",
      description: "Submit a trainer application with a resume file upload. No auth required.",
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/TrainerSignupRequest" },
          },
        },
      },
      responses: {
        201: { description: "Trainer application submitted" },
        400: { description: "Validation error / email already exists" },
        500: { description: "Server error" },
      },
    },
  },

  // ═══════════════ CLIENTS ═══════════════

  "/api/trainer/clients": {
    get: {
      tags: ["Trainer"],
      summary: "Get all assigned clients",
      description: "Returns the list of clients assigned to the authenticated trainer.",
      security: trainerSecurity,
      responses: {
        200: { description: "Array of client objects" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/api/trainer/client/{id}": {
    get: {
      tags: ["Trainer"],
      summary: "Get detailed client data",
      security: trainerSecurity,
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Client (User) ID" },
      ],
      responses: {
        200: { description: "Detailed client profile" },
        401: { description: "Unauthorized" },
        404: { description: "Client not found" },
      },
    },
  },

  "/api/trainer/client-progress/{clientId}": {
    get: {
      tags: ["Trainer"],
      summary: "Get client progress data",
      security: trainerSecurity,
      parameters: [
        { name: "clientId", in: "path", required: true, schema: { type: "string" }, description: "Client (User) ID" },
      ],
      responses: {
        200: { description: "Client workout / nutrition progress" },
        401: { description: "Unauthorized" },
        404: { description: "Client not found" },
      },
    },
  },

  // ═══════════════ WORKOUT PLANS ═══════════════

  "/api/trainer/workout/{userId}": {
    get: {
      tags: ["Trainer"],
      summary: "Get workout data for a client",
      security: trainerSecurity,
      parameters: [
        { name: "userId", in: "path", required: true, schema: { type: "string" }, description: "Client (User) ID" },
      ],
      responses: {
        200: { description: "Workout plan data" },
        401: { description: "Unauthorized" },
        404: { description: "User not found" },
      },
    },
  },

  "/api/trainer/save-workout-plan": {
    post: {
      tags: ["Trainer"],
      summary: "Save / update a client's workout plan",
      security: trainerSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/SaveWorkoutPlanRequest" }),
      },
      responses: {
        200: { description: "Workout plan saved" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
      },
    },
  },

  // ═══════════════ NUTRITION PLANS ═══════════════

  "/api/trainer/nutrition/{userId}": {
    get: {
      tags: ["Trainer"],
      summary: "Get nutrition data for a client",
      security: trainerSecurity,
      parameters: [
        { name: "userId", in: "path", required: true, schema: { type: "string" }, description: "Client (User) ID" },
      ],
      responses: {
        200: { description: "Nutrition plan data" },
        401: { description: "Unauthorized" },
        404: { description: "User not found" },
      },
    },
  },

  "/api/trainer/edit_nutritional_plan": {
    post: {
      tags: ["Trainer"],
      summary: "Save / update a client's nutrition plan",
      security: trainerSecurity,
      requestBody: {
        required: true,
        ...jsonContent({ $ref: "#/components/schemas/EditNutritionPlanRequest" }),
      },
      responses: {
        200: { description: "Nutrition plan saved" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
      },
    },
  },

  // ═══════════════ EXERCISE RATINGS ═══════════════

  "/api/trainer/exercise-ratings/{userId}": {
    get: {
      tags: ["Trainer"],
      summary: "Get a client's exercise ratings",
      security: trainerSecurity,
      parameters: [
        { name: "userId", in: "path", required: true, schema: { type: "string" }, description: "Client (User) ID" },
      ],
      responses: {
        200: { description: "Exercise ratings for the client" },
        401: { description: "Unauthorized" },
      },
    },
  },

  // ═══════════════ EXERCISES LIST ═══════════════

  "/api/trainer/exercises/list": {
    get: {
      tags: ["Trainer"],
      summary: "Get all verified exercises",
      description: "Returns a list of all verified exercises (name, category, difficulty, etc.) for building workout plans.",
      security: trainerSecurity,
      responses: {
        200: {
          description: "Array of exercises",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    name: { type: "string", example: "Barbell Squat" },
                    category: { type: "string", example: "Strength" },
                    difficulty: { type: "string", example: "Intermediate" },
                    targetMuscles: { type: "string", example: "Quads, Glutes" },
                    type: { type: "string", example: "compound" },
                    defaultSets: { type: "integer", example: 4 },
                    defaultRepsOrDuration: { type: "string", example: "8-12 reps" },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
      },
    },
  },

  // ═══════════════ RESUME ═══════════════

  "/api/trainer/resume/{filename}": {
    get: {
      tags: ["Trainer"],
      summary: "Download a trainer's resume",
      parameters: [
        { name: "filename", in: "path", required: true, schema: { type: "string" }, description: "Resume filename" },
      ],
      responses: {
        200: { description: "Resume file download" },
        404: { description: "File not found" },
      },
    },
  },
};

module.exports = { schemas, paths };
