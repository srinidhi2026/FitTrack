
export interface ProteinGoal {
  dailyGrams: number;
  consumed: number;
}

export type BudgetLevel = 'low' | 'high';

export interface ProteinFood {
  id: string;
  name: string;
  proteinPer100g: number;
  budget: BudgetLevel;
  servingSuggestion: string;
  imageUrl: string;
}
