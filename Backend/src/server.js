const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const methodOverride = require('method-override');

process.env.TZ = 'Asia/Kolkata';

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const adminRoutes = require('./Routes/adminRoutes');
const userRoutes = require('./Routes/userRoutes');
const trainerRoutes = require('./Routes/trainerRoutes');
const verifierRoutes = require('./Routes/verifierRoutes');

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Session setup
app.use(
  session({
    secret: 'gymrats-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, 
      maxAge: 3600000,
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/gymrats')
  .then(() => {
    console.log('Connected to MongoDB database');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.use('/uploads', express.static('uploads'));

// ========== API ROUTES (MUST COME FIRST) ==========
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/verifier', verifierRoutes);

// Legacy redirects (optional)
app.get('/admin_dashboard', (req, res) => res.redirect('/api/admin/dashboard'));
// ... other redirects

// Logout API Route
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// ========== STATIC FILES (AFTER API ROUTES) ==========
app.use(express.static(path.join(__dirname, '../Frontend/dist'), {
  index: false // Important: don't serve index.html for API routes
}));

// ========== CATCH-ALL FOR REACT APP ==========
app.get('*', (req, res, next) => {
  // Skip API routes - let them handle 404
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
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