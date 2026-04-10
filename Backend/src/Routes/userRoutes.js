const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const membershipController = require("../controllers/membershipController");
const NutritionHistory = require("../model/NutritionHistory");
const WorkoutHistory = require("../model/WorkoutHistory");
const User = require("../model/User");
const { protect } = require("../middleware/authMiddleware");

router.get('/api/exercise/progress', protect, userController.getUserProgressGraph);

// Existing EJS routes (keep these for now)
router.get("/login_signup", (req, res) => {
  res.render("login_signup", { form: req.query.form || "login" });
});

// ========== NEW JSON API ENDPOINTS FOR REACT ==========

// Get user profile data
router.get("/api/user/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("trainer", "name email specializations experience clients maxClients status") 
      .select("-password_hash");

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        membershipType: user.membershipType,
        membershipDuration: user.membershipDuration,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// User Module Feature Routes
router.get('/api/user/purchases', protect, userController.getPurchaseHistory);
router.post('/api/user/trainer/rate', protect, userController.rateTrainer);
router.post('/api/user/trainer/change', protect, userController.requestTrainerChange);
router.put('/api/user/password', protect, userController.changePassword);
router.delete('/api/user/account', protect, userController.deleteAccount);

// Get today's workout data
router.get("/api/workout/today", protect, userController.checkMembershipActive, async (req, res) => {
  try {
    const userId = req.user._id; 
    const todayWorkoutData = await userController.getTodaysWorkout(userId);

    res.json({
      success: true,
      ...todayWorkoutData,
    });
  } catch (error) {
    console.error("Error fetching today workout:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ==========================================
// 🍏 NUTRITION ROUTES (TIMEZONE FIXED)
// ==========================================

// 1. Get today's nutrition data (THIS WAS MISSING!)
router.get("/api/nutrition/today", protect, userController.checkMembershipActive, async (req, res) => {
  try {
    const userId = req.user._id;
    const todaysConsumedFoods = await userController.getTodaysFoods(userId);
    const user = await User.findById(userId);

    // === Force Timezone (Asia/Kolkata) ===
    const today = new Date();
    const localDate = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const todayDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][localDate.getDay()];
    
    // FETCH LATEST PLAN
    const weeklyNutrition = await NutritionHistory.findOne({
      userId: userId
    }).sort({ date: -1 });

    let todayNutrition = {
      calories_consumed: 0,
      protein_consumed: 0,
      calorie_goal: user.fitness_goals?.calorie_goal || 2200,
      protein_goal: user.fitness_goals?.protein_goal || 90,
      macros: { protein: 0, carbs: 0, fats: 0 }
    };

    if (weeklyNutrition) {
      const todayData = weeklyNutrition.daily_nutrition[todayDayName];

      if (todayData) {
        todayNutrition = {
          calories_consumed: todayData.calories_consumed || 0,
          protein_consumed: todayData.protein_consumed || 0,
          calorie_goal: weeklyNutrition.calorie_goal || user.fitness_goals?.calorie_goal || 2200,
          protein_goal: weeklyNutrition.protein_goal || user.fitness_goals?.protein_goal || 90,
          macros: todayData.macros || { protein: 0, carbs: 0, fats: 0 },
        };
      }
    }

    res.json({
      success: true,
      todayNutrition,
      todaysConsumedFoods,
    });
  } catch (error) {
    console.error("Error fetching today nutrition:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// 2. Nutrition mark consumed
router.post(
  "/api/nutrition/mark-consumed",
  protect,                                  
  userController.checkMembershipActive,     
  async (req, res) => {
    try {
      const { foodName, calories, protein, carbs, fats, day } = req.body;
      const userId = req.user._id;

      // === Force Timezone (Asia/Kolkata) ===
      const today = new Date();
      const localDate = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const currentDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][localDate.getDay()];

      // FETCH LATEST PLAN
      let nutritionEntry = await NutritionHistory.findOne({
        userId: userId
      }).sort({ date: -1 });

      if (!nutritionEntry) {
        return res.status(404).json({
          success: false,
          message: "No nutrition plan found",
        });
      }

      const targetDay = day || currentDayName;
        
      const dayData = nutritionEntry.daily_nutrition[targetDay];

      if (!dayData) {
        return res.status(400).json({
          success: false,
          message: "Day not found in nutrition plan: " + targetDay,
        });
      }

      const foodIndex = dayData.foods.findIndex(
        (food) => food.name === foodName && food.consumed === false
      );

      if (foodIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Food not found or already consumed: " + foodName,
        });
      }

      // Mark as consumed
      dayData.foods[foodIndex].consumed = true;
      dayData.foods[foodIndex].consumedAt = new Date();

      // Safely parse numbers
      const parsedCalories = parseInt(calories) || 0;
      const parsedProtein = parseInt(protein) || 0;
      const parsedCarbs = parseInt(carbs) || 0;
      const parsedFats = parseInt(fats) || 0;

      dayData.calories_consumed = (dayData.calories_consumed || 0) + parsedCalories;
      dayData.protein_consumed = (dayData.protein_consumed || 0) + parsedProtein;

      if (!dayData.macros) {
          dayData.macros = { protein: 0, carbs: 0, fats: 0 };
      }

      dayData.macros.protein = (dayData.macros.protein || 0) + parsedProtein;
      dayData.macros.carbs = (dayData.macros.carbs || 0) + parsedCarbs;
      dayData.macros.fats = (dayData.macros.fats || 0) + parsedFats;

      nutritionEntry.markModified("daily_nutrition");
      await nutritionEntry.save();

      res.json({
        success: true,
        message: "Food marked as consumed successfully",
        updatedNutrition: {
          calories_consumed: dayData.calories_consumed,
          protein_consumed: dayData.protein_consumed,
          calorie_goal: nutritionEntry.calorie_goal,
          protein_goal: nutritionEntry.protein_goal,
        },
      });
    } catch (error) {
      console.error("Error marking food as consumed:", error);
      res.status(500).json({
        success: false,
        message: "Error marking food as consumed: " + error.message,
      });
    }
  }
);

// Update user profile API route
router.put('/api/user/profile', protect, userController.updateUserProfile);

// Get weekly workout stats
router.get('/api/workout/weekly-stats', protect, userController.checkMembershipActive, userController.getWorkoutStats);

// Get exercise progress data
router.get("/api/exercise/progress", protect, userController.checkMembershipActive, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all workout history to find max weights
    const allWorkouts = await WorkoutHistory.find({ userId: userId });

    const exerciseMaxWeights = {
      "Bench Press": 0,
      Squat: 0,
      Deadlift: 0,
    };

    allWorkouts.forEach((workout) => {
      if (workout.exercises && workout.exercises.length > 0) {
        workout.exercises.forEach((exercise) => {
          const exerciseName = exercise.name.toLowerCase();
          const weight = exercise.weight || 0;

          if (
            exerciseName.includes("bench") ||
            exerciseName.includes("press")
          ) {
            if (weight > exerciseMaxWeights["Bench Press"]) {
              exerciseMaxWeights["Bench Press"] = weight;
            }
          } else if (exerciseName.includes("squat")) {
            if (weight > exerciseMaxWeights["Squat"]) {
              exerciseMaxWeights["Squat"] = weight;
            }
          } else if (exerciseName.includes("deadlift")) {
            if (weight > exerciseMaxWeights["Deadlift"]) {
              exerciseMaxWeights["Deadlift"] = weight;
            }
          }
        });
      }
    });

    const exerciseProgress = [
      {
        name: "Bench Press",
        progress:
          exerciseMaxWeights["Bench Press"] > 0
            ? Math.round((exerciseMaxWeights["Bench Press"] / 100) * 100)
            : 0,
        currentWeight: exerciseMaxWeights["Bench Press"],
        goalWeight: 100,
      },
      {
        name: "Squat",
        progress:
          exerciseMaxWeights["Squat"] > 0
            ? Math.round((exerciseMaxWeights["Squat"] / 120) * 100)
            : 0,
        currentWeight: exerciseMaxWeights["Squat"],
        goalWeight: 120,
      },
      {
        name: "Deadlift",
        progress:
          exerciseMaxWeights["Deadlift"] > 0
            ? Math.round((exerciseMaxWeights["Deadlift"] / 130) * 100)
            : 0,
        currentWeight: exerciseMaxWeights["Deadlift"],
        goalWeight: 130,
      },
    ];

    res.json({
      success: true,
      exerciseProgress,
    });
  } catch (error) {
    console.error("Error fetching exercise progress:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Get upcoming class
router.get("/api/class/upcoming", protect, userController.checkMembershipActive, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate(
      "class_schedules.trainerId",
      "name"
    );

    const upcomingClass =
      user.class_schedules && user.class_schedules.length > 0
        ? user.class_schedules
            .filter((cls) => {
              const classDate = new Date(cls.date);
              const now = new Date();
              return classDate >= now;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))[0]
        : null;

    // Format class data
    const formattedClass = upcomingClass
      ? {
          ...upcomingClass.toObject(),
          trainerName: upcomingClass.trainerId?.name || "Coach",
        }
      : null;

    res.json({
      success: true,
      upcomingClass: formattedClass,
    });
  } catch (error) {
    console.error("Error fetching upcoming class:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ========== EXISTING ROUTES (KEEP THESE) ==========

router.post("/signup", userController.signupUser);
router.get("/profile", userController.getUserProfile);
router.post("/complete-workout", userController.completeWorkout);
router.post("/api/workout/complete", protect, userController.markWorkoutCompleted);
router.post('/api/exercise/complete', protect, userController.checkMembershipActive, userController.markExerciseCompleted);

// Debug routes
router.get("/api/debug/workout/:id", async (req, res) => {
  try {
    const workout = await WorkoutHistory.findById(req.params.id);
    res.json({
      workout: workout,
      exercises: workout?.exercises?.map((ex) => ({
        name: ex.name,
        completed: ex.completed,
        _id: ex._id,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/api/debug/workouts",
  protect,
  userController.checkMembershipActive,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const workouts = await WorkoutHistory.find({ userId: userId });

      const today = new Date();
      const todayDayName = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][today.getUTCDay()];

      res.json({
        userId: userId,
        today: todayDayName,
        totalWorkouts: workouts.length,
        workouts: workouts.map((w) => ({
          id: w._id,
          date: w.date,
          exercises: w.exercises
            ? w.exercises.map((e) => ({
                name: e.name,
                day: e.day,
                completed: e.completed,
              }))
            : [],
          exercisesForToday: w.exercises
            ? w.exercises.filter((e) => e.day === todayDayName)
            : [],
        })),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Membership routes
router.post('/api/membership/extend', protect, membershipController.extendMembership);
router.get("/membership/status", membershipController.getMembershipStatus);
router.post("/membership/auto-renew", membershipController.toggleAutoRenew);
router.post("/user/membership/change", protect, userController.changeMembership);

router.get("/membership_renewal", protect, (req, res) => {
  res.render("membership_renewal", {
    user: req.user,
  });
});

// Page routes
router.get(
  "/user_nutrition",
  protect,
  userController.checkMembershipActive,
  (req, res) => {
    res.render("user_nutrition", {
      user: req.user,
      currentPage: "nutrition",
    });
  }
);

router.get(
  "/user_exercises",
  protect,
  userController.checkMembershipActive,
  async (req, res) => {
    try {
      const User = require("../model/User");
      const user = await User.findById(req.user._id);

      res.render("user_exercises", {
        user: {
          ...req.user,
          workout_type: user?.workout_type,
        },
        currentPage: "exercises",
      });
    } catch (error) {
      console.error("Error loading exercises page:", error);
      res.render("user_exercises", {
        user: req.user,
        currentPage: "exercises",
      });
    }
  }
);

const Exercise = require("../model/Exercise");
const UserExerciseRating = require("../model/UserExerciseRating");

// Get exercises based on user's workout type
router.get(
  "/api/exercises",
  protect,
  userController.checkMembershipActive,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const User = require("../model/User");
      const user = await User.findById(userId);

      let query = { verified: true };

      if (user && user.workout_type) {
        query.category = user.workout_type;
      }

      const exercises = await Exercise.find(query).sort({ name: 1 });

      const userRatings = await UserExerciseRating.find({
        userId: userId,
        exerciseId: { $in: exercises.map((ex) => ex._id) },
      });

      const ratingsMap = {};
      userRatings.forEach((rating) => {
        ratingsMap[rating.exerciseId.toString()] = rating.rating;
      });

      const exercisesWithRatings = exercises.map((exercise) => ({
        ...exercise.toObject(),
        userRating: ratingsMap[exercise._id.toString()] || null,
        hasRated: !!ratingsMap[exercise._id.toString()],
      }));

      res.json({
        success: true,
        exercises: exercisesWithRatings,
        userWorkoutType: user?.workout_type || "All",
      });
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching exercises" });
    }
  }
);

// Rate an exercise
router.post(
  "/api/exercises/:exerciseId/rate",
  protect,
  userController.checkMembershipActive,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { exerciseId } = req.params;
      const { rating, effectiveness, notes } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ success: false, message: "Rating must be between 1 and 5" });
      }

      const User = require("../model/User");
      const user = await User.findById(userId);
      const exercise = await Exercise.findById(exerciseId);

      if (!exercise) {
        return res
          .status(404)
          .json({ success: false, message: "Exercise not found" });
      }

      const userRating = await UserExerciseRating.findOneAndUpdate(
        { userId, exerciseId },
        {
          rating,
          effectiveness: effectiveness || "Neutral",
          notes: notes || "",
          workoutType: user?.workout_type || exercise.category,
        },
        { upsert: true, new: true }
      );

      const allRatings = await UserExerciseRating.find({ exerciseId });
      const averageRating =
        allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

      await Exercise.findByIdAndUpdate(exerciseId, {
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: allRatings.length,
      });

      if (rating >= 4) {
        await User.findByIdAndUpdate(userId, {
          $addToSet: {
            "exercisePreferences.preferredCategories": exercise.category,
            "exercisePreferences.favoriteExercises": {
              exerciseId: exercise._id,
              rating: rating,
            },
          },
          $set: { "exercisePreferences.lastRatedAt": new Date() },
        });
      }

      res.json({
        success: true,
        message: "Exercise rated successfully",
        rating: userRating,
        exercise: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings: allRatings.length,
        },
      });
    } catch (error) {
      console.error("Error rating exercise:", error);
      res
        .status(500)
        .json({ success: false, message: "Error rating exercise" });
    }
  }
);

// Get recommended exercises based on user ratings
router.get(
  "/api/exercises/recommended",
  protect,
  userController.checkMembershipActive,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const User = require("../model/User");
      const user = await User.findById(userId);
      const userWorkoutType = user?.workout_type;

      const highRatedExercises = await UserExerciseRating.find({
        userId,
        rating: { $gte: 4 },
      }).populate("exerciseId");

      let recommendedExercises = [];
      let reason = "";

      if (highRatedExercises.length > 0) {
        const validHighRatedExercises = highRatedExercises.filter(
          (r) => r.exerciseId !== null
        );

        const preferredCategories = [
          ...new Set(
            validHighRatedExercises
              .map((r) => r.exerciseId?.category)
              .filter(Boolean)
          ),
        ];
        const preferredMovementPatterns = [
          ...new Set(
            validHighRatedExercises
              .map((r) => r.exerciseId?.movementPattern)
              .filter(Boolean)
          ),
        ];
        const preferredPrimaryMuscles = [
          ...new Set(
            validHighRatedExercises
              .map((r) => r.exerciseId?.primaryMuscle)
              .filter(Boolean)
          ),
        ];

        recommendedExercises = await Exercise.find({
          verified: true,
          _id: { $nin: validHighRatedExercises.map((r) => r.exerciseId._id) },
          $or: [
            { category: { $in: preferredCategories } },
            { movementPattern: { $in: preferredMovementPatterns } },
            { primaryMuscle: { $in: preferredPrimaryMuscles } },
          ],
        }).limit(8);

        reason = "similar_to_your_high_rated_exercises";
      } else {
        const userWorkoutExercises = userWorkoutType
          ? await Exercise.find({
              verified: true,
              category: userWorkoutType,
            }).limit(4)
          : [];

        const otherCategoriesExercises = await Exercise.find({
          verified: true,
          category: { $ne: userWorkoutType }, 
        })
          .limit(4)
          .sort({ averageRating: -1, usageCount: -1 });

        recommendedExercises = [
          ...userWorkoutExercises,
          ...otherCategoriesExercises,
        ]
          .sort(() => Math.random() - 0.5) 
          .slice(0, 6); 

        reason = userWorkoutType
          ? `mix_of_${userWorkoutType.toLowerCase()}_and_popular_exercises`
          : "popular_exercises_from_all_categories";
      }

      if (recommendedExercises.length < 6) {
        const additionalExercises = await Exercise.find({
          verified: true,
          _id: { $nin: recommendedExercises.map((e) => e._id) },
        })
          .limit(6 - recommendedExercises.length)
          .sort({ averageRating: -1 });

        recommendedExercises = [
          ...recommendedExercises,
          ...additionalExercises,
        ];
      }

      if (userWorkoutType) {
        recommendedExercises.sort((a, b) => {
          const aIsUserType = a.category === userWorkoutType;
          const bIsUserType = b.category === userWorkoutType;

          if (aIsUserType && !bIsUserType) return -1;
          if (!aIsUserType && bIsUserType) return 1;

          return (b.averageRating || 0) - (a.averageRating || 0);
        });
      }

      res.json({
        success: true,
        exercises: recommendedExercises,
        reason: reason,
        userWorkoutType: userWorkoutType,
      });
    } catch (error) {
      console.error("Error fetching recommended exercises:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching recommendations" });
    }
  }
);


// Search exercises
router.get(
  "/api/exercises/search",
  protect,
  userController.checkMembershipActive,
  async (req, res) => {
    try {
      const { query } = req.query;
      const userId = req.user._id;

      if (!query || query.trim() === "") {
        return res.json({ success: true, exercises: [] });
      }

      const User = require("../model/User");
      const user = await User.findById(userId);

      let searchQuery = {
        verified: true,
        $or: [
          { name: { $regex: query, $options: "i" } },
          { targetMuscles: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
          { movementPattern: { $regex: query, $options: "i" } },
          { primaryMuscle: { $regex: query, $options: "i" } },
        ],
      };

      if (user && user.workout_type) {
        searchQuery.category = user.workout_type;
      }

      const exercises = await Exercise.find(searchQuery).limit(20);

      const userRatings = await UserExerciseRating.find({
        userId: userId,
        exerciseId: { $in: exercises.map((ex) => ex._id) },
      });

      const ratingsMap = {};
      userRatings.forEach((rating) => {
        ratingsMap[rating.exerciseId.toString()] = rating.rating;
      });

      const exercisesWithRatings = exercises.map((exercise) => ({
        ...exercise.toObject(),
        userRating: ratingsMap[exercise._id.toString()] || null,
      }));

      res.json({ success: true, exercises: exercisesWithRatings });
    } catch (error) {
      console.error("Error searching exercises:", error);
      res
        .status(500)
        .json({ success: false, message: "Error searching exercises" });
    }
  }
);

// Scheduling Routes
router.get('/trainer/:trainerId/availability', protect, userController.getTrainerAvailability);
router.post('/appointments/request', protect, userController.requestAppointment);
router.get('/appointments', protect, userController.getUserAppointments);

// Get exercise details
router.get(
  "/api/exercises/:exerciseId",
  protect,
  userController.checkMembershipActive,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { exerciseId } = req.params;

      const exercise = await Exercise.findById(exerciseId);
      if (!exercise) {
        return res
          .status(404)
          .json({ success: false, message: "Exercise not found" });
      }

      const userRating = await UserExerciseRating.findOne({
        userId,
        exerciseId,
      });

      const similarExercises = await Exercise.find({
        verified: true,
        _id: { $ne: exerciseId },
        $or: [
          { category: exercise.category },
          { movementPattern: exercise.movementPattern },
          { primaryMuscle: exercise.primaryMuscle },
        ],
      }).limit(4);

      res.json({
        success: true,
        exercise: {
          ...exercise.toObject(),
          userRating: userRating?.rating || null,
          userEffectiveness: userRating?.effectiveness || null,
          userNotes: userRating?.notes || null,
        },
        similarExercises,
      });
    } catch (error) {
      console.error("Error fetching exercise details:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching exercise details" });
    }
  }
);


module.exports = router;