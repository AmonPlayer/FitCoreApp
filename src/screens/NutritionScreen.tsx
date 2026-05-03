import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { format, addDays, subDays } from 'date-fns';
import { useUserStore } from '@/store/useUserStore';
import { useNutritionStore } from '@/store/useNutritionStore';
import { useDailyMacros } from '@/hooks/useDailyMacros';
import { QuickConfirmSheet } from '@/components/QuickConfirmSheet';
import { PresetChip } from '@/components/PresetChip';
import { MealSlot, FoodItem, FoodLog } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

const TABS: { label: string; value: MealSlot }[] = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Snack', value: 'snack' },
  { label: 'Meal', value: 'meal' },
];

export function NutritionScreen() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [activeSlot, setActiveSlot] = useState<MealSlot>('breakfast');
  const [sheetVisible, setSheetVisible] = useState(false);

  const profile = useUserStore((s) => s.profile);
  const logs = useNutritionStore((s) => s.logs);
  const presets = useNutritionStore((s) => s.presets);
  const loadDay = useNutritionStore((s) => s.loadDay);
  const loadPresets = useNutritionStore((s) => s.loadPresets);
  const addLog = useNutritionStore((s) => s.addLog);
  const removeLog = useNutritionStore((s) => s.removeLog);

  const { consumed, targets } = useDailyMacros(selectedDate);

  useEffect(() => {
    loadDay(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    loadPresets();
  }, []);

  const slotLogs = logs.filter((l) => l.mealSlot === activeSlot && l.date === selectedDate);

  const handleConfirm = async (items: Array<{ foodItem: FoodItem; quantityG: number }>) => {
    if (!profile) return;
    for (const item of items) {
      await addLog({
        userId: profile.id,
        date: selectedDate,
        mealSlot: activeSlot,
        foodItem: item.foodItem,
        quantityG: item.quantityG,
        loggedAt: new Date().toISOString(),
      });
    }
    setSheetVisible(false);
  };

  const caloriesPct = targets.calories > 0 ? Math.min(1, consumed.calories / targets.calories) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Date Navigator */}
        <View style={styles.dateNav}>
          <TouchableOpacity onPress={() => setSelectedDate(format(subDays(new Date(selectedDate), 1), 'yyyy-MM-dd'))}>
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>{format(new Date(selectedDate), 'EEEE, MMM d')}</Text>
          <TouchableOpacity onPress={() => setSelectedDate(format(addDays(new Date(selectedDate), 1), 'yyyy-MM-dd'))}>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Summary */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryCalories}>
            <Text style={styles.calValue}>{Math.round(consumed.calories)}</Text>
            <Text style={styles.calTarget}> / {targets.calories} kcal</Text>
          </View>
          <View style={styles.summaryMacros}>
            <Text style={[styles.macroStat, { color: Colors.primaryGreen }]}>{Math.round(consumed.proteinG)}g P</Text>
            <Text style={[styles.macroStat, { color: Colors.blueAccent }]}>{Math.round(consumed.carbsG)}g C</Text>
            <Text style={[styles.macroStat, { color: Colors.orangeAccent }]}>{Math.round(consumed.fatG)}g F</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.round(caloriesPct * 100)}%` }]} />
        </View>

        {/* Meal Slot Tabs */}
        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              style={[styles.tab, activeSlot === tab.value && styles.tabActive]}
              onPress={() => setActiveSlot(tab.value)}
            >
              <Text style={[styles.tabText, activeSlot === tab.value && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preset Chips */}
        {presets.length > 0 && (
          <FlatList
            data={presets}
            keyExtractor={(p) => p.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipList}
            contentContainerStyle={{ paddingHorizontal: Layout.spacing.lg }}
            renderItem={({ item }) => (
              <PresetChip preset={item} onPress={() => {}} />
            )}
          />
        )}

        {/* Log List */}
        <FlatList
          data={slotLogs}
          keyExtractor={(l) => l.id}
          style={styles.logList}
          contentContainerStyle={{ padding: Layout.spacing.lg, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nothing logged for {activeSlot}</Text>
              <Text style={styles.emptySubText}>Tap + to add food</Text>
            </View>
          }
          renderItem={({ item }) => <LogRow log={item} onDelete={() => removeLog(item.id)} />}
        />

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={() => setSheetVisible(true)}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

        <QuickConfirmSheet
          visible={sheetVisible}
          mealSlot={activeSlot}
          onClose={() => setSheetVisible(false)}
          onConfirm={handleConfirm}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function LogRow({ log, onDelete }: { log: FoodLog; onDelete: () => void }) {
  const ratio = log.quantityG / log.foodItem.servingSizeG;
  const cals = Math.round(log.foodItem.calories * ratio);
  return (
    <View style={logStyles.row}>
      <View style={logStyles.info}>
        <Text style={logStyles.name} numberOfLines={1}>{log.foodItem.name}</Text>
        <Text style={logStyles.qty}>{log.quantityG}g · {log.foodItem.brand ?? log.foodItem.source.toUpperCase()}</Text>
      </View>
      <Text style={logStyles.cals}>{cals} kcal</Text>
      <TouchableOpacity onPress={onDelete} style={logStyles.deleteBtn}>
        <Text style={logStyles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const logStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.card, borderRadius: Layout.borderRadius.md, padding: Layout.spacing.md, marginBottom: Layout.spacing.sm, borderWidth: 1, borderColor: Colors.dark.cardBorder, gap: Layout.spacing.sm },
  info: { flex: 1 },
  name: { fontFamily: Typography.sansMedium, fontSize: 14, color: Colors.dark.textPrimary },
  qty: { fontFamily: Typography.sans, fontSize: 12, color: Colors.dark.textTertiary, marginTop: 2 },
  cals: { fontFamily: Typography.mono, fontSize: 13, color: Colors.primaryGreen },
  deleteBtn: { padding: 4 },
  deleteIcon: { color: Colors.dark.textTertiary, fontSize: 13 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.bgPrimary },
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Layout.spacing.xl, paddingVertical: Layout.spacing.md },
  navArrow: { fontSize: 28, color: Colors.dark.textSecondary, lineHeight: 32 },
  dateText: { fontFamily: Typography.sansMedium, fontSize: 15, color: Colors.dark.textPrimary },
  summaryBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Layout.spacing.lg, paddingBottom: Layout.spacing.sm },
  summaryCalories: { flexDirection: 'row', alignItems: 'baseline' },
  calValue: { fontFamily: Typography.mono, fontSize: 22, color: Colors.dark.textPrimary },
  calTarget: { fontFamily: Typography.mono, fontSize: 12, color: Colors.dark.textTertiary },
  summaryMacros: { flexDirection: 'row', gap: Layout.spacing.sm },
  macroStat: { fontFamily: Typography.mono, fontSize: 12 },
  progressBar: { height: 3, backgroundColor: Colors.dark.border, marginHorizontal: Layout.spacing.lg, borderRadius: 2, marginBottom: Layout.spacing.md },
  progressFill: { height: '100%', backgroundColor: Colors.primaryGreen, borderRadius: 2 },
  tabs: { flexDirection: 'row', marginHorizontal: Layout.spacing.lg, backgroundColor: Colors.dark.bgSecondary, borderRadius: Layout.borderRadius.md, padding: 4, marginBottom: Layout.spacing.md },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: Layout.borderRadius.sm },
  tabActive: { backgroundColor: Colors.dark.card },
  tabText: { fontFamily: Typography.sansMedium, fontSize: 13, color: Colors.dark.textTertiary },
  tabTextActive: { color: Colors.dark.textPrimary },
  chipList: { marginBottom: Layout.spacing.md },
  logList: { flex: 1 },
  emptyState: { alignItems: 'center', paddingTop: 48 },
  emptyText: { fontFamily: Typography.sansMedium, fontSize: 15, color: Colors.dark.textSecondary, marginBottom: 4 },
  emptySubText: { fontFamily: Typography.sans, fontSize: 13, color: Colors.dark.textTertiary },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primaryGreen, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: Colors.primaryGreen, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  fabIcon: { fontSize: 28, color: '#FFFFFF', lineHeight: 32 },
});
