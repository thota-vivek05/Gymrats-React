// Backend/controllers/adminAnalyticsController.js

const Payment = require("../model/Payment");
const Trainer = require("../model/Trainer");
const User = require("../model/User");
const mongoose = require("mongoose");

// Accept legacy and case variants so analytics does not miss older payment rows.
const SUCCESSFUL_PAYMENT_QUERY = {
    status: { $regex: /^(success|completed|paid)$/i }
};
const AMOUNT_AS_NUMBER = {
    $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 }
};
const parseTimelineDate = (value, endOfDay = false) => {
    if (!value) return null;

    let parsedDate = null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        parsedDate = new Date(`${value}T00:00:00.000Z`);
    } else {
        const slashMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (slashMatch) {
            const [, day, month, year] = slashMatch;
            parsedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        } else {
            parsedDate = new Date(value);
        }
    }

    if (Number.isNaN(parsedDate?.getTime?.())) {
        return null;
    }

    if (endOfDay) {
        parsedDate.setUTCHours(23, 59, 59, 999);
    }

    return parsedDate;
};

/**
 * @desc    Get total revenue from all successful payments
 * @route   GET /api/admin/analytics/total-revenue
 * @access  Private/Admin
 */
exports.getTotalRevenue = async (req, res) => {
    try {
        const result = await Payment.aggregate([
            { $match: SUCCESSFUL_PAYMENT_QUERY },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: AMOUNT_AS_NUMBER },
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
            { $match: SUCCESSFUL_PAYMENT_QUERY },
            {
                $group: {
                    _id: "$revenueMonth",
                    total: { $sum: AMOUNT_AS_NUMBER },
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
            { $match: SUCCESSFUL_PAYMENT_QUERY },
            {
                $group: {
                    _id: "$revenueMonth",
                    total: { $sum: AMOUNT_AS_NUMBER }
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
                $match: SUCCESSFUL_PAYMENT_QUERY
            },
            // Some legacy payments don't store trainerId directly.
            // Fallback to the user's assigned trainer for analytics visibility.
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
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
                $addFields: {
                    effectiveTrainerId: { $ifNull: ["$trainerId", "$userDetails.trainer"] }
                }
            },
            {
                $match: {
                    effectiveTrainerId: { $ne: null }
                }
            },
            {
                $group: {
                    _id: "$effectiveTrainerId",
                    totalRevenue: { $sum: AMOUNT_AS_NUMBER },
                    transactionCount: { $sum: 1 },
                    uniqueUsers: { $addToSet: "$userId" },
                    lastPayment: { $max: "$paymentDate" },
                    averageTransaction: { $avg: AMOUNT_AS_NUMBER }
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
            {
                $unwind: {
                    path: "$trainerDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    trainerId: "$_id",
                    trainerName: { $ifNull: ["$trainerDetails.name", "Unknown Trainer"] },
                    trainerEmail: { $ifNull: ["$trainerDetails.email", "N/A"] },
                    specialization: { $ifNull: ["$trainerDetails.specializations", []] },
                    rating: { $ifNull: ["$trainerDetails.rating", 0] },
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
                    ...SUCCESSFUL_PAYMENT_QUERY,
                    membershipPlan: { $ne: null } 
                } 
            },
            {
                $group: {
                    _id: "$membershipPlan",
                    revenue: { $sum: AMOUNT_AS_NUMBER },
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
            { $match: SUCCESSFUL_PAYMENT_QUERY },
            {
                $group: {
                    _id: "$userId",
                    totalSpent: { $sum: AMOUNT_AS_NUMBER },
                    transactionCount: { $sum: 1 },
                    firstPurchase: { $min: "$paymentDate" },
                    lastPurchase: { $max: "$paymentDate" },
                    plans: { $addToSet: "$membershipPlan" },
                    averageTransaction: { $avg: AMOUNT_AS_NUMBER }
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
            ...SUCCESSFUL_PAYMENT_QUERY
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

/**
 * @desc    Get total revenue and transaction logs locked within a specific time window
 * @route   GET /api/admin/analytics/timeline-revenue
 * @access  Private/Admin
 */
exports.getTimelineRevenue = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "A startDate and endDate must be provided."
            });
        }

        const start = parseTimelineDate(startDate);
        const end = parseTimelineDate(endDate, true);

        if (!start || !end) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Use YYYY-MM-DD or DD/MM/YYYY."
            });
        }

        // Core Query Block resolving BSON Date vs BSON String fragmentation
        const matchQuery = {
            ...SUCCESSFUL_PAYMENT_QUERY,
            $expr: {
                $and: [
                    { $gte: [ { $toDate: "$paymentDate" }, start ] },
                    { $lte: [ { $toDate: "$paymentDate" }, end ] }
                ]
            }
        };

        const result = await Payment.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
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
                    _id: 1,
                    amount: 1,
                    currency: 1,
                    paymentFor: 1,
                    membershipPlan: 1,
                    paymentMethod: 1,
                    paymentDate: 1,
                    userId: 1,
                    userName: { $ifNull: ["$userDetails.full_name", "Unknown User"] },
                    userEmail: { $ifNull: ["$userDetails.email", "N/A"] }
                }
            },
            { $sort: { paymentDate: -1 } }
        ]);

        const totalRevenue = result.reduce((sum, doc) => sum + (doc.amount || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                transactions: result
            }
        });

    } catch (error) {
        console.error("Timeline Query Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to construct Timeline Analytics Data Log",
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
        const trainers = await Trainer.find({})
            .select("name email specializations rating experience status maxClients totalClients joined_users_count dropped_users_count monthly_revenue clients")
            .lean();

        const [payments, usersWithTrainer] = await Promise.all([
            Payment.find(SUCCESSFUL_PAYMENT_QUERY)
                .select("userId trainerId amount paymentDate")
                .lean(),
            User.find({ trainer: { $ne: null } })
                .select("_id trainer")
                .lean()
        ]);

        const userToTrainer = new Map(
            usersWithTrainer.map((u) => [u._id.toString(), u.trainer?.toString() || null])
        );

        // Fallback map from trainer client history for legacy datasets where user.trainer may be null.
        const clientHistoryToTrainer = new Map();
        trainers.forEach((trainer) => {
            (trainer.clients || []).forEach((client) => {
                const userId = client?.userId?.toString();
                if (!userId) return;

                const existing = clientHistoryToTrainer.get(userId);
                const joinedAtTs = client?.joinedAt ? new Date(client.joinedAt).getTime() : 0;
                if (!existing || joinedAtTs > existing.joinedAtTs) {
                    clientHistoryToTrainer.set(userId, {
                        trainerId: trainer._id.toString(),
                        joinedAtTs
                    });
                }
            });
        });

        const allClientIds = [
            ...new Set(
                trainers.flatMap((t) =>
                    (t.clients || [])
                        .map((c) => c?.userId?.toString())
                        .filter(Boolean)
                )
            )
        ];

        const clientProfiles = await User.find({ _id: { $in: allClientIds } })
            .select("_id full_name email membershipType status")
            .lean();

        const clientProfileMap = new Map(
            clientProfiles.map((u) => [u._id.toString(), u])
        );

        const revenueByTrainer = new Map();
        payments.forEach((payment) => {
            const userId = payment.userId?.toString();
            const effectiveTrainerId =
                payment.trainerId?.toString() ||
                (userId ? userToTrainer.get(userId) : null) ||
                (userId ? clientHistoryToTrainer.get(userId)?.trainerId : null);
            if (!effectiveTrainerId) return;

            if (!revenueByTrainer.has(effectiveTrainerId)) {
                revenueByTrainer.set(effectiveTrainerId, {
                    totalRevenue: 0,
                    transactionCount: 0,
                    uniqueUsers: new Set(),
                    lastPaymentDate: null
                });
            }

            const metric = revenueByTrainer.get(effectiveTrainerId);
            const amount = Number(payment.amount) || 0;
            metric.totalRevenue += amount;
            metric.transactionCount += 1;
            if (userId) metric.uniqueUsers.add(userId);

            if (payment.paymentDate) {
                const paymentDate = new Date(payment.paymentDate);
                if (!metric.lastPaymentDate || paymentDate > metric.lastPaymentDate) {
                    metric.lastPaymentDate = paymentDate;
                }
            }
        });

        const result = trainers
            .map((trainer) => {
                const trainerId = trainer._id.toString();
                const revenueMetric = revenueByTrainer.get(trainerId) || {
                    totalRevenue: 0,
                    transactionCount: 0,
                    uniqueUsers: new Set(),
                    lastPaymentDate: null
                };

                const clients = trainer.clients || [];
                const activeClients = clients.filter((c) => c?.isActive).length;
                const recentClients = clients.slice(0, 5).map((client) => {
                    const profile = client?.userId ? clientProfileMap.get(client.userId.toString()) : null;
                    return {
                        _id: profile?._id || client?.userId || null,
                        full_name: profile?.full_name || "Unknown User",
                        email: profile?.email || "N/A",
                        membershipType: profile?.membershipType || "N/A",
                        status: profile?.status || "Unknown",
                        isActive: !!client?.isActive,
                        joinedAt: client?.joinedAt || null,
                        droppedAt: client?.droppedAt || null
                    };
                });

                return {
                    ...trainer,
                    totalClients: clients.length,
                    activeClients,
                    totalRevenue: Math.round(revenueMetric.totalRevenue),
                    transactionCount: revenueMetric.transactionCount,
                    uniquePayingClients: revenueMetric.uniqueUsers.size,
                    lastPaymentDate: revenueMetric.lastPaymentDate,
                    monthlyRevenue: trainer.monthly_revenue || [],
                    recentClients
                };
            })
            .sort((a, b) => b.totalRevenue - a.totalRevenue);

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
        const trainerClientUserIds = (trainer.clients || [])
            .map((c) => c?.userId)
            .filter(Boolean);
        const currentlyAssignedUserIds = await User.find({ trainer: trainerObjectId })
            .select("_id")
            .lean();
        const fallbackUserIdSet = new Set([
            ...trainerClientUserIds.map((id) => id.toString()),
            ...currentlyAssignedUserIds.map((u) => u._id.toString())
        ]);
        const fallbackUserIds = [...fallbackUserIdSet].map((id) => new mongoose.Types.ObjectId(id));

        // Get revenue grouped by user for this trainer
        const result = await Payment.aggregate([
            {
                $match: SUCCESSFUL_PAYMENT_QUERY
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "paymentUser"
                }
            },
            {
                $unwind: {
                    path: "$paymentUser",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    effectiveTrainerId: { $ifNull: ["$trainerId", "$paymentUser.trainer"] }
                }
            },
            {
                $match: {
                    $or: [
                        { effectiveTrainerId: trainerObjectId },
                        { userId: { $in: fallbackUserIds } }
                    ]
                }
            },
            {
                $group: {
                    _id: "$userId",
                    totalPaid: { $sum: AMOUNT_AS_NUMBER },
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

        // FIX: Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(trainerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid trainer ID format"
            });
        }

        const trainer = await Trainer.findById(trainerId).select('name monthly_revenue clients');
        if (!trainer) {
            return res.status(404).json({
                success: false,
                message: "Trainer not found"
            });
        }

        // FIX: Create ObjectId instance with 'new' keyword
        const trainerObjectId = new mongoose.Types.ObjectId(trainerId);
        const trainerClientUserIds = (trainer.clients || [])
            .map((c) => c?.userId)
            .filter(Boolean);
        const currentlyAssignedUserIds = await User.find({ trainer: trainerObjectId })
            .select("_id")
            .lean();
        const fallbackUserIdSet = new Set([
            ...trainerClientUserIds.map((id) => id.toString()),
            ...currentlyAssignedUserIds.map((u) => u._id.toString())
        ]);
        const fallbackUserIds = [...fallbackUserIdSet].map((id) => new mongoose.Types.ObjectId(id));

        // Get monthly revenue from payments
        const monthlyRevenue = await Payment.aggregate([
            {
                $match: SUCCESSFUL_PAYMENT_QUERY
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "paymentUser"
                }
            },
            {
                $unwind: {
                    path: "$paymentUser",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    effectiveTrainerId: { $ifNull: ["$trainerId", "$paymentUser.trainer"] },
                    monthKey: {
                        $ifNull: [
                            "$revenueMonth",
                            {
                                $dateToString: {
                                    format: "%Y-%m",
                                    date: { $ifNull: ["$paymentDate", "$createdAt"] }
                                }
                            }
                        ]
                    }
                }
            },
            {
                $match: {
                    $or: [
                        { effectiveTrainerId: trainerObjectId },
                        { userId: { $in: fallbackUserIds } }
                    ]
                }
            },
            {
                $group: {
                    _id: "$monthKey",
                    revenue: { $sum: AMOUNT_AS_NUMBER },
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
        const activeUsers = await User.find({
            status: "Active",
            isDeleted: { $ne: true }
        })
        .select('full_name email phone membershipType membershipDuration lastActive created_at')
        .lean();

        // Enhance with payment summary
        const userIds = activeUsers.map(u => u._id);
        const paymentSummary = await Payment.aggregate([
            { $match: { userId: { $in: userIds }, ...SUCCESSFUL_PAYMENT_QUERY } },
            {
                $group: {
                    _id: "$userId",
                    totalSpent: { $sum: AMOUNT_AS_NUMBER },
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
            { $match: { userId: { $in: userIds }, ...SUCCESSFUL_PAYMENT_QUERY } },
            {
                $group: {
                    _id: "$userId",
                    totalSpent: { $sum: AMOUNT_AS_NUMBER },
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
            ...SUCCESSFUL_PAYMENT_QUERY,
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
            ...SUCCESSFUL_PAYMENT_QUERY,
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
