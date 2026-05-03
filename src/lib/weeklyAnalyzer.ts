import { FoodLog, Session, SleepLog, WeightLog, WeeklyStats } from '@/types';

export function analyzeWeek(
  foodLogs: FoodLog[],
  sessions: Session[],
  sleepLogs: SleepLog[],
  weightLogs: WeightLog[],
): WeeklyStats {
  const avgCalories = foodLogs.length
    ? Math.round(foodLogs.reduce((acc, l) => acc + (l.foodItem.calories * l.quantityG) / l.foodItem.servingSizeG, 0) / 7)
    : 0;

  const avgProtein = foodLogs.length
    ? Math.round(foodLogs.reduce((acc, l) => acc + (l.foodItem.proteinG * l.quantityG) / l.foodItem.servingSizeG, 0) / 7)
    : 0;

  const avgCarbs = foodLogs.length
    ? Math.round(foodLogs.reduce((acc, l) => acc + (l.foodItem.carbsG * l.quantityG) / l.foodItem.servingSizeG, 0) / 7)
    : 0;

  const avgFat = foodLogs.length
    ? Math.round(foodLogs.reduce((acc, l) => acc + (l.foodItem.fatG * l.quantityG) / l.foodItem.servingSizeG, 0) / 7)
    : 0;

  const sessionsCompleted = sessions.filter((s) => s.completedAt).length;

  const avgSleepMinutes = sleepLogs.length
    ? Math.round(sleepLogs.reduce((acc, l) => acc + l.durationMinutes, 0) / sleepLogs.length)
    : 0;

  const sorted = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));
  const startWeight = sorted[0]?.weightKg ?? 0;
  const endWeight = sorted[sorted.length - 1]?.weightKg ?? 0;
  const diff = endWeight - startWeight;

  let weightTrend: WeeklyStats['weightTrend'] = 'stable';
  if (diff > 0.3) weightTrend = 'gaining';
  else if (diff < -0.3) weightTrend = 'losing';

  return { avgCalories, avgProtein, avgCarbs, avgFat, sessionsCompleted, avgSleepMinutes, weightTrend, startWeight, endWeight };
}
