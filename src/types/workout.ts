
export type WorkoutDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type MuscleGroup = 'chest' | 'shoulders' | 'triceps' | 'back' | 'biceps' | 'quads' | 'glutes' | 'hamstrings' | 'calves';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  repsRange: string;
  muscleGroup: MuscleGroup;
  imageUrl: string;
  instructions: string;
}

export interface Workout {
  day: WorkoutDay;
  title: string;
  description: string;
  exercises: Exercise[];
}
