import React, { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  SpaceMono_400Regular,
} from '@expo-google-fonts/space-mono';

import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/useUserStore';
import { useNutritionStore } from '@/store/useNutritionStore';
import { useTrainingStore } from '@/store/useTrainingStore';
import { useSleepStore } from '@/store/useSleepStore';
import { useProgressStore } from '@/store/useProgressStore';
import { useThemeStore } from '@/store/useThemeStore';
import { RootNavigator } from '@/navigation/RootNavigator';
import { OnboardingNavigator } from '@/navigation/OnboardingNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const profile = useUserStore((s) => s.profile);
  const loadFromStorage = useUserStore((s) => s.loadFromStorage);
  const setProfile = useUserStore((s) => s.setProfile);
  const loadTheme = useThemeStore((s) => s.loadTheme);
  const theme = useThemeStore((s) => s.theme);

  // Load fonts and initial data
  useEffect(() => {
    async function init() {
      try {
        await Font.loadAsync({
          DMSans_400Regular,
          DMSans_500Medium,
          DMSans_700Bold,
          SpaceMono_400Regular,
        });
        await loadFromStorage();
        await loadTheme();
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }
    init();
  }, []);

  // Supabase auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        useUserStore.getState().signOut();
      } else if (session?.user && !profile) {
        const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        if (data) {
          const mapped = mapDbProfile(data);
          setProfile(mapped);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [profile]);

  // AppState listener for background sync
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        useNutritionStore.getState().syncToSupabase();
        useTrainingStore.getState().syncToSupabase();
        useSleepStore.getState().syncToSupabase();
        useProgressStore.getState().syncToSupabase();
      }
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, []);

  if (!fontsLoaded) return null;

  const showOnboarding = !profile?.onboardingComplete;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        {showOnboarding ? <OnboardingNavigator /> : <RootNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function mapDbProfile(db: Record<string, unknown>) {
  return {
    id: db.id as string,
    email: db.email as string,
    name: db.name as string,
    age: db.age as number,
    sex: db.sex as 'male' | 'female' | 'other',
    heightCm: db.height_cm as number,
    weightKg: db.weight_kg as number,
    activityLevel: db.activity_level as 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active',
    goal: db.goal as 'lose_fat' | 'maintain' | 'build_muscle',
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
