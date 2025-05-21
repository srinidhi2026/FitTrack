
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { User, Calculator, CheckCheck, CheckCircle2 } from 'lucide-react';

const NutritionPage = () => {
  const { user, updateUserWeight, updateUserGoal } = useAuth();
  const { proteinGoal, budgetFilter, setBudgetFilter, filteredProteinFoods } = useData();
  
  const [weight, setWeight] = useState(user?.weightInKg.toString() || '');
  const [goal, setGoal] = useState<string>(user?.goalType || 'muscle');
  
  const handleWeightUpdate = () => {
    const weightValue = parseFloat(weight);
    if (!isNaN(weightValue) && weightValue > 0) {
      updateUserWeight(weightValue);
    }
  };
  
  const handleGoalUpdate = (value: string) => {
    setGoal(value);
    updateUserGoal(value as any);
  };
  
  const getProteinMultiplier = (goalType: string) => {
    switch (goalType) {
      case 'muscle':
        return '2.0-2.2g/kg';
      case 'fat_loss':
        return '2.2g/kg';
      case 'weight_gain':
        return '1.8-2.0g/kg';
      case 'strength':
        return '1.6-2.0g/kg';
      default:
        return '1.6-2.2g/kg';
    }
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Protein Calculator & Food Guide
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track your protein intake and discover protein-rich foods
        </p>
      </div>
      
      {/* Protein Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" /> 
            Protein Calculator
          </CardTitle>
          <CardDescription>
            Calculate your daily protein requirements based on your weight and goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="weight">Your Weight (kg)</Label>
                <div className="flex items-center space-x-2 mt-1.5">
                  <Input
                    id="weight"
                    type="number"
                    min="1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleWeightUpdate}>Update</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Your Goal</Label>
                <RadioGroup value={goal} onValueChange={handleGoalUpdate} className="gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="muscle" id="muscle" />
                    <Label htmlFor="muscle" className="cursor-pointer">Muscle Gain</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fat_loss" id="fat_loss" />
                    <Label htmlFor="fat_loss" className="cursor-pointer">Fat Loss</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weight_gain" id="weight_gain" />
                    <Label htmlFor="weight_gain" className="cursor-pointer">Weight Gain</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="strength" id="strength" />
                    <Label htmlFor="strength" className="cursor-pointer">Strength Gain</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 flex flex-col justify-center">
              <div className="space-y-2">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Recommendation for {goal.replace('_', ' ')}:</div>
                <div className="font-medium text-gray-600 dark:text-gray-300">{getProteinMultiplier(goal)}</div>
                
                <div className="text-gray-500 dark:text-gray-400 text-sm mt-6">Your daily protein goal:</div>
                <div className="text-3xl font-bold text-primary">{proteinGoal.dailyGrams}g</div>
                
                <div className="text-gray-500 dark:text-gray-400 text-sm mt-4">Current intake today:</div>
                <div className="text-xl font-medium">{proteinGoal.consumed}g</div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p><strong>Note:</strong> Protein needs vary based on individual factors. These are general recommendations.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Protein Food Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCheck className="mr-2 h-5 w-5" /> 
            Protein Food Guide
          </CardTitle>
          <CardDescription>
            Select high-quality protein sources based on your budget
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Label>Filter by Budget:</Label>
            <div className="flex space-x-2">
              <Button 
                variant={budgetFilter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setBudgetFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={budgetFilter === 'low' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setBudgetFilter('low')}
              >
                Low Budget
              </Button>
              <Button 
                variant={budgetFilter === 'high' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setBudgetFilter('high')}
              >
                High Budget
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProteinFoods.map((food) => (
              <div key={food.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center shrink-0">
                    <img 
                      src={food.imageUrl}
                      alt={food.name}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{food.name}</h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                      <p><strong>{food.proteinPer100g}g</strong> protein per 100g</p>
                      <p>{food.servingSuggestion}</p>
                      <p className="text-xs mt-1">Budget: <span className={`capitalize ${food.budget === 'low' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>{food.budget}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p><strong>Tip:</strong> Aim to consume protein throughout the day, with at least 20-30g per meal for optimal muscle protein synthesis.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionPage;
