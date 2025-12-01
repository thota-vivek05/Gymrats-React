require("dotenv").config();

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const methodOverride = require('method-override');

// Configuration
process.env.TZ = "Asia/Kolkata";
const JWT_SECRET = process.env.JWT_SECRET || 'gymrats-secret-key';
const PORT = process.env.PORT || 3000;

const app = express();

// --- 1. Imports Routes ---
const adminRoutes = require("./Routes/adminRoutes");
const userRoutes = require("./Routes/userRoutes");
const trainerRoutes = require("./Routes/trainerRoutes");
const verifierRoutes = require("./Routes/verifierRoutes");
const authRoutes = require("./Routes/authRoutes");

// --- 2. Middleware ---
app.use(cors({
  origin: 'http://localhost:5173', // Allow Vite frontend
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// --- 3. Session Setup (FIXED) ---
app.use(
  session({
    secret: "gymrats-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true only if using HTTPS (Production)
      maxAge: 3600000, // 1 hour
      httpOnly: true, // Prevents XSS attacks
      sameSite: "lax",
    },
  })
);

// --- 4. Database Connection ---
mongoose
  .connect("mongodb://localhost:27017/gymrats")
  .then(() => {
    console.log("Connected to MongoDB database");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// --- 5. Static Files & Uploads ---
// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files from React build (Production)
// Adjust '../Frontend/dist' if your folder structure differs
app.use(express.static(path.join(__dirname, '../Frontend/dist')));


// --- 6. API Routes ---
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/verifier', verifierRoutes);
app.use('/api/auth', authRoutes);


// --- 7. Legacy/Helper Routes ---
// Redirect legacy admin URLs to new API routes (Optional: keep if old links exist)
app.get("/admin_dashboard", (req, res) => res.redirect("/api/admin/dashboard"));
// ... (You can keep the other redirects if strictly necessary)
app.get("/admin_user", (req, res) => res.redirect("/api/admin/users"));
// ... (You can keep the other redirects if strictly necessary)
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
    res.clearCookie("connect.sid"); // Clear the cookie explicitly
    res.json({ message: "Logged out successfully" });
  });
});

// --- 8. Catch-All Handler (React SPA) ---
// This handles ALL non-API routes (/login, /dashboard, etc.)
// You do NOT need the specific "spaRoutes" array anymore.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
});

// --- 9. Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend API: http://localhost:${PORT}/api`);
  console.log(`Frontend: http://localhost:5173`);
});