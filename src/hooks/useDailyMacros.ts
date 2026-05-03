import { useMemo } from 'react';
import { useNutritionStore } from '@/store/useNutritionStore';
import { useUserStore } from '@/store/useUserStore';
import { MacroTargets } from '@/types';

const ZERO: MacroTargets = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };

export function useDailyMacros(date: string) {
  const logs = useNutritionStore((s) => s.logs);
  const targets = useUserStore((s) => s.profile?.targets ?? ZERO);

  const consumed = useMemo((): MacroTargets => {
    const dayLogs = logs.filter((l) => l.date === date);
    return dayLogs.reduce(
      (acc, l) => {
        const ratio = l.quantityG / l.foodItem.servingSizeG;
        return {
          calories: acc.calories + l.foodItem.calories * ratio,
          proteinG: acc.proteinG + l.foodItem.proteinG * ratio,
          carbsG: acc.carbsG + l.foodItem.carbsG * ratio,
          fatG: acc.fatG + l.foodItem.fatG * ratio,
        };
      },
      { ...ZERO },
    );
  }, [logs, date]);

  const remaining: MacroTargets = {
    calories: Math.max(0, targets.calories - consumed.calories),
    proteinG: Math.max(0, targets.proteinG - consumed.proteinG),
    carbsG: Math.max(0, targets.carbsG - consumed.carbsG),
    fatG: Math.max(0, targets.fatG - consumed.fatG),
  };

  const pctCalories = targets.calories > 0 ? Math.min(1, consumed.calories / targets.calories) : 0;

  return { consumed, targets, remaining, pctCalories };
}
