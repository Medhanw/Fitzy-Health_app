
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MealPlan } from "../entities/MealPlan";
import { User } from "../entities/UserProfile";
import { InvokeLLM } from "../integrations/Core";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Calendar, ChefHat, Clock, Users, Sparkles, RefreshCw } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";

export default function MealPlanner() {
  const [mealPlans, setMealPlans] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // Load meal plans for current week
      const weekStart = startOfWeek(selectedDate);
      const weekEnd = addDays(weekStart, 6);
      
      const plans = await MealPlan.filter({
        created_by: userData.email
      }, '-created_date');
      
      // Filter plans for current week
      const weekPlans = plans.filter(plan => {
        const planDate = new Date(plan.date);
        return planDate >= weekStart && planDate <= weekEnd;
      });
      
      setMealPlans(weekPlans);
    } catch (error) {
      console.error("Error loading meal plans:", error);
    }
    setIsLoading(false);
  }, [selectedDate]); // Added selectedDate to dependencies

  useEffect(() => {
    loadData();
  }, [loadData]); // Added loadData to dependencies

  const generateWeeklyMealPlan = async () => {
    setIsGenerating(true);
    try {
      const weekStart = startOfWeek(selectedDate);
      
      // Create prompt based on user preferences
      const dietaryPrefs = user.dietary_preferences?.join(', ') || 'none';
      const allergies = user.allergies?.join(', ') || 'none';
      const goals = user.health_goals?.join(', ') || 'general health';
      const targetCalories = user.daily_calorie_target || 2000;

      const prompt = `Create a 7-day meal plan for someone with:
        - Dietary preferences: ${dietaryPrefs}
        - Allergies: ${allergies}
        - Health goals: ${goals}
        - Daily calorie target: ${targetCalories} calories
        
        For each day, provide breakfast, lunch, dinner, and one healthy snack.
        Include meal names, brief descriptions, estimated prep time, and nutrition estimates.
        Make meals varied, balanced, and appealing.`;

      const mealPlanData = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            weekly_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  meals: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        meal_type: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        ingredients: { 
                          type: "array",
                          items: { type: "string" }
                        },
                        instructions: { type: "string" },
                        prep_time: { type: "number" },
                        estimated_calories: { type: "number" },
                        estimated_protein: { type: "number" },
                        estimated_carbs: { type: "number" },
                        estimated_fat: { type: "number" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Save meal plans to database
      const newMealPlans = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const currentDate = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
        const dayData = mealPlanData.weekly_plan[dayIndex];
        
        if (dayData?.meals) {
          for (const meal of dayData.meals) {
            const mealPlan = await MealPlan.create({
              date: currentDate,
              meal_type: meal.meal_type,
              title: meal.title,
              description: meal.description,
              ingredients: meal.ingredients || [],
              instructions: meal.instructions || '',
              prep_time: meal.prep_time || 30,
              estimated_calories: meal.estimated_calories || 0,
              estimated_protein: meal.estimated_protein || 0,
              estimated_carbs: meal.estimated_carbs || 0,
              estimated_fat: meal.estimated_fat || 0,
              ai_generated: true
            });
            newMealPlans.push(mealPlan);
          }
        }
      }

      setMealPlans(prev => [...prev, ...newMealPlans]);
    } catch (error) {
      console.error("Error generating meal plan:", error);
    }
    setIsGenerating(false);
  };

  const groupMealsByDate = () => {
    const grouped = {};
    const weekStart = startOfWeek(selectedDate);
    
    // Initialize all days of the week
    for (let i = 0; i < 7; i++) {
      const date = format(addDays(weekStart, i), 'yyyy-MM-dd');
      grouped[date] = {
        breakfast: null,
        lunch: null,
        dinner: null,
        snack: null
      };
    }

    // Fill in actual meal plans
    mealPlans.forEach(plan => {
      if (grouped[plan.date]) {
        grouped[plan.date][plan.meal_type] = plan;
      }
    });

    return grouped;
  };

  const mealsByDate = groupMealsByDate();
  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const mealTypeIcons = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎'
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-green-600" />
              AI Meal Planner
            </h1>
            <p className="text-gray-600 mt-2">Personalized meal plans tailored to your goals</p>
          </div>

          <Button
            onClick={generateWeeklyMealPlan}
            disabled={isGenerating}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Weekly Plan
              </>
            )}
          </Button>
        </div>

        {/* Week Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Week of {format(weekStart, 'MMMM d, yyyy')}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {weekDays.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayMeals = mealsByDate[dateStr];
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

              return (
                <motion.div
                  key={dateStr}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border-2 ${
                    isToday ? 'border-green-300 bg-green-50/50' : 'border-white/20'
                  }`}
                >
                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-gray-900">{format(day, 'EEE')}</h3>
                    <p className="text-sm text-gray-500">{format(day, 'MMM d')}</p>
                    {isToday && (
                      <Badge variant="outline" className="mt-1 bg-green-100 text-green-700 text-xs">
                        Today
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                      const meal = dayMeals[mealType];
                      return (
                        <div key={mealType} className="text-center">
                          <div className="text-xs text-gray-500 mb-1 capitalize flex items-center justify-center gap-1">
                            <span>{mealTypeIcons[mealType]}</span>
                            {mealType}
                          </div>
                          {meal ? (
                            <div className="p-2 bg-gray-50 rounded-lg">
                              <p className="text-xs font-medium text-gray-900 line-clamp-2">
                                {meal.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {meal.estimated_calories} cal
                              </p>
                            </div>
                          ) : (
                            <div className="p-2 border-2 border-dashed border-gray-200 rounded-lg">
                              <p className="text-xs text-gray-400">No meal planned</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detailed Meal Cards */}
        {mealPlans.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Meal Details</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mealPlans.slice(0, 12).map(meal => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="h-full bg-white/80 backdrop-blur-sm shadow-sm border border-white/20 hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="capitalize">
                          {mealTypeIcons[meal.meal_type]} {meal.meal_type}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          {format(new Date(meal.date), 'MMM d')}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{meal.title}</CardTitle>
                      <p className="text-sm text-gray-600">{meal.description}</p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meal.prep_time} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {meal.estimated_calories} cal
                        </div>
                      </div>

                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Ingredients:</h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {meal.ingredients.slice(0, 4).map((ingredient, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                                {ingredient}
                              </li>
                            ))}
                            {meal.ingredients.length > 4 && (
                              <li className="text-gray-500">+{meal.ingredients.length - 4} more</li>
                            )}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <div className="text-xs font-semibold text-green-700">{Math.round(meal.estimated_protein || 0)}g</div>
                          <div className="text-xs text-gray-500">Protein</div>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <div className="text-xs font-semibold text-blue-700">{Math.round(meal.estimated_carbs || 0)}g</div>
                          <div className="text-xs text-gray-500">Carbs</div>
                        </div>
                        <div className="p-2 bg-amber-50 rounded-lg">
                          <div className="text-xs font-semibold text-amber-700">{Math.round(meal.estimated_fat || 0)}g</div>
                          <div className="text-xs text-gray-500">Fat</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {mealPlans.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No meal plans yet</h3>
            <p className="text-gray-600 mb-6">Generate your first AI-powered weekly meal plan!</p>
            <Button
              onClick={generateWeeklyMealPlan}
              disabled={isGenerating}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
