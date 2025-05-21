
import { saveAs } from 'file-saver';
import { supabase } from '@/integrations/supabase/client';

// Function to download a file from Supabase Storage
export const downloadFromStorage = async (
  bucketName: string,
  filePath: string,
  fileName: string
): Promise<void> => {
  try {
    const { data, error } = await supabase.storage.from(bucketName).download(filePath);
    
    if (error) {
      throw error;
    }
    
    if (data) {
      const blob = new Blob([data]);
      saveAs(blob, fileName);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

// Format date to a readable format
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Calculate BMI
export const calculateBMI = (weight: number, heightInCm: number): number => {
  const heightInMeters = heightInCm / 100;
  return weight / (heightInMeters * heightInMeters);
};

// Format BMI result into a category
export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

// Calculate daily calorie needs (Harris-Benedict equation)
export const calculateDailyCalories = (
  weight: number,
  heightInCm: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number => {
  // BMR calculation
  let bmr;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * heightInCm) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * heightInCm) - (4.330 * age);
  }
  
  // Activity multiplier
  const activityMultipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
    very_active: 1.9 // Very hard exercise & physical job
  };
  
  return Math.round(bmr * activityMultipliers[activityLevel]);
};
