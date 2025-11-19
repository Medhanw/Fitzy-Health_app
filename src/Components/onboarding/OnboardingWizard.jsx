import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Checkbox } from "../components/ui/Checkbox";
import { ArrowRight, ArrowLeft, Target, Activity, Utensils } from "lucide-react";
import { User } from "../entities/UserProfile";

const steps = [
  {
    title: "Tell us about yourself",
    description: "Help us personalize your experience",
    icon: Target
  },
  {
    title: "Activity & Goals",
    description: "What are you looking to achieve?",
    icon: Activity
  },
  {
    title: "Dietary Preferences",
    description: "Any dietary restrictions or preferences?",
    icon: Utensils
  }
];

export default function OnboardingWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    goal_weight: "",
    activity_level: "moderately_active",
    health_goals: [],
    dietary_preferences: [],
    allergies: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Calculate daily calorie target based on basic formula
      const bmr = formData.height && formData.weight && formData.age ? 
        (10 * parseFloat(formData.weight)) + (6.25 * parseFloat(formData.height)) - (5 * parseFloat(formData.age)) + 5 : 2000;
      
      const activityMultipliers = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
        extremely_active: 1.9
      };
      
      const dailyCalories = Math.round(bmr * activityMultipliers[formData.activity_level]);

      await User.updateMyUserData({
        ...formData,
        age: parseFloat(formData.age) || null,
        height: parseFloat(formData.height) || null,
        weight: parseFloat(formData.weight) || null,
        goal_weight: parseFloat(formData.goal_weight) || null,
        daily_calorie_target: dailyCalories,
        onboarding_completed: true
      });
      
      onComplete();
    } catch (error) {
      console.error("Error saving user data:", error);
    }
    setIsSubmitting(false);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item) 
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {React.createElement(steps[currentStep].icon, { className: "w-8 h-8 text-white" })}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{steps[currentStep].title}</h2>
              <p className="text-gray-600">{steps[currentStep].description}</p>
            </div>

            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => updateFormData('age', e.target.value)}
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => updateFormData('height', e.target.value)}
                      placeholder="170"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Current Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => updateFormData('weight', e.target.value)}
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal_weight">Goal Weight (kg)</Label>
                    <Input
                      id="goal_weight"
                      type="number"
                      value={formData.goal_weight}
                      onChange={(e) => updateFormData('goal_weight', e.target.value)}
                      placeholder="65"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-4 block">Activity Level</Label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="activity_level"
                        value="sedentary"
                        checked={formData.activity_level === "sedentary"}
                        onChange={(e) => updateFormData('activity_level', e.target.value)}
                        className="text-green-500"
                      />
                      <div>
                        <div className="font-medium">Sedentary</div>
                        <div className="text-sm text-gray-500">Little to no exercise</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="activity_level"
                        value="lightly_active"
                        checked={formData.activity_level === "lightly_active"}
                        onChange={(e) => updateFormData('activity_level', e.target.value)}
                        className="text-green-500"
                      />
                      <div>
                        <div className="font-medium">Lightly Active</div>
                        <div className="text-sm text-gray-500">Light exercise 1-3 days/week</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="activity_level"
                        value="moderately_active"
                        checked={formData.activity_level === "moderately_active"}
                        onChange={(e) => updateFormData('activity_level', e.target.value)}
                        className="text-green-500"
                      />
                      <div>
                        <div className="font-medium">Moderately Active</div>
                        <div className="text-sm text-gray-500">Moderate exercise 3-5 days/week</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="activity_level"
                        value="very_active"
                        checked={formData.activity_level === "very_active"}
                        onChange={(e) => updateFormData('activity_level', e.target.value)}
                        className="text-green-500"
                      />
                      <div>
                        <div className="font-medium">Very Active</div>
                        <div className="text-sm text-gray-500">Hard exercise 6-7 days/week</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-4 block">Health Goals</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <Checkbox
                        checked={formData.health_goals.includes("weight_loss")}
                        onCheckedChange={() => toggleArrayItem('health_goals', "weight_loss")}
                      />
                      <span className="text-sm">Weight Loss</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <Checkbox
                        checked={formData.health_goals.includes("weight_gain")}
                        onCheckedChange={() => toggleArrayItem('health_goals', "weight_gain")}
                      />
                      <span className="text-sm">Weight Gain</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <Checkbox
                        checked={formData.health_goals.includes("muscle_gain")}
                        onCheckedChange={() => toggleArrayItem('health_goals', "muscle_gain")}
                      />
                      <span className="text-sm">Muscle Gain</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <Checkbox
                        checked={formData.health_goals.includes("maintain_weight")}
                        onCheckedChange={() => toggleArrayItem('health_goals', "maintain_weight")}
                      />
                      <span className="text-sm">Maintain Weight</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <Checkbox
                        checked={formData.health_goals.includes("improve_energy")}
                        onCheckedChange={() => toggleArrayItem('health_goals', "improve_energy")}
                      />
                      <span className="text-sm">Improve Energy</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <Checkbox
                        checked={formData.health_goals.includes("better_sleep")}
                        onCheckedChange={() => toggleArrayItem('health_goals', "better_sleep")}
                      />
                      <span className="text-sm">Better Sleep</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-4 block">Dietary Preferences</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <Checkbox
                        checked={formData.dietary_preferences.includes("vegetarian")}
                        onCheckedChange={() => toggleArrayItem('dietary_preferences', "vegetarian")}
                      />
                      <span className="text-sm">Vegetarian</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <Checkbox
                        checked={formData.dietary_preferences.includes("vegan")}
                        onCheckedChange={() => toggleArrayItem('dietary_preferences', "vegan")}
                      />
                      <span className="text-sm">Vegan</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <Checkbox
                        checked={formData.dietary_preferences.includes("keto")}
                        onCheckedChange={() => toggleArrayItem('dietary_preferences', "keto")}
                      />
                      <span className="text-sm">Keto</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <Checkbox
                        checked={formData.dietary_preferences.includes("paleo")}
                        onCheckedChange={() => toggleArrayItem('dietary_preferences', "paleo")}
                      />
                      <span className="text-sm">Paleo</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <Checkbox
                        checked={formData.dietary_preferences.includes("mediterranean")}
                        onCheckedChange={() => toggleArrayItem('dietary_preferences', "mediterranean")}
                      />
                      <span className="text-sm">Mediterranean</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <Checkbox
                        checked={formData.dietary_preferences.includes("gluten_free")}
                        onCheckedChange={() => toggleArrayItem('dietary_preferences', "gluten_free")}
                      />
                      <span className="text-sm">Gluten Free</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <Checkbox
                        checked={formData.dietary_preferences.includes("dairy_free")}
                        onCheckedChange={() => toggleArrayItem('dietary_preferences', "dairy_free")}
                      />
                      <span className="text-sm">Dairy Free</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="allergies">Food Allergies (separate with commas)</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies.join(', ')}
                    onChange={(e) => updateFormData('allergies', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    placeholder="e.g. nuts, shellfish, dairy"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? (
                  isSubmitting ? 'Setting up...' : 'Complete Setup'
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}