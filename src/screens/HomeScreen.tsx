import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useUserStore } from '@/store/useUserStore';
import { useNutritionStore } from '@/store/useNutritionStore';
import { useTrainingStore } from '@/store/useTrainingStore';
import { useDailyMacros } from '@/hooks/useDailyMacros';
import { useTrainingSplit } from '@/hooks/useTrainingSplit';
import { useColors } from '@/hooks/useColors';
import { CalorieRing } from '@/components/CalorieRing';
import { MacroBar } from '@/components/MacroBar';
import { PresetChip } from '@/components/PresetChip';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';
import { RootStackParamList } from '@/navigation/RootNavigator';

type NavProp = StackNavigationProp<RootStackParamList, 'Tabs'>;

export function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const C = useColors();
  const today = format(new Date(), 'yyyy-MM-dd');
  const profile = useUserStore((s) => s.profile);
  const presets = useNutritionStore((s) => s.presets);
  const { consumed, targets } = useDailyMacros(today);
  const { todaySession, isRestDay } = useTrainingSplit();
  const startSession = useTrainingStore((s) => s.startSession);
  const activeSession = useTrainingStore((s) => s.activeSession);

  const loadDay = useNutritionStore((s) => s.loadDay);
  const loadPresets = useNutritionStore((s) => s.loadPresets);

  useEffect(() => {
    loadDay(today);
    loadPresets();
  }, [today]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: C.textPrimary }]}>{greeting()}, {profile?.name ?? 'there'}</Text>
            <Text style={[styles.date, { color: C.textSecondary }]}>{format(new Date(), 'EEEE, MMMM d')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.gearBtn, { backgroundColor: C.bgSecondary, borderColor: C.border }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={[styles.gearIcon, { color: C.textSecondary }]}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Calorie Ring */}
        <View style={styles.ringContainer}>
          <CalorieRing consumed={Math.round(consumed.calories)} target={targets.calories} size={210} />
        </View>

        {/* Macro Bars */}
        <View style={[styles.card, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
          <MacroBar label="Protein" consumed={Math.round(consumed.proteinG)} target={targets.proteinG} color={Colors.primaryGreen} />
          <MacroBar label="Carbs" consumed={Math.round(consumed.carbsG)} target={targets.carbsG} color={Colors.blueAccent} />
          <MacroBar label="Fat" consumed={Math.round(consumed.fatG)} target={targets.fatG} color={Colors.orangeAccent} />
        </View>

        {/* Breakfast Presets */}
        {presets.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.textTertiary }]}>Quick Add — Breakfast</Text>
            <FlatList
              data={presets}
              keyExtractor={(p) => p.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 2 }}
              renderItem={({ item }) => (
                <PresetChip preset={item} onPress={() => {}} />
              )}
            />
          </View>
        )}

        {/* Today's Workout Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.textTertiary }]}>Today's Training</Text>
          <View style={[styles.workoutCard, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
            {isRestDay ? (
              <View style={styles.restDay}>
                <Text style={styles.restEmoji}>😴</Text>
                <Text style={[styles.restTitle, { color: C.textPrimary }]}>Rest Day</Text>
                <Text style={[styles.restSub, { color: C.textSecondary }]}>Recovery is part of the process</Text>
              </View>
            ) : (
              <>
                <View style={styles.workoutHeader}>
                  <Text style={[styles.workoutLabel, { color: C.textPrimary }]}>{todaySession?.label}</Text>
                  <View style={styles.exerciseCountBadge}>
                    <Text style={styles.exerciseCountText}>{todaySession?.exercises.length} exercises</Text>
                  </View>
                </View>
                <View style={styles.exercisePreview}>
                  {todaySession?.exercises.slice(0, 3).map((ex) => (
                    <Text key={ex.id} style={[styles.exerciseItem, { color: C.textSecondary }]}>· {ex.name}</Text>
                  ))}
                  {(todaySession?.exercises.length ?? 0) > 3 && (
                    <Text style={[styles.moreExercises, { color: C.textTertiary }]}>+{(todaySession?.exercises.length ?? 0) - 3} more</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.startBtn, activeSession && styles.startBtnActive]}
                  onPress={() => {
                    if (!todaySession || activeSession) return;
                    startSession(todaySession, profile?.id ?? '');
                  }}
                >
                  <Text style={styles.startBtnText}>
                    {activeSession ? '▶ Session In Progress' : 'Start Session'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Layout.spacing.lg, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Layout.spacing.xl },
  headerText: { flex: 1 },
  greeting: { fontFamily: Typography.sansBold, fontSize: 22 },
  date: { fontFamily: Typography.sans, fontSize: 13, marginTop: 2 },
  gearBtn: { width: 44, height: 44, borderRadius: Layout.borderRadius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  gearIcon: { fontSize: 20 },
  ringContainer: { alignItems: 'center', marginBottom: Layout.spacing.xl },
  card: { borderRadius: Layout.borderRadius.lg, borderWidth: 1, padding: Layout.cardPadding, marginBottom: Layout.spacing.lg },
  section: { marginBottom: Layout.spacing.lg },
  sectionTitle: { fontFamily: Typography.sansMedium, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Layout.spacing.sm },
  workoutCard: { borderRadius: Layout.borderRadius.lg, borderWidth: 1, padding: Layout.cardPadding },
  restDay: { alignItems: 'center', paddingVertical: Layout.spacing.lg },
  restEmoji: { fontSize: 36, marginBottom: Layout.spacing.sm },
  restTitle: { fontFamily: Typography.sansBold, fontSize: 18, marginBottom: 4 },
  restSub: { fontFamily: Typography.sans, fontSize: 13 },
  workoutHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Layout.spacing.md },
  workoutLabel: { fontFamily: Typography.sansBold, fontSize: 17 },
  exerciseCountBadge: { backgroundColor: `${Colors.primaryGreen}20`, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  exerciseCountText: { fontFamily: Typography.sans, fontSize: 12, color: Colors.primaryGreen },
  exercisePreview: { gap: 4, marginBottom: Layout.spacing.md },
  exerciseItem: { fontFamily: Typography.sans, fontSize: 13 },
  moreExercises: { fontFamily: Typography.sans, fontSize: 12 },
  startBtn: { backgroundColor: Colors.primaryGreen, borderRadius: Layout.borderRadius.md, paddingVertical: 12, alignItems: 'center' },
  startBtnActive: { backgroundColor: Colors.darkGreen },
  startBtnText: { fontFamily: Typography.sansBold, fontSize: 14, color: '#FFFFFF' },
});
