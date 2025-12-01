import React, { useState } from "react";

const NutritionTracking = ({
  todaysConsumedFoods,
  todayNutrition,
  user,
  onFoodComplete,
}) => {
  const [consumedFoods, setConsumedFoods] = useState(
    todaysConsumedFoods.filter((food) => food.consumed)
  );

  const markFoodAsConsumed = async (
    foodName,
    calories,
    protein,
    carbs,
    fats
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to mark food as consumed");
        return;
      }

      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const today = new Date();
      const dayName = days[today.getDay()];

      const response = await fetch("/api/nutrition/mark-consumed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          foodName,
          calories,
          protein,
          carbs,
          fats,
          day: dayName,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const newFood = {
          name: foodName,
          calories,
          protein,
          carbs,
          fats,
          consumedAt: new Date(),
        };
        setConsumedFoods((prev) => [newFood, ...prev]);
        onFoodComplete();
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error marking food as consumed:", error);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-5 col-span-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Nutrition Tracking</h2>
      </div>

      {/* Food Completion Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-4">
          Today's Food Goals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todaysConsumedFoods && todaysConsumedFoods.length > 0 ? (
            todaysConsumedFoods.map((food, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between gap-4"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2">{food.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white/10 px-2 py-1 rounded text-xs text-gray-300">
                      {food.calories} kcal
                    </span>
                    <span className="bg-white/10 px-2 py-1 rounded text-xs text-gray-300">
                      {food.protein}g protein
                    </span>
                    {food.carbs && (
                      <span className="bg-white/10 px-2 py-1 rounded text-xs text-gray-300">
                        {food.carbs}g carbs
                      </span>
                    )}
                    {food.fats && (
                      <span className="bg-white/10 px-2 py-1 rounded text-xs text-gray-300">
                        {food.fats}g fats
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className={`w-full py-2 px-4 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    food.consumed
                      ? "bg-green-600 cursor-not-allowed opacity-80 text-white"
                      : "bg-[#8A2BE2] hover:bg-[#7B1FA2] text-white"
                  }`}
                  onClick={() =>
                    markFoodAsConsumed(
                      food.name,
                      food.calories,
                      food.protein,
                      food.carbs || 0,
                      food.fats || 0
                    )
                  }
                  disabled={food.consumed}
                >
                  {food.consumed ? (
                    <>
                      <i className="fas fa-check-circle"></i> Completed
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i> Mark as Eaten
                    </>
                  )}
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 col-span-full">
              No food goals set for today. Add some foods to your nutrition
              plan.
            </p>
          )}
        </div>
      </div>

      {/* Food Log Section */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Today's Food Log
        </h3>

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="bg-white/5 p-4 rounded-lg flex items-center gap-2 border border-white/5 flex-1 min-w-[200px]">
            <span className="font-bold text-gray-300">Calories:</span>
            <span className="text-xl font-bold text-[#8A2BE2]">
              {todayNutrition.calories_consumed || 0}
            </span>
            <span className="text-sm text-gray-500">
              / {user.fitness_goals.calorie_goal}
            </span>
          </div>
          <div className="bg-white/5 p-4 rounded-lg flex items-center gap-2 border border-white/5 flex-1 min-w-[200px]">
            <span className="font-bold text-gray-300">Protein:</span>
            <span className="text-xl font-bold text-[#8A2BE2]">
              {todayNutrition.protein_consumed || 0}
            </span>
            <span className="text-sm text-gray-500">
              / {user.fitness_goals.protein_goal}g
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-white/10 text-gray-100">
                <th className="p-3 font-semibold border-b border-white/10">
                  Food
                </th>
                <th className="p-3 font-semibold border-b border-white/10">
                  Calories
                </th>
                <th className="p-3 font-semibold border-b border-white/10">
                  Protein
                </th>
                <th className="p-3 font-semibold border-b border-white/10">
                  Carbs
                </th>
                <th className="p-3 font-semibold border-b border-white/10">
                  Fats
                </th>
                <th className="p-3 font-semibold border-b border-white/10">
                  Time
                </th>
                <th className="p-3 font-semibold border-b border-white/10">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {consumedFoods.length > 0 ? (
                consumedFoods.map((food, index) => (
                  <tr
                    key={index}
                    className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-0"
                  >
                    <td className="p-3">{food.name}</td>
                    <td className="p-3">{food.calories} kcal</td>
                    <td className="p-3">{food.protein}g</td>
                    <td className="p-3">{food.carbs}g</td>
                    <td className="p-3">{food.fats}g</td>
                    <td className="p-3">
                      {food.consumedAt
                        ? new Date(food.consumedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Today"}
                    </td>
                    <td className="p-3">
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No foods consumed today yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NutritionTracking;
 