// Backend/Routes/adminAnalyticsRoutes.js

const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/adminAnalyticsController");
const { admin_Protect } = require("../middleware/authMiddleware");
// All routes are protected with admin check
// You may want to add an additional admin role check middleware

// Revenue Analytics Routes
router.get("/total-revenue",  admin_Protect, analyticsController.getTotalRevenue);
router.get("/monthly-revenue",  admin_Protect, analyticsController.getMonthlyRevenue);
router.get("/monthly-growth",  admin_Protect, analyticsController.getMonthlyGrowth);
router.get("/trainer-revenue",  admin_Protect, analyticsController.getTrainerRevenue);
router.get("/membership-revenue",  admin_Protect, analyticsController.getMembershipRevenue);
router.get("/revenue-per-user",  admin_Protect, analyticsController.getRevenuePerUser);
router.get("/revenue-per-user/:userId",  admin_Protect, analyticsController.getRevenueForUser);

module.exports = router;