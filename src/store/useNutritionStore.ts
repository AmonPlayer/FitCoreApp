import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import { FoodLog, Preset, PendingSync, MealSlot } from '@/types';

const LOGS_KEY = 'fitcore:food_logs';
const PRESETS_KEY = 'fitcore:presets';
const SYNC_KEY = 'fitcore:pending_sync';

interface NutritionState {
  logs: FoodLog[];
  presets: Preset[];
  isLoading: boolean;
  loadDay: (date: string) => Promise<void>;
  addLog: (log: Omit<FoodLog, 'id' | 'synced'>) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
  loadPresets: () => Promise<void>;
  addPreset: (preset: Omit<Preset, 'id'>) => Promise<void>;
  removePreset: (id: string) => Promise<void>;
  syncToSupabase: () => Promise<void>;
}

async function enqueuePendingSync(record: PendingSync): Promise<void> {
  const raw = await AsyncStorage.getItem(SYNC_KEY);
  const queue: PendingSync[] = raw ? JSON.parse(raw) : [];
  queue.push(record);
  await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(queue));
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  logs: [],
  presets: [],
  isLoading: false,

  loadDay: async (date) => {
    set({ isLoading: true });
    try {
      const raw = await AsyncStorage.getItem(LOGS_KEY);
      const all: FoodLog[] = raw ? JSON.parse(raw) : [];
      set({ logs: all.filter((l) => l.date === date) });
    } finally {
      set({ isLoading: false });
    }
  },

  addLog: async (log) => {
    const newLog: FoodLog = { ...log, id: randomUUID(), synced: false };
    const raw = await AsyncStorage.getItem(LOGS_KEY);
    const all: FoodLog[] = raw ? JSON.parse(raw) : [];
    all.push(newLog);
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(all));
    set((state) => ({ logs: [...state.logs, newLog] }));
    await enqueuePendingSync({ table: 'food_logs', record: logToDb(newLog), operation: 'insert', timestamp: new Date().toISOString() });
  },

  removeLog: async (id) => {
    const raw = await AsyncStorage.getItem(LOGS_KEY);
    const all: FoodLog[] = raw ? JSON.parse(raw) : [];
    const updated = all.filter((l) => l.id !== id);
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated));
    set((state) => ({ logs: state.logs.filter((l) => l.id !== id) }));
    await enqueuePendingSync({ table: 'food_logs', record: { id }, operation: 'delete', timestamp: new Date().toISOString() });
  },

  loadPresets: async () => {
    const raw = await AsyncStorage.getItem(PRESETS_KEY);
    const presets: Preset[] = raw ? JSON.parse(raw) : [];
    set({ presets });
  },

  addPreset: async (preset) => {
    const newPreset: Preset = { ...preset, id: randomUUID() };
    const raw = await AsyncStorage.getItem(PRESETS_KEY);
    const all: Preset[] = raw ? JSON.parse(raw) : [];
    all.push(newPreset);
    await AsyncStorage.setItem(PRESETS_KEY, JSON.stringify(all));
    set((state) => ({ presets: [...state.presets, newPreset] }));
    await enqueuePendingSync({ table: 'presets', record: presetToDb(newPreset), operation: 'insert', timestamp: new Date().toISOString() });
  },

  removePreset: async (id) => {
    const raw = await AsyncStorage.getItem(PRESETS_KEY);
    const all: Preset[] = raw ? JSON.parse(raw) : [];
    const updated = all.filter((p) => p.id !== id);
    await AsyncStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
    set((state) => ({ presets: state.presets.filter((p) => p.id !== id) }));
  },

  syncToSupabase: async () => {
    const raw = await AsyncStorage.getItem(SYNC_KEY);
    if (!raw) return;
    const queue: PendingSync[] = JSON.parse(raw);
    const remaining: PendingSync[] = [];
    for (const item of queue) {
      try {
        if (item.operation === 'delete') {
          await supabase.from(item.table).delete().eq('id', item.record.id);
        } else {
          await supabase.from(item.table).upsert(item.record as Record<string, unknown>, { onConflict: 'id' });
        }
      } catch {
        remaining.push(item);
      }
    }
    await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(remaining));
  },
}));

function logToDb(log: FoodLog): Record<string, unknown> {
  return {
    id: log.id,
    user_id: log.userId,
    date: log.date,
    meal_slot: log.mealSlot,
    food_item: log.foodItem,
    quantity_g: log.quantityG,
    logged_at: log.loggedAt,
  };
}

function presetToDb(preset: Preset): Record<string, unknown> {
  return {
    id: preset.id,
    user_id: preset.userId,
    name: preset.name,
    items: preset.items,
    total_calories: preset.totalCalories,
    total_protein: preset.totalMacros.proteinG,
    total_carbs: preset.totalMacros.carbsG,
    total_fat: preset.totalMacros.fatG,
  };
}
