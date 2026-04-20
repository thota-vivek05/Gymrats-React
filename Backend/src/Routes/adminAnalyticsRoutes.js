// Backend/Routes/adminAnalyticsRoutes.js

const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/adminAnalyticsController");
const { admin_Protect } = require("../middleware/authMiddleware");

// ===== PHASE 2: REVENUE ANALYTICS ROUTES =====
router.get("/total-revenue", admin_Protect, analyticsController.getTotalRevenue);
router.get("/monthly-revenue", admin_Protect, analyticsController.getMonthlyRevenue);
router.get("/monthly-growth", admin_Protect, analyticsController.getMonthlyGrowth);
router.get("/trainer-revenue", admin_Protect, analyticsController.getTrainerRevenue);
router.get("/membership-revenue", admin_Protect, analyticsController.getMembershipRevenue);
router.get("/revenue-per-user", admin_Protect, analyticsController.getRevenuePerUser);
router.get("/revenue-per-user/:userId", admin_Protect, analyticsController.getRevenueForUser);
router.get("/timeline-revenue", admin_Protect, analyticsController.getTimelineRevenue);

// ===== PHASE 3: TRAINER ANALYTICS ROUTES =====
router.get("/trainer-performance", admin_Protect, analyticsController.getTrainerPerformance);
router.get("/trainer/:trainerId/user-revenue", admin_Protect, analyticsController.getTrainerUserRevenue);
router.get("/trainer/:trainerId/monthly-trend", admin_Protect, analyticsController.getTrainerMonthlyTrend);

// ===== PHASE 4: USER LIFECYCLE ROUTES =====
/**
 * @route   GET /api/admin/analytics/users/active
 * @desc    Get all active users
 * @access  Admin/Manager Only
 */
router.get("/users/active", admin_Protect, analyticsController.getActiveUsers);

/**
 * @route   GET /api/admin/analytics/users/expired
 * @desc    Get all expired users
 * @access  Admin/Manager Only
 */
router.get("/users/expired", admin_Protect, analyticsController.getExpiredUsers);

/**
 * @route   GET /api/admin/analytics/users/dropped
 * @desc    Get all dropped/deleted users
 * @access  Admin/Manager Only
 */
router.get("/users/dropped", admin_Protect, analyticsController.getDroppedUsers);

/**
 * @route   GET /api/admin/analytics/users/renewals
 * @desc    Get renewal tracking (upcoming and recent)
 * @access  Admin/Manager Only
 */
router.get("/users/renewals", admin_Protect, analyticsController.getRenewalTracking);

module.exports = router;