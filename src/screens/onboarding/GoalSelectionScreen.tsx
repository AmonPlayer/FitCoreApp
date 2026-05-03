import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import { useUserStore } from '@/store/useUserStore';
import { Goal } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

type Props = { navigation: StackNavigationProp<OnboardingStackParamList, 'GoalSelection'> };

const GOALS: { value: Goal; label: string; description: string; emoji: string; color: string }[] = [
  { value: 'lose_fat', label: 'Lose Fat', description: 'Reduce body fat while preserving muscle mass', emoji: '🔥', color: Colors.redAccent },
  { value: 'maintain', label: 'Maintain', description: 'Keep your current weight and body composition', emoji: '⚖️', color: Colors.blueAccent },
  { value: 'build_muscle', label: 'Build Muscle', description: 'Gain lean muscle with a strategic calorie surplus', emoji: '💪', color: Colors.primaryGreen },
];

export function GoalSelectionScreen({ navigation }: Props) {
  const { updateOnboardingDraft } = useUserStore();
  const [selected, setSelected] = useState<Goal | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    updateOnboardingDraft({ goal: selected });
    navigation.navigate('TDEEResult');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.progress}><View style={[styles.progressFill, { width: '100%' }]} /></View>
        <Text style={styles.step}>Step 3 of 3</Text>
        <Text style={styles.title}>Your Goal</Text>
        <Text style={styles.subtitle}>We'll build your plan around this</Text>

        <View style={styles.options}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.value}
              style={[styles.card, selected === goal.value && { borderColor: goal.color, backgroundColor: `${goal.color}12` }]}
              onPress={() => setSelected(goal.value)}
              activeOpacity={0.75}
            >
              <Text style={styles.emoji}>{goal.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.cardLabel, selected === goal.value && { color: goal.color }]}>{goal.label}</Text>
                <Text style={styles.cardDesc}>{goal.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.continueBtn, !selected && styles.continueBtnDisabled]} onPress={handleContinue} disabled={!selected}>
          <Text style={styles.continueBtnText}>Calculate My Targets →</Text>
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
  options: { gap: Layout.spacing.md, marginBottom: Layout.spacing.xl },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.bgSecondary, borderWidth: 1.5, borderColor: Colors.dark.border, borderRadius: Layout.borderRadius.xl, padding: Layout.spacing.lg, gap: Layout.spacing.md },
  emoji: { fontSize: 36 },
  cardText: { flex: 1 },
  cardLabel: { fontFamily: Typography.sansBold, fontSize: 18, color: Colors.dark.textPrimary, marginBottom: 4 },
  cardDesc: { fontFamily: Typography.sans, fontSize: 13, color: Colors.dark.textSecondary },
  continueBtn: { backgroundColor: Colors.primaryGreen, borderRadius: Layout.borderRadius.lg, paddingVertical: 16, alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { fontFamily: Typography.sansBold, fontSize: 16, color: '#FFFFFF' },
});
