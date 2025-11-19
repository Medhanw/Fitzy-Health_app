import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User } from "./entities/UserProfile";
import { FoodEntry } from "./entities/FoodEntry";
import { WaterIntake } from "./entities/WaterIntake";
import { Flame, Droplets, Scale, Target } from "lucide-react";
import { format } from "date-fns";

import OnboardingWizard from "../Components/onboarding/OnboardingWizard.jsx";
import StatsCard from "../components/dashboard/StatsCard";
import QuickActions from "../components/dashboard/QuickActions";
import NutritionChart from "../components/dashboard/NutritionChart";
import BMICalculator from "../components/dashboard/BMICalculator";
import BMRCalculator from "../components/dashboard/BMRCalculator";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [todayFoodEntries, setTodayFoodEntries] = useState([]);
  const [todayWaterIntake, setTodayWaterIntake] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      if (userData.onboarding_completed) {
        const today = format(new Date(), 'yyyy-MM-dd');
        
        const foodEntries = await FoodEntry.filter({ 
          date: today, 
          created_by: userData.email 
        });
        setTodayFoodEntries(foodEntries);

        const waterEntries = await WaterIntake.filter({ 
          date: today, 
          created_by: userData.email 
        });
        setTodayWaterIntake(waterEntries);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleOnboardingComplete = () => {
    loadData();
  };

  const calculateTodayStats = () => {
    const calories = todayFoodEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
    const protein = todayFoodEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0);
    const carbs = todayFoodEntries.reduce((sum, entry) => sum + (entry.carbs || 0), 0);
    const fat = todayFoodEntries.reduce((sum, entry) => sum + (entry.fat || 0), 0);
    const water = todayWaterIntake.reduce((sum, entry) => sum + (entry.amount || 0), 0);

    return { calories, protein, carbs, fat, water };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Droplets className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user?.onboarding_completed) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  const stats = calculateTodayStats();
  const calorieProgress = user.daily_calorie_target ? (stats.calories / user.daily_calorie_target) * 100 : 0;
  const waterProgress = user.daily_water_target ? (stats.water / user.daily_water_target) * 100 : 0;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Here's your health summary for today</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Calories"
            value={Math.round(stats.calories)}
            unit="kcal"
            icon={Flame}
            color="orange"
            progress={calorieProgress}
            target={user.daily_calorie_target}
          />
          <StatsCard
            title="Water Intake"
            value={Math.round(stats.water)}
            unit="ml"
            icon={Droplets}
            color="blue"
            progress={waterProgress}
            target={user.daily_water_target}
          />
          <StatsCard
            title="Current Weight"
            value={user.weight || 0}
            unit="kg"
            icon={Scale}
            color="purple"
          />
          <StatsCard
            title="Goal Weight"
            value={user.goal_weight || 0}
            unit="kg"
            icon={Target}
            color="green"
          />
        </div>

        {/* BMI and BMR Calculators */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <BMICalculator 
            weight={user.weight} 
            height={user.height}
          />
          <BMRCalculator 
            weight={user.weight} 
            height={user.height}
            age={user.age}
            activityLevel={user.activity_level}
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <QuickActions
              onLogFood={() => window.location.href = '/food-log'}
              onLogWater={() => console.log('Log water')}
              onScanFood={() => console.log('Scan food')}
              onQuickMeal={() => window.location.href = '/meal-planner'}
            />
            
            <NutritionChart
              protein={Math.round(stats.protein)}
              carbs={Math.round(stats.carbs)}
              fat={Math.round(stats.fat)}
            />
          </div>

          <div className="space-y-6">
            {/* Today's Meals */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Meals</h2>
              {todayFoodEntries.length > 0 ? (
                <div className="space-y-3">
                  {todayFoodEntries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{entry.food_name}</div>
                        <div className="text-xs text-gray-500 capitalize">{entry.meal_type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">{entry.calories || 0} cal</div>
                      </div>
                    </div>
                  ))}
                  {todayFoodEntries.length > 5 && (
                    <p className="text-center text-sm text-gray-500">
                      +{todayFoodEntries.length - 5} more meals
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p>No meals logged today</p>
                  <p className="text-sm">Start tracking your nutrition!</p>
                </div>
              )}
            </div>

            {/* Progress Insights */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Insights</h2>
              <div className="space-y-4">
                {calorieProgress > 100 && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800">
                      You've exceeded your calorie target by {Math.round(stats.calories - user.daily_calorie_target)} calories.
                    </p>
                  </div>
                )}
                {waterProgress < 50 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      Stay hydrated! You need {Math.round(user.daily_water_target - stats.water)}ml more water today.
                    </p>
                  </div>
                )}
                {stats.calories < user.daily_calorie_target * 0.8 && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      Great job staying within your calorie goals!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}