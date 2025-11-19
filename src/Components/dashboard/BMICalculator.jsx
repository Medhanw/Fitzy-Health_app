import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingDown, TrendingUp, CheckCircle } from "lucide-react";

export default function BMICalculator({ weight, height }) {
  if (!weight || !height) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 BMI Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Add your height and weight</p>
            <p className="text-sm">in your profile to calculate BMI</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const bmiRounded = bmi.toFixed(1);

  // BMI Categories
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600", bg: "bg-blue-50", icon: TrendingDown };
    if (bmi >= 18.5 && bmi < 25) return { category: "Normal weight", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle };
    if (bmi >= 25 && bmi < 30) return { category: "Overweight", color: "text-yellow-600", bg: "bg-yellow-50", icon: TrendingUp };
    return { category: "Obese", color: "text-red-600", bg: "bg-red-50", icon: TrendingUp };
  };

  const bmiInfo = getBMICategory(bmi);
  const Icon = bmiInfo.icon;

  // Calculate BMI percentage for visual bar
  const getBMIPercentage = (bmi) => {
    // Map BMI 15-35 to 0-100%
    const minBMI = 15;
    const maxBMI = 35;
    const percentage = ((Math.min(Math.max(bmi, minBMI), maxBMI) - minBMI) / (maxBMI - minBMI)) * 100;
    return percentage;
  };

  const bmiPercentage = getBMIPercentage(bmi);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm shadow-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Body Mass Index (BMI)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* BMI Value Display */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${bmiInfo.bg} mb-3`}>
              <div className="text-3xl font-bold">{bmiRounded}</div>
            </div>
            <div className={`flex items-center justify-center gap-2 ${bmiInfo.color}`}>
              <Icon className="w-5 h-5" />
              <span className="text-lg font-semibold">{bmiInfo.category}</span>
            </div>
          </div>

          {/* BMI Scale */}
          <div className="space-y-2">
            <div className="relative h-8 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                style={{ left: `${bmiPercentage}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Your BMI
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>35</span>
            </div>
          </div>

          {/* BMI Categories Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-gray-600">Underweight (&lt;18.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">Normal (18.5-24.9)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-600">Overweight (25-29.9)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-gray-600">Obese (≥30)</span>
            </div>
          </div>

          {/* Health Tip */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Tip:</strong> {bmi < 18.5 && "Consider consulting with a healthcare provider about healthy ways to gain weight."}
              {bmi >= 18.5 && bmi < 25 && "Great job! Maintain your healthy lifestyle with balanced nutrition and regular exercise."}
              {bmi >= 25 && bmi < 30 && "Focus on a balanced diet and regular physical activity to reach a healthier weight."}
              {bmi >= 30 && "Consult with a healthcare provider to develop a safe and effective weight management plan."}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}