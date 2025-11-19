import React from "react";
import { motion } from "framer-motion";
import { Plus, Droplets, Camera, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuickActions({ onLogFood, onLogWater, onScanFood, onQuickMeal }) {
  const actions = [
    {
      title: "Log Food",
      icon: Plus,
      color: "from-green-500 to-emerald-500",
      onClick: onLogFood
    },
    {
      title: "Add Water",
      icon: Droplets,
      color: "from-blue-500 to-cyan-500",
      onClick: onLogWater
    },
    {
      title: "Scan Food",
      icon: Camera,
      color: "from-purple-500 to-indigo-500",
      onClick: onScanFood
    },
    {
      title: "Quick Meal",
      icon: Zap,
      color: "from-orange-500 to-amber-500",
      onClick: onQuickMeal
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              onClick={action.onClick}
              className={`w-full h-20 bg-gradient-to-r ${action.color} hover:scale-105 transition-transform duration-200 shadow-lg border-0 rounded-xl`}
            >
              <div className="flex flex-col items-center gap-2">
                <action.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{action.title}</span>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}