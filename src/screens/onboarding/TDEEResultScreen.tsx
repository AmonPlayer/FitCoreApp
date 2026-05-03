import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import { useUserStore } from '@/store/useUserStore';
import { useTrainingStore } from '@/store/useTrainingStore';
import { calculateTDEE } from '@/lib/tdeeCalc';
import { allocateMacros } from '@/lib/macroAllocator';
import { getDefaultSplit } from '@/lib/splitCycler';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';
import { randomUUID } from '@/lib/uuid';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

type Props = { navigation: StackNavigationProp<OnboardingStackParamList, 'TDEEResult'> };

export function TDEEResultScreen({ navigation }: Props) {
  const { onboardingDraft, setProfile } = useUserStore();
  const { setSplit } = useTrainingStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { tdee, targets } = useMemo(() => {
    const draft = onboardingDraft;
    if (!draft.weightKg || !draft.heightCm || !draft.age || !draft.sex || !draft.activityLevel || !draft.goal) {
      return { tdee: 0, targets: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 } };
    }
    const calculatedTDEE = calculateTDEE({
      weightKg: draft.weightKg,
      heightCm: draft.heightCm,
      age: draft.age,
      sex: draft.sex,
      activityLevel: draft.activityLevel,
    });
    const calculatedTargets = allocateMacros(calculatedTDEE, draft.goal, draft.weightKg);
    return { tdee: calculatedTDEE, targets: calculatedTargets };
  }, [onboardingDraft]);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const draft = onboardingDraft;
      const profile: UserProfile = {
        id: user.id,
        email: user.email ?? '',
        name: draft.name ?? '',
        age: draft.age ?? 25,
        sex: draft.sex ?? 'other',
        heightCm: draft.heightCm ?? 170,
        weightKg: draft.weightKg ?? 70,
        activityLevel: draft.activityLevel ?? 'sedentary',
        goal: draft.goal ?? 'maintain',
        tdee,
        targets,
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
      };

      // Save to Supabase
      const { error: dbError } = await supabase.from('users').upsert({
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
        onboarding_complete: true,
      }, { onConflict: 'id' });

      if (dbError) throw dbError;

      // Assign default training split
      const split = getDefaultSplit(profile.goal, profile.id);
      split.id = randomUUID();
      await setSplit(split);

      setProfile(profile);
      // Root navigator in App.tsx will switch to AppNavigator automatically
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const macroTiles = [
    { label: 'Calories', value: targets.calories, unit: 'kcal', color: Colors.primaryGreen },
    { label: 'Protein', value: targets.proteinG, unit: 'g', color: Colors.primaryGreen },
    { label: 'Carbs', value: targets.carbsG, unit: 'g', color: Colors.blueAccent },
    { label: 'Fat', value: targets.fatG, unit: 'g', color: Colors.orangeAccent },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Your Daily Targets</Text>
        <Text style={styles.subtitle}>Based on your profile and goal</Text>

        <View style={styles.tdeeCard}>
          <Text style={styles.tdeeLabel}>TDEE (Maintenance)</Text>
          <Text style={styles.tdeeValue}>{tdee}</Text>
          <Text style={styles.tdeeUnit}>calories / day</Text>
        </View>

        <View style={styles.macroGrid}>
          {macroTiles.map((tile) => (
            <View key={tile.label} style={styles.macroTile}>
              <Text style={styles.macroLabel}>{tile.label}</Text>
              <Text style={[styles.macroValue, { color: tile.color }]}>{tile.value}</Text>
              <Text style={styles.macroUnit}>{tile.unit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            These targets are calculated using the Mifflin-St Jeor formula and adjusted for your {onboardingDraft.goal?.replace('_', ' ')} goal. You can update them anytime in Settings.
          </Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.confirmText}>Let's Go 🚀</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.bgPrimary },
  scroll: { padding: Layout.spacing.xl },
  title: { fontFamily: Typography.sansBold, fontSize: 26, color: Colors.dark.textPrimary, marginBottom: 4 },
  subtitle: { fontFamily: Typography.sans, fontSize: 15, color: Colors.dark.textSecondary, marginBottom: Layout.spacing.xl },
  tdeeCard: { backgroundColor: Colors.dark.bgSecondary, borderRadius: Layout.borderRadius.xl, padding: Layout.spacing.xl, alignItems: 'center', marginBottom: Layout.spacing.lg, borderWidth: 1, borderColor: Colors.dark.border },
  tdeeLabel: { fontFamily: Typography.sans, fontSize: 12, color: Colors.dark.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  tdeeValue: { fontFamily: Typography.mono, fontSize: 52, color: Colors.primaryGreen, lineHeight: 60 },
  tdeeUnit: { fontFamily: Typography.sans, fontSize: 13, color: Colors.dark.textSecondary, marginTop: 4 },
  macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Layout.spacing.sm, marginBottom: Layout.spacing.lg },
  macroTile: { flex: 1, minWidth: '45%', backgroundColor: Colors.dark.bgSecondary, borderRadius: Layout.borderRadius.lg, padding: Layout.spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
  macroLabel: { fontFamily: Typography.sans, fontSize: 11, color: Colors.dark.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  macroValue: { fontFamily: Typography.mono, fontSize: 28 },
  macroUnit: { fontFamily: Typography.sans, fontSize: 11, color: Colors.dark.textTertiary, marginTop: 2 },
  infoCard: { backgroundColor: `${Colors.primaryGreen}12`, borderRadius: Layout.borderRadius.md, padding: Layout.spacing.md, marginBottom: Layout.spacing.xl, borderWidth: 1, borderColor: `${Colors.primaryGreen}30` },
  infoText: { fontFamily: Typography.sans, fontSize: 13, color: Colors.dark.textSecondary, lineHeight: 20 },
  errorText: { fontFamily: Typography.sans, fontSize: 13, color: Colors.redAccent, marginBottom: Layout.spacing.md },
  confirmBtn: { backgroundColor: Colors.primaryGreen, borderRadius: Layout.borderRadius.lg, paddingVertical: 16, alignItems: 'center' },
  confirmText: { fontFamily: Typography.sansBold, fontSize: 16, color: '#FFFFFF' },
});
