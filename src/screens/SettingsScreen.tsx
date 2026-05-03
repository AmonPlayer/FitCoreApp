import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '@/store/useUserStore';
import { useThemeStore, } from '@/store/useThemeStore';
import { useColors, useTheme } from '@/hooks/useColors';
import { calculateTDEE } from '@/lib/tdeeCalc';
import { allocateMacros } from '@/lib/macroAllocator';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';
import { ActivityLevel, Goal, Sex } from '@/types';

const ACTIVITY_OPTIONS: { label: string; value: ActivityLevel }[] = [
  { label: 'Sedentary', value: 'sedentary' },
  { label: 'Light', value: 'lightly_active' },
  { label: 'Moderate', value: 'moderately_active' },
  { label: 'Very Active', value: 'very_active' },
  { label: 'Extra Active', value: 'extra_active' },
];

const GOAL_OPTIONS: { label: string; value: Goal }[] = [
  { label: 'Lose Fat', value: 'lose_fat' },
  { label: 'Maintain', value: 'maintain' },
  { label: 'Build Muscle', value: 'build_muscle' },
];

const SEX_OPTIONS: { label: string; value: Sex }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export function SettingsScreen() {
  const navigation = useNavigation();
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const signOut = useUserStore((s) => s.signOut);
  const theme = useTheme();
  const setTheme = useThemeStore((s) => s.setTheme);
  const C = useColors();

  const [name, setName] = useState(profile?.name ?? '');
  const [age, setAge] = useState(String(profile?.age ?? ''));
  const [heightCm, setHeightCm] = useState(String(profile?.heightCm ?? ''));
  const [weightKg, setWeightKg] = useState(String(profile?.weightKg ?? ''));
  const [sex, setSex] = useState<Sex>(profile?.sex ?? 'other');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel ?? 'sedentary');
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? 'maintain');
  const [isSaving, setIsSaving] = useState(false);

  const recalcAndSave = async (overrides: Partial<{
    name: string; age: number; heightCm: number; weightKg: number;
    sex: Sex; activityLevel: ActivityLevel; goal: Goal;
  }>) => {
    if (!profile) return;
    const merged = {
      name: overrides.name ?? name,
      age: overrides.age ?? Number(age),
      heightCm: overrides.heightCm ?? Number(heightCm),
      weightKg: overrides.weightKg ?? Number(weightKg),
      sex: overrides.sex ?? sex,
      activityLevel: overrides.activityLevel ?? activityLevel,
      goal: overrides.goal ?? goal,
    };
    const newTDEE = calculateTDEE(merged);
    const newTargets = allocateMacros(newTDEE, merged.goal, merged.weightKg);
    setIsSaving(true);
    try {
      await updateProfile({ ...merged, tdee: newTDEE, targets: newTargets });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive', onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bgPrimary }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: C.border }]}>
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={[s.closeText, { color: C.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: C.textPrimary }]}>Settings</Text>
        {isSaving
          ? <ActivityIndicator size="small" color={Colors.primaryGreen} style={s.saveIndicator} />
          : <View style={s.saveIndicator} />
        }
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Profile ── */}
        <Text style={[s.sectionTitle, { color: C.textTertiary }]}>PROFILE</Text>
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
          <FieldRow label="Name" color={C}>
            <TextInput
              style={[s.textInput, { color: C.textPrimary, borderColor: C.border, backgroundColor: C.bgSecondary }]}
              value={name}
              onChangeText={setName}
              onBlur={() => recalcAndSave({ name })}
              returnKeyType="done"
              onSubmitEditing={() => recalcAndSave({ name })}
            />
          </FieldRow>
          <Divider color={C.border} />
          <FieldRow label="Age" color={C}>
            <TextInput
              style={[s.textInputSm, { color: C.textPrimary, borderColor: C.border, backgroundColor: C.bgSecondary }]}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              onBlur={() => recalcAndSave({ age: Number(age) })}
              onSubmitEditing={() => recalcAndSave({ age: Number(age) })}
            />
          </FieldRow>
          <Divider color={C.border} />
          <FieldRow label="Sex" color={C}>
            <PillSelector
              options={SEX_OPTIONS}
              value={sex}
              onSelect={(v) => { setSex(v); recalcAndSave({ sex: v }); }}
            />
          </FieldRow>
          <Divider color={C.border} />
          <FieldRow label="Height (cm)" color={C}>
            <TextInput
              style={[s.textInputSm, { color: C.textPrimary, borderColor: C.border, backgroundColor: C.bgSecondary }]}
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="decimal-pad"
              onBlur={() => recalcAndSave({ heightCm: Number(heightCm) })}
              onSubmitEditing={() => recalcAndSave({ heightCm: Number(heightCm) })}
            />
          </FieldRow>
          <Divider color={C.border} />
          <FieldRow label="Weight (kg)" color={C}>
            <TextInput
              style={[s.textInputSm, { color: C.textPrimary, borderColor: C.border, backgroundColor: C.bgSecondary }]}
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="decimal-pad"
              onBlur={() => recalcAndSave({ weightKg: Number(weightKg) })}
              onSubmitEditing={() => recalcAndSave({ weightKg: Number(weightKg) })}
            />
          </FieldRow>
        </View>

        {/* ── Training ── */}
        <Text style={[s.sectionTitle, { color: C.textTertiary }]}>TRAINING</Text>
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
          <Text style={[s.fieldLabel, { color: C.textSecondary }]}>Activity Level</Text>
          <View style={s.pillColumn}>
            {ACTIVITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[s.optionRow, activityLevel === opt.value && { backgroundColor: `${Colors.primaryGreen}18` }]}
                onPress={() => { setActivityLevel(opt.value); recalcAndSave({ activityLevel: opt.value }); }}
              >
                <Text style={[s.optionLabel, { color: activityLevel === opt.value ? Colors.primaryGreen : C.textPrimary }]}>
                  {opt.label}
                </Text>
                {activityLevel === opt.value && <Text style={s.checkMark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
          <Divider color={C.border} />
          <Text style={[s.fieldLabel, { color: C.textSecondary, marginTop: Layout.spacing.md }]}>Goal</Text>
          <View style={s.pillColumn}>
            {GOAL_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[s.optionRow, goal === opt.value && { backgroundColor: `${Colors.primaryGreen}18` }]}
                onPress={() => { setGoal(opt.value); recalcAndSave({ goal: opt.value }); }}
              >
                <Text style={[s.optionLabel, { color: goal === opt.value ? Colors.primaryGreen : C.textPrimary }]}>
                  {opt.label}
                </Text>
                {goal === opt.value && <Text style={s.checkMark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Appearance ── */}
        <Text style={[s.sectionTitle, { color: C.textTertiary }]}>APPEARANCE</Text>
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
          <FieldRow label="Theme" color={C}>
            <PillSelector
              options={[{ label: 'Dark', value: 'dark' }, { label: 'Light', value: 'light' }]}
              value={theme}
              onSelect={(v) => setTheme(v as 'dark' | 'light')}
            />
          </FieldRow>
        </View>

        {/* ── Account ── */}
        <Text style={[s.sectionTitle, { color: C.textTertiary }]}>ACCOUNT</Text>
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
          <Text style={[s.emailText, { color: C.textSecondary }]}>{profile?.email}</Text>
          <TouchableOpacity style={s.logoutBtn} onPress={handleSignOut}>
            <Text style={s.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldRow({ label, color, children }: { label: string; color: typeof Colors.dark; children: React.ReactNode }) {
  return (
    <View style={s.fieldRow}>
      <Text style={[s.fieldLabel, { color: color.textSecondary }]}>{label}</Text>
      <View style={s.fieldValue}>{children}</View>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[s.divider, { backgroundColor: color }]} />;
}

function PillSelector<T extends string>({
  options, value, onSelect,
}: { options: { label: string; value: T }[]; value: T; onSelect: (v: T) => void }) {
  return (
    <View style={s.pills}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[s.pill, opt.value === value && s.pillActive]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={[s.pillText, opt.value === value && s.pillTextActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg, paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
  },
  closeBtn: { padding: 4, width: 44, alignItems: 'flex-start' },
  closeText: { fontSize: 18 },
  headerTitle: { fontFamily: Typography.sansBold, fontSize: 17 },
  saveIndicator: { width: 44, alignItems: 'flex-end' },
  scroll: { padding: Layout.spacing.lg },
  sectionTitle: {
    fontFamily: Typography.sansMedium, fontSize: 11,
    letterSpacing: 0.9, marginBottom: Layout.spacing.sm, marginTop: Layout.spacing.lg,
  },
  card: {
    borderRadius: Layout.borderRadius.lg, borderWidth: 1,
    paddingHorizontal: Layout.spacing.md, paddingVertical: Layout.spacing.sm,
    marginBottom: 4,
  },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: Layout.spacing.sm },
  fieldLabel: { fontFamily: Typography.sans, fontSize: 14, flex: 1 },
  fieldValue: { flex: 1.2, alignItems: 'flex-end' },
  textInput: {
    fontFamily: Typography.sans, fontSize: 14, borderWidth: 1,
    borderRadius: Layout.borderRadius.sm, paddingHorizontal: 10, paddingVertical: 6,
    width: '100%', textAlign: 'right',
  },
  textInputSm: {
    fontFamily: Typography.mono, fontSize: 14, borderWidth: 1,
    borderRadius: Layout.borderRadius.sm, paddingHorizontal: 10, paddingVertical: 6,
    width: 90, textAlign: 'center',
  },
  divider: { height: 1, marginVertical: 2 },
  pills: { flexDirection: 'row', gap: 6 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#444',
  },
  pillActive: { backgroundColor: Colors.primaryGreen, borderColor: Colors.primaryGreen },
  pillText: { fontFamily: Typography.sansMedium, fontSize: 12, color: '#888' },
  pillTextActive: { color: '#FFF' },
  pillColumn: { gap: 2 },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 11, paddingHorizontal: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
  },
  optionLabel: { fontFamily: Typography.sans, fontSize: 14 },
  checkMark: { color: Colors.primaryGreen, fontSize: 14, fontFamily: Typography.sansBold },
  emailText: { fontFamily: Typography.mono, fontSize: 13, paddingVertical: 12 },
  logoutBtn: {
    marginTop: 4, marginBottom: 8, paddingVertical: 13,
    borderRadius: Layout.borderRadius.md, borderWidth: 1,
    borderColor: Colors.redAccent, alignItems: 'center',
  },
  logoutText: { fontFamily: Typography.sansBold, fontSize: 14, color: Colors.redAccent },
});
