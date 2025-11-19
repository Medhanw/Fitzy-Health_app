import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FoodEntry } from "../entities/FoodEntry";
import { User } from "../entities/UserProfile";
import { InvokeLLM } from "../integrations/Core";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Plus, Search, Utensils, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function FoodLog() {
  const [foodEntries, setFoodEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [newEntry, setNewEntry] = useState({
    meal_type: 'breakfast',
    food_name: '',
    quantity: '',
    unit: 'grams',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      const entries = await FoodEntry.filter({ 
        date: selectedDate,
        created_by: userData.email
      }, '-created_date');
      setFoodEntries(entries);
    } catch (error) {
      console.error("Error loading food entries:", error);
    }
    setIsLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddFood = async () => {
    if (!newEntry.food_name) return;
    
    setIsAdding(true);
    try {
      // Use AI to estimate nutrition if not provided
      if (!newEntry.calories && newEntry.food_name) {
        const nutritionData = await InvokeLLM({
          prompt: `Estimate the nutrition facts for ${newEntry.quantity || 100} ${newEntry.unit} of ${newEntry.food_name}. Provide realistic estimates.`,
          response_json_schema: {
            type: "object",
            properties: {
              calories: { type: "number" },
              protein: { type: "number" },
              carbs: { type: "number" },
              fat: { type: "number" },
              fiber: { type: "number" }
            }
          }
        });

        await FoodEntry.create({
          ...newEntry,
          date: selectedDate,
          quantity: parseFloat(newEntry.quantity) || 100,
          calories: nutritionData.calories || 0,
          protein: nutritionData.protein || 0,
          carbs: nutritionData.carbs || 0,
          fat: nutritionData.fat || 0,
          fiber: nutritionData.fiber || 0
        });
      } else {
        await FoodEntry.create({
          ...newEntry,
          date: selectedDate,
          quantity: parseFloat(newEntry.quantity) || 100,
          calories: parseFloat(newEntry.calories) || 0,
          protein: parseFloat(newEntry.protein) || 0,
          carbs: parseFloat(newEntry.carbs) || 0,
          fat: parseFloat(newEntry.fat) || 0
        });
      }

      setNewEntry({
        meal_type: 'breakfast',
        food_name: '',
        quantity: '',
        unit: 'grams',
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      });
      setShowAddDialog(false);
      loadData();
    } catch (error) {
      console.error("Error adding food entry:", error);
    }
    setIsAdding(false);
  };

  const deleteEntry = async (entryId) => {
    try {
      await FoodEntry.delete(entryId);
      loadData();
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const groupedEntries = foodEntries.reduce((groups, entry) => {
    if (!groups[entry.meal_type]) {
      groups[entry.meal_type] = [];
    }
    groups[entry.meal_type].push(entry);
    return groups;
  }, {});

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealIcons = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎'
  };

  const calculateDayTotals = () => {
    return foodEntries.reduce((totals, entry) => ({
      calories: totals.calories + (entry.calories || 0),
      protein: totals.protein + (entry.protein || 0),
      carbs: totals.carbs + (entry.carbs || 0),
      fat: totals.fat + (entry.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const dayTotals = calculateDayTotals();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Utensils className="w-8 h-8 text-green-600" />
              Food Log
            </h1>
            <p className="text-gray-600 mt-2">Track your meals and nutrition</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Food
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Food Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="meal_type">Meal Type</Label>
                    <Select value={newEntry.meal_type} onValueChange={(value) => setNewEntry(prev => ({...prev, meal_type: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mealTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {mealIcons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="food_name">Food Name</Label>
                    <Input
                      id="food_name"
                      value={newEntry.food_name}
                      onChange={(e) => setNewEntry(prev => ({...prev, food_name: e.target.value}))}
                      placeholder="e.g. Grilled chicken breast"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newEntry.quantity}
                        onChange={(e) => setNewEntry(prev => ({...prev, quantity: e.target.value}))}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={newEntry.unit} onValueChange={(value) => setNewEntry(prev => ({...prev, unit: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grams">Grams</SelectItem>
                          <SelectItem value="cups">Cups</SelectItem>
                          <SelectItem value="pieces">Pieces</SelectItem>
                          <SelectItem value="servings">Servings</SelectItem>
                          <SelectItem value="ml">ML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 p-3 bg-blue-50 rounded-lg">
                    💡 Leave nutrition fields empty and we'll estimate them with AI!
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="calories">Calories (optional)</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={newEntry.calories}
                        onChange={(e) => setNewEntry(prev => ({...prev, calories: e.target.value}))}
                        placeholder="Auto-calculated"
                      />
                    </div>
                    <div>
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        value={newEntry.protein}
                        onChange={(e) => setNewEntry(prev => ({...prev, protein: e.target.value}))}
                        placeholder="Auto-calculated"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        value={newEntry.carbs}
                        onChange={(e) => setNewEntry(prev => ({...prev, carbs: e.target.value}))}
                        placeholder="Auto-calculated"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        value={newEntry.fat}
                        onChange={(e) => setNewEntry(prev => ({...prev, fat: e.target.value}))}
                        placeholder="Auto-calculated"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddFood}
                    disabled={!newEntry.food_name || isAdding}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    {isAdding ? 'Adding...' : 'Add Food Entry'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Daily Summary */}
        <Card className="mb-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg">Daily Summary - {format(new Date(selectedDate), 'MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Math.round(dayTotals.calories)}</div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.round(dayTotals.protein)}</div>
                <div className="text-sm text-gray-600">Protein (g)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Math.round(dayTotals.carbs)}</div>
                <div className="text-sm text-gray-600">Carbs (g)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{Math.round(dayTotals.fat)}</div>
                <div className="text-sm text-gray-600">Fat (g)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Sections */}
        <div className="space-y-6">
          {mealTypes.map(mealType => (
            <motion.div
              key={mealType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-2xl">{mealIcons[mealType]}</span>
                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                <span className="text-sm font-normal text-gray-500">
                  ({groupedEntries[mealType]?.length || 0} items)
                </span>
              </h2>

              {groupedEntries[mealType]?.length > 0 ? (
                <div className="space-y-3">
                  {groupedEntries[mealType].map(entry => (
                    <div key={entry.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{entry.food_name}</h3>
                        <p className="text-sm text-gray-600">
                          {entry.quantity} {entry.unit} • {entry.calories || 0} cal
                        </p>
                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                          <span>P: {entry.protein || 0}g</span>
                          <span>C: {entry.carbs || 0}g</span>
                          <span>F: {entry.fat || 0}g</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEntry(entry.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">{mealIcons[mealType]}</div>
                  <p>No {mealType} logged yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                      setNewEntry(prev => ({...prev, meal_type: mealType}));
                      setShowAddDialog(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add {mealType}
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}