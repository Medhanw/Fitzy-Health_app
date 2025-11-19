import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, ChefHat } from "lucide-react";

export default function TodaysMeals({ mealPlan, foodLogs, onRefresh }) {
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  
  const getMealData = (mealType) => {
    const plannedMeal = mealPlan.find(meal => meal.meal_type === mealType);
    const loggedMeals = foodLogs.filter(log => log.meal_type === mealType);
    
    return { plannedMeal, loggedMeals, hasLogged: loggedMeals.length > 0 };
  };

  const getMealTypeIcon = (mealType) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return icons[mealType] || '🍽️';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Today's Meals</span>
          <Link to={createPageUrl("MealPlanner")}>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {mealTypes.map((mealType) => {
            const { plannedMeal, loggedMeals, hasLogged } = getMealData(mealType);
            
            return (
              <div key={mealType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getMealTypeIcon(mealType)}</span>
                  <div>
                    <p className="font-medium capitalize text-gray-900">
                      {mealType}
                    </p>
                    {plannedMeal ? (
                      <p className="text-sm text-gray-600">{plannedMeal.recipe_name}</p>
                    ) : (
                      <p className="text-sm text-gray-500">No meal planned</p>
                    )}
                    {loggedMeals.length > 0 && (
                      <p className="text-xs text-emerald-600">
                        {loggedMeals.length} item{loggedMeals.length > 1 ? 's' : ''} logged
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {hasLogged && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      Logged
                    </Badge>
                  )}
                  <Link to={createPageUrl(`FoodLogger?meal=${mealType}`)}>
                    <Button size="sm" variant="ghost">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}