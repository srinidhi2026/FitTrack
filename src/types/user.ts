
export interface User {
  id: string;
  name: string;
  email: string;
  weightInKg: number;
  goalType: 'muscle' | 'fat_loss' | 'weight_gain' | 'strength';
  workoutStreak: number;
  completedWorkouts: number;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
