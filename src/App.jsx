import React, { useState, useEffect, useCallback, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { format, addDays, startOfWeek } from 'date-fns';
import { Home, Calendar, BookOpen, TrendingUp, User as UserIcon, Droplets, Zap, Scale, Heart, BatteryCharging, ChevronRight, Droplet, ChefHat, Clock, Users, Sparkles, RefreshCw, Dices, LogIn, LogOut, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

// --- Local Data Storage Utility (Simulating Database with localStorage) ---
const LOCAL_STORAGE_KEY_USER = 'fitzy_user_profile';
const LOCAL_STORAGE_KEY_LOG = 'fitzy_food_log';

// --- Mock/Integration Functions (Local State/localStorage) ---

// 1. User Integration (Local Storage)
const User = {
    getProfile: () => {
        const storedProfile = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
        if (storedProfile) {
            return JSON.parse(storedProfile);
        }
        // Default Profile if none exists
        return {
            userId: 'local_user_12345',
            email: 'local@user.app',
            gender: 'female',
            height_cm: 165,
            weight_kg: 55,
            daily_calorie_target: 1800,
            dietary_preferences: ['vegetarian'],
            allergies: [],
            health_goals: ['maintain weight'],
            last_login: new Date().toISOString()
        };
    },
    saveProfile: (profile) => {
        localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(profile));
        return profile;
    }
};

// 2. Food Entry Integration (Local Storage)
const FoodEntry = {
    getTodayLog: () => {
        const storedLog = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_LOG) || '[]');
        const todayDate = format(new Date(), 'yyyy-MM-dd');
        return storedLog.filter(entry => entry.date === todayDate);
    },
    log: (data) => {
        const newEntry = {
            id: Date.now(),
            ...data,
            timestamp: new Date().toISOString(),
            date: format(new Date(), 'yyyy-MM-dd'),
        };
        const storedLog = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_LOG) || '[]');
        storedLog.push(newEntry);
        localStorage.setItem(LOCAL_STORAGE_KEY_LOG, JSON.stringify(storedLog));
        return newEntry;
    },
};

// 3. Meal Plan Integration (Local Storage)
const MealPlan = {
    getPlans: () => JSON.parse(localStorage.getItem('fitzy_meal_plans') || '[]'),
    savePlans: (plans) => localStorage.setItem('fitzy_meal_plans', JSON.stringify(plans)),
    clearPlans: () => localStorage.removeItem('fitzy_meal_plans'),
    create: (data) => {
        const plans = MealPlan.getPlans();
        const newPlan = { id: Date.now(), ...data, created_at: new Date().toISOString() };
        plans.push(newPlan);
        MealPlan.savePlans(plans);
        return newPlan;
    }
};

// 4. Invoke LLM (Mocked)
const InvokeLLM = async ({ prompt }) => {
  console.log("Generating plan with prompt:", prompt);
  // Mocking the AI response structure
  return new Promise(resolve => {
      setTimeout(() => {
          resolve({
              weekly_plan: Array.from({ length: 7 }, (_, i) => ({
                  day: format(addDays(startOfWeek(new Date()), i), 'EEEE'),
                  meals: [
                      { meal_type: "breakfast", title: "Oatmeal w/ Berries", description: "Quick, balanced start.", prep_time: 5, estimated_calories: 350, estimated_protein: 15, estimated_carbs: 50, estimated_fat: 8, ingredients: ["Oats", "Milk", "Berries", "Chia Seeds"] },
                      { meal_type: "lunch", title: "Chickpea Salad Sandwich", description: "Vegetarian high-protein lunch.", prep_time: 15, estimated_calories: 450, estimated_protein: 20, estimated_carbs: 60, estimated_fat: 12, ingredients: ["Chickpeas", "Bread", "Mayo (light)", "Veggies"] },
                      { meal_type: "dinner", title: "Vegetable Curry", description: "Healthy Indian-style curry.", prep_time: 35, estimated_calories: 600, estimated_protein: 25, estimated_carbs: 80, estimated_fat: 20, ingredients: ["Veggies", "Curry Paste", "Rice", "Yogurt"] },
                      { meal_type: "snack", title: "Apple and Almonds", description: "Crunchy and satisfying snack.", prep_time: 2, estimated_calories: 200, estimated_protein: 8, estimated_carbs: 30, estimated_fat: 6, ingredients: ["Apple", "Almonds"] }
                  ]
              }))
          });
      }, 1500); // Simulate API delay
  });
};


// --- Context for Authentication Status ---
const AuthContext = React.createContext({
    isAuthenticated: true,
    userId: 'local_user_12345',
    isAuthReady: true,
    login: () => {},
    logout: () => {}
});

// --- Placeholder UI Components ---
const Button = ({ onClick, disabled, className, children }) => (
  <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-xl text-white font-medium transition-colors duration-200 shadow-lg ${className}`}>{children}</button>
);
const Card = ({ children, className }) => <div className={`rounded-2xl bg-white shadow-md ${className}`}>{children}</div>;
const CardHeader = ({ children }) => <div className="p-4 pb-0">{children}</div>;
const CardTitle = ({ children, className }) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
const CardContent = ({ children, className }) => <div className={`p-4 pt-2 ${className}`}>{children}</div>;
const Badge = ({ children, className }) => <span className={`text-xs px-2 py-1 rounded-full ${className}`}>{children}</span>;


// --- Utility Functions ---
const createPageUrl = (pageName) => `/${pageName.replace(/\s/g, '').toLowerCase()}`;
const today = format(new Date(), 'EEEE, MMMM d');

const calculateBMI = (weightKg, heightCm) => {
    if (!weightKg || !heightCm) return 0;
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(1);
};


// ##########################################################################################
// ############################# 1. APP LAYOUT COMPONENT ####################################
// ##########################################################################################

function AppLayout({ children, currentPageName }) {
  const location = useLocation();

  const navigationItems = [
    { title: "Dashboard", url: createPageUrl("Dashboard"), icon: Home },
    { title: "Meal Planner", url: createPageUrl("Meal Planner"), icon: Calendar },
    { title: "Food Log", url: createPageUrl("Food Log"), icon: BookOpen },
    { title: "Progress", url: createPageUrl("Progress"), icon: TrendingUp },
    { title: "Profile", url: createPageUrl("Profile"), icon: UserIcon }, 
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200 hidden md:block z-40 shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Fitzy
              </h1>
              <p className="text-xs text-gray-500">Healthy Living Assistant</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname.toLowerCase() === item.url.toLowerCase();
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-xl transform scale-[1.02] font-semibold'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-64 p-4 md:p-8 pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 md:hidden z-50 shadow-2xl">
        <div className="flex justify-around items-center py-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname.toLowerCase() === item.url.toLowerCase();
            return (
              <Link
                key={item.title}
                to={item.url}
                className="flex flex-col items-center p-2 min-w-0"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                </motion.div>
                <span className={`text-xs mt-1 truncate ${
                  isActive ? 'text-green-600 font-medium' : 'text-gray-500'
                }`}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}


// ##########################################################################################
// ############################# 2. DASHBOARD COMPONENT #####################################
// ##########################################################################################

const nutritionData = [
  { name: 'Protein', value: 80, color: '#10B981' },
  { name: 'Carbs', value: 120, color: '#3B82F6' },
  { name: 'Fat', value: 40, color: '#F59E0B' },
];

const NutritionChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={150}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={40}
        outerRadius={60}
        fill="#8884d8"
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Legend 
        layout="vertical" 
        align="right" 
        verticalAlign="middle" 
        iconType="circle"
        wrapperStyle={{ fontSize: '12px' }}
      />
    </PieChart>
  </ResponsiveContainer>
);

const DashboardPage = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { userId, isAuthReady } = useContext(AuthContext);

    useEffect(() => {
        // Fetch profile once component mounts
        const data = User.getProfile();
        setUserProfile(data);
        setIsLoading(false);
    }, []);

    const currentBMI = userProfile ? calculateBMI(userProfile.weight_kg, userProfile.height_cm) : '...';

  return (
    <div className="space-y-8">
      <hgroup>
        <h2 className="text-3xl font-extrabold text-gray-800">Good afternoon, Medha! 👋</h2>
        <p className="text-sm text-gray-500">{today} | Quick summary for today</p>
      </hgroup>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Calorie Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl transition-all hover:shadow-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Calories Left</h3>
            <Zap className="w-6 h-6 text-red-500 bg-red-50 p-1 rounded-lg" />
          </div>
          <p className="text-4xl font-bold text-red-600">1,123</p>
          <p className="text-sm text-gray-500 mt-1">out of 2,178 kcal</p>
          <div className="h-2 bg-gray-200 rounded-full mt-4">
            <div className="h-full bg-red-400 rounded-full w-[50%]"></div>
          </div>
        </div>

        {/* Water Intake Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl transition-all hover:shadow-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Water Intake</h3>
            <Droplet className="w-6 h-6 text-blue-500 bg-blue-50 p-1 rounded-lg" />
          </div>
          <p className="text-4xl font-bold text-blue-600">0.5 <span className="text-base font-normal">L</span></p>
          <p className="text-sm text-gray-500 mt-1">Goal: 3.0 L</p>
          <div className="h-2 bg-gray-200 rounded-full mt-4">
            <div className="h-full bg-blue-400 rounded-full w-[16%]"></div>
          </div>
        </div>

        {/* Weight Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl transition-all hover:shadow-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Current Weight</h3>
            <Scale className="w-6 h-6 text-purple-500 bg-purple-50 p-1 rounded-lg" />
          </div>
          <p className="text-4xl font-bold text-purple-600">{userProfile ? userProfile.weight_kg : '55'} <span className="text-base font-normal">kg</span></p>
          <p className="text-sm text-gray-500 mt-1">Goal: 50 kg</p>
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <span>Goal: 50 kg</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Nutrition Pie Chart Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl transition-all hover:shadow-2xl border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-0">Macro Nutrients</h3>
          <p className="text-sm text-gray-500 mb-0">Consumed Today</p>
          <NutritionChart data={nutritionData} />
        </div>
      </div>
      
      {/* Detailed Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BMI Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl transition-all hover:shadow-2xl border border-gray-100 lg:col-span-1">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-green-500" />
            Body Mass Index (BMI)
          </h3>
          <div className="text-center py-6">
            <p className="text-6xl font-extrabold text-green-600">{currentBMI}</p>
            <p className="text-lg font-medium text-green-500 mt-1">Normal weight</p>
          </div>
          
          <div className="mt-4">
            <img 
                src="https://placehold.co/600x40/E5E7EB/6B7280?text=25" 
                alt="BMI Range Indicator Placeholder" 
                className="w-full rounded-full h-4"
                style={{backgroundImage: 'linear-gradient(to right, #4ade80, #facc15, #f97316, #ef4444)'}}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>35</span>
            </div>
            <ul className="text-xs text-gray-600 mt-4 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span> 
                Normal (18.5 - 24.9)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> 
                Obese (&gt;30)
              </li>
            </ul>
          </div>
        </div>
        
        {/* BMR and Energy Goals Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl transition-all hover:shadow-2xl border border-gray-100 lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* BMR (Based on standard Mifflin-St Jeor formula for female, moderate activity) */}
                <div className="border border-gray-100 p-4 rounded-xl text-center shadow-inner">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
                        <BatteryCharging className="w-5 h-5 text-yellow-500" />
                        Basal Metabolic Rate (BMR)
                    </h3>
                    <p className="text-5xl font-extrabold text-yellow-600">1,405</p>
                    <p className="text-sm text-gray-500 mt-1">cal / day</p>
                    <p className="text-xs text-gray-400 mt-2">Calories burned at rest</p>
                </div>

                {/* Total Daily Energy */}
                <div className="border border-gray-100 p-4 rounded-xl text-center shadow-inner">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5 text-indigo-500" />
                        Total Daily Energy (TDEE)
                    </h3>
                    <p className="text-5xl font-extrabold text-indigo-600">2,178</p>
                    <p className="text-sm text-gray-500 mt-1">cal / day</p>
                    <p className="text-xs text-gray-400 mt-2">Based on your Moderately Active Lifestyle</p>
                </div>
            </div>

            {/* Calorie Goals */}
            <h3 className="text-xl font-semibold text-gray-700 pt-4 border-t border-gray-100">
                Calorie Goals
            </h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium text-gray-700">Weight Loss (-0.5 kg/week)</span>
                    <span className="text-lg font-bold text-red-600">1,678 <span className="text-sm font-normal">cal/day</span></span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-gray-700">Maintain Weight</span>
                    <span className="text-lg font-bold text-green-600">2,178 <span className="text-sm font-normal">cal/day</span></span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-gray-700">Weight Gain (+0.5 kg/week)</span>
                    <span className="text-lg font-bold text-blue-600">2,678 <span className="text-sm font-normal">cal/day</span></span>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};


// ##########################################################################################
// ############################# 3. MEAL PLANNER COMPONENT ##################################
// ##########################################################################################

const MealPlannerPage = () => {
  const [mealPlans, setMealPlans] = useState(MealPlan.getPlans);
  const [user, setUser] = useState(User.getProfile);
  const [selectedDate] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Changed to false as local storage is fast
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    // Re-fetch local user data on mount
    setUser(User.getProfile());
    // Re-fetch local meal plans for the current week
    // NOTE: For simplicity, we just load all plans from localStorage here
    setMealPlans(MealPlan.getPlans()); 
  }, [isAuthenticated]);


  const generateWeeklyMealPlan = async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const weekStart = startOfWeek(selectedDate);
      
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
        Provide the response in the requested JSON schema.`;

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
                        meal_type: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
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

      // Clear existing plans and save the new ones
      MealPlan.clearPlans(); 
      const newMealPlans = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const currentDate = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
        const dayData = mealPlanData.weekly_plan[dayIndex];
        
        if (dayData?.meals) {
          for (const meal of dayData.meals) {
            const mealPlan = MealPlan.create({
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

      setMealPlans(newMealPlans); // Update state to trigger UI refresh

    } catch (error) {
      console.error("Error generating meal plan:", error);
    }
    setIsGenerating(false);
  };

  const groupMealsByDate = () => {
    const grouped = {};
    const weekStart = startOfWeek(new Date());
    
    for (let i = 0; i < 7; i++) {
      const date = format(addDays(weekStart, i), 'yyyy-MM-dd');
      grouped[date] = { breakfast: null, lunch: null, dinner: null, snack: null };
    }

    mealPlans.forEach(plan => {
      if (grouped[plan.date]) {
        grouped[plan.date][plan.meal_type] = plan;
      }
    });

    return grouped;
  };

  const mealsByDate = groupMealsByDate();
  const weekStart = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const mealTypeIcons = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎'
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-gray-500">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-4" />
        <p>Loading user data and existing plans...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 text-red-500">
        <LogOut className="w-8 h-8 mx-auto mb-4" />
        <p className="font-semibold">Please log in (Profile page) to use the Meal Planner.</p>
      </div>
    );
  }

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
            <p className="text-gray-600 mt-2">Personalized meal plans tailored to your goals and preferences.</p>
          </div>

          <Button
            onClick={generateWeeklyMealPlan}
            disabled={isGenerating || !user}
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
                Generate New Weekly Plan
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

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
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
                      <Badge className="mt-1 bg-green-100 text-green-700 text-xs">
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
                        <Badge className="capitalize bg-gray-200 text-gray-800">
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
              disabled={isGenerating || !user}
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
};


// ##########################################################################################
// ############################# 4. FOOD LOG COMPONENT ######################################
// ##########################################################################################

const FoodLogPage = () => {
    const [formState, setFormState] = useState({ mealName: '', calories: '', protein: '', carbs: '', fat: '' });
    const [loggedMeals, setLoggedMeals] = useState(FoodEntry.getTodayLog);
    const { isAuthenticated } = useContext(AuthContext);

    useEffect(() => {
        // Simple polling/refresh mechanism for local storage data
        const interval = setInterval(() => {
            setLoggedMeals(FoodEntry.getTodayLog());
        }, 1000);
        return () => clearInterval(interval);
    }, []);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleLogMeal = () => {
        if (!formState.mealName || !formState.calories) {
            console.warn("Please enter a meal name and calories.");
            return;
        }

        try {
            FoodEntry.log({
                mealName: formState.mealName,
                calories: Number(formState.calories) || 0,
                protein: Number(formState.protein) || 0,
                carbs: Number(formState.carbs) || 0,
                fat: Number(formState.fat) || 0,
            });
            setFormState({ mealName: '', calories: '', protein: '', carbs: '', fat: '' }); // Reset form
            setLoggedMeals(FoodEntry.getTodayLog()); // Force immediate update
        } catch (error) {
            console.error("Error logging meal:", error);
        }
    };

    const totalMacros = loggedMeals.reduce((acc, meal) => {
        acc.calories += Number(meal.calories);
        acc.protein += Number(meal.protein); 
        acc.carbs += Number(meal.carbs);
        acc.fat += Number(meal.fat);
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    if (!isAuthenticated) {
        return (
            <div className="text-center py-20 text-red-500">
                <LogOut className="w-8 h-8 mx-auto mb-4" />
                <p className="font-semibold">Please log in (Profile page) to access the Food Log.</p>
            </div>
        );
    }

  return (
    <div className="p-8 md:pt-8 pt-24 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-indigo-600" />
        Food Log
      </h1>
      <p className="text-gray-600 mb-8">Record your meals and track your daily nutrition intake.</p>
      
      {/* Food Entry Card */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">Log a New Meal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input 
                type="text" 
                name="mealName"
                value={formState.mealName}
                onChange={handleInputChange}
                placeholder="Meal Name (e.g., Breakfast)" 
                className="p-3 border rounded-lg focus:ring-green-500 focus:border-green-500" 
            />
            <input 
                type="number" 
                name="calories"
                value={formState.calories}
                onChange={handleInputChange}
                placeholder="Calories (kcal)" 
                className="p-3 border rounded-lg focus:ring-green-500 focus:border-green-500" 
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input 
                type="number" 
                name="protein"
                value={formState.protein}
                onChange={handleInputChange}
                placeholder="Protein (g)" 
                className="p-3 border rounded-lg focus:ring-green-500 focus:border-green-500" 
            />
            <input 
                type="number" 
                name="carbs"
                value={formState.carbs}
                onChange={handleInputChange}
                placeholder="Carbs (g)" 
                className="p-3 border rounded-lg focus:ring-green-500 focus:border-green-500" 
            />
            <input 
                type="number" 
                name="fat"
                value={formState.fat}
                onChange={handleInputChange}
                placeholder="Fat (g)" 
                className="p-3 border rounded-lg focus:ring-green-500 focus:border-green-500" 
            />
          </div>
          <Button onClick={handleLogMeal} className="bg-indigo-500 hover:bg-indigo-600 w-full">
            Add to Log
          </Button>
        </CardContent>
      </Card>
      
      {/* Summary Totals */}
      <Card className="shadow-lg p-6 bg-indigo-50/50">
        <CardTitle className="text-xl mb-4 text-indigo-700">Daily Totals</CardTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
                <p className="text-3xl font-bold text-indigo-800">{totalMacros.calories}</p>
                <p className="text-sm text-gray-500">kcal</p>
            </div>
            <div>
                <p className="text-3xl font-bold text-green-700">{Math.round(totalMacros.protein)}g</p>
                <p className="text-sm text-gray-500">Protein</p>
            </div>
            <div>
                <p className="text-3xl font-bold text-blue-700">{Math.round(totalMacros.carbs)}g</p>
                <p className="text-sm text-gray-500">Carbs</p>
            </div>
            <div>
                <p className="text-3xl font-bold text-amber-700">{Math.round(totalMacros.fat)}g</p>
                <p className="text-sm text-gray-500">Fat</p>
            </div>
        </div>
      </Card>

      {/* Logged Meals List */}
      <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">Today's Entries</h2>
      <div className="space-y-3">
          {loggedMeals.length > 0 ? (
              loggedMeals.map(meal => (
                  <div key={meal.id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div>
                          <p className="font-semibold text-gray-800">{meal.mealName} <span className="text-xs text-gray-400">({meal.timestamp ? format(new Date(meal.timestamp), 'h:mm a') : 'N/A'})</span></p>
                      </div>
                      <div className="text-right">
                          <p className="font-bold text-lg text-indigo-600">{meal.calories} kcal</p>
                          <p className="text-xs text-gray-500">{Math.round(meal.protein)}P • {Math.round(meal.carbs)}C • {Math.round(meal.fat)}F</p>
                      </div>
                  </div>
              ))
          ) : (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <p>No meals logged today. Use the form above to start tracking!</p>
              </div>
          )}
      </div>
    </div>
  );
};


// ##########################################################################################
// ############################# 5. PROFILE COMPONENT #######################################
// ##########################################################################################

const ProfilePage = () => {
    const [userProfile, setUserProfile] = useState(User.getProfile);
    const [isLoading, setIsLoading] = useState(false);
    const { userId, isAuthenticated, login, logout, isAuthReady } = useContext(AuthContext);

    useEffect(() => {
        // Fetch profile once component mounts or auth state changes
        setUserProfile(User.getProfile());
    }, [isAuthenticated]);

    const currentBMI = userProfile ? calculateBMI(userProfile.weight_kg, userProfile.height_cm) : '...';

    const ProfileField = ({ label, value }) => (
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="font-medium text-gray-600">{label}</span>
            <span className="font-semibold text-gray-800 capitalize">{value}</span>
        </div>
    );
    
    const ProfileTags = ({ label, tags }) => (
        <div className="py-3 border-b border-gray-100">
            <h4 className="font-medium text-gray-600 mb-2">{label}:</h4>
            <div className="flex flex-wrap gap-2">
                {tags && tags.length > 0 ? (
                    tags.map(p => <Badge key={p} className="bg-green-100 text-green-700">{p}</Badge>)
                ) : (
                    <Badge className="bg-gray-100 text-gray-500">None Specified</Badge>
                )}
            </div>
        </div>
    );
    
    const handleSaveMetrics = () => {
        // In a real app, this would open a modal/form and then call User.saveProfile(updatedData)
        console.log("Simulating saving updated profile data to local storage.");
        alert("Simulating saving profile. You can check your console.");
        // For local storage, we would typically update the state here and call User.saveProfile
    };

    const { email, gender, weight_kg, height_cm, dietary_preferences, allergies, health_goals } = userProfile || {};


    if (isLoading) {
        return (
            <div className="text-center py-20 text-gray-500">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-4" />
                <p>Loading profile data...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 pt-24 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-600" />
                My Profile Settings
            </h1>
            
            {/* Auth Status Card */}
            <Card className="shadow-xl p-6 bg-blue-50/50 border-blue-200">
                <CardTitle className="text-2xl pb-3 mb-4 flex items-center gap-2 text-gray-700">
                    Account Status
                </CardTitle>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-600">User ID</p>
                        <p className="font-mono text-xs text-blue-800 break-all">{userId || 'N/A'}</p>
                    </div>
                    {isAuthenticated ? (
                        <Button 
                            onClick={logout} 
                            className="bg-red-500 hover:bg-red-600 flex items-center gap-2"
                        >
                            <LogOut className="w-5 h-5" /> Logout
                        </Button>
                    ) : (
                        <Button 
                            onClick={login} 
                            className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
                        >
                            <LogIn className="w-5 h-5" /> Log In (Local)
                        </Button>
                    )}
                </div>
                {!isAuthenticated && (
                  <p className="text-xs text-red-600 mt-3">You are logged out. Data will only be stored locally for the session.</p>
                )}
            </Card>


            {/* Basic Metrics Card */}
            <Card className="shadow-xl p-6">
                <CardTitle className="text-2xl border-b pb-3 mb-4 flex items-center gap-2 text-gray-700">
                    Basic Metrics
                </CardTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ProfileField label="Email" value={email} />
                    <ProfileField label="Gender" value={gender} />
                    <ProfileField label="Height" value={`${height_cm} cm`} />
                    <ProfileField label="Current Weight" value={`${weight_kg} kg`} />
                    <ProfileField label="BMI" value={currentBMI} />
                    <ProfileField label="Daily Calorie Target" value={`${userProfile.daily_calorie_target} kcal`} />
                </div>
                <Button onClick={handleSaveMetrics} className="mt-6 bg-blue-500 hover:bg-blue-600">Edit Metrics</Button>
            </Card>

            {/* Preferences and Goals Card */}
            <Card className="shadow-xl p-6">
                <CardTitle className="text-2xl border-b pb-3 mb-4 flex items-center gap-2 text-gray-700">
                    Preferences & Goals
                </CardTitle>
                <ProfileTags label="Health Goals" tags={health_goals} />
                <ProfileTags label="Dietary Preferences" tags={dietary_preferences} />
                <ProfileTags label="Allergies" tags={allergies} />
                <Button onClick={handleSaveMetrics} className="mt-6 bg-blue-500 hover:bg-blue-600">Update Preferences</Button>
            </Card>
        </div>
    );
};


// ##########################################################################################
// ########################## 6. OTHER PLACEHOLDER COMPONENTS ###############################
// ##########################################################################################

const ProgressPage = () => {
    const { isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) {
        return (
            <div className="text-center py-20 text-red-500">
                <LogOut className="w-8 h-8 mx-auto mb-4" />
                <p className="font-semibold">Please log in (Profile page) to access Progress tracking.</p>
            </div>
        );
    }
    
    return (
        <div className="p-8 md:pt-8 pt-24 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                Progress Tracker
            </h1>
            <p className="text-gray-600 mt-2 mb-8">View your weight, BMI, and nutrition trends over time.</p>

            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 text-center">
                <Dices className="w-12 h-12 mx-auto text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">Progress Charts Go Here</h3>
                <p className="text-gray-500">Coming soon: Interactive visualizations for weight loss and macro intake.</p>
            </div>
        </div>
    );
};


// ##########################################################################################
// ############################# 7. MAIN APPLICATION WRAPPER ################################
// ##########################################################################################

function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [userId, setUserId] = useState('local_user_12345');
    
    const login = useCallback(() => {
        setIsAuthenticated(true);
        setUserId(User.getProfile().userId);
        alert("Simulating Login. Data is now saved locally.");
    }, []);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setUserId(null);
        alert("Simulating Logout. Data will not persist across sessions while logged out.");
    }, []);

    const contextValue = {
        isAuthenticated,
        userId,
        isAuthReady: true, // Always ready without external Firebase
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}


export default function App() {
  return (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  // We assume BrowserRouter is above App in main.jsx
  return (
    <AppLayout>
      <Routes>
        {/* The Dashboard route should use the DashboardPage component */}
        <Route path="/" element={<DashboardPage />} />
        <Route path={createPageUrl("Dashboard")} element={<DashboardPage />} />
        
        {/* The Meal Planner route uses the new stateful component */}
        <Route path={createPageUrl("Meal Planner")} element={<MealPlannerPage />} />
        
        {/* The Food Log route uses the new FoodLogPage component */}
        <Route path={createPageUrl("Food Log")} element={<FoodLogPage />} />
        
        {/* Other pages using the new components */}
        <Route path={createPageUrl("Progress")} element={<ProgressPage />} />
        <Route path={createPageUrl("Profile")} element={<ProfilePage />} />
        
        {/* 404 Page */}
        <Route path="*" element={<div className="p-8 md:pt-8 pt-24">404 - Page Not Found</div>} />
      </Routes>
    </AppLayout>
  );
}
