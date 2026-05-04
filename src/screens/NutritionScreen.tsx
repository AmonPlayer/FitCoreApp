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
import { useColors } from '@/hooks/useColors';
import { QuickConfirmSheet } from '@/components/QuickConfirmSheet';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { PresetChip } from '@/components/PresetChip';
import { MealSlot, FoodItem, FoodLog } from '@/types';
import { searchByBarcode } from '@/lib/openFoodFacts';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

const TABS: { label: string; value: MealSlot }[] = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Snack', value: 'snack' },
  { label: 'Meal', value: 'meal' },
];

export function NutritionScreen() {
  const C = useColors();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeSlot, setActiveSlot] = useState<MealSlot>('breakfast');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);

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

  const handleBarcodeScan = async (barcode: string) => {
    setScannerVisible(false);
    if (!profile) return;
    const item = await searchByBarcode(barcode);
    if (item) {
      await addLog({
        userId: profile.id,
        date: selectedDate,
        mealSlot: activeSlot,
        foodItem: item,
        quantityG: Math.round(item.servingSizeG),
        loggedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bgPrimary }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Date Navigator */}
        <View style={styles.dateNav}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => {
              const [y, m, d] = selectedDate.split('-').map(Number);
              setSelectedDate(format(subDays(new Date(y, m - 1, d), 1), 'yyyy-MM-dd'));
            }}
          >
            <Text style={[styles.navArrow, { color: C.textSecondary }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.dateText, { color: C.textPrimary }]}>{format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMM d')}</Text>
          <TouchableOpacity
            style={[styles.navBtn, selectedDate >= today && styles.navBtnDisabled]}
            disabled={selectedDate >= today}
            onPress={() => {
              const [y, m, d] = selectedDate.split('-').map(Number);
              setSelectedDate(format(addDays(new Date(y, m - 1, d), 1), 'yyyy-MM-dd'));
            }}
          >
            <Text style={[styles.navArrow, { color: C.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Summary */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryCalories}>
            <Text style={[styles.calValue, { color: C.textPrimary }]}>{Math.round(consumed.calories)}</Text>
            <Text style={[styles.calTarget, { color: C.textTertiary }]}> / {targets.calories} kcal</Text>
          </View>
          <View style={styles.summaryMacros}>
            <Text style={[styles.macroStat, { color: Colors.primaryGreen }]}>{Math.round(consumed.proteinG)}g P</Text>
            <Text style={[styles.macroStat, { color: Colors.blueAccent }]}>{Math.round(consumed.carbsG)}g C</Text>
            <Text style={[styles.macroStat, { color: Colors.orangeAccent }]}>{Math.round(consumed.fatG)}g F</Text>
          </View>
        </View>
        <View style={[styles.progressBar, { backgroundColor: C.border }]}>
          <View style={[styles.progressFill, { width: `${Math.round(caloriesPct * 100)}%` }]} />
        </View>

        {/* Meal Slot Tabs */}
        <View style={[styles.tabs, { backgroundColor: C.bgSecondary }]}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              style={[styles.tab, activeSlot === tab.value && { backgroundColor: C.card }]}
              onPress={() => setActiveSlot(tab.value)}
            >
              <Text style={[styles.tabText, { color: activeSlot === tab.value ? C.textPrimary : C.textTertiary }]}>{tab.label}</Text>
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
              <Text style={[styles.emptyText, { color: C.textSecondary }]}>Nothing logged for {activeSlot}</Text>
              <Text style={[styles.emptySubText, { color: C.textTertiary }]}>Tap + to add food</Text>
            </View>
          }
          renderItem={({ item }) => <LogRow log={item} onDelete={() => removeLog(item.id)} />}
        />

        {/* FABs */}
        <TouchableOpacity style={styles.fabBarcode} onPress={() => setScannerVisible(true)}>
          <Text style={styles.fabBarcodeIcon}>⊡</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={() => setSheetVisible(true)}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

        <BarcodeScanner
          visible={scannerVisible}
          onScanned={handleBarcodeScan}
          onClose={() => setScannerVisible(false)}
        />
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
  const C = useColors();
  const ratio = log.quantityG / 100;
  const cals = Math.round(log.foodItem.calories * ratio);
  const protein = Math.round(log.foodItem.proteinG * ratio);
  const carbs = Math.round(log.foodItem.carbsG * ratio);
  const fat = Math.round(log.foodItem.fatG * ratio);
  return (
    <View style={[logStyles.row, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
      <View style={logStyles.info}>
        <View style={logStyles.topRow}>
          <Text style={[logStyles.name, { color: C.textPrimary }]} numberOfLines={1}>{log.foodItem.name}</Text>
          <Text style={logStyles.cals}>{cals} kcal</Text>
        </View>
        <Text style={[logStyles.qty, { color: C.textTertiary }]}>{log.quantityG}g · {log.foodItem.brand ?? log.foodItem.source.toUpperCase()}</Text>
        <View style={logStyles.macroRow}>
          <Text style={[logStyles.macroVal, { color: Colors.primaryGreen }]}>{protein}g P</Text>
          <Text style={[logStyles.macroDot, { color: C.textTertiary }]}>·</Text>
          <Text style={[logStyles.macroVal, { color: Colors.blueAccent }]}>{carbs}g C</Text>
          <Text style={[logStyles.macroDot, { color: C.textTertiary }]}>·</Text>
          <Text style={[logStyles.macroVal, { color: Colors.orangeAccent }]}>{fat}g F</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onDelete} style={logStyles.deleteBtn}>
        <Text style={[logStyles.deleteIcon, { color: C.textTertiary }]}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const logStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: Layout.borderRadius.md, padding: Layout.spacing.md, marginBottom: Layout.spacing.sm, borderWidth: 1, gap: Layout.spacing.sm },
  info: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  name: { fontFamily: Typography.sansMedium, fontSize: 14, flex: 1, marginRight: 8 },
  cals: { fontFamily: Typography.mono, fontSize: 13, color: Colors.primaryGreen },
  qty: { fontFamily: Typography.sans, fontSize: 12, marginTop: 2 },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  macroVal: { fontFamily: Typography.mono, fontSize: 11 },
  macroDot: { fontFamily: Typography.mono, fontSize: 11 },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 13 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Layout.spacing.md, paddingVertical: Layout.spacing.sm },
  navBtn: { paddingHorizontal: Layout.spacing.lg, paddingVertical: Layout.spacing.md },
  navBtnDisabled: { opacity: 0.25 },
  navArrow: { fontSize: 28, lineHeight: 32 },
  dateText: { fontFamily: Typography.sansMedium, fontSize: 15 },
  summaryBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Layout.spacing.lg, paddingBottom: Layout.spacing.sm },
  summaryCalories: { flexDirection: 'row', alignItems: 'baseline' },
  calValue: { fontFamily: Typography.mono, fontSize: 22 },
  calTarget: { fontFamily: Typography.mono, fontSize: 12 },
  summaryMacros: { flexDirection: 'row', gap: Layout.spacing.sm },
  macroStat: { fontFamily: Typography.mono, fontSize: 12 },
  progressBar: { height: 3, marginHorizontal: Layout.spacing.lg, borderRadius: 2, marginBottom: Layout.spacing.md },
  progressFill: { height: '100%', backgroundColor: Colors.primaryGreen, borderRadius: 2 },
  tabs: { flexDirection: 'row', marginHorizontal: Layout.spacing.lg, borderRadius: Layout.borderRadius.md, padding: 4, marginBottom: Layout.spacing.md },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: Layout.borderRadius.sm },
  tabText: { fontFamily: Typography.sansMedium, fontSize: 13 },
  chipList: { marginBottom: Layout.spacing.md },
  logList: { flex: 1 },
  emptyState: { alignItems: 'center', paddingTop: 48 },
  emptyText: { fontFamily: Typography.sansMedium, fontSize: 15, marginBottom: 4 },
  emptySubText: { fontFamily: Typography.sans, fontSize: 13 },
  fabBarcode: { position: 'absolute', bottom: 92, right: 28, width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.primaryGreen, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  fabBarcodeIcon: { fontSize: 20, color: '#FFFFFF' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primaryGreen, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: Colors.primaryGreen, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  fabIcon: { fontSize: 28, color: '#FFFFFF', lineHeight: 32 },
});
