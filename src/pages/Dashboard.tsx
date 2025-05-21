
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Calendar, CheckCircle, Trophy, Weight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    getTodaysWorkout, 
    markWorkoutDone, 
    proteinGoal,
    updateProteinConsumed
  } = useData();

  const [proteinInput, setProteinInput] = React.useState(proteinGoal.consumed.toString());
  const [checkedExercises, setCheckedExercises] = React.useState<string[]>([]);

  const todaysWorkout = getTodaysWorkout();
  const proteinPercentage = Math.min(Math.round((proteinGoal.consumed / proteinGoal.dailyGrams) * 100), 100);

  const handleExerciseCheck = (exerciseId: string) => {
    setCheckedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };

  const handleProteinUpdate = () => {
    const proteinValue = parseInt(proteinInput);
    if (!isNaN(proteinValue) && proteinValue >= 0) {
      updateProteinConsumed(proteinValue);
    }
  };

  const handleWorkoutDone = () => {
    markWorkoutDone();
    setCheckedExercises([]);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Here's your fitness dashboard for today.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={handleWorkoutDone}>
            <CheckCircle className="mr-2 h-4 w-4" /> Mark Workout Done
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              <Weight className="inline-block mr-2 h-4 w-4" /> Current Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.weightInKg || 0} kg</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              <Trophy className="inline-block mr-2 h-4 w-4" /> Workout Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.workoutStreak || 0} days</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              <Calendar className="inline-block mr-2 h-4 w-4" /> Completed Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.completedWorkouts || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Protein Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Protein Intake</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span>Daily Goal: {proteinGoal.dailyGrams}g</span>
              <span>Current: {proteinGoal.consumed}g ({proteinPercentage}%)</span>
            </div>
            <Progress value={proteinPercentage} className="h-2" />
            
            <div className="flex items-end gap-4 mt-2">
              <div className="space-y-2 flex-grow">
                <Label htmlFor="protein-input">Update protein intake (grams)</Label>
                <Input
                  id="protein-input"
                  type="number"
                  min="0"
                  value={proteinInput}
                  onChange={(e) => setProteinInput(e.target.value)}
                />
              </div>
              <Button onClick={handleProteinUpdate}>Update</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Workout */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Workout: {todaysWorkout?.title || 'Rest Day'}</CardTitle>
        </CardHeader>
        <CardContent>
          {todaysWorkout?.exercises && todaysWorkout.exercises.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{todaysWorkout.description}</p>
              
              <div className="space-y-2">
                {todaysWorkout.exercises.map(exercise => (
                  <div key={exercise.id} className="flex items-center space-x-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <Checkbox 
                      id={exercise.id} 
                      checked={checkedExercises.includes(exercise.id)}
                      onCheckedChange={() => handleExerciseCheck(exercise.id)}
                    />
                    <Label htmlFor={exercise.id} className="flex-grow cursor-pointer">
                      <span className="font-medium">{exercise.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block">
                        {exercise.sets} sets × {exercise.repsRange} reps
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {todaysWorkout?.description || 'Today is a rest day. Recover and prepare for tomorrow!'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
