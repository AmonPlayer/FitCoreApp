import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { FoodItem, MealSlot } from '@/types';
import { searchFoods } from '@/lib/usda';
import { searchByBarcode } from '@/lib/openFoodFacts';
import { useColors } from '@/hooks/useColors';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

interface SelectedItem {
  foodItem: FoodItem;
  quantityG: number;
}

interface QuickConfirmSheetProps {
  visible: boolean;
  mealSlot: MealSlot;
  onClose: () => void;
  onConfirm: (items: SelectedItem[]) => void;
}

export function QuickConfirmSheet({ visible, mealSlot, onClose, onConfirm }: QuickConfirmSheetProps) {
  const C = useColors();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<SelectedItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (searchTimer) clearTimeout(searchTimer);
    if (text.trim().length < 2) { setResults([]); setSearchError(null); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const items = await searchFoods(text.trim());
        setResults(items);
        if (items.length === 0) setSearchError('No results found. Try a different search term.');
      } catch (e) {
        setResults([]);
        setSearchError(`Search failed: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    setSearchTimer(timer);
  }, [searchTimer]);

  const addItem = (item: FoodItem) => {
    setSelected((prev) => {
      if (prev.find((s) => s.foodItem.id === item.id)) return prev;
      return [...prev, { foodItem: item, quantityG: Math.round(item.servingSizeG) }];
    });
  };

  const removeSelected = (id: string) => {
    setSelected((prev) => prev.filter((s) => s.foodItem.id !== id));
  };

  const updateQuantity = (id: string, qty: string) => {
    const num = parseFloat(qty);
    if (isNaN(num) || num <= 0) return;
    setSelected((prev) => prev.map((s) => s.foodItem.id === id ? { ...s, quantityG: num } : s));
  };

  const handleConfirm = () => {
    if (selected.length === 0) return;
    onConfirm(selected);
    setQuery('');
    setResults([]);
    setSelected([]);
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSelected([]);
    setScanError(null);
    setSearchError(null);
    onClose();
  };

  const handleBarcodeScan = async (barcode: string) => {
    setScannerOpen(false);
    setIsSearching(true);
    setScanError(null);
    try {
      const item = await searchByBarcode(barcode);
      if (item) {
        setSelected((prev) => prev.find((s) => s.foodItem.id === item.id) ? prev : [...prev, { foodItem: item, quantityG: item.servingSizeG }]);
      } else {
        setScanError('Product not found. Try searching by name.');
        setTimeout(() => setScanError(null), 3000);
      }
    } catch {
      setScanError('Scan failed. Try again.');
      setTimeout(() => setScanError(null), 3000);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.sheet, { backgroundColor: C.bgSecondary }]}
        >
          <View style={[styles.handle, { backgroundColor: C.border }]} />
          <Text style={[styles.title, { color: C.textPrimary }]}>Add Food — {mealSlot}</Text>

          <View style={styles.searchRow}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: C.card, borderColor: C.border, color: C.textPrimary }]}
              placeholder="Search food..."
              placeholderTextColor={C.textTertiary}
              value={query}
              onChangeText={handleSearch}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.scanBtn, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={() => setScannerOpen(true)}
            >
              <Text style={styles.scanIcon}>⊡</Text>
            </TouchableOpacity>
          </View>

          {scanError && <Text style={styles.scanError}>{scanError}</Text>}
          {searchError && <Text style={styles.scanError}>{searchError}</Text>}
          {isSearching && <ActivityIndicator color={Colors.primaryGreen} style={{ marginVertical: 8 }} />}

          <BarcodeScanner
            visible={scannerOpen}
            onScanned={handleBarcodeScan}
            onClose={() => setScannerOpen(false)}
          />

          {results.length > 0 && (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isGeneric = item.dataType === 'Foundation' || item.dataType === 'SR Legacy';
                const badgeLabel = isGeneric ? 'Generic' : (item.brand ?? item.dataType ?? '');
                return (
                  <TouchableOpacity style={[styles.resultRow, { borderBottomColor: C.border }]} onPress={() => addItem(item)}>
                    <View style={styles.resultInfo}>
                      <View style={styles.resultTopRow}>
                        <Text style={[styles.resultName, { color: C.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                        {badgeLabel ? (
                          <View style={[styles.badge, isGeneric ? styles.badgeGeneric : { backgroundColor: C.bgPrimary }]}>
                            <Text style={[styles.badgeText, isGeneric ? styles.badgeTextGeneric : { color: C.textTertiary }]} numberOfLines={1}>{badgeLabel}</Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.macroRow}>
                        <Text style={[styles.macroChip, { color: Colors.primaryGreen }]}>{Math.round(item.proteinG)}g P</Text>
                        <Text style={[styles.macroDot, { color: C.textTertiary }]}>·</Text>
                        <Text style={[styles.macroChip, { color: Colors.blueAccent }]}>{Math.round(item.carbsG)}g C</Text>
                        <Text style={[styles.macroDot, { color: C.textTertiary }]}>·</Text>
                        <Text style={[styles.macroChip, { color: Colors.orangeAccent }]}>{Math.round(item.fatG)}g F</Text>
                        <Text style={[styles.resultCal, { color: C.textTertiary }]}>{item.calories} kcal</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.addCircle} onPress={() => addItem(item)}>
                      <Text style={styles.addBtn}>+</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {selected.length > 0 && (
            <View style={styles.selectedSection}>
              <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>Selected</Text>
              {selected.map((s) => (
                <View key={s.foodItem.id} style={styles.selectedRow}>
                  <Text style={[styles.selectedName, { color: C.textPrimary }]} numberOfLines={1}>{s.foodItem.name}</Text>
                  <TextInput
                    style={[styles.qtyInput, { backgroundColor: C.card, borderColor: C.border, color: C.textPrimary }]}
                    value={String(s.quantityG)}
                    onChangeText={(v) => updateQuantity(s.foodItem.id, v)}
                    keyboardType="decimal-pad"
                  />
                  <Text style={[styles.gLabel, { color: C.textTertiary }]}>g</Text>
                  <TouchableOpacity onPress={() => removeSelected(s.foodItem.id)}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: C.border }]} onPress={handleClose}>
              <Text style={[styles.cancelText, { color: C.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, selected.length === 0 && styles.confirmDisabled]}
              onPress={handleConfirm}
              disabled={selected.length === 0}
            >
              <Text style={styles.confirmText}>Log {selected.length > 0 ? `(${selected.length})` : ''}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.lg,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Layout.spacing.md,
  },
  title: {
    fontFamily: Typography.sansBold,
    fontSize: 16,
    textTransform: 'capitalize',
    marginBottom: Layout.spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm + 2,
    fontFamily: Typography.sans,
    fontSize: 14,
  },
  scanBtn: {
    width: 46,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanIcon: {
    fontSize: 22,
    color: Colors.primaryGreen,
  },
  scanError: {
    fontFamily: Typography.sans,
    fontSize: 12,
    color: Colors.redAccent,
    marginBottom: Layout.spacing.sm,
  },
  resultsList: {
    maxHeight: 280,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: Layout.spacing.sm,
  },
  resultInfo: {
    flex: 1,
    gap: 4,
  },
  resultTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  resultName: {
    fontFamily: Typography.sansMedium,
    fontSize: 14,
    flex: 1,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeGeneric: {
    backgroundColor: `${Colors.primaryGreen}20`,
  },
  badgeText: {
    fontFamily: Typography.sans,
    fontSize: 10,
  },
  badgeTextGeneric: {
    color: Colors.primaryGreen,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  macroChip: {
    fontFamily: Typography.mono,
    fontSize: 11,
  },
  macroDot: {
    fontFamily: Typography.mono,
    fontSize: 11,
  },
  resultCal: {
    fontFamily: Typography.mono,
    fontSize: 11,
    marginLeft: 'auto',
  },
  addCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: Colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    color: Colors.primaryGreen,
    fontSize: 20,
    fontFamily: Typography.sansBold,
    lineHeight: 22,
  },
  selectedSection: {
    marginTop: Layout.spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.sansMedium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Layout.spacing.sm,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    gap: Layout.spacing.sm,
  },
  selectedName: {
    flex: 1,
    fontFamily: Typography.sans,
    fontSize: 13,
  },
  qtyInput: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    fontFamily: Typography.mono,
    fontSize: 13,
    width: 60,
    textAlign: 'center',
  },
  gLabel: {
    fontFamily: Typography.sans,
    fontSize: 12,
  },
  removeBtn: {
    color: Colors.redAccent,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginTop: Layout.spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: Typography.sansMedium,
    fontSize: 14,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.primaryGreen,
    alignItems: 'center',
  },
  confirmDisabled: {
    opacity: 0.4,
  },
  confirmText: {
    fontFamily: Typography.sansBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
