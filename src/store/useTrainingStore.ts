import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from '@/lib/uuid';
import { supabase } from '@/lib/supabase';
import { TrainingSplit, TrainingDay, Session, ExerciseLog, SetLog, PendingSync } from '@/types';

const SPLIT_KEY = 'fitcore:split';
const SESSIONS_KEY = 'fitcore:sessions';
const SYNC_KEY = 'fitcore:pending_sync';

interface TrainingState {
  split: TrainingSplit | null;
  activeSession: Session | null;
  sessions: Session[];
  isLoading: boolean;
  setSplit: (split: TrainingSplit) => Promise<void>;
  startSession: (day: TrainingDay, userId: string) => void;
  updateSetLog: (exerciseId: string, setIndex: number, update: Partial<SetLog>) => void;
  completeSession: () => Promise<void>;
  loadSessions: () => Promise<void>;
  loadSplit: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
}

async function enqueuePendingSync(record: PendingSync): Promise<void> {
  const raw = await AsyncStorage.getItem(SYNC_KEY);
  const queue: PendingSync[] = raw ? JSON.parse(raw) : [];
  queue.push(record);
  await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(queue));
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
  split: null,
  activeSession: null,
  sessions: [],
  isLoading: false,

  setSplit: async (split) => {
    set({ split });
    await AsyncStorage.setItem(SPLIT_KEY, JSON.stringify(split));
    await supabase.from('training_splits').upsert({ id: split.id, user_id: split.userId, type: split.type, days: split.days }, { onConflict: 'id' });
  },

  startSession: (day, userId) => {
    const exerciseLogs: ExerciseLog[] = day.exercises.map((exercise) => ({
      exercise,
      sets: Array.from({ length: 4 }, (_, i) => ({
        setNumber: i + 1,
        reps: 0,
        weightKg: 0,
        completed: false,
      })),
    }));
    const session: Session = {
      id: randomUUID(),
      userId,
      date: new Date().toISOString().slice(0, 10),
      splitDayLabel: day.label,
      exerciseLogs,
      synced: false,
    };
    set({ activeSession: session });
  },

  updateSetLog: (exerciseId, setIndex, update) => {
    set((state) => {
      if (!state.activeSession) return state;
      const exerciseLogs = state.activeSession.exerciseLogs.map((el) => {
        if (el.exercise.id !== exerciseId) return el;
        const sets = el.sets.map((s, i) => (i === setIndex ? { ...s, ...update } : s));
        return { ...el, sets };
      });
      return { activeSession: { ...state.activeSession, exerciseLogs } };
    });
  },

  completeSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return;
    const completed: Session = { ...activeSession, completedAt: new Date().toISOString(), synced: false };
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    const all: Session[] = raw ? JSON.parse(raw) : [];
    all.push(completed);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
    set((state) => ({ sessions: [...state.sessions, completed], activeSession: null }));
    await enqueuePendingSync({ table: 'sessions', record: sessionToDb(completed), operation: 'insert', timestamp: new Date().toISOString() });
  },

  loadSessions: async () => {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    const sessions: Session[] = raw ? JSON.parse(raw) : [];
    set({ sessions });
  },

  loadSplit: async () => {
    const raw = await AsyncStorage.getItem(SPLIT_KEY);
    if (raw) set({ split: JSON.parse(raw) });
  },

  syncToSupabase: async () => {
    const raw = await AsyncStorage.getItem(SYNC_KEY);
    if (!raw) return;
    const queue: PendingSync[] = JSON.parse(raw);
    const remaining: PendingSync[] = [];
    for (const item of queue) {
      if (item.table !== 'sessions') { remaining.push(item); continue; }
      try {
        await supabase.from('sessions').upsert(item.record as Record<string, unknown>, { onConflict: 'id' });
      } catch {
        remaining.push(item);
      }
    }
    await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(remaining));
  },
}));

function sessionToDb(session: Session): Record<string, unknown> {
  return {
    id: session.id,
    user_id: session.userId,
    date: session.date,
    split_day_label: session.splitDayLabel,
    exercise_logs: session.exerciseLogs,
    completed_at: session.completedAt ?? null,
  };
}
