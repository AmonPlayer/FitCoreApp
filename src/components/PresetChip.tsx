import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Preset } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

interface PresetChipProps {
  preset: Preset;
  onPress: (preset: Preset) => void;
  isSelected?: boolean;
}

export function PresetChip({ preset, onPress, isSelected = false }: PresetChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={() => onPress(preset)}
      activeOpacity={0.7}
    >
      <Text style={styles.name} numberOfLines={1}>{preset.name}</Text>
      <View style={styles.calBadge}>
        <Text style={styles.calText}>{Math.round(preset.totalCalories)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 20,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    marginRight: Layout.spacing.sm,
    gap: Layout.spacing.sm,
  },
  chipSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: `${Colors.primaryGreen}20`,
  },
  name: {
    fontFamily: Typography.sansMedium,
    fontSize: 13,
    color: Colors.dark.textPrimary,
    maxWidth: 120,
  },
  calBadge: {
    backgroundColor: Colors.dark.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  calText: {
    fontFamily: Typography.mono,
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
});
