import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import { SleepLog, PendingSync } from '@/types';

const LOGS_KEY = 'fitcore:sleep_logs';
const SYNC_KEY = 'fitcore:pending_sync';

interface SleepState {
  logs: SleepLog[];
  addSleepLog: (log: Omit<SleepLog, 'id' | 'synced'>) => Promise<void>;
  removeSleepLog: (id: string) => Promise<void>;
  loadLogs: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
}

async function enqueuePendingSync(record: PendingSync): Promise<void> {
  const raw = await AsyncStorage.getItem(SYNC_KEY);
  const queue: PendingSync[] = raw ? JSON.parse(raw) : [];
  queue.push(record);
  await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(queue));
}

export const useSleepStore = create<SleepState>((set, get) => ({
  logs: [],

  addSleepLog: async (log) => {
    const newLog: SleepLog = { ...log, id: randomUUID(), synced: false };
    const raw = await AsyncStorage.getItem(LOGS_KEY);
    const all: SleepLog[] = raw ? JSON.parse(raw) : [];
    all.push(newLog);
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(all));
    set((state) => ({ logs: [...state.logs, newLog] }));
    await enqueuePendingSync({ table: 'sleep_logs', record: sleepLogToDb(newLog), operation: 'insert', timestamp: new Date().toISOString() });
  },

  removeSleepLog: async (id) => {
    const raw = await AsyncStorage.getItem(LOGS_KEY);
    const all: SleepLog[] = raw ? JSON.parse(raw) : [];
    const updated = all.filter((l) => l.id !== id);
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated));
    set((state) => ({ logs: state.logs.filter((l) => l.id !== id) }));
  },

  loadLogs: async () => {
    const raw = await AsyncStorage.getItem(LOGS_KEY);
    const logs: SleepLog[] = raw ? JSON.parse(raw) : [];
    set({ logs });
  },

  syncToSupabase: async () => {
    const raw = await AsyncStorage.getItem(SYNC_KEY);
    if (!raw) return;
    const queue: PendingSync[] = JSON.parse(raw);
    const remaining: PendingSync[] = [];
    for (const item of queue) {
      if (item.table !== 'sleep_logs') { remaining.push(item); continue; }
      try {
        await supabase.from('sleep_logs').upsert(item.record as Record<string, unknown>, { onConflict: 'id' });
      } catch {
        remaining.push(item);
      }
    }
    await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(remaining));
  },
}));

function sleepLogToDb(log: SleepLog): Record<string, unknown> {
  return {
    id: log.id,
    user_id: log.userId,
    date: log.date,
    bedtime_iso: log.bedtimeISO,
    wake_iso: log.wakeISO,
    duration_minutes: log.durationMinutes,
    quality_score: log.qualityScore ?? null,
  };
}
