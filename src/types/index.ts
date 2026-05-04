// ---- User / Onboarding ----
export type Sex = 'male' | 'female' | 'other';
export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active';
export type Goal = 'lose_fat' | 'maintain' | 'build_muscle';

export interface MacroTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  tdee: number;
  targets: MacroTargets;
  onboardingComplete: boolean;
  createdAt: string;
}

export type OnboardingDraft = Partial<Omit<UserProfile, 'id' | 'createdAt' | 'tdee' | 'targets' | 'onboardingComplete'>> & {
  userId?: string;
  userEmail?: string;
};

// ---- Nutrition ----
export type MealSlot = 'breakfast' | 'snack' | 'meal';

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSizeG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  source: 'usda' | 'off' | 'custom';
  barcode?: string;
  dataType?: string;
}

export interface FoodLog {
  id: string;
  userId: string;
  date: string;
  mealSlot: MealSlot;
  foodItem: FoodItem;
  quantityG: number;
  loggedAt: string;
  synced: boolean;
}

export interface PresetItem {
  foodItem: FoodItem;
  quantityG: number;
}

export interface Preset {
  id: string;
  userId: string;
  name: string;
  items: PresetItem[];
  totalCalories: number;
  totalMacros: MacroTargets;
}

// ---- Training ----
export type SplitType = 'PPL' | 'UpperLower' | 'FullBody' | 'Bro';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  notes?: string;
}

export interface SetLog {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
}

export interface ExerciseLog {
  exercise: Exercise;
  sets: SetLog[];
}

export interface TrainingDay {
  dayIndex: number;
  label: string;
  exercises: Exercise[];
}

export interface TrainingSplit {
  id: string;
  userId: string;
  type: SplitType;
  days: TrainingDay[];
}

export interface Session {
  id: string;
  userId: string;
  date: string;
  splitDayLabel: string;
  exerciseLogs: ExerciseLog[];
  completedAt?: string;
  synced: boolean;
}

// ---- Sleep ----
export interface SleepLog {
  id: string;
  userId: string;
  date: string;
  bedtimeISO: string;
  wakeISO: string;
  durationMinutes: number;
  qualityScore?: number;
  synced: boolean;
}

// ---- Weight / Progress ----
export interface WeightLog {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  bodyFatPct?: number;
  synced: boolean;
}

// ---- Offline Sync ----
export interface PendingSync {
  table: string;
  record: Record<string, unknown>;
  operation: 'insert' | 'update' | 'delete';
  timestamp: string;
}

// ---- Analytics ----
export interface WeeklyStats {
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  sessionsCompleted: number;
  avgSleepMinutes: number;
  weightTrend: 'gaining' | 'losing' | 'stable';
  startWeight: number;
  endWeight: number;
}
