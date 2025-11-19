import React from "react";
import { motion } from "framer-motion";

export default function StatsCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  color = "green", 
  progress,
  target 
}) {
  const colorClasses = {
    green: "from-green-500 to-emerald-500",
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-indigo-500",
    orange: "from-orange-500 to-amber-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {progress && target && (
          <div className="text-right">
            <div className="text-xs text-gray-500">Target</div>
            <div className="text-sm font-semibold text-gray-700">{target}{unit}</div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <span className="text-sm text-gray-500">{unit}</span>
        </div>
        
        {progress !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-2 rounded-full bg-gradient-to-r ${colorClasses[color]}`}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}