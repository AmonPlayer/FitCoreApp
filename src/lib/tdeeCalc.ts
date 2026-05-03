import { ActivityLevel, Sex } from '@/types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export function calculateTDEE(profile: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
}): number {
  const { weightKg, heightCm, age, sex, activityLevel } = profile;
  const maleBMR = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const femaleBMR = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  let bmr: number;
  if (sex === 'male') bmr = maleBMR;
  else if (sex === 'female') bmr = femaleBMR;
  else bmr = (maleBMR + femaleBMR) / 2;

  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}
