import { Goal, MacroTargets } from '@/types';

export function allocateMacros(tdee: number, goal: Goal, weightKg: number): MacroTargets {
  let targetCalories: number;
  let proteinG: number;
  let fatRatio: number;

  if (goal === 'lose_fat') {
    targetCalories = tdee - 500;
    proteinG = Math.round(2.2 * weightKg);
    fatRatio = 0.25;
  } else if (goal === 'build_muscle') {
    targetCalories = tdee + 300;
    proteinG = Math.round(2.0 * weightKg);
    fatRatio = 0.25;
  } else {
    targetCalories = tdee;
    proteinG = Math.round(1.8 * weightKg);
    fatRatio = 0.3;
  }

  const fatG = Math.round((targetCalories * fatRatio) / 9);
  const proteinCals = proteinG * 4;
  const fatCals = fatG * 9;
  const carbsG = Math.round(Math.max(0, targetCalories - proteinCals - fatCals) / 4);

  return {
    calories: Math.round(targetCalories),
    proteinG,
    carbsG,
    fatG,
  };
}
