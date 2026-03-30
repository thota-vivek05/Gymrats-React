/**
 * Swagger definitions for Authentication routes
 * Prefix: /api/auth
 */

const schemas = {
  LoginRequest: {
    type: "object",
    required: ["email", "password", "role"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "john@example.com",
      },
      password: {
        type: "string",
        format: "password",
        example: "mypassword123",
      },
      role: {
        type: "string",
        enum: ["user", "trainer"],
        example: "user",
        description: "Login as user or trainer",
      },
    },
  },
  LoginResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Login successful" },
      token: {
        type: "string",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
      user: {
        type: "object",
        properties: {
          id: { type: "string", example: "60d5ec49f1b2c72b7c8e4a3f" },
          email: { type: "string", example: "john@example.com" },
          name: { type: "string", example: "John Doe" },
          role: { type: "string", example: "user" },
          membershipType: { type: "string", example: "Gold" },
        },
      },
      redirect: { type: "string", example: "/userdashboard_g" },
    },
  },
  SignupRequest: {
    type: "object",
    required: [
      "full_name",
      "email",
      "password",
      "phone",
      "membershipType",
      "membershipDuration",
    ],
    properties: {
      full_name: { type: "string", example: "John Doe" },
      email: { type: "string", format: "email", example: "john@example.com" },
      password: {
        type: "string",
        format: "password",
        example: "securePass123",
      },
      phone: { type: "string", example: "9876543210" },
      age: { type: "integer", example: 25 },
      gender: {
        type: "string",
        enum: ["Male", "Female", "Other"],
        example: "Male",
      },
      height: { type: "number", example: 175 },
      weight: { type: "number", example: 70 },
      workout_type: {
        type: "string",
        enum: ["Strength", "Cardio", "Flexibility", "HIIT", "Yoga"],
        example: "Strength",
      },
      membershipType: {
        type: "string",
        enum: ["Silver", "Gold", "Platinum"],
        example: "Gold",
      },
      membershipDuration: {
        type: "string",
        enum: ["1", "3", "6", "12"],
        example: "3",
      },
    },
  },
  ProfileResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      user: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string" },
          role: { type: "string" },
          name: { type: "string" },
        },
      },
    },
  },
};

const paths = {
  // ─── POST /api/auth/login ───
  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login (User or Trainer)",
      description:
        "Authenticate with email, password and role. Returns a JWT token valid for 24 hours.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful – JWT token returned",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginResponse" },
            },
          },
        },
        400: {
          description: "Missing fields or invalid role",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        401: {
          description: "Invalid email or password",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        403: {
          description: "Account not active",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  // ─── GET /api/auth/profile ───
  "/api/auth/profile": {
    get: {
      tags: ["Auth"],
      summary: "Get authenticated user profile",
      description:
        "Returns the decoded JWT payload for the currently authenticated user.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Profile data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProfileResponse" },
            },
          },
        },
        401: {
          description: "No token / invalid token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  // ─── POST /signup ───
  "/signup": {
    post: {
      tags: ["Auth"],
      summary: "Register a new user",
      description:
        "Create a new user account with membership details. No auth required.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/SignupRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "User created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: {
          description: "Validation error / email already exists",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  // ─── POST /api/logout ───
  "/api/logout": {
    post: {
      tags: ["Auth"],
      summary: "Logout (destroy session)",
      description: "Destroys the server-side session.",
      responses: {
        200: {
          description: "Logged out successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Logged out successfully",
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Error logging out",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
};

module.exports = { schemas, paths };
