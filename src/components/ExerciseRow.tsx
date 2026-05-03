import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ExerciseLog, SetLog } from '@/types';
import { useColors } from '@/hooks/useColors';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

interface ExerciseRowProps {
  exerciseLog: ExerciseLog;
  onSetUpdate: (setIndex: number, update: Partial<SetLog>) => void;
}

export function ExerciseRow({ exerciseLog, onSetUpdate }: ExerciseRowProps) {
  const C = useColors();
  const { exercise, sets } = exerciseLog;

  return (
    <View style={[styles.container, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
      <View style={styles.header}>
        <Text style={[styles.name, { color: C.textPrimary }]}>{exercise.name}</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{exercise.muscleGroup}</Text>
        </View>
      </View>
      {exercise.notes && <Text style={[styles.notes, { color: C.textTertiary }]}>{exercise.notes}</Text>}

      <View style={[styles.setHeader, { borderTopColor: C.border }]}>
        <Text style={[styles.setLabel, styles.setNumCol, { color: C.textTertiary }]}>SET</Text>
        <Text style={[styles.setLabel, styles.weightCol, { color: C.textTertiary }]}>KG</Text>
        <Text style={[styles.setLabel, styles.repsCol, { color: C.textTertiary }]}>REPS</Text>
        <View style={styles.checkCol} />
      </View>

      {sets.map((set, i) => (
        <View key={i} style={[styles.setRow, set.completed && styles.setRowDone]}>
          <Text style={[styles.setNum, styles.setNumCol, { color: C.textSecondary }]}>{set.setNumber}</Text>
          <TextInput
            style={[styles.input, styles.weightCol, { color: C.textPrimary, backgroundColor: C.bgSecondary }]}
            value={set.weightKg > 0 ? String(set.weightKg) : ''}
            placeholder="0"
            placeholderTextColor={C.textTertiary}
            keyboardType="decimal-pad"
            onChangeText={(v) => onSetUpdate(i, { weightKg: parseFloat(v) || 0 })}
          />
          <TextInput
            style={[styles.input, styles.repsCol, { color: C.textPrimary, backgroundColor: C.bgSecondary }]}
            value={set.reps > 0 ? String(set.reps) : ''}
            placeholder="0"
            placeholderTextColor={C.textTertiary}
            keyboardType="number-pad"
            onChangeText={(v) => onSetUpdate(i, { reps: parseInt(v, 10) || 0 })}
          />
          <TouchableOpacity
            style={[styles.checkBtn, { borderColor: C.border }, set.completed && styles.checkBtnDone, styles.checkCol]}
            onPress={() => onSetUpdate(i, { completed: !set.completed })}
          >
            <Text style={[styles.checkIcon, { color: C.textTertiary }, set.completed && styles.checkIconDone]}>
              {set.completed ? '✓' : '○'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: Layout.borderRadius.lg, borderWidth: 1, padding: Layout.cardPadding, marginBottom: Layout.spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontFamily: Typography.sansBold, fontSize: 15, flex: 1 },
  tag: { backgroundColor: `${Colors.primaryGreen}20`, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontFamily: Typography.sans, fontSize: 11, color: Colors.primaryGreen },
  notes: { fontFamily: Typography.sans, fontSize: 12, marginBottom: Layout.spacing.sm },
  setHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingTop: Layout.spacing.sm, borderTopWidth: 1 },
  setLabel: { fontFamily: Typography.mono, fontSize: 10, letterSpacing: 0.5 },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderRadius: Layout.borderRadius.sm, marginBottom: 2 },
  setRowDone: { backgroundColor: `${Colors.primaryGreen}12` },
  setNumCol: { width: 36 },
  weightCol: { flex: 1 },
  repsCol: { flex: 1 },
  checkCol: { width: 40, alignItems: 'center' },
  setNum: { fontFamily: Typography.mono, fontSize: 13 },
  input: { fontFamily: Typography.mono, fontSize: 14, paddingVertical: 4, paddingHorizontal: 6, borderRadius: Layout.borderRadius.sm, marginHorizontal: 2, textAlign: 'center' },
  checkBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  checkBtnDone: { backgroundColor: Colors.primaryGreen, borderColor: Colors.primaryGreen },
  checkIcon: { fontFamily: Typography.sans, fontSize: 14 },
  checkIconDone: { color: '#FFFFFF' },
});
