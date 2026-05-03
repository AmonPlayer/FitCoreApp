import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { UserProfile, OnboardingDraft, MacroTargets } from '@/types';

const STORAGE_KEY = 'fitcore:user';

interface UserState {
  profile: UserProfile | null;
  onboardingDraft: OnboardingDraft;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setProfile: (profile: UserProfile) => void;
  updateOnboardingDraft: (partial: OnboardingDraft) => void;
  updateProfile: (partial: Partial<UserProfile>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  onboardingDraft: {},
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setProfile: (profile) => {
    set({ profile, isAuthenticated: true });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch(() => null);
  },

  updateOnboardingDraft: (partial) => {
    set((state) => ({ onboardingDraft: { ...state.onboardingDraft, ...partial } }));
  },

  updateProfile: async (partial) => {
    const current = get().profile;
    if (!current) return;
    const updated: UserProfile = { ...current, ...partial };
    set({ profile: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user returned');
      const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (profile) {
        const mapped = mapDbProfile(profile);
        set({ profile: mapped, isAuthenticated: true });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      }
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ profile: null, isAuthenticated: false, onboardingDraft: {} });
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const profile = JSON.parse(raw) as UserProfile;
        set({ profile, isAuthenticated: true });
      }
    } catch {
      // ignore
    }
  },

  syncToSupabase: async () => {
    const { profile } = get();
    if (!profile) return;
    const dbRecord = mapProfileToDb(profile);
    await supabase.from('users').upsert(dbRecord, { onConflict: 'id' });
  },

  setError: (error) => set({ error }),
}));

function mapDbProfile(db: Record<string, unknown>): UserProfile {
  return {
    id: db.id as string,
    email: db.email as string,
    name: db.name as string,
    age: db.age as number,
    sex: db.sex as UserProfile['sex'],
    heightCm: db.height_cm as number,
    weightKg: db.weight_kg as number,
    activityLevel: db.activity_level as UserProfile['activityLevel'],
    goal: db.goal as UserProfile['goal'],
    tdee: db.tdee as number,
    targets: {
      calories: db.target_calories as number,
      proteinG: db.target_protein as number,
      carbsG: db.target_carbs as number,
      fatG: db.target_fat as number,
    },
    onboardingComplete: db.onboarding_complete as boolean,
    createdAt: db.created_at as string,
  };
}

function mapProfileToDb(profile: UserProfile): Record<string, unknown> {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    age: profile.age,
    sex: profile.sex,
    height_cm: profile.heightCm,
    weight_kg: profile.weightKg,
    activity_level: profile.activityLevel,
    goal: profile.goal,
    tdee: profile.tdee,
    target_calories: profile.targets.calories,
    target_protein: profile.targets.proteinG,
    target_carbs: profile.targets.carbsG,
    target_fat: profile.targets.fatG,
    onboarding_complete: profile.onboardingComplete,
  };
}
