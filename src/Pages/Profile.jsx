import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FoodEntry } from "../entities/FoodEntry";
import { User } from "../entities/UserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Calendar, Target, Award } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export default function Progress() {
  const [user, setUser] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    avgCalories: 0,
    goalProgress: 0,
    streak: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // Get last 7 days of data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, 'yyyy-MM-dd');
      });

      const allEntries = await FoodEntry.filter({
        created_by: userData.email
      }, '-created_date');

      // Process daily data for charts
      const dailyData = last7Days.map(date => {
        const dayEntries = allEntries.filter(entry => entry.date === date);
        const calories = dayEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
        const protein = dayEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0);
        const carbs = dayEntries.reduce((sum, entry) => sum + (entry.carbs || 0), 0);
        const fat = dayEntries.reduce((sum, entry) => sum + (entry.fat || 0), 0);

        return {
          date: format(new Date(date), 'MMM d'),
          fullDate: date,
          calories: Math.round(calories),
          protein: Math.round(protein),
          carbs: Math.round(carbs),
          fat: Math.round(fat),
          entries: dayEntries.length
        };
      });

      setWeeklyData(dailyData);

      // Calculate stats
      const totalEntries = allEntries.length;
      const recentEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        const weekAgo = subDays(new Date(), 7);
        return entryDate >= weekAgo;
      });

      const avgCalories = recentEntries.length > 0 
        ? recentEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0) / 7
        : 0;

      const goalProgress = userData.daily_calorie_target 
        ? (avgCalories / userData.daily_calorie_target) * 100 
        : 0;

      // Calculate streak (days with at least one entry)
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const hasEntry = allEntries.some(entry => entry.date === date);
        if (hasEntry) {
          streak++;
        } else {
          break;
        }
      }

      setStats({
        totalEntries,
        avgCalories: Math.round(avgCalories),
        goalProgress: Math.round(goalProgress),
        streak
      });

    } catch (error) {
      console.error("Error loading progress data:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            Progress Analytics
          </h1>
          <p className="text-gray-600 mt-2">Track your nutrition journey and achievements</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            delay={0.1}
          >
            <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Entries</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalEntries}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            delay={0.2}
          >
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Avg Daily Calories</p>
                    <p className="text-2xl font-bold text-green-900">{stats.avgCalories}</p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            delay={0.3}
          >
            <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Goal Progress</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.goalProgress}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            delay={0.4}
          >
            <Card className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Logging Streak</p>
                    <p className="text-2xl font-bold text-orange-900">{stats.streak} days</p>
                  </div>
                  <Award className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calorie Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            delay={0.5}
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📈 Daily Calorie Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', r: 6 }}
                        activeDot={{ r: 8, fill: '#059669' }}
                      />
                      {user?.daily_calorie_target && (
                        <Line 
                          type="monotone" 
                          dataKey={() => user.daily_calorie_target} 
                          stroke="#6B7280" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {user?.daily_calorie_target && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Dashed line shows your daily calorie target ({user.daily_calorie_target} cal)
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Macronutrient Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            delay={0.6}
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🥗 Weekly Macros Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="protein" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="carbs" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="fat" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Protein</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Carbs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Fat</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.7}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏆 Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {stats.streak >= 7 && (
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-3xl mb-2">🔥</div>
                    <h3 className="font-semibold text-gray-900">Week Warrior</h3>
                    <p className="text-sm text-gray-600">Logged food for 7+ consecutive days</p>
                  </div>
                )}
                
                {stats.totalEntries >= 50 && (
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-3xl mb-2">📊</div>
                    <h3 className="font-semibold text-gray-900">Data Devotee</h3>
                    <p className="text-sm text-gray-600">Logged 50+ food entries</p>
                  </div>
                )}

                {stats.goalProgress >= 80 && stats.goalProgress <= 120 && (
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-3xl mb-2">🎯</div>
                    <h3 className="font-semibold text-gray-900">Goal Getter</h3>
                    <p className="text-sm text-gray-600">Staying within calorie targets</p>
                  </div>
                )}

                {(stats.streak < 7 && stats.totalEntries < 50 && (stats.goalProgress < 80 || stats.goalProgress > 120)) && (
                  <div className="text-center p-4 bg-white rounded-lg col-span-full">
                    <div className="text-4xl mb-2">🌱</div>
                    <h3 className="font-semibold text-gray-900">Just Getting Started</h3>
                    <p className="text-sm text-gray-600 mb-4">Keep logging your meals to unlock achievements!</p>
                    <div className="text-xs text-gray-500">
                      <p>• Log for 7 consecutive days to unlock "Week Warrior"</p>
                      <p>• Reach 50 food entries to become a "Data Devotee"</p>
                      <p>• Stay within your calorie goals to become a "Goal Getter"</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}