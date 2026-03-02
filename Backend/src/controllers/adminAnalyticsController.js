// Backend/controllers/adminAnalyticsController.js

const Payment = require("../model/Payment");
const Trainer = require("../model/Trainer");
const User = require("../model/User");
const mongoose = require("mongoose");

/**
 * @desc    Get total revenue from all successful payments
 * @route   GET /api/admin/analytics/total-revenue
 * @access  Private/Admin
 */
exports.getTotalRevenue = async (req, res) => {
    try {
        const result = await Payment.aggregate([
            { $match: { status: "Success" } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        const data = result[0] || { totalRevenue: 0, totalTransactions: 0 };

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: data.totalRevenue,
                totalTransactions: data.totalTransactions
            }
        });

    } catch (error) {
        console.error("Total Revenue Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching total revenue",
            error: error.message
        });
    }
};

/**
 * @desc    Get monthly revenue breakdown
 * @route   GET /api/admin/analytics/monthly-revenue
 * @access  Private/Admin
 */
exports.getMonthlyRevenue = async (req, res) => {
    try {
        const result = await Payment.aggregate([
            { $match: { status: "Success" } },
            {
                $group: {
                    _id: "$revenueMonth",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                    renewals: {
                        $sum: { $cond: ["$isRenewal", 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    month: "$_id",
                    revenue: "$total",
                    transactions: "$count",
                    renewals: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Monthly Revenue Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching monthly revenue",
            error: error.message
        });
    }
};

/**
 * @desc    Get monthly growth percentage
 * @route   GET /api/admin/analytics/monthly-growth
 * @access  Private/Admin
 */
exports.getMonthlyGrowth = async (req, res) => {
    try {
        const data = await Payment.aggregate([
            { $match: { status: "Success" } },
            {
                $group: {
                    _id: "$revenueMonth",
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Calculate growth between last two months
        let growth = 0;
        let trend = "stable";

        if (data.length >= 2) {
            const currentMonth = data[data.length - 1].total;
            const previousMonth = data[data.length - 2].total;

            if (previousMonth > 0) {
                growth = ((currentMonth - previousMonth) / previousMonth) * 100;
            } else if (currentMonth > 0) {
                growth = 100; // 100% growth if previous was 0
            }

            trend = growth > 0 ? "up" : growth < 0 ? "down" : "stable";
        }

        // Also get current month vs same month last year
        const currentDate = new Date();
        const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        const lastYearMonth = `${currentDate.getFullYear() - 1}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

        const currentMonthData = data.find(d => d._id === currentYearMonth) || { total: 0 };
        const lastYearMonthData = data.find(d => d._id === lastYearMonth) || { total: 0 };

        const yearOverYearGrowth = lastYearMonthData.total > 0 
            ? ((currentMonthData.total - lastYearMonthData.total) / lastYearMonthData.total) * 100
            : currentMonthData.total > 0 ? 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                monthlyGrowth: parseFloat(growth.toFixed(2)),
                yearOverYearGrowth: parseFloat(yearOverYearGrowth.toFixed(2)),
                trend,
                currentMonth: currentMonthData.total,
                previousMonth: data.length >= 2 ? data[data.length - 2].total : 0,
                lastYearMonth: lastYearMonthData.total
            }
        });

    } catch (error) {
        console.error("Monthly Growth Error:", error);
        res.status(500).json({
            success: false,
            message: "Error calculating monthly growth",
            error: error.message
        });
    }
};

/**
 * @desc    Get revenue breakdown by trainer
 * @route   GET /api/admin/analytics/trainer-revenue
 * @access  Private/Admin
 */
exports.getTrainerRevenue = async (req, res) => {
    try {
        const result = await Payment.aggregate([
            { 
                $match: { 
                    status: "Success", 
                    trainerId: { $ne: null } 
                } 
            },
            {
                $group: {
                    _id: "$trainerId",
                    totalRevenue: { $sum: "$amount" },
                    transactionCount: { $sum: 1 },
                    uniqueUsers: { $addToSet: "$userId" },
                    lastPayment: { $max: "$paymentDate" },
                    averageTransaction: { $avg: "$amount" }
                }
            },
            {
                $lookup: {
                    from: "trainers",
                    localField: "_id",
                    foreignField: "_id",
                    as: "trainerDetails"
                }
            },
            { $unwind: "$trainerDetails" },
            {
                $project: {
                    trainerId: "$_id",
                    trainerName: "$trainerDetails.name",
                    trainerEmail: "$trainerDetails.email",
                    specialization: "$trainerDetails.specializations",
                    rating: "$trainerDetails.rating",
                    totalRevenue: 1,
                    transactionCount: 1,
                    uniqueUserCount: { $size: "$uniqueUsers" },
                    lastPayment: 1,
                    averageTransaction: { $round: ["$averageTransaction", 2] }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Trainer Revenue Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching trainer revenue",
            error: error.message
        });
    }
};

/**
 * @desc    Get revenue breakdown by membership type
 * @route   GET /api/admin/analytics/membership-revenue
 * @access  Private/Admin
 */
exports.getMembershipRevenue = async (req, res) => {
    try {
        const result = await Payment.aggregate([
            { 
                $match: { 
                    status: "Success", 
                    membershipPlan: { $ne: null } 
                } 
            },
            {
                $group: {
                    _id: "$membershipPlan",
                    revenue: { $sum: "$amount" },
                    count: { $sum: 1 },
                    uniqueUsers: { $addToSet: "$userId" }
                }
            },
            {
                $project: {
                    plan: "$_id",
                    revenue: 1,
                    transactions: "$count",
                    uniqueUsers: { $size: "$uniqueUsers" },
                    _id: 0
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        // Calculate total for percentages
        const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);
        
        // Add percentage to each plan
        const dataWithPercentage = result.map(item => ({
            ...item,
            percentage: totalRevenue > 0 
                ? parseFloat(((item.revenue / totalRevenue) * 100).toFixed(2))
                : 0
        }));

        res.status(200).json({
            success: true,
            data: dataWithPercentage,
            total: totalRevenue
        });

    } catch (error) {
        console.error("Membership Revenue Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching membership revenue",
            error: error.message
        });
    }
};

/**
 * @desc    Get revenue per user
 * @route   GET /api/admin/analytics/revenue-per-user
 * @access  Private/Admin
 */
exports.getRevenuePerUser = async (req, res) => {
    try {
        const result = await Payment.aggregate([
            { $match: { status: "Success" } },
            {
                $group: {
                    _id: "$userId",
                    totalSpent: { $sum: "$amount" },
                    transactionCount: { $sum: 1 },
                    firstPurchase: { $min: "$paymentDate" },
                    lastPurchase: { $max: "$paymentDate" },
                    plans: { $addToSet: "$membershipPlan" },
                    averageTransaction: { $avg: "$amount" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $project: {
                    userId: "$_id",
                    userName: "$userDetails.full_name",
                    userEmail: "$userDetails.email",
                    userStatus: "$userDetails.status",
                    membershipType: "$userDetails.membershipType",
                    totalSpent: 1,
                    transactionCount: 1,
                    firstPurchase: 1,
                    lastPurchase: 1,
                    plans: 1,
                    averageTransaction: { $round: ["$averageTransaction", 2] }
                }
            },
            { $sort: { totalSpent: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: result,
            summary: {
                totalUsers: result.length,
                averageSpentPerUser: result.length > 0 
                    ? result.reduce((sum, u) => sum + u.totalSpent, 0) / result.length 
                    : 0,
                highestSpender: result[0] || null
            }
        });

    } catch (error) {
        console.error("Revenue Per User Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching revenue per user",
            error: error.message
        });
    }
};

/**
 * @desc    Get revenue per specific user
 * @route   GET /api/admin/analytics/revenue-per-user/:userId
 * @access  Private/Admin
 */
exports.getRevenueForUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format"
            });
        }

        const payments = await Payment.find({ 
            userId, 
            status: "Success" 
        }).sort({ paymentDate: -1 });

        const user = await User.findById(userId).select('full_name email membershipType status');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const summary = {
            totalSpent: payments.reduce((sum, p) => sum + p.amount, 0),
            transactionCount: payments.length,
            firstPurchase: payments[payments.length - 1]?.paymentDate || null,
            lastPurchase: payments[0]?.paymentDate || null,
            averageTransaction: payments.length > 0 
                ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length 
                : 0,
            byPlan: payments.reduce((acc, p) => {
                if (p.membershipPlan) {
                    acc[p.membershipPlan] = (acc[p.membershipPlan] || 0) + p.amount;
                }
                return acc;
            }, {})
        };

        res.status(200).json({
            success: true,
            data: {
                user,
                summary,
                payments
            }
        });

    } catch (error) {
        console.error("Revenue For User Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching revenue for user",
            error: error.message
        });
    }
};