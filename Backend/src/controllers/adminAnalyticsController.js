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

// ==================== PHASE 3: TRAINER ANALYTICS APIS ====================

/**
 * @desc    Get total revenue per trainer with active clients count
 * @route   GET /api/admin/analytics/trainer-performance
 * @access  Private/Admin
 */
exports.getTrainerPerformance = async (req, res) => {
    try {
        console.log('📊 Fetching trainer performance...');
        
        const result = await Trainer.aggregate([
            {
                $lookup: {
                    from: "payments",
                    localField: "_id",
                    foreignField: "trainerId",
                    as: "payments"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "clients.userId",
                    foreignField: "_id",
                    as: "clientDetails"
                }
            },
            {
                $addFields: {
                    // Calculate active clients count
                    activeClients: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ["$clients", []] },
                                as: "client",
                                cond: "$$client.isActive"
                            }
                        }
                    },
                    // Calculate total revenue from payments
                    totalRevenue: {
                        $reduce: {
                            input: { $ifNull: ["$payments", []] },
                            initialValue: 0,
                            in: { $add: ["$$value", "$$this.amount"] }
                        }
                    },
                    // Get unique clients from payments
                    uniquePayingClients: {
                        $size: { 
                            $setUnion: [
                                { $ifNull: ["$payments.userId", []] }
                            ] 
                        }
                    },
                    // Last payment date
                    lastPaymentDate: {
                        $max: "$payments.paymentDate"
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    specializations: 1,
                    rating: 1,
                    experience: 1,
                    status: 1,
                    maxClients: 1,
                    totalClients: 1,
                    activeClients: 1,
                    joined_users_count: 1,
                    dropped_users_count: 1,
                    totalRevenue: 1,
                    uniquePayingClients: 1,
                    lastPaymentDate: 1,
                    // Include monthly revenue trend
                    monthlyRevenue: { $ifNull: ["$monthly_revenue", []] },
                    // Sample of recent clients
                    recentClients: {
                        $slice: [{ $ifNull: ["$clientDetails", []] }, 5]
                    }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        console.log(`✅ Found performance data for ${result.length} trainers`);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("❌ Trainer Performance Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching trainer performance",
            error: error.message
        });
    }
};

/**
 * @desc    Get revenue from each user for a specific trainer
 * @route   GET /api/admin/analytics/trainer/:trainerId/user-revenue
 * @access  Private/Admin
 */
exports.getTrainerUserRevenue = async (req, res) => {
    try {
        const { trainerId } = req.params;
        console.log(`📊 Fetching user revenue for trainer: ${trainerId}`);

        // FIX: Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(trainerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid trainer ID format"
            });
        }

        // First verify trainer exists and get client data
        const trainer = await Trainer.findById(trainerId).select('name clients');
        if (!trainer) {
            return res.status(404).json({
                success: false,
                message: "Trainer not found"
            });
        }

        // FIX: Create ObjectId instance with 'new' keyword
        const trainerObjectId = new mongoose.Types.ObjectId(trainerId);

        // Get revenue grouped by user for this trainer
        const result = await Payment.aggregate([
            {
                $match: {
                    trainerId: trainerObjectId,
                    status: "Success"
                }
            },
            {
                $group: {
                    _id: "$userId",
                    totalPaid: { $sum: "$amount" },
                    transactionCount: { $sum: 1 },
                    firstPayment: { $min: "$paymentDate" },
                    lastPayment: { $max: "$paymentDate" },
                    plans: { $addToSet: "$membershipPlan" }
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
            { 
                $unwind: { 
                    path: "$userDetails", 
                    preserveNullAndEmptyArrays: true 
                } 
            },
            {
                $project: {
                    userId: "$_id",
                    userName: { $ifNull: ["$userDetails.full_name", "Unknown User"] },
                    userEmail: { $ifNull: ["$userDetails.email", "N/A"] },
                    userStatus: { $ifNull: ["$userDetails.status", "Unknown"] },
                    membershipType: { $ifNull: ["$userDetails.membershipType", "N/A"] },
                    totalPaid: 1,
                    transactionCount: 1,
                    firstPayment: 1,
                    lastPayment: 1,
                    plans: 1,
                    _id: 0
                }
            },
            { $sort: { totalPaid: -1 } }
        ]);

        // FIX: Safely create client status map
        const clientStatusMap = {};
        if (trainer.clients && Array.isArray(trainer.clients)) {
            trainer.clients.forEach(client => {
                if (client && client.userId) {
                    clientStatusMap[client.userId.toString()] = {
                        isActive: client.isActive || false,
                        joinedAt: client.joinedAt || null,
                        droppedAt: client.droppedAt || null
                    };
                }
            });
        }

        // FIX: Safely add client status to each result
        const enrichedResult = result.map(item => {
            const clientStatus = item.userId ? clientStatusMap[item.userId.toString()] : null;
            
            return {
                ...item,
                isActiveClient: clientStatus?.isActive || false,
                joinedAt: clientStatus?.joinedAt || null,
                droppedAt: clientStatus?.droppedAt || null
            };
        });

        res.status(200).json({
            success: true,
            data: {
                trainerId,
                trainerName: trainer.name || "Unknown Trainer",
                totalUsers: result.length,
                totalRevenue: result.reduce((sum, u) => sum + (u.totalPaid || 0), 0),
                users: enrichedResult
            }
        });

    } catch (error) {
        console.error("❌ Trainer User Revenue Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching trainer user revenue",
            error: error.message
        });
    }
};

/**
 * @desc    Get monthly revenue trend for a specific trainer
 * @route   GET /api/admin/analytics/trainer/:trainerId/monthly-trend
 * @access  Private/Admin
 */
exports.getTrainerMonthlyTrend = async (req, res) => {
    try {
        const { trainerId } = req.params;
        console.log(`📊 Fetching monthly trend for trainer: ${trainerId}`);

        // FIX: Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(trainerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid trainer ID format"
            });
        }

        const trainer = await Trainer.findById(trainerId).select('name monthly_revenue');
        if (!trainer) {
            return res.status(404).json({
                success: false,
                message: "Trainer not found"
            });
        }

        // FIX: Create ObjectId instance with 'new' keyword
        const trainerObjectId = new mongoose.Types.ObjectId(trainerId);

        // Get monthly revenue from payments
        const monthlyRevenue = await Payment.aggregate([
            {
                $match: {
                    trainerId: trainerObjectId,
                    status: "Success"
                }
            },
            {
                $group: {
                    _id: "$revenueMonth",
                    revenue: { $sum: "$amount" },
                    transactions: { $sum: 1 },
                    uniqueUsers: { $addToSet: "$userId" }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    month: "$_id",
                    revenue: 1,
                    transactions: 1,
                    uniqueUsers: { $size: { $ifNull: ["$uniqueUsers", []] } },
                    _id: 0
                }
            }
        ]);

        // FIX: Safely get monthly client metrics
        const clientMetrics = (trainer.monthly_revenue && Array.isArray(trainer.monthly_revenue)) 
            ? trainer.monthly_revenue 
            : [];

        // FIX: Safely combine the data
        const trend = monthlyRevenue.map(rev => {
            const clientData = clientMetrics.find(c => c && c.month === rev.month) || {
                new_clients: 0,
                dropped_clients: 0
            };
            
            return {
                month: rev.month || "Unknown",
                revenue: rev.revenue || 0,
                transactions: rev.transactions || 0,
                uniqueUsers: rev.uniqueUsers || 0,
                newClients: clientData.new_clients || 0,
                droppedClients: clientData.dropped_clients || 0
            };
        });

        // FIX: Safely calculate growth
        let growth = 0;
        if (trend.length >= 2) {
            const lastMonth = trend[trend.length - 1].revenue || 0;
            const prevMonth = trend[trend.length - 2].revenue || 0;
            
            if (prevMonth > 0) {
                growth = ((lastMonth - prevMonth) / prevMonth) * 100;
            } else if (lastMonth > 0) {
                growth = 100;
            }
        }

        res.status(200).json({
            success: true,
            data: {
                trainerId,
                trainerName: trainer.name || "Unknown Trainer",
                totalRevenue: trend.reduce((sum, m) => sum + (m.revenue || 0), 0),
                monthlyGrowth: parseFloat(growth.toFixed(2)),
                trend
            }
        });

    } catch (error) {
        console.error("❌ Trainer Monthly Trend Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching trainer monthly trend",
            error: error.message
        });
    }
};

// ==================== PHASE 4: USER LIFECYCLE APIS ====================================================

/**
 * @desc    Get all active users
 * @route   GET /api/admin/analytics/users/active
 * @access  Private/Admin
 */
exports.getActiveUsers = async (req, res) => {
    try {
        console.log('📊 Fetching active users...');
        
        const activeUsers = await User.find({
            status: "Active",
            isDeleted: { $ne: true }
        })
        .select('full_name email phone membershipType membershipDuration lastActive created_at')
        .lean();

        // Enhance with payment summary
        const userIds = activeUsers.map(u => u._id);
        const paymentSummary = await Payment.aggregate([
            { $match: { userId: { $in: userIds }, status: "Success" } },
            {
                $group: {
                    _id: "$userId",
                    totalSpent: { $sum: "$amount" },
                    lastPayment: { $max: "$paymentDate" }
                }
            }
        ]);

        const paymentMap = {};
        paymentSummary.forEach(p => {
            paymentMap[p._id.toString()] = {
                totalSpent: p.totalSpent,
                lastPayment: p.lastPayment
            };
        });

        const enrichedUsers = activeUsers.map(user => {
            const payment = paymentMap[user._id.toString()] || { totalSpent: 0, lastPayment: null };
            const daysRemaining = user.membershipDuration?.end_date 
                ? Math.ceil((new Date(user.membershipDuration.end_date) - new Date()) / (1000 * 60 * 60 * 24))
                : 0;
            
            return {
                userId: user._id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                membershipType: user.membershipType,
                membershipEndDate: user.membershipDuration?.end_date,
                daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
                autoRenew: user.membershipDuration?.auto_renew || false,
                totalSpent: payment.totalSpent,
                lastPayment: payment.lastPayment,
                lastActive: user.lastActive,
                joinedDate: user.created_at
            };
        });

        res.status(200).json({
            success: true,
            data: enrichedUsers,
            total: enrichedUsers.length
        });

    } catch (error) {
        console.error("❌ Active Users Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching active users",
            error: error.message
        });
    }
};

/**
 * @desc    Get all expired users
 * @route   GET /api/admin/analytics/users/expired
 * @access  Private/Admin
 */
exports.getExpiredUsers = async (req, res) => {
    try {
        console.log('📊 Fetching expired users...');
        
        const expiredUsers = await User.find({
            $or: [
                { status: "Expired" },
                { 
                    status: "Active",
                    "membershipDuration.end_date": { $lt: new Date() }
                }
            ],
            isDeleted: { $ne: true }
        })
        .select('full_name email phone membershipType membershipDuration lastActive created_at')
        .lean();

        // Enhance with payment summary
        const userIds = expiredUsers.map(u => u._id);
        const paymentSummary = await Payment.aggregate([
            { $match: { userId: { $in: userIds }, status: "Success" } },
            {
                $group: {
                    _id: "$userId",
                    totalSpent: { $sum: "$amount" },
                    lastPayment: { $max: "$paymentDate" }
                }
            }
        ]);

        const paymentMap = {};
        paymentSummary.forEach(p => {
            paymentMap[p._id.toString()] = {
                totalSpent: p.totalSpent,
                lastPayment: p.lastPayment
            };
        });

        const enrichedUsers = expiredUsers.map(user => {
            const payment = paymentMap[user._id.toString()] || { totalSpent: 0, lastPayment: null };
            const expiredDate = user.membershipDuration?.end_date || user.membershipDuration?.last_renewal_date;
            const daysExpired = expiredDate 
                ? Math.ceil((new Date() - new Date(expiredDate)) / (1000 * 60 * 60 * 24))
                : 0;
            
            return {
                userId: user._id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                membershipType: user.membershipType,
                membershipEndDate: user.membershipDuration?.end_date,
                daysExpired: daysExpired > 0 ? daysExpired : 0,
                totalSpent: payment.totalSpent,
                lastPayment: payment.lastPayment,
                lastActive: user.lastActive,
                joinedDate: user.created_at
            };
        });

        res.status(200).json({
            success: true,
            data: enrichedUsers,
            total: enrichedUsers.length
        });

    } catch (error) {
        console.error("❌ Expired Users Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching expired users",
            error: error.message
        });
    }
};

/**
 * @desc    Get all dropped/deleted users
 * @route   GET /api/admin/analytics/users/dropped
 * @access  Private/Admin
 */
exports.getDroppedUsers = async (req, res) => {
    try {
        console.log('📊 Fetching dropped users...');
        
        // Find users who are deleted or inactive
        const droppedUsers = await User.find({
            $or: [
                { isDeleted: true },
                { status: "Inactive" },
                { status: "Suspended" }
            ]
        })
        .select('full_name email phone status isDeleted deletedAt lastActive created_at')
        .lean();

        // Also find users who were dropped by trainers
        const trainers = await Trainer.find({
            "clients.isActive": false,
            "clients.droppedAt": { $ne: null }
        })
        .select('clients')
        .lean();

        const droppedByTrainerMap = new Map();
        trainers.forEach(trainer => {
            trainer.clients.forEach(client => {
                if (!client.isActive && client.droppedAt) {
                    droppedByTrainerMap.set(client.userId.toString(), {
                        droppedAt: client.droppedAt,
                        trainerId: trainer._id
                    });
                }
            });
        });

        // Enhance users with dropped info
        const enrichedUsers = droppedUsers.map(user => {
            const trainerDropInfo = droppedByTrainerMap.get(user._id.toString());
            
            return {
                userId: user._id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                status: user.status,
                isDeleted: user.isDeleted,
                droppedAt: user.deletedAt || trainerDropInfo?.droppedAt || null,
                droppedReason: user.isDeleted ? "User deleted account" : 
                              user.status === "Inactive" ? "Inactive account" :
                              user.status === "Suspended" ? "Account suspended" :
                              trainerDropInfo ? "Dropped by trainer" : "Unknown",
                droppedByTrainer: trainerDropInfo?.trainerId || null,
                lastActive: user.lastActive,
                joinedDate: user.created_at
            };
        });

        res.status(200).json({
            success: true,
            data: enrichedUsers,
            total: enrichedUsers.length
        });

    } catch (error) {
        console.error("❌ Dropped Users Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching dropped users",
            error: error.message
        });
    }
};

/**
 * @desc    Get renewal tracking
 * @route   GET /api/admin/analytics/users/renewals
 * @access  Private/Admin
 */
exports.getRenewalTracking = async (req, res) => {
    try {
        console.log('📊 Fetching renewal tracking...');
        
        // Get upcoming renewals (next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const upcomingRenewals = await User.find({
            status: "Active",
            isDeleted: { $ne: true },
            "membershipDuration.end_date": {
                $gte: new Date(),
                $lte: thirtyDaysFromNow
            },
            "membershipDuration.auto_renew": true
        })
        .select('full_name email membershipType membershipDuration trainer')
        .populate('trainer', 'name')
        .lean();

        // Get recent renewals from payments
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentRenewals = await Payment.find({
            isRenewal: true,
            status: "Success",
            paymentDate: { $gte: thirtyDaysAgo }
        })
        .populate('userId', 'full_name email')
        .populate('previousPaymentId')
        .sort({ paymentDate: -1 })
        .lean();

        // Calculate renewal rate
        const totalExpiredLast30Days = await User.countDocuments({
            "membershipDuration.end_date": {
                $gte: thirtyDaysAgo,
                $lt: new Date()
            }
        });

        const totalRenewalsLast30Days = await Payment.countDocuments({
            isRenewal: true,
            status: "Success",
            paymentDate: { $gte: thirtyDaysAgo }
        });

        const renewalRate = totalExpiredLast30Days > 0 
            ? (totalRenewalsLast30Days / totalExpiredLast30Days) * 100 
            : 0;

        // Format upcoming renewals
        const formattedUpcoming = upcomingRenewals.map(user => ({
            userId: user._id,
            userName: user.full_name,
            userEmail: user.email,
            membershipType: user.membershipType,
            trainerName: user.trainer?.name || "No trainer",
            endDate: user.membershipDuration?.end_date,
            daysLeft: Math.ceil((new Date(user.membershipDuration?.end_date) - new Date()) / (1000 * 60 * 60 * 24)),
            autoRenew: user.membershipDuration?.auto_renew || false
        }));

        // Format recent renewals
        const formattedRecent = recentRenewals.map(payment => ({
            paymentId: payment._id,
            userName: payment.userId?.full_name || "Unknown",
            userEmail: payment.userId?.email || "Unknown",
            amount: payment.amount,
            renewalDate: payment.paymentDate,
            plan: payment.membershipPlan,
            previousPaymentId: payment.previousPaymentId?._id || null,
            previousPaymentDate: payment.previousPaymentId?.paymentDate || null,
            previousPaymentAmount: payment.previousPaymentId?.amount || null
        }));

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    upcomingCount: formattedUpcoming.length,
                    recentRenewalsCount: formattedRecent.length,
                    renewalRate: parseFloat(renewalRate.toFixed(2)),
                    totalExpiredLast30Days,
                    totalRenewalsLast30Days
                },
                upcomingRenewals: formattedUpcoming,
                recentRenewals: formattedRecent
            }
        });

    } catch (error) {
        console.error("❌ Renewal Tracking Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching renewal tracking",
            error: error.message
        });
    }
};