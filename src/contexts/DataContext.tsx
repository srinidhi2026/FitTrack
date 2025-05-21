
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workout, Exercise, WorkoutDay } from '@/types/workout';
import { ProteinFood, ProteinGoal, BudgetLevel } from '@/types/nutrition';
import { ProgressEntry } from '@/types/progress';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface DataContextType {
  // Workouts
  workouts: Workout[];
  getTodaysWorkout: () => Workout | undefined;
  getWorkoutByDay: (day: WorkoutDay) => Workout | undefined;
  markWorkoutDone: () => void;
  
  // Nutrition
  proteinGoal: ProteinGoal;
  updateProteinConsumed: (grams: number) => void;
  proteinFoods: ProteinFood[];
  budgetFilter: BudgetLevel | 'all';
  setBudgetFilter: (level: BudgetLevel | 'all') => void;
  filteredProteinFoods: ProteinFood[];
  
  // Progress
  progressEntries: ProgressEntry[];
  addProgressEntry: (entry: Omit<ProgressEntry, 'date'>) => void;
  
  // Loading state
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data - in a real app this would come from an API
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

const mockWorkouts: Workout[] = [
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
  const [workouts, setWorkouts] = useState<Workout[]>(mockWorkouts);
  
  // State for protein tracking
  const [proteinGoal, setProteinGoal] = useState<ProteinGoal>({
    dailyGrams: 0,
    consumed: 0
  });
  
  // State for protein foods
  const [proteinFoods, setProteinFoods] = useState<ProteinFood[]>(mockProteinFoods);
  const [budgetFilter, setBudgetFilter] = useState<BudgetLevel | 'all'>('all');
  
  // State for tracking progress
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Effect to calculate protein goal when user changes
  useEffect(() => {
    if (!user) {
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
    
    setProteinGoal(prev => ({
      dailyGrams: calculatedGoal,
      consumed: prev.consumed
    }));
    
    // Load progress entries from localStorage
    const storedEntries = localStorage.getItem(`fittrack_progress_${user.id}`);
    if (storedEntries) {
      try {
        const parsedEntries = JSON.parse(storedEntries).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }));
        setProgressEntries(parsedEntries);
      } catch (error) {
        console.error('Failed to parse progress entries', error);
      }
    }
    
    setIsLoading(false);
  }, [user]);

  const getTodaysWorkout = () => {
    // Fix: Use a valid value for weekday parameter and convert it to lowercase manually
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as WorkoutDay;
    return workouts.find(workout => workout.day === today);
  };

  const getWorkoutByDay = (day: WorkoutDay) => {
    return workouts.find(workout => workout.day === day);
  };

  const markWorkoutDone = () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const existingEntry = progressEntries.find(
      entry => new Date(entry.date).toISOString().split('T')[0] === today
    );
    
    if (existingEntry) {
      // Update existing entry
      const updatedEntries = progressEntries.map(entry => 
        new Date(entry.date).toISOString().split('T')[0] === today 
          ? { ...entry, workoutCompleted: true }
          : entry
      );
      
      setProgressEntries(updatedEntries);
      localStorage.setItem(`fittrack_progress_${user.id}`, JSON.stringify(updatedEntries));
    } else {
      // Create new entry
      const newEntry: ProgressEntry = {
        date: new Date(),
        weight: user.weightInKg,
        sleepHours: 7, // Default
        proteinConsumed: proteinGoal.consumed,
        workoutCompleted: true
      };
      
      const updatedEntries = [...progressEntries, newEntry];
      setProgressEntries(updatedEntries);
      localStorage.setItem(`fittrack_progress_${user.id}`, JSON.stringify(updatedEntries));
    }
    
    toast({
      title: "Workout Completed!",
      description: "Great job! Your workout has been logged for today.",
    });
  };

  const updateProteinConsumed = (grams: number) => {
    setProteinGoal(prev => ({
      ...prev,
      consumed: grams
    }));
    
    toast({
      title: "Protein Intake Updated",
      description: `You've logged ${grams}g of protein today.`,
    });
  };

  const addProgressEntry = (entry: Omit<ProgressEntry, 'date'>) => {
    if (!user) return;
    
    const newEntry: ProgressEntry = {
      ...entry,
      date: new Date()
    };
    
    const updatedEntries = [...progressEntries, newEntry];
    setProgressEntries(updatedEntries);
    
    localStorage.setItem(`fittrack_progress_${user.id}`, JSON.stringify(updatedEntries));
    
    toast({
      title: "Progress Tracked",
      description: "Your progress data has been saved.",
    });
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
