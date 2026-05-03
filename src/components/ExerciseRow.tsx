import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ExerciseLog, SetLog } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

interface ExerciseRowProps {
  exerciseLog: ExerciseLog;
  onSetUpdate: (setIndex: number, update: Partial<SetLog>) => void;
}

export function ExerciseRow({ exerciseLog, onSetUpdate }: ExerciseRowProps) {
  const { exercise, sets } = exerciseLog;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{exercise.name}</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{exercise.muscleGroup}</Text>
        </View>
      </View>
      {exercise.notes && <Text style={styles.notes}>{exercise.notes}</Text>}

      <View style={styles.setHeader}>
        <Text style={[styles.setLabel, styles.setNumCol]}>SET</Text>
        <Text style={[styles.setLabel, styles.weightCol]}>KG</Text>
        <Text style={[styles.setLabel, styles.repsCol]}>REPS</Text>
        <View style={styles.checkCol} />
      </View>

      {sets.map((set, i) => (
        <View key={i} style={[styles.setRow, set.completed && styles.setRowDone]}>
          <Text style={[styles.setNum, styles.setNumCol]}>{set.setNumber}</Text>
          <TextInput
            style={[styles.input, styles.weightCol]}
            value={set.weightKg > 0 ? String(set.weightKg) : ''}
            placeholder="0"
            placeholderTextColor={Colors.dark.textTertiary}
            keyboardType="decimal-pad"
            onChangeText={(v) => onSetUpdate(i, { weightKg: parseFloat(v) || 0 })}
          />
          <TextInput
            style={[styles.input, styles.repsCol]}
            value={set.reps > 0 ? String(set.reps) : ''}
            placeholder="0"
            placeholderTextColor={Colors.dark.textTertiary}
            keyboardType="number-pad"
            onChangeText={(v) => onSetUpdate(i, { reps: parseInt(v, 10) || 0 })}
          />
          <TouchableOpacity
            style={[styles.checkBtn, set.completed && styles.checkBtnDone, styles.checkCol]}
            onPress={() => onSetUpdate(i, { completed: !set.completed })}
          >
            <Text style={[styles.checkIcon, set.completed && styles.checkIconDone]}>
              {set.completed ? '✓' : '○'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    padding: Layout.cardPadding,
    marginBottom: Layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontFamily: Typography.sansBold,
    fontSize: 15,
    color: Colors.dark.textPrimary,
    flex: 1,
  },
  tag: {
    backgroundColor: `${Colors.primaryGreen}20`,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontFamily: Typography.sans,
    fontSize: 11,
    color: Colors.primaryGreen,
  },
  notes: {
    fontFamily: Typography.sans,
    fontSize: 12,
    color: Colors.dark.textTertiary,
    marginBottom: Layout.spacing.sm,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  setLabel: {
    fontFamily: Typography.mono,
    fontSize: 10,
    color: Colors.dark.textTertiary,
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: Layout.borderRadius.sm,
    marginBottom: 2,
  },
  setRowDone: {
    backgroundColor: `${Colors.primaryGreen}12`,
  },
  setNumCol: { width: 36 },
  weightCol: { flex: 1 },
  repsCol: { flex: 1 },
  checkCol: { width: 40, alignItems: 'center' },
  setNum: {
    fontFamily: Typography.mono,
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  input: {
    fontFamily: Typography.mono,
    fontSize: 14,
    color: Colors.dark.textPrimary,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: Colors.dark.bgSecondary,
    borderRadius: Layout.borderRadius.sm,
    marginHorizontal: 2,
    textAlign: 'center',
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDone: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  checkIcon: {
    fontFamily: Typography.sans,
    fontSize: 14,
    color: Colors.dark.textTertiary,
  },
  checkIconDone: {
    color: '#FFFFFF',
  },
});
