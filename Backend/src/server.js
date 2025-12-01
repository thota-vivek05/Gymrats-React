require("dotenv").config();

const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const methodOverride = require("method-override");
const JWT_SECRET = process.env.JWT_SECRET || "gymrats-secret-key"; // Use environment variable in production

process.env.TZ = "Asia/Kolkata";

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const adminRoutes = require("./Routes/adminRoutes");
const userRoutes = require("./Routes/userRoutes");
const trainerRoutes = require("./Routes/trainerRoutes");
const verifierRoutes = require("./Routes/verifierRoutes");
// In server.js - Add these lines after other route imports
const authRoutes = require("./Routes/authRoutes");

// Enhanced CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Session setup
app.use(
  session({
    secret: "gymrats-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 3600000,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/gymrats")
  .then(() => {
    console.log("Connected to MongoDB database");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use("/uploads", express.static("uploads"));

// ========== API ROUTES (MUST COME FIRST) ==========
app.use("/api/admin", adminRoutes);
app.use("/", userRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/verifier", verifierRoutes);
app.use("/api/auth", authRoutes);

// react signup
// Add these before the catch-all handler
const spaRoutes = [
  "/login",
  "/signup/user",
  "/signup/trainer",
  "/dashboard",
  "/trainer/dashboard",
];
spaRoutes.forEach((route) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
  });
});

// Redirect legacy admin URLs to new API routes
app.get("/admin_dashboard", (req, res) => res.redirect("/api/admin/dashboard"));
app.get("/admin_user", (req, res) => res.redirect("/api/admin/users"));
app.get("/admin_trainers", (req, res) => res.redirect("/api/admin/trainers"));
app.get("/admin_membership", (req, res) =>
  res.redirect("/api/admin/memberships")
);
app.get("/admin_nutrition", (req, res) =>
  res.redirect("/api/admin/nutrition-plans")
);
app.get("/admin_exercises", (req, res) => res.redirect("/api/admin/exercises"));
app.get("/admin_verifier", (req, res) => res.redirect("/api/admin/verifier"));
app.get("/admin_settings", (req, res) => res.redirect("/api/admin/settings"));

// API Routes for static pages data (if needed)
const pages = [
  "about",
  "blog",
  "calculators",
  "contact",
  "home",
  "isolation",
  "login_signup",
  "nutrition",
  "privacy_policy",
  "schedule",
  "signup",
  "terms",
  "testimonial",
  "trainer_form",
  "trainer",
  "trainers",
  "verifier_form",
  "verifier",
  "workout_plans",
  "trainer_login",
  "edit_nutritional_plan",
  "admin_login",
  "pendingverifications",
  "verifier_login",
  "user_nutrition",
  "user_exercises",
  "userprofile",
];

// Optional: Provide API endpoints for page data
pages.forEach((page) => {
  app.get(`/api/${page}`, (req, res) => {
    // Return data for React components instead of rendering EJS
    res.json({ page: page, data: {} });
  });
});

// Logout API Route
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ error: "Error logging out" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// ========== STATIC FILES (AFTER API ROUTES) ==========
app.use(
  express.static(path.join(__dirname, "../Frontend/dist"), {
    index: false, // Important: don't serve index.html for API routes
  })
);

// ========== CATCH-ALL FOR REACT APP ==========
app.get("*", (req, res, next) => {
  // Skip API routes - let them handle 404
  if (req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
});

app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend API: http://localhost:${PORT}/api`);
  console.log(`Frontend: http://localhost:5173`);
});

// // In your React components
// fetch('/api/user/profile')
//   .then(response => response.json())
//   .then(data => console.log(data));
