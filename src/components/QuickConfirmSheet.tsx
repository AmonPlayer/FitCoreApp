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
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<SelectedItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (searchTimer) clearTimeout(searchTimer);
    if (text.trim().length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const items = await searchFoods(text.trim());
        setResults(items);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    setSearchTimer(timer);
  }, [searchTimer]);

  const addItem = (item: FoodItem) => {
    setSelected((prev) => {
      if (prev.find((s) => s.foodItem.id === item.id)) return prev;
      return [...prev, { foodItem: item, quantityG: item.servingSizeG }];
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
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheet}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>Add Food — {mealSlot}</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search food..."
            placeholderTextColor={Colors.dark.textTertiary}
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />

          {isSearching && <ActivityIndicator color={Colors.primaryGreen} style={{ marginVertical: 8 }} />}

          {results.length > 0 && (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultRow} onPress={() => addItem(item)}>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                    {item.brand && <Text style={styles.resultBrand} numberOfLines={1}>{item.brand}</Text>}
                  </View>
                  <Text style={styles.resultCal}>{item.calories} kcal</Text>
                  <Text style={styles.addBtn}>+</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {selected.length > 0 && (
            <View style={styles.selectedSection}>
              <Text style={styles.sectionTitle}>Selected</Text>
              {selected.map((s) => (
                <View key={s.foodItem.id} style={styles.selectedRow}>
                  <Text style={styles.selectedName} numberOfLines={1}>{s.foodItem.name}</Text>
                  <TextInput
                    style={styles.qtyInput}
                    value={String(s.quantityG)}
                    onChangeText={(v) => updateQuantity(s.foodItem.id, v)}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.gLabel}>g</Text>
                  <TouchableOpacity onPress={() => removeSelected(s.foodItem.id)}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
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
    backgroundColor: Colors.dark.bgSecondary,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.lg,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.border,
    alignSelf: 'center',
    marginBottom: Layout.spacing.md,
  },
  title: {
    fontFamily: Typography.sansBold,
    fontSize: 16,
    color: Colors.dark.textPrimary,
    textTransform: 'capitalize',
    marginBottom: Layout.spacing.md,
  },
  searchInput: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm + 2,
    fontFamily: Typography.sans,
    fontSize: 14,
    color: Colors.dark.textPrimary,
    marginBottom: Layout.spacing.sm,
  },
  resultsList: {
    maxHeight: 200,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    gap: Layout.spacing.sm,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontFamily: Typography.sansMedium,
    fontSize: 13,
    color: Colors.dark.textPrimary,
  },
  resultBrand: {
    fontFamily: Typography.sans,
    fontSize: 11,
    color: Colors.dark.textTertiary,
  },
  resultCal: {
    fontFamily: Typography.mono,
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  addBtn: {
    color: Colors.primaryGreen,
    fontSize: 20,
    fontFamily: Typography.sansBold,
    width: 24,
    textAlign: 'center',
  },
  selectedSection: {
    marginTop: Layout.spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.sansMedium,
    fontSize: 12,
    color: Colors.dark.textSecondary,
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
    color: Colors.dark.textPrimary,
  },
  qtyInput: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    fontFamily: Typography.mono,
    fontSize: 13,
    color: Colors.dark.textPrimary,
    width: 60,
    textAlign: 'center',
  },
  gLabel: {
    fontFamily: Typography.sans,
    fontSize: 12,
    color: Colors.dark.textTertiary,
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
    borderColor: Colors.dark.border,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: Typography.sansMedium,
    fontSize: 14,
    color: Colors.dark.textSecondary,
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
