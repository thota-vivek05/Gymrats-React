const User = require("../model/User");
const Trainer = require("../model/Trainer");
const Exercise = require("../model/Exercise");
const Membership = require("../model/Membership");
const Verifier = require("../model/Verifier");
const TrainerApplication = require("../model/TrainerApplication");
const WorkoutHistory = require("../model/WorkoutHistory");
const NutritionHistory = require("../model/NutritionHistory");
const TrainerReview = require("../model/TrainerReview");
const Manager = require("../model/Manager");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Auto-seed MongoDB with a default Admin if none exist
const seedAdmin = async () => {
  try {
    const existingAdmin = await Manager.findOne({ role: "admin" });
    if (!existingAdmin) {
      const hashedPwd = await bcrypt.hash("Password123", 10);
      await Manager.create({
        full_name: "GymRats Admin",
        email: "gymratsweb@gmail.com",
        password_hash: hashedPwd,
        role: "admin",
        permissions: [
          "manage_exercises",
          "approve_trainers",
          "manage_users",
          "view_trainer_ratings",
        ],
        isActive: true,
      });
      console.log("Default Admin seeded successfully!");
    }
  } catch (error) {
    console.error("Failed to seed admin:", error);
  }
};

const adminAuthController = {
  getAdminLogin: (req, res) => {
    res.json({
      success: true,
      message: "Please login via POST /api/admin/login",
    });
  },

  postAdminLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Email and password are required" });
      }

      const adminUser = await Manager.findOne({ email });
      if (!adminUser) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      if (adminUser.isActive === false) {
        return res
          .status(403)
          .json({ success: false, message: "Account deactivated" });
      }

      const isMatch = await bcrypt.compare(password, adminUser.password_hash);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      const token = jwt.sign(
        {
          id: adminUser._id,
          email: adminUser.email,
          role: adminUser.role,
          name: adminUser.full_name,
        },
        process.env.JWT_SECRET || "gymrats-secret-key",
        { expiresIn: "24h" },
      );

      return res.json({
        success: true,
        message: "Admin login successful",
        token,
        user: {
          id: adminUser._id,
          name: adminUser.full_name,
          email: adminUser.email,
          role: adminUser.role,
        },
      });
    } catch (err) {
      console.error("Admin login error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  adminLogout: (req, res) => {
    res.json({
      success: true,
      message: "Logged out successfully. Please clear your token.",
    });
  },
};

const adminController = {
  // Dashboard
  getDashboard: async (req, res) => {
    try {
      // Check for authentication (return 401 JSON if not logged in)

      const now = new Date();
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const twoMonthsAgo = new Date(now);
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const twoWeeksAgo = new Date(now);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const userCount = await User.countDocuments();
      const activeMembers = await User.countDocuments({ status: "Active" });
      const trainerCount = await Trainer.countDocuments();
      const verifierCount = await Verifier.countDocuments();
      const platinumMembers = await User.countDocuments({
        membershipType: "Platinum",
      });
      const newSignups = await User.countDocuments({
        created_at: { $gte: oneWeekAgo },
      });

      // Calculate percentages (dynamic where possible)
      const newUsersLastMonth = await User.countDocuments({
        created_at: { $gte: oneMonthAgo },
      });
      const previousTotalUsers = userCount - newUsersLastMonth;
      let totalUsersChange = "+0% from last month";
      if (previousTotalUsers > 0) {
        const change = (
          ((userCount - previousTotalUsers) / previousTotalUsers) *
          100
        ).toFixed(0);
        totalUsersChange =
          (change > 0 ? "+" : "") + change + "% from last month";
      }

      const newActiveLastMonth = await User.countDocuments({
        status: "Active",
        created_at: { $gte: oneMonthAgo },
      });
      const previousActive = activeMembers - newActiveLastMonth;
      let activeChange = "+0% from last month";
      if (previousActive > 0) {
        const change = (
          ((activeMembers - previousActive) / previousActive) *
          100
        ).toFixed(0);
        activeChange = (change > 0 ? "+" : "") + change + "% from last month";
      }

      const newTrainersLastMonth = await Trainer.countDocuments({
        createdAt: { $gte: oneMonthAgo },
      });
      const previousTrainers = trainerCount - newTrainersLastMonth;
      let trainersChange = "+0% from last month";
      if (previousTrainers > 0) {
        const change = (
          ((trainerCount - previousTrainers) / previousTrainers) *
          100
        ).toFixed(0);
        trainersChange = (change > 0 ? "+" : "") + change + "% from last month";
      }

      const newVerifiersLastMonth = await Verifier.countDocuments({
        createdAt: { $gte: oneMonthAgo },
      });
      const previousVerifiers = verifierCount - newVerifiersLastMonth;
      let verifiersChange = "+0% from last month";
      if (previousVerifiers > 0) {
        const change = (
          ((verifierCount - previousVerifiers) / previousVerifiers) *
          100
        ).toFixed(0);
        verifiersChange =
          (change > 0 ? "+" : "") + change + "% from last month";
      }

      const newPlatinumLastMonth = await User.countDocuments({
        membershipType: "Platinum",
        created_at: { $gte: oneMonthAgo },
      });
      const previousPlatinum = platinumMembers - newPlatinumLastMonth;
      let platinumChange = "+0% from last month";
      if (previousPlatinum > 0) {
        const change = (
          ((platinumMembers - previousPlatinum) / previousPlatinum) *
          100
        ).toFixed(0);
        platinumChange = (change > 0 ? "+" : "") + change + "% from last month";
      }

      const previousNewSignups = await User.countDocuments({
        created_at: { $gte: twoWeeksAgo, $lt: oneWeekAgo },
      });
      let newSignupsChange = "+0% from last week";
      if (previousNewSignups > 0) {
        const change = (
          ((newSignups - previousNewSignups) / previousNewSignups) *
          100
        ).toFixed(0);
        newSignupsChange =
          (change > 0 ? "+" : "") + change + "% from last week";
      }

      // Revenue calculation function
      const calculateRevenue = async (additionalMatch = {}) => {
        const agg = await User.aggregate([
          {
            $match: {
              status: "Active",
              membershipType: { $in: ["Basic", "Gold", "Platinum"] },
              ...additionalMatch,
            },
          },
          {
            $addFields: {
              months_paid: {
                $cond: {
                  if: {
                    $and: [
                      {
                        $ifNull: [
                          "$membershipDuration.months_remaining",
                          false,
                        ],
                      },
                      { $gt: ["$membershipDuration.months_remaining", 0] },
                    ],
                  },
                  then: "$membershipDuration.months_remaining",
                  else: 1,
                },
              },
              monthly_price: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$membershipType", "Basic"] }, then: 299 },
                    { case: { $eq: ["$membershipType", "Gold"] }, then: 599 },
                    {
                      case: { $eq: ["$membershipType", "Platinum"] },
                      then: 999,
                    },
                  ],
                  default: 0,
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              revenue: {
                $sum: { $multiply: ["$monthly_price", "$months_paid"] },
              },
            },
          },
        ]);
        return agg[0]?.revenue || 0;
      };

      const totalRevenue = await calculateRevenue();
      const monthlyRevenue = await calculateRevenue({
        "membershipDuration.start_date": { $gte: oneMonthAgo },
      });
      const previousMonthlyRevenue = await calculateRevenue({
        "membershipDuration.start_date": {
          $gte: twoMonthsAgo,
          $lt: oneMonthAgo,
        },
      });
      let monthlyChange = "+0% from last month";
      if (previousMonthlyRevenue > 0) {
        const change = (
          ((monthlyRevenue - previousMonthlyRevenue) / previousMonthlyRevenue) *
          100
        ).toFixed(0);
        monthlyChange = (change > 0 ? "+" : "") + change + "% from last month";
      }

      const users = await User.find()
        .sort({ created_at: -1 })
        .limit(5)
        .select("full_name email status membershipType created_at");
      const trainers = await Trainer.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name specializations experience status email");
      const verifiers = await Verifier.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name");

      // SAFE DATA FORMATTING
      const safeTrainers = trainers.map((trainer) => ({
        name: trainer.name || "Unknown Trainer",
        specializations: trainer.specializations || [],
        experience: trainer.experience || 0,
        status: trainer.status || "Unknown",
        email: trainer.email || "No email",
      }));

      const safeVerifiers = verifiers.map((verifier) => ({
        name: verifier.name || "Unknown Verifier",
      }));

      // RETURN JSON RESPONSE FOR REACT
      res.json({
        success: true,
        stats: {
          totalUsers: userCount,
          totalUsersChange,
          activeMembers,
          activeChange,
          personalTrainers: trainerCount,
          trainersChange,
          contentVerifiers: verifierCount,
          verifiersChange,
          totalRevenue,
          monthlyRevenue,
          monthlyChange,
          platinumMembers,
          platinumChange,
          newSignups,
          newSignupsChange,
        },
        users: users || [],
        trainers: safeTrainers || [],
        verifiers: safeVerifiers || [],
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching dashboard data",
        stats: {
          totalUsers: 0,
          totalUsersChange: "+0% from last month",
          activeMembers: 0,
          activeChange: "+0% from last month",
          personalTrainers: 0,
          trainersChange: "+0% from last month",
          contentVerifiers: 0,
          verifiersChange: "+0% from last month",
          totalRevenue: 0,
          monthlyRevenue: 0,
          monthlyChange: "+0% from last month",
          platinumMembers: 0,
          platinumChange: "+0% from last month",
          newSignups: 0,
          newSignupsChange: "+0% from last week",
        },
        users: [],
        trainers: [],
        verifiers: [],
      });
    }
  },

  // User Management
  // User Management
  getUsers: async (req, res) => {
    try {
      const { search } = req.query;
      let query = {};

      // Search Logic using Regex for partial matching
      if (search && search.trim() !== "") {
        const searchRegex = new RegExp(search, "i");
        
        let dateQuery = {};
        const possibleDate = new Date(search);
        if (!isNaN(possibleDate.getTime())) {
          const startOfDay = new Date(possibleDate.setHours(0, 0, 0, 0));
          const endOfDay = new Date(possibleDate.setHours(23, 59, 59, 999));
          dateQuery = {
            created_at: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          };
        }

        query = {
          $or: [
            { full_name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { status: searchRegex },
            { membershipType: searchRegex },
            ...(Object.keys(dateQuery).length > 0 ? [dateQuery] : []),
          ],
        };
      }

      const users = await User.find(query)
        .sort({ created_at: -1 })
        .populate("trainer", "name");

      // Calculate stats
      const totalUsers = await User.countDocuments();
      const activeMembers = await User.countDocuments({ status: "Active" });
      const platinumUsers = await User.countDocuments({
        membershipType: "Platinum",
      });
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newSignups = await User.countDocuments({
        created_at: { $gte: oneWeekAgo },
      });

      res.json({
        success: true,
        users,
        stats: {
          totalUsers,
          activeMembers,
          platinumUsers,
          newSignups,
        },
      });
    } catch (error) {
      console.error("User management error:", error);
      res.status(500).json({ success: false, message: "Error fetching users" });
    }
  },

  // 2. NEW: Dropped Users API (Expired Subscriptions)
  // Dropped Users API with search support
  getDroppedUsers: async (req, res) => {
    try {
      const { search } = req.query;
      const today = new Date();

      // Base query for dropped users
      let query = {
        $or: [
          { "membershipDuration.end_date": { $lt: today } },
          { status: "Inactive" },
        ],
      };

      // Add search filter if provided
      if (search && search.trim() !== "") {
        const searchRegex = new RegExp(search, "i");

        // Try to parse search as date
        let dateQuery = {};
        const possibleDate = new Date(search);
        if (!isNaN(possibleDate.getTime())) {
          const startOfDay = new Date(possibleDate.setHours(0, 0, 0, 0));
          const endOfDay = new Date(possibleDate.setHours(23, 59, 59, 999));
          dateQuery = {
            created_at: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          };
        }

        query.$and = [
          query, // Keep the dropped users condition
          {
            $or: [
              { full_name: searchRegex },
              { email: searchRegex },
              { phone: searchRegex },
              { status: searchRegex },
              { membershipType: searchRegex },
              ...(Object.keys(dateQuery).length > 0 ? [dateQuery] : []),
            ],
          },
        ];
      }

      const droppedUsers = await User.find(query).select(
        "full_name email phone membershipType membershipDuration status created_at",
      );

      res.json({
        success: true,
        count: droppedUsers.length,
        users: droppedUsers,
      });
    } catch (error) {
      console.error("Error fetching dropped users:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching dropped users" });
    }
  },

  // 3. NEW: Detailed User View API
  getUserDetails: async (req, res) => {
    try {
      const { id } = req.params;

      // Fetch basic user data + assigned trainer
      const user = await User.findById(id).populate(
        "trainer",
        "name email specializations phone",
      );

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Fetch Membership History (Payment History)
      const membershipHistory = await Membership.find({ user_id: id }).sort({
        start_date: -1,
      });

      // Determine Renewal Status
      const today = new Date();
      const endDate = user.membershipDuration?.end_date
        ? new Date(user.membershipDuration.end_date)
        : null;
      let renewalStatus = "Active";
      let daysUntilRenewal = 0;

      if (!endDate) {
        renewalStatus = "No Plan";
      } else if (endDate < today) {
        renewalStatus = "Expired"; // Dropped
      } else {
        const diffTime = Math.abs(endDate - today);
        daysUntilRenewal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysUntilRenewal <= 7) renewalStatus = "Renew Soon";
      }

      res.json({
        success: true,
        profile: user,
        trainer: user.trainer,
        membership: {
          currentType: user.membershipType,
          startDate: user.membershipDuration?.start_date,
          endDate: user.membershipDuration?.end_date,
          history: membershipHistory,
          status: renewalStatus,
          daysRemaining: daysUntilRenewal,
        },
        lifecycle: {
          joinDate: user.created_at,
          lastActive: user.updatedAt, // Assuming updatedAt tracks activity or login
        },
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching user details" });
    }
  },
  createUser: async (req, res) => {
    try {
      const {
        fullName,
        email,
        password,
        dob,
        gender,
        phone,
        status,
        membershipType,
        weight,
        height,
      } = req.body;
      if (
        !fullName ||
        !email ||
        !password ||
        !dob ||
        !gender ||
        !phone ||
        !weight ||
        !height
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const heightInMeters = Number(height) / 100;
      const bmi =
        heightInMeters > 0
          ? (Number(weight) / (heightInMeters * heightInMeters)).toFixed(2)
          : null;
      const newUser = new User({
        full_name: fullName,
        email,
        password_hash: hashedPassword,
        dob: new Date(dob),
        gender,
        phone,
        weight: Number(weight),
        height: Number(height),
        BMI: bmi ? Number(bmi) : null,
        status: status || "Active",
        membershipType: membershipType || "Basic",
        created_at: new Date(),
      });
      await newUser.save();
      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: newUser,
      });
    } catch (error) {
      console.error("Create user error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  updateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const {
        fullName,
        email,
        dob,
        gender,
        phone,
        weight,
        height,
        status,
        membershipType,
      } = req.body;
      let bmi = null;
      if (weight && height) {
        const heightInMeters = Number(height) / 100;
        bmi =
          heightInMeters > 0
            ? (Number(weight) / (heightInMeters * heightInMeters)).toFixed(2)
            : null;
      }
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          full_name: fullName,
          email,
          dob: dob ? new Date(dob) : undefined,
          gender,
          phone,
          weight: weight ? Number(weight) : undefined,
          height: height ? Number(height) : undefined,
          BMI: bmi ? Number(bmi) : undefined,
          status,
          membershipType,
        },
        { new: true },
      );
      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update user error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const deletedUser = await User.findByIdAndDelete(userId);
      if (!deletedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      await WorkoutHistory.deleteMany({ userId });
      await NutritionHistory.deleteMany({ userId });
      res
        .status(200)
        .json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Trainer Management
  // Trainer Management - Updated with search/filter support
  getTrainers: async (req, res) => {
    try {
      const { search, status, experience } = req.query;
      let query = {};

      // Apply filters
      if (status && status !== "") {
        query.status = status;
      }

      if (experience && experience !== "") {
        query.experience = experience;
      }

      // Apply search using Regex for partial matching
      if (search && search.trim() !== "") {
        const searchRegex = new RegExp(search, "i");
        query = {
          ...query,
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { specializations: searchRegex },
          ]
        };
      }

      const trainers = await Trainer.find(query).sort({ createdAt: -1 });

      // Calculate stats
      const trainerCount = await Trainer.countDocuments({ status: "Active" });
      const pendingApprovals = await TrainerApplication.countDocuments({
        status: "Pending",
      });

      // Count unique specializations
      const specializationResult = await Trainer.aggregate([
        { $unwind: "$specializations" },
        { $group: { _id: "$specializations" } },
        { $count: "uniqueCount" },
      ]);
      const specializationCount =
        specializationResult.length > 0
          ? specializationResult[0].uniqueCount
          : 0;

      res.json({
        success: true,
        trainers,
        stats: {
          totalTrainers: trainerCount,
          pendingApprovals,
          specializationCount,
          activeTrainers: await Trainer.countDocuments({ status: "Active" }),
          totalCertifications: specializationCount,
        },
      });
    } catch (error) {
      console.error("Trainer management error:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching trainers" });
    }
  },

  // Trainer Assignment (Admin) - fetch trainers and unassigned users
  getTrainerAssignmentData: async (req, res) => {
    try {
      // Fetch active trainers
      const trainers = await Trainer.find({ status: "Active" }).select(
        "name email specializations",
      );

      // Fetch unassigned users (trainer is null)
      const unassignedUsers = await User.find({
        trainer: null,
        status: "Active",
      }).select("full_name email workout_type _id");

      res.json({ success: true, trainers, unassignedUsers });
    } catch (error) {
      console.error("Get trainer assignment data error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Admin assigns trainer to user
  assignTrainerToUserAdmin: async (req, res) => {
    try {
      const { userId, trainerId } = req.body;
      if (!userId || !trainerId)
        return res
          .status(400)
          .json({ success: false, message: "Missing userId or trainerId" });

      const user = await User.findById(userId);
      const trainer = await Trainer.findById(trainerId);

      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      if (!trainer)
        return res
          .status(404)
          .json({ success: false, message: "Trainer not found" });

      if (user.trainer)
        return res
          .status(400)
          .json({ success: false, message: "User already has a trainer" });

      // Optional: check specialization match
      if (
        user.workout_type &&
        trainer.specializations &&
        trainer.specializations.length > 0
      ) {
        if (!trainer.specializations.includes(user.workout_type)) {
          // allow assignment but warn (or reject) — here we'll allow but log
          console.warn(
            `Assigning trainer ${trainerId} whose specializations ${trainer.specializations} do not include user's workout_type ${user.workout_type}`,
          );
        }
      }

      user.trainer = trainerId;
      await user.save();

      if (!trainer.clients) trainer.clients = [];
      if (!trainer.clients.includes(userId)) {
        trainer.clients.push(userId);
        await trainer.save();
      }

      res.json({
        success: true,
        message: "User assigned to trainer",
        user: { id: user._id, name: user.full_name },
      });
    } catch (error) {
      console.error("Assign trainer to user (admin) error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // getTrainersApi: async (req, res) => {
  //     try {
  //       if (!req.session.userId) {
  //         return res.status(401).json({ success: false, message: 'Unauthorized' });
  //       }
  //       const { search } = req.query;
  //       let query = {};
  //       if (search) {
  //         query = {
  //           $or: [
  //             { name: { $regex: search, $options: 'i' } },
  //             { email: { $regex: search, $options: 'i' } },
  //             { specializations: { $regex: search, $options: 'i' } }
  //           ]
  //         };
  //       }
  //       const trainers = await Trainer.find(query).sort({ createdAt: -1 }).select('name email specializations experience status');
  //       res.status(200).json({ success: true, trainers });
  //     } catch (error) {
  //       console.error('Get trainers API error:', error);
  //       res.status(500).json({ success: false, message: 'Internal server error' });
  //     }
  //   },

  createTrainer: async (req, res) => {
    try {
      console.log("Create trainer request body:", req.body); // Debug log

      const {
        name,
        email,
        password,
        phone,
        experience,
        specializations,
        status,
      } = req.body;

      // Validate required fields
      if (!name || !email || !password || !phone || !experience) {
        console.log("Missing fields:", {
          name,
          email,
          password,
          phone,
          experience,
        });
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      // Check if email exists in Trainer collection only (simpler for now)
      const existingTrainer = await Trainer.findOne({ email });

      if (existingTrainer) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another trainer",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Process specializations safely
      let specializationsArray = [];
      if (specializations) {
        if (Array.isArray(specializations)) {
          specializationsArray = specializations;
        } else if (typeof specializations === "string") {
          specializationsArray = specializations
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s);
        }
      }

      console.log("Creating trainer with data:", {
        name,
        email,
        phone,
        experience,
        specializations: specializationsArray,
        status: status || "Active",
      });

      // Create new trainer
      const newTrainer = new Trainer({
        name,
        email,
        password_hash: hashedPassword,
        phone,
        experience,
        specializations: specializationsArray,
        status: status || "Active",
        rating: 0,
        clients: [],
        totalClients: 0,
        totalRevenue: 0,
        maxClients: 20,
      });

      // Save to database
      const savedTrainer = await newTrainer.save();
      console.log("Trainer saved successfully:", savedTrainer._id);

      res.status(201).json({
        success: true,
        message: "Trainer created successfully",
        trainer: savedTrainer,
      });
    } catch (error) {
      console.error("Create trainer error details:", error);

      // Check for duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Email already exists in the system",
        });
      }

      // Check for validation errors
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: "Validation error: " + messages.join(", "),
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error: " + error.message,
      });
    }
  },

  updateTrainer: async (req, res) => {
    try {
      console.log("--- DEBUG START ---");
      console.log("Request Body:", req.body); // Check if meetingLink is here
      console.log("Trainer ID:", req.params.id);

      const {
        name,
        email,
        phone,
        experience,
        specializations,
        status,
        meetingLink,
      } = req.body;

      console.log("Extracted meetingLink:", meetingLink);

      const updatedTrainer = await Trainer.findByIdAndUpdate(
        req.params.id,
        {
          name,
          email,
          phone,
          experience,
          specializations: Array.isArray(specializations)
            ? specializations
            : specializations.split(","),
          status,
          meetingLink, // Ensure this matches the Schema field name
        },
        { new: true, runValidators: true }, // runValidators helps catch schema errors
      );

      if (!updatedTrainer) {
        console.log("Update Failed: Trainer not found");
        return res.status(404).json({ success: false });
      }

      console.log("Updated Trainer from DB:", updatedTrainer);
      console.log("--- DEBUG END ---");

      res.status(200).json({ success: true, trainer: updatedTrainer });
    } catch (error) {
      console.error("Backend Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  deleteTrainer: async (req, res) => {
    try {
      const trainerId = req.params.id;
      const deletedTrainer = await Trainer.findByIdAndDelete(trainerId);
      if (!deletedTrainer) {
        return res
          .status(404)
          .json({ success: false, message: "Trainer not found" });
      }
      res
        .status(200)
        .json({ success: true, message: "Trainer deleted successfully" });
    } catch (error) {
      console.error("Delete trainer error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Membership Management
  // Membership Management - UPDATED TO WORK WITH USER MODEL
  getMemberships: async (req, res) => {
    try {
      // Get ALL USERS with membership information
      const users = await User.find()
        .sort({ created_at: -1 })
        .select(
          "full_name email membershipType created_at membershipDuration status weight height BMI goal",
        );

      // Calculate real-time stats from User data
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Calculate stats using User aggregation
      const agg = await User.aggregate([
        {
          $match: {
            status: "Active",
            membershipType: { $in: ["Basic", "Gold", "Platinum"] },
          },
        },
        {
          $addFields: {
            // Use months_remaining for revenue calculation
            months_paid: {
              $cond: {
                if: {
                  $and: [
                    {
                      $ifNull: ["$membershipDuration.months_remaining", false],
                    },
                    { $gt: ["$membershipDuration.months_remaining", 0] },
                  ],
                },
                then: "$membershipDuration.months_remaining",
                else: 1,
              },
            },
            // Pricing based on membershipType
            monthly_price: {
              $switch: {
                branches: [
                  { case: { $eq: ["$membershipType", "Basic"] }, then: 299 },
                  { case: { $eq: ["$membershipType", "Gold"] }, then: 599 },
                  { case: { $eq: ["$membershipType", "Platinum"] }, then: 999 },
                ],
                default: 0,
              },
            },
            // Calculate membership duration in months
            membership_months: {
              $cond: {
                if: { $ifNull: ["$membershipDuration.start_date", false] },
                then: {
                  $ceil: {
                    $divide: [
                      {
                        $subtract: [
                          new Date(),
                          { $toDate: "$membershipDuration.start_date" },
                        ],
                      },
                      1000 * 60 * 60 * 24 * 30, // milliseconds in a month
                    ],
                  },
                },
                else: 1,
              },
            },
          },
        },
        {
          $group: {
            _id: "$membershipType",
            active: { $sum: 1 },
            revenue: {
              $sum: { $multiply: ["$monthly_price", "$months_paid"] },
            },
            retention: { $avg: "$membership_months" },
          },
        },
      ]);

      // Process aggregate results into planStats
      let planStats = {
        basic: { active: 0, revenue: 0, retention: 0 },
        gold: { active: 0, revenue: 0, retention: 0 },
        platinum: { active: 0, revenue: 0, retention: 0 },
      };

      agg.forEach((group) => {
        const type = group._id ? group._id.toLowerCase() : "basic";
        if (planStats[type]) {
          planStats[type] = {
            active: group.active || 0,
            revenue: group.revenue || 0,
            retention: Math.round((group.retention || 1) * 10) / 10, // Round to 1 decimal
          };
        }
      });

      // Calculate top-level stats
      const totalUsers = await User.countDocuments();
      const activeMembers = await User.countDocuments({ status: "Active" });
      const premiumMembers = await User.countDocuments({
        status: "Active",
        membershipType: "Platinum",
      });
      const newSignups = await User.countDocuments({
        created_at: { $gte: oneWeekAgo },
      });

      // Calculate total revenue
      const totalRevenue = agg.reduce(
        (sum, group) => sum + (group.revenue || 0),
        0,
      );

      // Ensure all plan stats have default values
      ["basic", "gold", "platinum"].forEach((plan) => {
        if (
          !planStats[plan].active &&
          !planStats[plan].revenue &&
          !planStats[plan].retention
        ) {
          planStats[plan] = { active: 0, revenue: 0, retention: 0 };
        }
      });

      // Transform users to membership format for frontend
      const memberships = users.map((user) => ({
        _id: user._id,
        userName: user.full_name,
        planType: user.membershipType || "Basic",
        startDate: user.membershipDuration?.start_date || user.created_at,
        endDate:
          user.membershipDuration?.end_date ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: user.status,
        amount: (() => {
          switch (user.membershipType) {
            case "Gold":
              return 599;
            case "Platinum":
              return 999;
            default:
              return 299;
          }
        })(),
      }));

      res.json({
        success: true,
        memberships,
        stats: {
          activeMembers,
          monthlyRevenue: Math.round(totalRevenue),
          upcomingRenewals: newSignups,
          expiringMemberships: premiumMembers,
        },
      });
    } catch (error) {
      console.error("Membership management error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching memberships",
        memberships: [],
        stats: {
          activeMembers: 0,
          monthlyRevenue: 0,
          upcomingRenewals: 0,
          expiringMemberships: 0,
        },
      });
    }
  },
  createMembership: async (req, res) => {
    try {
      const { userId, type, startDate, endDate, price } = req.body;
      if (!userId || !type || !startDate || !endDate || !price) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      const newMembership = new Membership({
        user_id: userId,
        type,
        start_date: new Date(startDate),
        end_date: new Date(endDate),
        price: Number(price),
        status: "Active",
      });
      await newMembership.save();
      await User.findByIdAndUpdate(userId, { membershipType: type });
      res.status(201).json({
        success: true,
        message: "Membership created successfully",
        membership: newMembership,
      });
    } catch (error) {
      console.error("Create membership error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  updateMembership: async (req, res) => {
    try {
      const membershipId = req.params.id;
      const { type, startDate, endDate, price, status } = req.body;
      const updatedMembership = await Membership.findByIdAndUpdate(
        membershipId,
        {
          type,
          start_date: startDate ? new Date(startDate) : undefined,
          end_date: endDate ? new Date(endDate) : undefined,
          price: price ? Number(price) : undefined,
          status,
        },
        { new: true },
      );
      if (!updatedMembership) {
        return res
          .status(404)
          .json({ success: false, message: "Membership not found" });
      }
      if (status === "Active") {
        await User.findByIdAndUpdate(updatedMembership.user_id, {
          membershipType: type,
        });
      }
      res.status(200).json({
        success: true,
        message: "Membership updated successfully",
        membership: updatedMembership,
      });
    } catch (error) {
      console.error("Update membership error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  deleteMembership: async (req, res) => {
    try {
      const membershipId = req.params.id;
      const membership = await Membership.findById(membershipId);
      if (!membership) {
        return res
          .status(404)
          .json({ success: false, message: "Membership not found" });
      }
      await Membership.findByIdAndDelete(membershipId);
      await User.findByIdAndUpdate(membership.user_id, {
        membershipType: "Basic",
      });
      res
        .status(200)
        .json({ success: true, message: "Membership deleted successfully" });
    } catch (error) {
      console.error("Delete membership error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Exercise Management - UPDATED
  // Exercise Management - UPDATED with proper search and filters
  // Exercise Management - UPDATED with more precise search
  // Exercise Management - UPDATED with more precise search
  getExercises: async (req, res) => {
    try {
      const { search, category, difficulty, verified } = req.query;

      // Build query object
      let query = {};

      // Apply category filter
      if (category && category !== "") {
        query.category = category;
      }

      // Apply difficulty filter
      if (difficulty && difficulty !== "") {
        query.difficulty = difficulty;
      }

      // Apply verified filter
      if (verified === "true") {
        query.verified = true;
      } else if (verified === "false") {
        query.verified = false;
      }

      // Apply search filter - Partial Matching
      if (search && search.trim() !== "") {
        const searchRegex = new RegExp(search, "i"); 
        
        query.$or = [
          { name: searchRegex },
          { primaryMuscle: searchRegex },
          { targetMuscles: { $in: [searchRegex] } },
          { category: searchRegex },
          { equipment: { $in: [searchRegex] } }
        ];
      }

      console.log("Exercise query:", JSON.stringify(query)); // For debugging

      // Fetch exercises with the query
      const exercises = await Exercise.find(query).sort({ name: 1 });

      // Calculate stats
      const totalExercises = await Exercise.countDocuments();

      res.json({
        success: true,
        exercises,
        stats: {
          totalExercises,
          categories: 17,
          difficulties: 3,
          recentUpdates: totalExercises,
        },
      });
    } catch (error) {
      console.error("Exercise management error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching exercises",
        exercises: [],
        stats: {
          totalExercises: 0,
          categories: 0,
          difficulties: 0,
          recentUpdates: 0,
        },
      });
    }
  },
  createExercise: async (req, res) => {
    try {
      const {
        name,
        category,
        difficulty,
        targetMuscles,
        instructions,
        type,
        defaultSets,
        defaultRepsOrDuration,
        equipment,
        movementPattern,
        primaryMuscle, // This is now REQUIRED
        secondaryMuscles,
        image,
      } = req.body;

      // Validate required fields - primaryMuscle is now required
      if (
        !name ||
        !category ||
        !difficulty ||
        !targetMuscles ||
        !instructions ||
        !type ||
        !defaultRepsOrDuration ||
        !primaryMuscle
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields. Primary muscle is required.",
        });
      }

      const newExercise = new Exercise({
        name,
        category,
        difficulty,
        targetMuscles: Array.isArray(targetMuscles)
          ? targetMuscles
          : targetMuscles.split(",").map((m) => m.trim()),
        instructions,
        type,
        defaultSets: defaultSets || 3,
        defaultRepsOrDuration,
        equipment: equipment
          ? Array.isArray(equipment)
            ? equipment
            : equipment.split(",").map((e) => e.trim())
          : [],
        movementPattern: movementPattern || "",
        primaryMuscle: primaryMuscle, // This is crucial for filtering
        secondaryMuscles: secondaryMuscles
          ? Array.isArray(secondaryMuscles)
            ? secondaryMuscles
            : secondaryMuscles.split(",").map((m) => m.trim())
          : [],
        image: image || "",
        verified: false,
        usageCount: 0,
        averageRating: 0,
        totalRatings: 0,
      });

      await newExercise.save();

      res.status(201).json({
        success: true,
        message: "Exercise created successfully",
        exercise: newExercise,
      });
    } catch (error) {
      console.error("Create exercise error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  updateExercise: async (req, res) => {
    try {
      const exerciseId = req.params.id;
      const {
        name,
        category,
        difficulty,
        targetMuscles,
        instructions,
        type,
        defaultSets,
        defaultRepsOrDuration,
        equipment,
        movementPattern,
        primaryMuscle,
        secondaryMuscles,
        image,
        verified,
      } = req.body;

      const updatedExercise = await Exercise.findByIdAndUpdate(
        exerciseId,
        {
          name,
          category,
          difficulty,
          targetMuscles: Array.isArray(targetMuscles)
            ? targetMuscles
            : targetMuscles.split(",").map((m) => m.trim()),
          instructions,
          type,
          defaultSets,
          defaultRepsOrDuration,
          equipment: equipment
            ? Array.isArray(equipment)
              ? equipment
              : equipment.split(",").map((e) => e.trim())
            : [],
          movementPattern,
          primaryMuscle,
          secondaryMuscles: secondaryMuscles
            ? Array.isArray(secondaryMuscles)
              ? secondaryMuscles
              : secondaryMuscles.split(",").map((m) => m.trim())
            : [],
          image,
          verified: verified === "true" || verified === true,
        },
        { new: true },
      );

      if (!updatedExercise) {
        return res
          .status(404)
          .json({ success: false, message: "Exercise not found" });
      }

      res.status(200).json({
        success: true,
        message: "Exercise updated successfully",
        exercise: updatedExercise,
      });
    } catch (error) {
      console.error("Update exercise error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  deleteExercise: async (req, res) => {
    try {
      const exerciseId = req.params.id;
      const deletedExercise = await Exercise.findByIdAndDelete(exerciseId);

      if (!deletedExercise) {
        return res
          .status(404)
          .json({ success: false, message: "Exercise not found" });
      }

      res
        .status(200)
        .json({ success: true, message: "Exercise deleted successfully" });
    } catch (error) {
      console.error("Delete exercise error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  // Verify exercise
  verifyExercise: async (req, res) => {
    try {
      const { id } = req.params;
      const { verified } = req.body;

      console.log(`Verifying exercise ${id} to:`, verified);

      const exercise = await Exercise.findByIdAndUpdate(
        id,
        { verified: verified === true || verified === "true" },
        { new: true },
      );

      if (!exercise) {
        return res
          .status(404)
          .json({ success: false, message: "Exercise not found" });
      }

      res.json({
        success: true,
        message: `Exercise ${exercise.verified ? "verified" : "unverified"} successfully`,
        exercise,
      });
    } catch (error) {
      console.error("Verify exercise error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  searchExercises: async (req, res) => {
    try {
      const { search, category, difficulty, verified } = req.query;
      let query = {};

      // Apply filters
      if (category && category !== "") {
        query.category = category;
      }

      if (difficulty && difficulty !== "") {
        query.difficulty = difficulty;
      }

      if (verified === "true") {
        query.verified = true;
      } else if (verified === "false") {
        query.verified = false;
      }

      // Apply search - MORE PRECISE
      if (search && search.trim() !== "") {
        const searchRegex = new RegExp(`^${search}$`, "i"); // Exact match

        // Define categories list
        const categories = [
          "calisthenics",
          "weight loss",
          "hiit",
          "strength training",
          "cardio",
          "flexibility",
          "bodybuilding",
          "legs",
          "full body",
          "plyometrics",
        ];
        const muscleGroups = [
          "chest",
          "back",
          "shoulders",
          "triceps",
          "biceps",
          "legs",
          "quadriceps",
          "hamstrings",
          "glutes",
          "abs",
          "core",
          "cardio",
        ];

        if (muscleGroups.includes(search.toLowerCase())) {
          // Search in muscle fields
          query.$or = [
            { primaryMuscle: searchRegex },
            { targetMuscles: { $in: [searchRegex] } },
          ];
        } else if (categories.includes(search.toLowerCase())) {
          // Search in category field only
          query.category = searchRegex;
        } else {
          // Search in name only
          query.name = searchRegex;
        }
      }

      const exercises = await Exercise.find(query).sort({ name: 1 });

      res.json({
        success: true,
        exercises,
      });
    } catch (error) {
      console.error("Search exercises error:", error);
      res.status(500).json({
        success: false,
        message: "Error searching exercises",
      });
    }
  },
  // Verifier Management
  getVerifiers: async (req, res) => {
    try {
      // Get all verifiers
      const verifiers = await Verifier.find().sort({ createdAt: -1 });
      const totalVerifiers = verifiers.length;

      // Calculate verifier statistics
      const pendingVerifiers = verifiers.filter(
        (v) => v.status === "Pending" || !v.status,
      ).length;
      const approvedVerifiers = verifiers.filter(
        (v) => v.status === "Approved",
      ).length;
      const rejectedVerifiers = verifiers.filter(
        (v) => v.status === "Rejected",
      ).length;

      // Transform verifiers to include all required fields
      const transformedVerifiers = verifiers.map((v) => ({
        _id: v._id,
        name: v.name || "Unknown",
        email: v.email || "No email",
        phone: v.phone || "No phone",
        specialization: v.specialization || "Not specified",
        certifications: v.certifications || [],
        experienceYears: v.experienceYears || 0,
        status: v.status || "Pending",
        createdAt: v.createdAt,
      }));

      // Return JSON response
      res.json({
        success: true,
        verifiers: transformedVerifiers,
        stats: {
          totalVerifiers,
          pendingReview: pendingVerifiers,
          approvedVerifiers,
          rejectedVerifiers,
        },
      });
    } catch (error) {
      console.error("Verifier management error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching verifiers",
        verifiers: [],
        stats: {
          totalVerifiers: 0,
          pendingReview: 0,
          approvedVerifiers: 0,
          rejectedVerifiers: 0,
        },
      });
    }
  },

  createVerifier: async (req, res) => {
    try {
      const { name, email, password, phone, experienceYears } = req.body;

      // Keep only essential fields required from client payload.
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: name, email, and password are required",
          missing: {
            name: !name,
            email: !email,
            phone: false,
            experienceYears: false,
            password: !password,
          },
        });
      }

      const existingVerifier = await Verifier.findOne({ email });
      if (existingVerifier) {
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
      }

      const parsedExperienceYears = Number.parseInt(experienceYears, 10);
      const finalExperienceYears =
        Number.isFinite(parsedExperienceYears) && parsedExperienceYears > 0
          ? parsedExperienceYears
          : 1;

      const hashedPassword = await bcrypt.hash(password, 10);
      const newVerifier = new Verifier({
        name,
        email,
        password: hashedPassword,
        phone,
        experienceYears: finalExperienceYears,
      });

      await newVerifier.save();

      // console.log('Verifier created successfully:', { name, email });

      res.status(201).json({
        success: true,
        message: "Verifier created successfully",
        verifier: {
          id: newVerifier._id,
          name: newVerifier.name,
          email: newVerifier.email,
        },
      });
    } catch (error) {
      console.error("Create verifier error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  updateVerifier: async (req, res) => {
    try {
      const verifierId = req.params.id;
      const { name, email, phone } = req.body;
      const updatedVerifier = await Verifier.findByIdAndUpdate(
        verifierId,
        {
          name,
          email,
          phone,
        },
        { new: true },
      );
      if (!updatedVerifier) {
        return res
          .status(404)
          .json({ success: false, message: "Verifier not found" });
      }
      res.status(200).json({
        success: true,
        message: "Verifier updated successfully",
        verifier: updatedVerifier,
      });
    } catch (error) {
      console.error("Update verifier error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  deleteVerifier: async (req, res) => {
    try {
      const verifierId = req.params.id;
      const deletedVerifier = await Verifier.findByIdAndDelete(verifierId);
      if (!deletedVerifier) {
        return res
          .status(404)
          .json({ success: false, message: "Verifier not found" });
      }
      res
        .status(200)
        .json({ success: true, message: "Verifier deleted successfully" });
    } catch (error) {
      console.error("Delete verifier error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  approveVerifier: async (req, res) => {
    try {
      const verifierId = req.params.id;
      const updatedVerifier = await Verifier.findByIdAndUpdate(
        verifierId,
        { status: "Approved" },
        { new: true },
      );
      if (!updatedVerifier) {
        return res
          .status(404)
          .json({ success: false, message: "Verifier not found" });
      }
      res.status(200).json({
        success: true,
        message: "Verifier approved successfully",
        verifier: updatedVerifier,
      });
    } catch (error) {
      console.error("Approve verifier error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  rejectVerifier: async (req, res) => {
    try {
      const verifierId = req.params.id;
      const updatedVerifier = await Verifier.findByIdAndUpdate(
        verifierId,
        { status: "Rejected" },
        { new: true },
      );
      if (!updatedVerifier) {
        return res
          .status(404)
          .json({ success: false, message: "Verifier not found" });
      }
      res.status(200).json({
        success: true,
        message: "Verifier rejected successfully",
        verifier: updatedVerifier,
      });
    } catch (error) {
      console.error("Reject verifier error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // Get Trainer Statistics API
  getTrainerStats: async (req, res) => {
    try {
      // Total active trainers
      const totalTrainers = await Trainer.countDocuments({ status: "Active" });

      // Calculate revenue using User model
      const users = await User.find({ status: "Active" });
      let revenue = 0;
      const prices = {
        basic: 299,
        gold: 599,
        platinum: 999,
      };
      users.forEach((user) => {
        const remainingMonths = user.membershipDuration.months_remaining || 0;
        const price = prices[user.membershipType.toLowerCase()] || 0;
        revenue += remainingMonths * price;
      });

      // Count unique specializations using aggregation
      const specializationResult = await Trainer.aggregate([
        { $unwind: "$specializations" },
        { $group: { _id: "$specializations" } },
        { $count: "uniqueCount" },
      ]);
      const specializationCount =
        specializationResult.length > 0
          ? specializationResult[0].uniqueCount
          : 0;

      // Count pending trainer applications
      const pendingApprovals = await TrainerApplication.countDocuments({
        status: "Pending",
      });

      res.json({
        success: true,
        stats: {
          totalTrainers,
          revenue,
          specializationCount,
          pendingApprovals,
        },
      });
    } catch (error) {
      console.error("Get trainer stats error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Search Trainers API
  // Search Trainers API - Updated to include Experience and Status
  searchTrainers: async (req, res) => {
    try {
      const { search } = req.query;
      let query = {};

      // Build search query
      if (search && search.trim() !== "") {
        const searchRegex = new RegExp(search, "i");

        // Handle experience range searches (e.g., "3-5", "5-10", "10+")
        let experienceQuery = {};
        if (search.match(/^\d+-\d+$/) || search === "10+") {
          experienceQuery = { experience: searchRegex };
        }

        query = {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { specializations: { $in: [searchRegex] } },
            { status: searchRegex },
            { experience: searchRegex },
            ...(Object.keys(experienceQuery).length > 0
              ? [experienceQuery]
              : []),
          ],
        };
      }

      const trainers = await Trainer.find(query)
        .select("name email experience specializations status meetingLink")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        trainers,
      });
    } catch (error) {
      console.error("Search trainers error:", error);
      res.status(500).json({
        success: false,
        message: "Error searching trainers",
      });
    }
  },

  // Trainer Applications Management
  getTrainerApplications: async (req, res) => {
    try {
      const applications = await TrainerApplication.find().sort({
        createdAt: -1,
      });
      const totalApplications = applications.length;
      const pendingApplications = applications.filter(
        (a) => a.status === "Pending",
      ).length;
      const approvedApplications = applications.filter(
        (a) => a.status === "Approved",
      ).length;
      const rejectedApplications = applications.filter(
        (a) => a.status === "Rejected",
      ).length;

      // Transform applications for frontend
      const transformedApplications = applications.map((app) => ({
        _id: app._id,
        name: `${app.firstName} ${app.lastName}`,
        firstName: app.firstName,
        lastName: app.lastName,
        email: app.email,
        phone: app.phone,
        experience: app.experience,
        specializations: app.specializations || [],
        status: app.status || "Pending",
        createdAt: app.createdAt,
        verificationNotes: app.verificationNotes || "",
      }));

      res.json({
        success: true,
        applications: transformedApplications,
        stats: {
          totalApplications,
          pendingApplications,
          approvedApplications,
          rejectedApplications,
        },
      });
    } catch (error) {
      console.error("Trainer applications error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching trainer applications",
        applications: [],
        stats: {
          totalApplications: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0,
        },
      });
    }
  },

  approveTrainerApplication: async (req, res) => {
    try {
      const applicationId = req.params.id;
      console.log("Approving trainer application:", applicationId);

      const application = await TrainerApplication.findById(applicationId);

      if (!application) {
        return res
          .status(404)
          .json({ success: false, message: "Application not found" });
      }

      console.log("Found application:", application);

      // Create a new Trainer record from the approved application
      const newTrainer = new Trainer({
        name: `${application.firstName} ${application.lastName}`,
        email: application.email,
        password_hash: application.password_hash,
        phone: application.phone,
        experience: application.experience,
        specializations: application.specializations || [],
        status: "Active",
        rating: 0,
        clients: [],
        sessions: [],
        workoutPlans: [],
        nutritionPlans: [],
      });

      console.log("Created new trainer object:", newTrainer);

      const savedTrainer = await newTrainer.save();
      console.log("Saved trainer:", savedTrainer);

      // Update the application status
      application.status = "Approved";
      const savedApplication = await application.save();
      console.log("Updated application status:", savedApplication);

      res.json({
        success: true,
        message: "Trainer application approved successfully",
        trainer: savedTrainer,
        application: savedApplication,
      });
    } catch (error) {
      console.error("Approve trainer application error:", error);
      res.status(500).json({
        success: false,
        message: "Error approving trainer application",
        error: error.message,
      });
    }
  },

  rejectTrainerApplication: async (req, res) => {
    try {
      const applicationId = req.params.id;
      const { reason } = req.body;

      const application = await TrainerApplication.findByIdAndUpdate(
        applicationId,
        {
          status: "Rejected",
          verificationNotes: reason || "Application rejected by admin",
        },
        { new: true },
      );

      if (!application) {
        return res
          .status(404)
          .json({ success: false, message: "Application not found" });
      }

      res.json({
        success: true,
        message: "Trainer application rejected successfully",
        application,
      });
    } catch (error) {
      console.error("Reject trainer application error:", error);
      res.status(500).json({
        success: false,
        message: "Error rejecting trainer application",
      });
    }
  },
};

// ============ RATINGS INTELLIGENCE ============

// Get top rated exercises
const getTopRatedExercises = async (req, res) => {
  try {
    const { limit = 10, category } = req.query;

    let query = { verified: true, totalRatings: { $gt: 0 } };
    if (category) {
      query.category = category;
    }

    const exercises = await Exercise.find(query)
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(parseInt(limit))
      .select(
        "name category difficulty averageRating totalRatings primaryMuscle image",
      );

    // Get category averages for comparison
    const categoryAverages = await Exercise.aggregate([
      { $match: { verified: true, totalRatings: { $gt: 0 } } },
      {
        $group: {
          _id: "$category",
          avgRating: { $avg: "$averageRating" },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1 } },
    ]);

    res.json({
      success: true,
      exercises,
      categoryAverages,
    });
  } catch (error) {
    console.error("Get top rated exercises error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching top exercises" });
  }
};

// Get trainer ratings leaderboard
const getTrainerRatingLeaderboard = async (req, res) => {
  try {
    const minReviews = Number.parseInt(req.query.minReviews, 10);
    const limit = Number.parseInt(req.query.limit, 10);
    const minReviewsValue = Number.isFinite(minReviews) ? minReviews : 0;
    const limitValue = Number.isFinite(limit) && limit > 0 ? limit : 20;

    const trainers = await Trainer.aggregate([
      {
        $lookup: {
          from: "trainerreviews",
          localField: "_id",
          foreignField: "trainerId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          computedAvgRating: { $avg: "$reviews.rating" },
          reviewCount: { $size: "$reviews" },
          // Fall back to trainer.rating when no review docs exist yet.
          avgRating: { $ifNull: [{ $avg: "$reviews.rating" }, "$rating"] },
          // Count flagged reviews
          flaggedReviews: {
            $size: {
              $filter: {
                input: "$reviews",
                as: "review",
                cond: { $eq: ["$$review.flaggedForReassignment", true] },
              },
            },
          },
        },
      },
      {
        $match: {
          reviewCount: { $gte: minReviewsValue },
          avgRating: { $ne: null },
        },
      },
      {
        $sort: { avgRating: -1, reviewCount: -1 },
      },
      {
        $limit: limitValue,
      },
      {
        $addFields: {
          activeClients: {
            $size: {
              $filter: {
                input: { $ifNull: ["$clients", []] },
                as: "client",
                cond: "$$client.isActive",
              },
            },
          },
          isAvailable: {
            $lt: [
              {
                $size: {
                  $filter: {
                    input: { $ifNull: ["$clients", []] },
                    as: "client",
                    cond: "$$client.isActive",
                  },
                },
              },
              { $ifNull: ["$maxClients", 20] },
            ],
          },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          specializations: 1,
          avgRating: { $round: ["$avgRating", 1] },
          profileRating: "$rating",
          reviewCount: 1,
          flaggedReviews: 1,
          status: 1,
          totalClients: 1,
          activeClients: 1,
          maxClients: 1,
          isAvailable: 1,
        },
      },
    ]);

    // Get poorly rated trainers (for reassignment)
    const poorlyRatedTrainers = await Trainer.aggregate([
      {
        $lookup: {
          from: "trainerreviews",
          localField: "_id",
          foreignField: "trainerId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          avgRating: { $ifNull: [{ $avg: "$reviews.rating" }, "$rating"] },
          reviewCount: { $size: "$reviews" },
        },
      },
      {
        $match: {
          reviewCount: { $gte: 3 },
          avgRating: { $lt: 3.0 },
        },
      },
      {
        $sort: { avgRating: 1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          name: 1,
          email: 1,
          specializations: 1,
          avgRating: { $round: ["$avgRating", 1] },
          reviewCount: 1,
          totalClients: 1,
        },
      },
    ]);

    res.json({
      success: true,
      leaderboard: trainers,
      poorlyRated: poorlyRatedTrainers,
    });
  } catch (error) {
    console.error("Get trainer leaderboard error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching trainer ratings" });
  }
};

// Get reviews for a specific trainer
const getTrainerReviews = async (req, res) => {
  try {
    const { trainerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid trainer ID format" });
    }

    const trainerExists = await Trainer.exists({ _id: trainerId });
    if (!trainerExists) {
      return res
        .status(404)
        .json({ success: false, message: "Trainer not found" });
    }

    const reviews = await TrainerReview.find({ trainerId })
      .populate("userId", "full_name email")
      .sort({ reviewedAt: -1 })
      .lean();

    // Calculate average
    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1)
        : 0;

    res.json({
      success: true,
      reviews,
      stats: {
        total: reviews.length,
        average: avgRating,
        flagged: reviews.filter((r) => r.flaggedForReassignment).length,
      },
    });
  } catch (error) {
    console.error("Get trainer reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

// Flag a review for reassignment
const flagReviewForReassignment = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await TrainerReview.findByIdAndUpdate(
      reviewId,
      {
        flaggedForReassignment: true,
        "reassignedBy.managerId": req.user._id,
        // Keep this null until reassignment is actually completed.
        "reassignedBy.reassignedAt": null,
      },
      { new: true },
    );

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    res.json({
      success: true,
      message: "Review flagged for reassignment",
      review,
    });
  } catch (error) {
    console.error("Flag review error:", error);
    res.status(500).json({ success: false, message: "Error flagging review" });
  }
};

// ============ TRAINER REASSIGNMENT ============

// Get poorly rated trainers with their clients
const getPoorlyRatedTrainers = async (req, res) => {
  try {
    const { minRating = 3.0, minReviews = 3 } = req.query;

    const poorlyRatedTrainers = await Trainer.aggregate([
      {
        $lookup: {
          from: "trainerreviews",
          localField: "_id",
          foreignField: "trainerId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          avgRating: { $avg: "$reviews.rating" },
          reviewCount: { $size: "$reviews" },
          flaggedReviews: {
            $size: {
              $filter: {
                input: "$reviews",
                as: "review",
                cond: { $eq: ["$$review.flaggedForReassignment", true] },
              },
            },
          },
        },
      },
      {
        $match: {
          reviewCount: { $gte: parseInt(minReviews) },
          avgRating: { $lt: parseFloat(minRating) },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "clients.userId",
          foreignField: "_id",
          as: "clientDetails",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          specializations: 1,
          avgRating: { $round: ["$avgRating", 1] },
          reviewCount: 1,
          flaggedReviews: 1,
          totalClients: 1,
          clientDetails: {
            _id: 1,
            full_name: 1,
            email: 1,
            workout_type: 1,
            membershipType: 1,
          },
        },
      },
      { $sort: { avgRating: 1 } },
    ]);

    res.json({
      success: true,
      trainers: poorlyRatedTrainers,
    });
  } catch (error) {
    console.error("Get poorly rated trainers error:", error);
    res.status(500).json({ success: false, message: "Error fetching data" });
  }
};

// Get potential alternative trainers for a user
const getPotentialTrainersForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find active trainers with matching specializations and available slots
    const potentialTrainers = await Trainer.aggregate([
      {
        $match: {
          status: "Active",
          _id: { $ne: user.trainer }, // Exclude current trainer
        },
      },
      {
        $lookup: {
          from: "trainerreviews",
          localField: "_id",
          foreignField: "trainerId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          avgRating: { $avg: "$reviews.rating" },
          reviewCount: { $size: "$reviews" },
          activeClients: {
            $size: {
              $filter: {
                input: "$clients",
                as: "client",
                cond: { $eq: ["$$client.isActive", true] },
              },
            },
          },
        },
      },
      {
        $match: {
          activeClients: { $lt: "$maxClients" }, // Has available slots
        },
      },
      {
        $addFields: {
          specializationMatch: {
            $cond: {
              if: {
                $and: [
                  { $ifNull: [user.workout_type, false] },
                  { $in: [user.workout_type, "$specializations"] },
                ],
              },
              then: 2, // Higher score for exact match
              else: 1,
            },
          },
        },
      },
      {
        $sort: {
          specializationMatch: -1,
          avgRating: -1,
          reviewCount: -1,
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          specializations: 1,
          avgRating: { $round: ["$avgRating", 1] },
          reviewCount: 1,
          activeClients: 1,
          maxClients: 1,
          experience: 1,
        },
      },
    ]);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.full_name,
        workout_type: user.workout_type,
        currentTrainer: user.trainer,
      },
      potentialTrainers,
    });
  } catch (error) {
    console.error("Get potential trainers error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching potential trainers" });
  }
};

// Reassign user to a new trainer
const reassignUserToTrainer = async (req, res) => {
  try {
    const { userId, newTrainerId, reason } = req.body;

    if (!userId || !newTrainerId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Get user and trainers
    const user = await User.findById(userId);
    const oldTrainer = user.trainer
      ? await Trainer.findById(user.trainer)
      : null;
    const newTrainer = await Trainer.findById(newTrainerId);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (!newTrainer)
      return res
        .status(404)
        .json({ success: false, message: "New trainer not found" });

    // Check if new trainer has capacity
    const activeClients =
      newTrainer.clients?.filter((c) => c.isActive).length || 0;
    if (activeClients >= newTrainer.maxClients) {
      return res.status(400).json({
        success: false,
        message: "Trainer has reached maximum client capacity",
      });
    }

    // Remove user from old trainer's clients list
    if (oldTrainer) {
      oldTrainer.clients = oldTrainer.clients.filter(
        (c) => c.userId.toString() !== userId.toString(),
      );
      await oldTrainer.save();
    }

    // Add user to new trainer's clients list
    if (!newTrainer.clients) newTrainer.clients = [];
    newTrainer.clients.push({
      userId: user._id,
      joinedAt: new Date(),
      isActive: true,
    });
    await newTrainer.save();

    // Update user's trainer
    user.trainer = newTrainerId;
    await user.save();

    // Log the reassignment in a review if reason provided
    if (reason) {
      // Find any flagged review for this user-trainer pair
      await TrainerReview.updateMany(
        {
          userId: user._id,
          trainerId: oldTrainer?._id,
          flaggedForReassignment: true,
        },
        {
          $set: {
            "reassignedBy.managerId": req.user._id,
            "reassignedBy.reassignedAt": new Date(),
            "reassignedBy.reason": reason,
          },
        },
      );
    }

    res.json({
      success: true,
      message: "User reassigned successfully",
      data: {
        user: user.full_name,
        oldTrainer: oldTrainer?.name || "None",
        newTrainer: newTrainer.name,
      },
    });
  } catch (error) {
    console.error("Reassign user error:", error);
    res.status(500).json({ success: false, message: "Error reassigning user" });
  }
};

// Get pending reassignment flags
const getPendingReassignmentFlags = async (req, res) => {
  try {
    const flaggedReviews = await TrainerReview.find({
      flaggedForReassignment: true,
      "reassignedBy.reassignedAt": null,
    })
      .populate("userId", "full_name email")
      .populate("trainerId", "name email")
      .sort({ reviewedAt: -1 });

    res.json({
      success: true,
      count: flaggedReviews.length,
      flags: flaggedReviews,
    });
  } catch (error) {
    console.error("Get pending flags error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching pending flags" });
  }
};

// ============ TRAINER CHANGE REQUESTS ============
const getTrainerChangeRequests = async (req, res) => {
  try {
    const users = await User.find({
      "trainer_change_request.requested": true,
    })
      .populate("trainer", "name email specializations")
      .select(
        "full_name email membershipType trainer trainer_change_request workout_type",
      )
      .sort({ "trainer_change_request.requestedAt": -1 });

    res.json({
      success: true,
      count: users.length,
      requests: users.map((u) => ({
        userId: u._id,
        userName: u.full_name,
        userEmail: u.email,
        membershipType: u.membershipType,
        workoutType: u.workout_type,
        currentTrainer: u.trainer
          ? {
              _id: u.trainer._id,
              name: u.trainer.name,
              email: u.trainer.email,
              specializations: u.trainer.specializations,
            }
          : null,
        reason: u.trainer_change_request?.reason || "",
        requestedAt: u.trainer_change_request?.requestedAt,
      })),
    });
  } catch (error) {
    console.error("Get trainer change requests error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching change requests" });
  }
};

const resolveTrainerChangeRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, newTrainerId } = req.body; // action: 'approve' | 'reject'

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.trainer_change_request?.requested) {
      return res.status(400).json({
        success: false,
        message: "No pending change request for this user",
      });
    }

    if (action === "approve") {
      if (!newTrainerId) {
        return res.status(400).json({
          success: false,
          message: "New trainer ID is required for approval",
        });
      }

      const newTrainer = await Trainer.findById(newTrainerId);
      if (!newTrainer) {
        return res
          .status(404)
          .json({ success: false, message: "New trainer not found" });
      }

      // Remove user from old trainer's client list
      if (user.trainer) {
        const oldTrainer = await Trainer.findById(user.trainer);
        if (oldTrainer) {
          oldTrainer.clients = oldTrainer.clients.filter(
            (c) => c.toString() !== userId.toString(),
          );
          await oldTrainer.save();
        }
      }

      // Assign new trainer
      user.trainer = newTrainerId;

      // Add to new trainer's client list
      if (!newTrainer.clients.includes(userId)) {
        newTrainer.clients.push(userId);
        await newTrainer.save();
      }

      // Resolve the change request
      user.trainer_change_request = {
        requested: false,
        reason: user.trainer_change_request.reason,
        requestedAt: user.trainer_change_request.requestedAt,
        resolvedAt: new Date(),
        resolvedBy: req.user ? req.user._id : null,
      };

      await user.save();

      res.json({
        success: true,
        message: `Trainer changed successfully. ${user.full_name} is now assigned to ${newTrainer.name}.`,
      });
    } else if (action === "reject") {
      // Just clear the request
      user.trainer_change_request = {
        requested: false,
        reason: user.trainer_change_request.reason,
        requestedAt: user.trainer_change_request.requestedAt,
        resolvedAt: new Date(),
        resolvedBy: req.user ? req.user._id : null,
      };

      await user.save();

      res.json({
        success: true,
        message: `Trainer change request for ${user.full_name} has been rejected.`,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "reject".',
      });
    }
  } catch (error) {
    console.error("Resolve trainer change request error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error resolving change request" });
  }
};

module.exports = {
  ...adminController,
  ...adminAuthController,
  seedAdmin,
  getTopRatedExercises,
  getTrainerRatingLeaderboard,
  getTrainerReviews,
  flagReviewForReassignment,
  getPoorlyRatedTrainers,
  getPotentialTrainersForUser,
  reassignUserToTrainer,
  getPendingReassignmentFlags,
  getTrainerChangeRequests,
  resolveTrainerChangeRequest,
};
