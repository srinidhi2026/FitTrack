import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workout, Exercise, WorkoutDay } from '@/types/workout';
import { ProteinFood, ProteinGoal, BudgetLevel } from '@/types/nutrition';
import { ProgressEntry } from '@/types/progress';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface DataContextType {
  // Workouts
  workouts: Workout[];
  getTodaysWorkout: () => Workout | undefined;
  getWorkoutByDay: (day: WorkoutDay) => Workout | undefined;
  markWorkoutDone: () => Promise<void>;
  
  // Nutrition
  proteinGoal: ProteinGoal;
  updateProteinConsumed: (grams: number) => Promise<void>;
  proteinFoods: ProteinFood[];
  budgetFilter: BudgetLevel | 'all';
  setBudgetFilter: (level: BudgetLevel | 'all') => void;
  filteredProteinFoods: ProteinFood[];
  
  // Progress
  progressEntries: ProgressEntry[];
  addProgressEntry: (entry: Omit<ProgressEntry, 'date'>) => Promise<void>;
  
  // Reports
  generateExcelReport: () => Promise<void>;
  generatePDFReport: () => Promise<void>;
  
  // Loading state
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock exercises data - will be replaced with data from Supabase later
const mockExercises: Record<string, Exercise[]> = {
  push: [
    {
      id: 'bench-press',
      name: 'Barbell Bench Press',
      sets: 4,
      repsRange: '6-8',
      muscleGroup: 'chest',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Lie on a flat bench with feet on the ground. Grip the bar slightly wider than shoulder-width. Lower the bar to your chest, then press back up.'
    },
    {
      id: 'shoulder-press',
      name: 'Dumbbell Shoulder Press',
      sets: 4,
      repsRange: '8-10',
      muscleGroup: 'shoulders',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Sit on a bench with back support. Hold dumbbells at shoulder height. Press weights upward until arms are extended, then lower.'
    },
    {
      id: 'incline-press',
      name: 'Incline Dumbbell Press',
      sets: 3,
      repsRange: '8-10',
      muscleGroup: 'chest',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Lie on an incline bench. Hold dumbbells at shoulder width. Press weights up until arms are extended, then lower.'
    },
    {
      id: 'lateral-raises',
      name: 'Lateral Raises',
      sets: 3,
      repsRange: '12-15',
      muscleGroup: 'shoulders',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Stand with dumbbells at your sides. Raise arms out to the sides until parallel with the floor, then lower.'
    },
    {
      id: 'chest-fly',
      name: 'Cable Chest Fly',
      sets: 3,
      repsRange: '10-12',
      muscleGroup: 'chest',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Stand between cable machines. Grab handles with arms extended. Pull handles together in front of you, then return.'
    },
    {
      id: 'tricep-pushdown',
      name: 'Tricep Pushdowns',
      sets: 3,
      repsRange: '10-12',
      muscleGroup: 'triceps',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Stand at cable machine with high pulley. Grab bar with overhand grip. Push down until arms are straight, then return.'
    },
    {
      id: 'tricep-extension',
      name: 'Overhead Tricep Extensions',
      sets: 3,
      repsRange: '10-12',
      muscleGroup: 'triceps',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Hold dumbbell with both hands behind your head. Extend arms upward, then lower weight back down.'
    }
  ],
  pull: [
    {
      id: 'pull-ups',
      name: 'Pull-Ups or Lat Pulldowns',
      sets: 4,
      repsRange: '8-10',
      muscleGroup: 'back',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Hang from a bar with hands wider than shoulder width. Pull yourself up until chin is over the bar, then lower.'
    },
    {
      id: 'barbell-rows',
      name: 'Barbell Rows',
      sets: 4,
      repsRange: '8-10',
      muscleGroup: 'back',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Bend at hips with slight knee bend. Hold bar with overhand grip. Pull bar to lower chest, then lower.'
    },
    {
      id: 'seated-rows',
      name: 'Seated Cable Rows',
      sets: 3,
      repsRange: '10-12',
      muscleGroup: 'back',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Sit at cable row machine. Pull handle to waist while keeping back straight, then extend arms.'
    },
    {
      id: 'face-pulls',
      name: 'Face Pulls',
      sets: 3,
      repsRange: '12-15',
      muscleGroup: 'shoulders',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Stand at cable machine with rope attachment. Pull rope towards face while spreading ends apart, then return.'
    },
    {
      id: 'barbell-curls',
      name: 'Barbell Curls',
      sets: 3,
      repsRange: '10-12',
      muscleGroup: 'biceps',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Stand with barbell in hands using underhand grip. Curl weight up while keeping elbows fixed, then lower.'
    },
    {
      id: 'hammer-curls',
      name: 'Hammer Curls',
      sets: 3,
      repsRange: '10-12',
      muscleGroup: 'biceps',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Stand with dumbbells in hands, palms facing each other. Curl weights up while keeping elbows fixed, then lower.'
    }
  ],
  legs: [
    {
      id: 'squats',
      name: 'Squats',
      sets: 4,
      repsRange: '6-8',
      muscleGroup: 'quads',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Stand with barbell on shoulders. Bend knees and lower into squat position, then stand back up.'
    },
    {
      id: 'romanian-deadlifts',
      name: 'Romanian Deadlifts',
      sets: 4,
      repsRange: '8-10',
      muscleGroup: 'hamstrings',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Hold barbell in front of thighs. Hinge at hips and lower weight while keeping back straight, then return to starting position.'
    },
    {
      id: 'leg-press',
      name: 'Leg Press',
      sets: 3,
      repsRange: '10-12',
      muscleGroup: 'quads',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Sit at leg press machine. Push weight away with feet until legs are extended, then return.'
    },
    {
      id: 'walking-lunges',
      name: 'Walking Lunges',
      sets: 3,
      repsRange: '12/leg',
      muscleGroup: 'quads',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Hold dumbbells at sides. Step forward into a lunge position, then bring back leg forward to step again.'
    },
    {
      id: 'leg-curls',
      name: 'Leg Curls',
      sets: 3,
      repsRange: '12-15',
      muscleGroup: 'hamstrings',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Lie face down on leg curl machine. Curl legs up by bringing heels toward buttocks, then lower.'
    },
    {
      id: 'calf-raises',
      name: 'Calf Raises (Standing/Seated)',
      sets: 4,
      repsRange: '15-20',
      muscleGroup: 'calves',
      imageUrl: '/public/placeholder.svg',
      instructions: 'Stand with weights on shoulders or seated with weight on knees. Raise heels as high as possible, then lower.'
    }
  ]
};

// Initial workout structure
const initialWorkouts: Workout[] = [
  {
    day: 'monday',
    title: 'Push Day',
    description: 'Focus on Chest, Shoulders, and Triceps',
    exercises: mockExercises.push
  },
  {
    day: 'tuesday',
    title: 'Pull Day',
    description: 'Focus on Back and Biceps',
    exercises: mockExercises.pull
  },
  {
    day: 'wednesday',
    title: 'Leg Day',
    description: 'Focus on Quads, Glutes, Hamstrings, and Calves',
    exercises: mockExercises.legs
  },
  {
    day: 'thursday',
    title: 'Push Day',
    description: 'Focus on Chest, Shoulders, and Triceps',
    exercises: mockExercises.push
  },
  {
    day: 'friday',
    title: 'Pull Day',
    description: 'Focus on Back and Biceps',
    exercises: mockExercises.pull
  },
  {
    day: 'saturday',
    title: 'Leg Day',
    description: 'Focus on Quads, Glutes, Hamstrings, and Calves',
    exercises: mockExercises.legs
  },
  {
    day: 'sunday',
    title: 'Rest Day',
    description: 'Rest, Light Cardio, or Stretching',
    exercises: []
  }
];

const mockProteinFoods: ProteinFood[] = [
  // Low Budget
  {
    id: 'eggs',
    name: 'Eggs',
    proteinPer100g: 13,
    budget: 'low',
    servingSuggestion: '3 eggs = ~20g protein',
    imageUrl: '/public/placeholder.svg'
  },
  {
    id: 'lentils',
    name: 'Lentils, Beans, Chickpeas',
    proteinPer100g: 9,
    budget: 'low',
    servingSuggestion: '1 cup cooked = ~18g protein',
    imageUrl: '/public/placeholder.svg'
  },
  {
    id: 'soya',
    name: 'Soya Chunks',
    proteinPer100g: 52,
    budget: 'low',
    servingSuggestion: '100g = ~52g protein',
    imageUrl: '/public/placeholder.svg'
  },
  {
    id: 'milk',
    name: 'Milk, Curd/Yogurt',
    proteinPer100g: 3.5,
    budget: 'low',
    servingSuggestion: '1 cup = ~8g protein',
    imageUrl: '/public/placeholder.svg'
  },
  {
    id: 'paneer',
    name: 'Homemade Paneer',
    proteinPer100g: 18,
    budget: 'low',
    servingSuggestion: '100g = ~18g protein',
    imageUrl: '/public/placeholder.svg'
  },
  {
    id: 'oats-milk',
    name: 'Oats + Milk',
    proteinPer100g: 16.5,
    budget: 'low',
    servingSuggestion: '1 bowl = ~15g protein',
    imageUrl: '/public/placeholder.svg'
  },
  {
    id: 'peanut-butter',
    name: 'Peanut Butter',
    proteinPer100g: 25,
    budget: 'low',
    servingSuggestion: '2 tbsp = ~7g protein',
    imageUrl: '/public/placeholder.svg'
  },
  // High Budget
  {
    id: 'whey',
    name: 'Whey Protein',
    proteinPer100g: 80,
    budget: 'high',
    servingSuggestion: '1 scoop (30g) = ~24g protein',
    imageUrl: '/public/placeholder.svg'
  },
  {
    id: 'chicken',
    name: 'Chicken Breast',
    proteinPer100g: 31,
    budget: 'high',
    servingSuggestion: '100g = ~31g protein',
    imageUrl: '/public/placeholder.svg'
  },
  {
    id: 'fish',
    name: 'Fish (Tuna, Salmon)',
    proteinPer100g: 26,
    budget: 'high',
    servingSuggestion: '100g = ~26g protein',
    imageUrl: '/public/placeholder.svg'
  },
  {
    id: 'beef',
    name: 'Lean Beef',
    proteinPer100g: 26,
    budget: 'high',
    servingSuggestion: '100g = ~26g protein',
    imageUrl: '/public/placeholder.svg'
  },
  {
    id: 'protein-bars',
    name: 'Protein Bars',
    proteinPer100g: 30,
    budget: 'high',
    servingSuggestion: '1 bar = ~20g protein',
    imageUrl: '/public/placeholder.svg'
  },
  {
    id: 'nuts',
    name: 'Almonds, Walnuts',
    proteinPer100g: 21,
    budget: 'high',
    servingSuggestion: '30g (handful) = ~6g protein',
    imageUrl: '/public/placeholder.svg'
  },
  {
    id: 'greek-yogurt',
    name: 'Greek Yogurt',
    proteinPer100g: 10,
    budget: 'high',
    servingSuggestion: '1 cup = ~17g protein',
    imageUrl: '/public/placeholder.svg'
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State for workouts
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  
  // State for protein tracking
  const [proteinGoal, setProteinGoal] = useState<ProteinGoal>({
    dailyGrams: 0,
    consumed: 0
  });
  
  // State for protein foods
  const [proteinFoods, setProteinFoods] = useState<ProteinFood[]>([]);
  const [budgetFilter, setBudgetFilter] = useState<BudgetLevel | 'all'>('all');
  
  // State for tracking progress
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Load exercises and protein foods data
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*');

        if (error) throw error;
        
        if (data && data.length > 0) {
          // Map data to Exercise type and update workouts with actual exercises
          const exercisesMap: Record<string, Exercise[]> = {};
          
          // Group exercises by muscle group
          data.forEach((exercise: any) => {
            const muscleGroup = exercise.muscle_group;
            if (!exercisesMap[muscleGroup]) {
              exercisesMap[muscleGroup] = [];
            }
            
            exercisesMap[muscleGroup].push({
              id: exercise.id,
              name: exercise.name,
              sets: exercise.sets,
              repsRange: exercise.reps_range,
              muscleGroup: exercise.muscle_group,
              imageUrl: exercise.image_url,
              instructions: exercise.instructions
            });
          });
          
          // For demo purpose, let's map chest, shoulders, triceps exercises to push
          // back, biceps to pull, and legs to legs
          const pushExercises = [
            ...(exercisesMap.chest || []), 
            ...(exercisesMap.shoulders || []), 
            ...(exercisesMap.triceps || [])
          ];
          
          const pullExercises = [
            ...(exercisesMap.back || []),
            ...(exercisesMap.biceps || [])
          ];
          
          const legExercises = [
            ...(exercisesMap.quads || []),
            ...(exercisesMap.hamstrings || []),
            ...(exercisesMap.calves || []),
            ...(exercisesMap.glutes || [])
          ];
          
          // If we have real data, update workouts
          if (pushExercises.length > 0 || pullExercises.length > 0 || legExercises.length > 0) {
            const updatedWorkouts = workouts.map(workout => {
              if (workout.title.includes('Push')) {
                return { ...workout, exercises: pushExercises.length > 0 ? pushExercises : workout.exercises };
              } else if (workout.title.includes('Pull')) {
                return { ...workout, exercises: pullExercises.length > 0 ? pullExercises : workout.exercises };
              } else if (workout.title.includes('Leg')) {
                return { ...workout, exercises: legExercises.length > 0 ? legExercises : workout.exercises };
              }
              return workout;
            });
            
            setWorkouts(updatedWorkouts);
          }
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };
    
    const fetchProteinFoods = async () => {
      try {
        const { data, error } = await supabase
          .from('protein_foods')
          .select('*');

        if (error) throw error;
        
        if (data && data.length > 0) {
          // Map data to ProteinFood type
          const foods: ProteinFood[] = data.map((food: any) => ({
            id: food.id,
            name: food.name,
            proteinPer100g: food.protein_per_100g,
            budget: food.budget_level,
            servingSuggestion: food.serving_suggestion,
            imageUrl: food.image_url
          }));
          
          setProteinFoods(foods);
        } else {
          // If no data in database, load mock data
          setProteinFoods(mockProteinFoods);
        }
      } catch (error) {
        console.error('Error fetching protein foods:', error);
      }
    };
    
    fetchExercises();
    fetchProteinFoods();
  }, []);

  // Effect to calculate protein goal when user changes
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    let proteinMultiplier = 1.6; // Default
    
    switch (user.goalType) {
      case 'muscle':
        proteinMultiplier = 2.0;
        break;
      case 'fat_loss':
        proteinMultiplier = 2.2;
        break;
      case 'weight_gain':
        proteinMultiplier = 1.8;
        break;
      case 'strength':
        proteinMultiplier = 1.6;
        break;
      default:
        proteinMultiplier = 1.6;
    }
    
    const calculatedGoal = Math.round(user.weightInKg * proteinMultiplier);
    
    // Fetch today's protein intake
    const fetchTodaysProtein = async () => {
      try {
        const today = new Date();
        const { data, error } = await supabase
          .from('protein_tracking')
          .select('grams')
          .eq('user_id', user.id)
          .gte('recorded_at', startOfDay(today).toISOString())
          .lte('recorded_at', endOfDay(today).toISOString())
          .maybeSingle();
          
        if (error) throw error;
        
        setProteinGoal({
          dailyGrams: calculatedGoal,
          consumed: data?.grams || 0
        });
      } catch (error) {
        console.error('Error fetching protein data:', error);
        setProteinGoal({
          dailyGrams: calculatedGoal,
          consumed: 0
        });
      }
    };
    
    // Fetch progress entries
    const fetchProgressEntries = async () => {
      try {
        const { data, error } = await supabase
          .from('weight_history')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(30);
          
        if (error) throw error;
        
        const entries: ProgressEntry[] = data.map((entry: any) => ({
          date: new Date(entry.recorded_at),
          weight: entry.weight_kg,
          sleepHours: 0, // These will be filled in later if needed
          proteinConsumed: 0,
          workoutCompleted: false
        }));
        
        setProgressEntries(entries);
      } catch (error) {
        console.error('Error fetching progress entries:', error);
      }
      
      setIsLoading(false);
    };
    
    fetchTodaysProtein();
    fetchProgressEntries();
  }, [user]);

  const getTodaysWorkout = () => {
    // Fix: Use a valid value for weekday parameter and convert it to lowercase manually
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as WorkoutDay;
    return workouts.find(workout => workout.day === today);
  };

  const getWorkoutByDay = (day: WorkoutDay) => {
    return workouts.find(workout => workout.day === day);
  };

  const markWorkoutDone = async () => {
    if (!user) return;
    
    try {
      const todayWorkout = getTodaysWorkout();
      if (!todayWorkout) {
        toast({
          title: "No workout scheduled",
          description: "There's no workout scheduled for today.",
        });
        return;
      }
      
      // Record workout completion
      const { error: workoutError } = await supabase
        .from('workout_completions')
        .insert({
          user_id: user.id,
          workout_day: todayWorkout.day,
          workout_title: todayWorkout.title
        });
      
      if (workoutError) throw workoutError;
      
      // Update streak and completed workouts count
      let streak = user.workoutStreak;
      
      // Check if there was a workout completed yesterday to maintain streak
      const yesterday = subDays(new Date(), 1);
      
      const { data: yesterdayWorkout, error: yesterdayError } = await supabase
        .from('workout_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', startOfDay(yesterday).toISOString())
        .lte('completed_at', endOfDay(yesterday).toISOString())
        .maybeSingle();
      
      if (yesterdayError) throw yesterdayError;
      
      if (yesterdayWorkout) {
        // Maintain or increase streak
        streak += 1;
      } else {
        // Streak broken, start new streak
        streak = 1;
      }
      
      // Update profile with new streak and completed workouts
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          workout_streak: streak,
          completed_workouts: user.completedWorkouts + 1
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Workout Completed!",
        description: `Great job! Your streak is now ${streak} days.`,
      });
      
      // Fetch updated user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileError) throw profileError;
        
      // Note: AuthContext will pick up the user profile changes automatically
    } catch (error: any) {
      console.error('Error recording workout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record workout completion",
        variant: "destructive",
      });
    }
  };

  const updateProteinConsumed = async (grams: number) => {
    if (!user) return;
    
    try {
      const today = new Date();
      
      // Check if there's already a protein entry for today
      const { data: existingEntry, error: fetchError } = await supabase
        .from('protein_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', startOfDay(today).toISOString())
        .lte('recorded_at', endOfDay(today).toISOString())
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      if (existingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('protein_tracking')
          .update({ grams })
          .eq('id', existingEntry.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new entry
        const { error: insertError } = await supabase
          .from('protein_tracking')
          .insert({ user_id: user.id, grams });
          
        if (insertError) throw insertError;
      }
      
      setProteinGoal(prev => ({
        ...prev,
        consumed: grams
      }));
      
      toast({
        title: "Protein Intake Updated",
        description: `You've logged ${grams}g of protein today.`,
      });
    } catch (error: any) {
      console.error('Error updating protein intake:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update protein intake",
        variant: "destructive",
      });
    }
  };

  const addProgressEntry = async (entry: Omit<ProgressEntry, 'date'>) => {
    if (!user) return;
    
    try {
      // Record weight in weight history
      const { error: weightError } = await supabase
        .from('weight_history')
        .insert({ 
          user_id: user.id, 
          weight_kg: entry.weight
        });
      
      if (weightError) throw weightError;
      
      // Update profile weight
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ weight_kg: entry.weight })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Update protein tracking
      await updateProteinConsumed(entry.proteinConsumed);
      
      // If workout was completed, mark it done
      if (entry.workoutCompleted) {
        await markWorkoutDone();
      }
      
      // Refresh progress entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('weight_history')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(30);
        
      if (entriesError) throw entriesError;
      
      const updatedEntries: ProgressEntry[] = entriesData.map((weightEntry: any) => ({
        date: new Date(weightEntry.recorded_at),
        weight: weightEntry.weight_kg,
        sleepHours: entry.sleepHours || 0,
        proteinConsumed: entry.proteinConsumed || 0,
        workoutCompleted: entry.workoutCompleted || false,
        measurements: entry.measurements
      }));
      
      setProgressEntries(updatedEntries);
      
      toast({
        title: "Progress Tracked",
        description: "Your progress data has been saved.",
      });
    } catch (error: any) {
      console.error('Error saving progress:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save progress data",
        variant: "destructive",
      });
    }
  };

  // Generate Excel report of user progress
  const generateExcelReport = async () => {
    if (!user) return;
    
    try {
      // Fetch comprehensive progress data
      const [weightData, proteinData, workoutData] = await Promise.all([
        supabase
          .from('weight_history')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false }),
          
        supabase
          .from('protein_tracking')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false }),
          
        supabase
          .from('workout_completions')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
      ]);
      
      if (weightData.error) throw weightData.error;
      if (proteinData.error) throw proteinData.error;
      if (workoutData.error) throw workoutData.error;
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create weight sheet
      const weightSheet = XLSX.utils.json_to_sheet(weightData.data.map((item: any) => ({
        Date: new Date(item.recorded_at).toLocaleDateString(),
        'Weight (kg)': item.weight_kg
      })));
      
      // Create protein sheet
      const proteinSheet = XLSX.utils.json_to_sheet(proteinData.data.map((item: any) => ({
        Date: new Date(item.recorded_at).toLocaleDateString(),
        'Protein (g)': item.grams
      })));
      
      // Create workout sheet
      const workoutSheet = XLSX.utils.json_to_sheet(workoutData.data.map((item: any) => ({
        Date: new Date(item.completed_at).toLocaleDateString(),
        'Workout': item.workout_title,
        'Day': item.workout_day
      })));
      
      // Add sheets to workbook
      XLSX.utils.book_append_sheet(wb, weightSheet, 'Weight History');
      XLSX.utils.book_append_sheet(wb, proteinSheet, 'Protein Tracking');
      XLSX.utils.book_append_sheet(wb, workoutSheet, 'Workouts Completed');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `FitTrack_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Excel Report Generated",
        description: "Your fitness progress report has been downloaded.",
      });
    } catch (error: any) {
      console.error('Error generating Excel report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate Excel report",
        variant: "destructive",
      });
    }
  };
  
  // Generate PDF report of user progress
  const generatePDFReport = async () => {
    if (!user) return;
    
    try {
      // Fetch comprehensive progress data
      const [weightData, proteinData, workoutData, profileData] = await Promise.all([
        supabase
          .from('weight_history')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(10),
          
        supabase
          .from('protein_tracking')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(10),
          
        supabase
          .from('workout_completions')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(10),
          
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
      ]);
      
      if (weightData.error) throw weightData.error;
      if (proteinData.error) throw proteinData.error;
      if (workoutData.error) throw workoutData.error;
      if (profileData.error) throw profileData.error;
      
      // Create PDF document
      const pdfDoc = await PDFDocument.create();
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Add page
      const page = pdfDoc.addPage([600, 800]);
      
      // Add title
      page.drawText('FitTrack Progress Report', {
        x: 50,
        y: 750,
        size: 24,
        font: helveticaBold,
        color: rgb(0, 0.3, 0.7),
      });
      
      // Add user info
      page.drawText(`Name: ${user.name}`, {
        x: 50,
        y: 720,
        size: 12,
        font: helvetica,
      });
      
      page.drawText(`Current Weight: ${user.weightInKg} kg`, {
        x: 50,
        y: 700,
        size: 12,
        font: helvetica,
      });
      
      page.drawText(`Goal: ${user.goalType.replace('_', ' ')}`, {
        x: 50,
        y: 680,
        size: 12,
        font: helvetica,
      });
      
      page.drawText(`Workout Streak: ${user.workoutStreak} days`, {
        x: 50,
        y: 660,
        size: 12,
        font: helvetica,
      });
      
      page.drawText(`Completed Workouts: ${user.completedWorkouts}`, {
        x: 50,
        y: 640,
        size: 12,
        font: helvetica,
      });
      
      // Add weight history section
      page.drawText('Weight History', {
        x: 50,
        y: 600,
        size: 16,
        font: helveticaBold,
        color: rgb(0, 0.3, 0.7),
      });
      
      let y = 580;
      weightData.data.slice(0, 5).forEach((item: any, index: number) => {
        page.drawText(`${new Date(item.recorded_at).toLocaleDateString()}: ${item.weight_kg} kg`, {
          x: 50,
          y: y - (index * 20),
          size: 10,
          font: helvetica,
        });
      });
      
      // Add protein tracking section
      page.drawText('Recent Protein Intake', {
        x: 50,
        y: 480,
        size: 16,
        font: helveticaBold,
        color: rgb(0, 0.3, 0.7),
      });
      
      y = 460;
      proteinData.data.slice(0, 5).forEach((item: any, index: number) => {
        page.drawText(`${new Date(item.recorded_at).toLocaleDateString()}: ${item.grams} g`, {
          x: 50,
          y: y - (index * 20),
          size: 10,
          font: helvetica,
        });
      });
      
      // Add workouts section
      page.drawText('Recent Workouts', {
        x: 50,
        y: 360,
        size: 16,
        font: helveticaBold,
        color: rgb(0, 0.3, 0.7),
      });
      
      y = 340;
      workoutData.data.slice(0, 5).forEach((item: any, index: number) => {
        page.drawText(`${new Date(item.completed_at).toLocaleDateString()}: ${item.workout_title}`, {
          x: 50,
          y: y - (index * 20),
          size: 10,
          font: helvetica,
        });
      });
      
      // Add footer
      page.drawText(`Report generated on ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: 50,
        size: 10,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `FitTrack_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Report Generated",
        description: "Your fitness progress report has been downloaded.",
      });
    } catch (error: any) {
      console.error('Error generating PDF report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  const filteredProteinFoods = budgetFilter === 'all'
    ? proteinFoods
    : proteinFoods.filter(food => food.budget === budgetFilter);

  return (
    <DataContext.Provider
      value={{
        workouts,
        getTodaysWorkout,
        getWorkoutByDay,
        markWorkoutDone,
        proteinGoal,
        updateProteinConsumed,
        proteinFoods,
        budgetFilter,
        setBudgetFilter,
        filteredProteinFoods,
        progressEntries,
        addProgressEntry,
        generateExcelReport,
        generatePDFReport,
        isLoading
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
