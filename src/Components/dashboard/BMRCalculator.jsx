import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Activity } from "lucide-react";

export default function BMRCalculator({ weight, height, age, activityLevel, gender = "male" }) {
  if (!weight || !height || !age) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚡ BMR Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Zap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Complete your profile</p>
            <p className="text-sm">to calculate your BMR</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate BMR using Mifflin-St Jeor Equation
  // For simplicity, we'll assume male. In a real app, you'd add gender to user profile
  const bmr = Math.round(
    (10 * weight) + (6.25 * height) - (5 * age) + 5
  );

  // Activity multipliers
  const activityMultipliers = {
    sedentary: { value: 1.2, label: "Sedentary" },
    lightly_active: { value: 1.375, label: "Lightly Active" },
    moderately_active: { value: 1.55, label: "Moderately Active" },
    very_active: { value: 1.725, label: "Very Active" },
    extremely_active: { value: 1.9, label: "Extremely Active" }
  };

  const activityInfo = activityMultipliers[activityLevel] || activityMultipliers.moderately_active;
  const tdee = Math.round(bmr * activityInfo.value);

  // Calorie recommendations for different goals
  const weightLossCalories = Math.round(tdee - 500);
  const weightGainCalories = Math.round(tdee + 500);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm shadow-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚡ Basal Metabolic Rate (BMR)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* BMR Display */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 mb-3">
              <div>
                <div className="text-3xl font-bold text-orange-600">{bmr}</div>
                <div className="text-xs text-orange-600">cal/day</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">Calories burned at rest</p>
          </div>

          {/* TDEE Display */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-900">Total Daily Energy</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">{tdee}</span>
            </div>
            <p className="text-xs text-gray-600">
              Based on your <span className="font-medium">{activityInfo.label}</span> lifestyle
            </p>
          </div>

          {/* Calorie Goals */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-900">Calorie Goals:</h4>
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <div className="font-medium text-sm text-gray-900">Weight Loss</div>
                  <div className="text-xs text-gray-600">-0.5 kg/week</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{weightLossCalories}</div>
                  <div className="text-xs text-gray-600">cal/day</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <div className="font-medium text-sm text-gray-900">Maintain Weight</div>
                  <div className="text-xs text-gray-600">Current weight</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{tdee}</div>
                  <div className="text-xs text-gray-600">cal/day</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div>
                  <div className="font-medium text-sm text-gray-900">Weight Gain</div>
                  <div className="text-xs text-gray-600">+0.5 kg/week</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-amber-600">{weightGainCalories}</div>
                  <div className="text-xs text-gray-600">cal/day</div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>What is BMR?</strong> Your Basal Metabolic Rate is the number of calories your body burns at rest to maintain vital functions like breathing, circulation, and cell production.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}