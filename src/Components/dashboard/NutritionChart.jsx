import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

export default function NutritionChart({ protein = 0, carbs = 0, fat = 0 }) {
  const total = protein + carbs + fat;
  
  const data = [
    { name: 'Protein', value: protein, color: '#10B981' },
    { name: 'Carbs', value: carbs, color: '#3B82F6' },
    { name: 'Fat', value: fat, color: '#F59E0B' }
  ].filter(item => item.value > 0);

  if (total === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Macros</h2>
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">🍽️</div>
            <p>No food logged yet</p>
            <p className="text-sm">Start by logging your first meal!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Macros</h2>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
          <div className="text-sm text-gray-600">Protein</div>
          <div className="font-semibold">{protein}g</div>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
          <div className="text-sm text-gray-600">Carbs</div>
          <div className="font-semibold">{carbs}g</div>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 bg-amber-500 rounded-full mx-auto mb-1"></div>
          <div className="text-sm text-gray-600">Fat</div>
          <div className="font-semibold">{fat}g</div>
        </div>
      </div>
    </motion.div>
  );
}