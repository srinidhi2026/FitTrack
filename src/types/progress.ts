
export interface ProgressEntry {
  date: Date;
  weight: number;
  sleepHours: number;
  proteinConsumed: number;
  measurements?: {
    arms?: number;
    chest?: number;
    waist?: number;
    legs?: number;
  };
  workoutCompleted: boolean;
}
