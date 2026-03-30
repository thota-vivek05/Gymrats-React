const swaggerUi = require("swagger-ui-express");

// Import all swagger doc modules
const authSwagger = require("./auth.swagger");
const adminSwagger = require("./admin.swagger");
const userSwagger = require("./user.swagger");
const trainerSwagger = require("./trainer.swagger");

// Merge all paths from individual swagger files
const allPaths = {
  ...authSwagger.paths,
  ...adminSwagger.paths,
  ...userSwagger.paths,
  ...trainerSwagger.paths,
};

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "GymRats API Documentation",
    version: "1.0.0",
    description:
      "Complete REST API documentation for the GymRats fitness platform. Covers authentication, user management, trainer operations, admin dashboard, and analytics.",
    contact: {
      name: "GymRats Dev Team",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          'JWT token obtained from /api/auth/login. Pass as: Authorization: Bearer <token>',
      },
    },
    schemas: {
      // ── Reusable Error / Success envelopes ──
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string", example: "Error message" },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation successful" },
        },
      },

      // ── Auth Schemas ──
      ...authSwagger.schemas,

      // ── Admin Schemas ──
      ...adminSwagger.schemas,

      // ── User Schemas ──
      ...userSwagger.schemas,

      // ── Trainer Schemas ──
      ...trainerSwagger.schemas,
    },
  },
  tags: [
    {
      name: "Auth",
      description: "Authentication & Authorization (Login, Signup, Profile)",
    },
    {
      name: "User",
      description: "User profile, workouts, nutrition, exercises & membership",
    },
    {
      name: "Trainer",
      description:
        "Trainer operations – clients, workout plans, nutrition plans",
    },
    {
      name: "Admin",
      description:
        "Admin CRUD operations for users, trainers, exercises, memberships & verifiers",
    },
    {
      name: "Admin Analytics",
      description:
        "Revenue analytics, trainer performance, and user lifecycle tracking",
    },
  ],
  paths: allPaths,
};

/**
 * Call this once in server.js to mount Swagger UI.
 *   setupSwagger(app);
 */
function setupSwagger(app) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDefinition, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "GymRats API Docs",
    })
  );

  console.log("📄 Swagger docs available at http://localhost:3000/api-docs");
}

module.exports = setupSwagger;
