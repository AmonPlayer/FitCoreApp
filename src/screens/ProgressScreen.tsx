import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { format } from 'date-fns';
import { useUserStore } from '@/store/useUserStore';
import { useProgressStore } from '@/store/useProgressStore';
import { useSleepStore } from '@/store/useSleepStore';
import { useColors } from '@/hooks/useColors';
import { WeightChart } from '@/components/WeightChart';
import { SleepEntry } from '@/components/SleepEntry';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

export function ProgressScreen() {
  const C = useColors();
  const profile = useUserStore((s) => s.profile);
  const { weightLogs, weeklyStats, addWeightLog, loadLogs, computeWeeklyStats } = useProgressStore();
  const { logs: sleepLogs, loadLogs: loadSleepLogs, addSleepLog } = useSleepStore();
  const [weightInput, setWeightInput] = useState('');

  useEffect(() => {
    loadLogs();
    loadSleepLogs();
  }, []);

  useEffect(() => {
    if (weightLogs.length > 0) computeWeeklyStats();
  }, [weightLogs]);

  const last30Days = weightLogs.filter((l) => {
    const d = new Date(l.date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return d >= cutoff;
  });

  const handleLogWeight = async () => {
    const kg = parseFloat(weightInput);
    if (!kg || !profile) return;
    await addWeightLog({ userId: profile.id, date: format(new Date(), 'yyyy-MM-dd'), weightKg: kg });
    setWeightInput('');
    computeWeeklyStats();
  };

  const handleSleepSubmit = async (bedtime: Date, wake: Date, quality: number) => {
    if (!profile) return;
    const durationMinutes = Math.round((wake.getTime() - bedtime.getTime()) / 60000);
    await addSleepLog({
      userId: profile.id,
      date: format(new Date(), 'yyyy-MM-dd'),
      bedtimeISO: bedtime.toISOString(),
      wakeISO: wake.toISOString(),
      durationMinutes,
      qualityScore: quality,
    });
  };

  const latestWeight = [...weightLogs].sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.screenTitle, { color: C.textPrimary }]}>Progress</Text>

        {/* Weight Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.textTertiary }]}>Weight</Text>
            {latestWeight && (
              <Text>
                <Text style={styles.currentWeightValue}>{latestWeight.weightKg}</Text>
                <Text style={[styles.currentWeightUnit, { color: C.textSecondary }]}> kg</Text>
              </Text>
            )}
          </View>
          <WeightChart logs={last30Days} targetWeight={undefined} />
          <View style={styles.logWeightRow}>
            <TextInput
              style={[styles.weightInput, { backgroundColor: C.bgSecondary, borderColor: C.border, color: C.textPrimary }]}
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder="kg"
              placeholderTextColor={C.textTertiary}
              keyboardType="decimal-pad"
            />
            <TouchableOpacity style={styles.logWeightBtn} onPress={handleLogWeight}>
              <Text style={styles.logWeightBtnText}>Log Weight</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sleep Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.textTertiary }]}>Sleep</Text>
          <SleepEntry onSubmit={handleSleepSubmit} />
          {sleepLogs.length > 0 && (
            <View style={styles.sleepHistory}>
              <Text style={[styles.sectionSubTitle, { color: C.textTertiary }]}>Last 7 Nights</Text>
              {sleepLogs.slice(-7).reverse().map((log) => (
                <View key={log.id} style={[styles.sleepRow, { borderBottomColor: C.border }]}>
                  <Text style={[styles.sleepDate, { color: C.textSecondary }]}>{format(new Date(log.date), 'EEE, MMM d')}</Text>
                  <Text style={styles.sleepDuration}>{Math.round(log.durationMinutes / 60 * 10) / 10}h</Text>
                  {log.qualityScore && <Text style={styles.sleepQuality}>{'★'.repeat(log.qualityScore)}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Weekly Stats */}
        {weeklyStats && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.textTertiary }]}>This Week</Text>
            <View style={styles.statsGrid}>
              <StatTile label="Avg Calories" value={weeklyStats.avgCalories} unit="kcal" color={Colors.primaryGreen} />
              <StatTile label="Sessions" value={weeklyStats.sessionsCompleted} unit="done" color={Colors.blueAccent} />
              <StatTile label="Avg Sleep" value={Math.round(weeklyStats.avgSleepMinutes / 60 * 10) / 10} unit="hrs" color={Colors.blueAccent} />
              <StatTile label="Weight" value={weeklyStats.endWeight} unit={weeklyStats.weightTrend} color={weeklyStats.weightTrend === 'gaining' ? Colors.orangeAccent : weeklyStats.weightTrend === 'losing' ? Colors.redAccent : Colors.primaryGreen} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  const C = useColors();
  return (
    <View style={[statStyles.tile, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
      <Text style={[statStyles.label, { color: C.textTertiary }]}>{label}</Text>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={[statStyles.unit, { color: C.textTertiary }]}>{unit}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  tile: { flex: 1, minWidth: '45%', borderRadius: Layout.borderRadius.lg, borderWidth: 1, padding: Layout.spacing.md, alignItems: 'center' },
  label: { fontFamily: Typography.sans, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  value: { fontFamily: Typography.mono, fontSize: 24 },
  unit: { fontFamily: Typography.sans, fontSize: 11, marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Layout.spacing.lg, paddingBottom: 32 },
  screenTitle: { fontFamily: Typography.sansBold, fontSize: 26, marginBottom: Layout.spacing.xl },
  section: { marginBottom: Layout.spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: Layout.spacing.md },
  sectionTitle: { fontFamily: Typography.sansMedium, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Layout.spacing.md },
  sectionSubTitle: { fontFamily: Typography.sansMedium, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Layout.spacing.sm, marginTop: Layout.spacing.md },
  currentWeightValue: { fontFamily: Typography.mono, fontSize: 22, color: Colors.primaryGreen },
  currentWeightUnit: { fontFamily: Typography.sans, fontSize: 14 },
  logWeightRow: { flexDirection: 'row', gap: Layout.spacing.md, marginTop: Layout.spacing.md },
  weightInput: { flex: 1, borderWidth: 1, borderRadius: Layout.borderRadius.md, padding: Layout.spacing.md, fontFamily: Typography.mono, fontSize: 18, textAlign: 'center' },
  logWeightBtn: { flex: 2, backgroundColor: Colors.primaryGreen, borderRadius: Layout.borderRadius.md, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  logWeightBtnText: { fontFamily: Typography.sansBold, fontSize: 14, color: '#FFFFFF' },
  sleepHistory: { marginTop: Layout.spacing.md },
  sleepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, gap: Layout.spacing.md },
  sleepDate: { flex: 1, fontFamily: Typography.sans, fontSize: 13 },
  sleepDuration: { fontFamily: Typography.mono, fontSize: 14, color: Colors.blueAccent },
  sleepQuality: { fontSize: 12, color: Colors.orangeAccent },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Layout.spacing.sm },
});
