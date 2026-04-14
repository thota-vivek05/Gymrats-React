const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const options = {
  definition: {
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
    },
    tags: [
      { name: "Auth", description: "Authentication & Authorization (Login, Signup, Profile)" },
      { name: "User", description: "User profile, workouts, nutrition, exercises & membership" },
      { name: "Trainer", description: "Trainer operations – clients, workout plans, nutrition plans" },
      { name: "Admin Dashboard", description: "Admin CRUD operations for users, trainers, exercises, memberships & verifiers" },
      { name: "Admin Analytics", description: "Revenue analytics, trainer performance, and user lifecycle tracking" },
    ],
  },
  apis: [path.join(__dirname, "./*.swagger.js")],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Call this once in server.js to mount Swagger UI.
 *   setupSwagger(app);
 */
function setupSwagger(app) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "GymRats API Docs",
    })
  );

  if (process.env.NODE_ENV !== 'test') {
    console.log("Swagger docs available at http://localhost:3000/api-docs");
  }
}

module.exports = setupSwagger;
