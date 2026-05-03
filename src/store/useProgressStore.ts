import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from '@/lib/uuid';
import { supabase } from '@/lib/supabase';
import { WeightLog, WeeklyStats, PendingSync } from '@/types';
import { analyzeWeek } from '@/lib/weeklyAnalyzer';
import { useNutritionStore } from './useNutritionStore';
import { useTrainingStore } from './useTrainingStore';
import { useSleepStore } from './useSleepStore';

const LOGS_KEY = 'fitcore:weight_logs';
const SYNC_KEY = 'fitcore:pending_sync';

interface ProgressState {
  weightLogs: WeightLog[];
  weeklyStats: WeeklyStats | null;
  addWeightLog: (log: Omit<WeightLog, 'id' | 'synced'>) => Promise<void>;
  computeWeeklyStats: () => void;
  loadLogs: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
}

async function enqueuePendingSync(record: PendingSync): Promise<void> {
  const raw = await AsyncStorage.getItem(SYNC_KEY);
  const queue: PendingSync[] = raw ? JSON.parse(raw) : [];
  queue.push(record);
  await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(queue));
}

function lastNDays(n: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  weightLogs: [],
  weeklyStats: null,

  addWeightLog: async (log) => {
    const newLog: WeightLog = { ...log, id: randomUUID(), synced: false };
    const raw = await AsyncStorage.getItem(LOGS_KEY);
    const all: WeightLog[] = raw ? JSON.parse(raw) : [];
    all.push(newLog);
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(all));
    set((state) => ({ weightLogs: [...state.weightLogs, newLog] }));
    await enqueuePendingSync({ table: 'weight_logs', record: weightLogToDb(newLog), operation: 'insert', timestamp: new Date().toISOString() });
  },

  computeWeeklyStats: () => {
    const week = lastNDays(7);
    const nutritionLogs = useNutritionStore.getState().logs.filter((l) => week.includes(l.date));
    const sessions = useTrainingStore.getState().sessions.filter((s) => week.includes(s.date));
    const sleepLogs = useSleepStore.getState().logs.filter((l) => week.includes(l.date));
    const weightLogs = get().weightLogs.filter((l) => week.includes(l.date));
    const stats = analyzeWeek(nutritionLogs, sessions, sleepLogs, weightLogs);
    set({ weeklyStats: stats });
  },

  loadLogs: async () => {
    const raw = await AsyncStorage.getItem(LOGS_KEY);
    const logs: WeightLog[] = raw ? JSON.parse(raw) : [];
    set({ weightLogs: logs });
  },

  syncToSupabase: async () => {
    const raw = await AsyncStorage.getItem(SYNC_KEY);
    if (!raw) return;
    const queue: PendingSync[] = JSON.parse(raw);
    const remaining: PendingSync[] = [];
    for (const item of queue) {
      if (item.table !== 'weight_logs') { remaining.push(item); continue; }
      try {
        await supabase.from('weight_logs').upsert(item.record as Record<string, unknown>, { onConflict: 'id' });
      } catch {
        remaining.push(item);
      }
    }
    await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(remaining));
  },
}));

function weightLogToDb(log: WeightLog): Record<string, unknown> {
  return {
    id: log.id,
    user_id: log.userId,
    date: log.date,
    weight_kg: log.weightKg,
    body_fat_pct: log.bodyFatPct ?? null,
  };
}
