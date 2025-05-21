
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GradientCard } from '@/components/ui/gradient-card';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Calendar, CheckCircle, Trophy, Weight, Download, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { gradients } from '@/styles/gradients';
import { useTheme } from 'next-themes';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    getTodaysWorkout, 
    markWorkoutDone,
    unmarkWorkoutDone,
    proteinGoal,
    updateProteinConsumed,
    generateExcelReport,
    generatePDFReport,
    isTodayWorkoutCompleted
  } = useData();

  const [proteinInput, setProteinInput] = useState(proteinGoal.consumed.toString());
  const [checkedExercises, setCheckedExercises] = useState<string[]>([]);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [showUnmarkDialog, setShowUnmarkDialog] = useState(false);
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false);
  const [missedExercises, setMissedExercises] = useState<string[]>([]);

  const todaysWorkout = getTodaysWorkout();
  const proteinPercentage = Math.min(Math.round((proteinGoal.consumed / proteinGoal.dailyGrams) * 100), 100);

  useEffect(() => {
    setProteinInput(proteinGoal.consumed.toString());
  }, [proteinGoal.consumed]);

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

  const handleWorkoutDone = async () => {
    // Check if all exercises are completed
    if (todaysWorkout?.exercises && todaysWorkout.exercises.length > 0) {
      const uncheckedExercises = todaysWorkout.exercises
        .filter(exercise => !checkedExercises.includes(exercise.id))
        .map(exercise => exercise.name);

      if (uncheckedExercises.length > 0) {
        setMissedExercises(uncheckedExercises);
        setShowIncompleteDialog(true);
        return;
      }
    }

    await markWorkoutDone();
    setCheckedExercises([]);
  };

  const handleUnmarkWorkout = () => {
    setShowUnmarkDialog(true);
  };

  const confirmUnmarkWorkout = async () => {
    await unmarkWorkoutDone();
    setShowUnmarkDialog(false);
    setCheckedExercises([]);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className={`flex flex-col md:flex-row md:items-center md:justify-between p-6 rounded-lg ${isDark ? gradients.header.dark : gradients.header.light}`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Here's your fitness dashboard for today.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          {isTodayWorkoutCompleted ? (
            <Button 
              onClick={handleUnmarkWorkout} 
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <AlertTriangle className="mr-2 h-4 w-4" /> Unmark Workout
            </Button>
          ) : (
            <Button 
              onClick={handleWorkoutDone} 
              className={isDark ? gradients.success.dark : gradients.success.light}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Mark Workout Done
            </Button>
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={generateExcelReport} 
          variant="outline" 
          className="flex items-center"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel Report
        </Button>
        
        <Button 
          onClick={generatePDFReport} 
          variant="outline"
          className="flex items-center"
        >
          <Download className="mr-2 h-4 w-4" /> Export PDF Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GradientCard gradientType="card" hoverEffect="lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <Weight className="inline-block mr-2 h-4 w-4" /> Current Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{user?.weightInKg || 0} kg</div>
          </CardContent>
        </GradientCard>
        
        <GradientCard gradientType="card" hoverEffect="lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <Trophy className="inline-block mr-2 h-4 w-4" /> Workout Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{user?.workoutStreak || 0} days</div>
          </CardContent>
        </GradientCard>
        
        <GradientCard gradientType="card" hoverEffect="lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <Calendar className="inline-block mr-2 h-4 w-4" /> Completed Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{user?.completedWorkouts || 0}</div>
          </CardContent>
        </GradientCard>
      </div>

      {/* Protein Tracking */}
      <GradientCard>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Protein Intake</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700 dark:text-gray-300">Daily Goal: {proteinGoal.dailyGrams}g</span>
              <span className="text-gray-700 dark:text-gray-300">Current: {proteinGoal.consumed}g ({proteinPercentage}%)</span>
            </div>
            <Progress value={proteinPercentage} className="h-2" />
            
            <div className="flex items-end gap-4 mt-2">
              <div className="space-y-2 flex-grow">
                <Label htmlFor="protein-input" className="text-gray-700 dark:text-gray-300">Update protein intake (grams)</Label>
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
      </GradientCard>

      {/* Today's Workout */}
      <GradientCard>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Today's Workout: {todaysWorkout?.title || 'Rest Day'}</CardTitle>
        </CardHeader>
        <CardContent>
          {todaysWorkout?.exercises && todaysWorkout.exercises.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{todaysWorkout.description}</p>
              
              <div className="space-y-2">
                {todaysWorkout.exercises.map(exercise => (
                  <div key={exercise.id} className="flex items-start space-x-3 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <Checkbox 
                      id={exercise.id} 
                      checked={checkedExercises.includes(exercise.id)}
                      onCheckedChange={() => handleExerciseCheck(exercise.id)}
                      className="mt-1"
                      disabled={isTodayWorkoutCompleted}
                    />
                    <div className="flex flex-col md:flex-row w-full">
                      <Label htmlFor={exercise.id} className="flex-grow cursor-pointer text-gray-800 dark:text-gray-200">
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 block">
                          {exercise.sets} sets × {exercise.repsRange} reps
                        </span>
                      </Label>
                      
                      <div className="mt-2 md:mt-0">
                        <img 
                          src={exercise.imageUrl} 
                          alt={exercise.name} 
                          className="h-16 w-24 object-cover rounded-md"
                        />
                      </div>
                    </div>
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
      </GradientCard>

      {/* Incomplete Workout Alert */}
      <AlertDialog open={showIncompleteDialog} onOpenChange={setShowIncompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Incomplete Workout</AlertDialogTitle>
            <AlertDialogDescription>
              You haven't marked the following exercises as completed:
              <ul className="list-disc pl-5 mt-2">
                {missedExercises.map((exercise, index) => (
                  <li key={index} className="text-gray-800 dark:text-gray-200">{exercise}</li>
                ))}
              </ul>
              Complete all exercises to increase your workout streak!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ok, I'll Complete Them</AlertDialogCancel>
            <AlertDialogAction onClick={markWorkoutDone}>Mark Anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unmark Workout Alert */}
      <AlertDialog open={showUnmarkDialog} onOpenChange={setShowUnmarkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unmark Today's Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove today's workout from your completed list and may affect your streak. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnmarkWorkout} className="bg-red-600 hover:bg-red-700">
              Yes, Unmark
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
