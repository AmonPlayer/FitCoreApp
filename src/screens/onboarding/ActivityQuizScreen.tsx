import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import { useUserStore } from '@/store/useUserStore';
import { ActivityLevel } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

type Props = { navigation: StackNavigationProp<OnboardingStackParamList, 'ActivityQuiz'> };

const LEVELS: { value: ActivityLevel; label: string; description: string; emoji: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise, desk job', emoji: '🛋️' },
  { value: 'lightly_active', label: 'Lightly Active', description: 'Light exercise 1–3 days/week', emoji: '🚶' },
  { value: 'moderately_active', label: 'Moderately Active', description: 'Moderate exercise 3–5 days/week', emoji: '🏃' },
  { value: 'very_active', label: 'Very Active', description: 'Hard exercise 6–7 days/week', emoji: '🏋️' },
  { value: 'extra_active', label: 'Extra Active', description: 'Very hard exercise + physical job', emoji: '⚡' },
];

export function ActivityQuizScreen({ navigation }: Props) {
  const { updateOnboardingDraft } = useUserStore();
  const [selected, setSelected] = useState<ActivityLevel | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    updateOnboardingDraft({ activityLevel: selected });
    navigation.navigate('GoalSelection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.progress}><View style={[styles.progressFill, { width: '66%' }]} /></View>
        <Text style={styles.step}>Step 2 of 3</Text>
        <Text style={styles.title}>Activity Level</Text>
        <Text style={styles.subtitle}>How active are you in a typical week?</Text>

        <View style={styles.options}>
          {LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[styles.card, selected === level.value && styles.cardActive]}
              onPress={() => setSelected(level.value)}
              activeOpacity={0.75}
            >
              <Text style={styles.emoji}>{level.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.cardLabel, selected === level.value && styles.cardLabelActive]}>{level.label}</Text>
                <Text style={styles.cardDesc}>{level.description}</Text>
              </View>
              <View style={[styles.radio, selected === level.value && styles.radioActive]}>
                {selected === level.value && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.continueBtn, !selected && styles.continueBtnDisabled]} onPress={handleContinue} disabled={!selected}>
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.bgPrimary },
  scroll: { padding: Layout.spacing.xl },
  progress: { height: 3, backgroundColor: Colors.dark.border, borderRadius: 2, marginBottom: Layout.spacing.lg },
  progressFill: { height: '100%', backgroundColor: Colors.primaryGreen, borderRadius: 2 },
  step: { fontFamily: Typography.sans, fontSize: 12, color: Colors.dark.textTertiary, marginBottom: Layout.spacing.sm },
  title: { fontFamily: Typography.sansBold, fontSize: 26, color: Colors.dark.textPrimary, marginBottom: 4 },
  subtitle: { fontFamily: Typography.sans, fontSize: 15, color: Colors.dark.textSecondary, marginBottom: Layout.spacing.xl },
  options: { gap: Layout.spacing.sm, marginBottom: Layout.spacing.xl },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.bgSecondary, borderWidth: 1, borderColor: Colors.dark.border, borderRadius: Layout.borderRadius.lg, padding: Layout.cardPadding, gap: Layout.spacing.md },
  cardActive: { borderColor: Colors.primaryGreen, backgroundColor: `${Colors.primaryGreen}12` },
  emoji: { fontSize: 24 },
  cardText: { flex: 1 },
  cardLabel: { fontFamily: Typography.sansMedium, fontSize: 15, color: Colors.dark.textPrimary, marginBottom: 2 },
  cardLabelActive: { color: Colors.primaryGreen },
  cardDesc: { fontFamily: Typography.sans, fontSize: 13, color: Colors.dark.textSecondary },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.dark.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.primaryGreen },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primaryGreen },
  continueBtn: { backgroundColor: Colors.primaryGreen, borderRadius: Layout.borderRadius.lg, paddingVertical: 16, alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { fontFamily: Typography.sansBold, fontSize: 16, color: '#FFFFFF' },
});
