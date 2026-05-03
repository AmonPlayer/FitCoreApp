import { useMemo } from 'react';
import { useNutritionStore } from '@/store/useNutritionStore';
import { MealSlot, FoodLog } from '@/types';
import { format } from 'date-fns';

export function usePresets(mealSlot: MealSlot) {
  const presets = useNutritionStore((s) => s.presets);
  const addLog = useNutritionStore((s) => s.addLog);
  const addPreset = useNutritionStore((s) => s.addPreset);
  const removePreset = useNutritionStore((s) => s.removePreset);

  const filteredPresets = useMemo(() => presets, [presets]);

  const applyPreset = async (presetId: string, userId: string, date?: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    const targetDate = date ?? format(new Date(), 'yyyy-MM-dd');
    for (const item of preset.items) {
      const log: Omit<FoodLog, 'id' | 'synced'> = {
        userId,
        date: targetDate,
        mealSlot,
        foodItem: item.foodItem,
        quantityG: item.quantityG,
        loggedAt: new Date().toISOString(),
      };
      await addLog(log);
    }
  };

  return { presets: filteredPresets, addPreset, removePreset, applyPreset };
}
