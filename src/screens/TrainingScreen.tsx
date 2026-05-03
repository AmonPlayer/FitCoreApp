import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useUserStore } from '@/store/useUserStore';
import { useTrainingStore } from '@/store/useTrainingStore';
import { useTrainingSplit } from '@/hooks/useTrainingSplit';
import { ExerciseRow } from '@/components/ExerciseRow';
import { SetLog } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

export function TrainingScreen() {
  const profile = useUserStore((s) => s.profile);
  const { todaySession, isRestDay } = useTrainingSplit();
  const activeSession = useTrainingStore((s) => s.activeSession);
  const startSession = useTrainingStore((s) => s.startSession);
  const updateSetLog = useTrainingStore((s) => s.updateSetLog);
  const completeSession = useTrainingStore((s) => s.completeSession);
  const loadSplit = useTrainingStore((s) => s.loadSplit);

  useEffect(() => {
    loadSplit();
  }, []);

  const allSetsCompleted = activeSession?.exerciseLogs.every((el) => el.sets.every((s) => s.completed)) ?? false;

  const handleComplete = () => {
    Alert.alert('Complete Session?', 'Mark this session as done and save it.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Complete', onPress: () => completeSession() },
    ]);
  };

  if (!activeSession && isRestDay) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.restContainer}>
          <Text style={styles.restEmoji}>🛌</Text>
          <Text style={styles.restTitle}>Rest Day</Text>
          <Text style={styles.restSub}>Your next session is scheduled for tomorrow. Recovery is where the gains happen.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeSession && !isRestDay && todaySession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.startContainer}>
          <Text style={styles.sessionLabel}>{todaySession.label}</Text>
          <Text style={styles.exerciseCount}>{todaySession.exercises.length} exercises</Text>
          <View style={styles.exerciseList}>
            {todaySession.exercises.map((ex) => (
              <Text key={ex.id} style={styles.exerciseName}>· {ex.name} <Text style={styles.exerciseNote}>{ex.notes}</Text></Text>
            ))}
          </View>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => startSession(todaySession, profile?.id ?? '')}
          >
            <Text style={styles.startBtnText}>Start Session</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Session Header */}
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionTitle}>{activeSession?.splitDayLabel}</Text>
          <View style={styles.volumeBadge}>
            <Text style={styles.volumeText}>
              {activeSession?.exerciseLogs.reduce((acc, el) => acc + el.sets.filter((s) => s.completed).length, 0)} / {activeSession?.exerciseLogs.reduce((acc, el) => acc + el.sets.length, 0)} sets
            </Text>
          </View>
        </View>

        <FlatList
          data={activeSession?.exerciseLogs}
          keyExtractor={(el) => el.exercise.id}
          contentContainerStyle={{ padding: Layout.spacing.lg, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <ExerciseRow
              exerciseLog={item}
              onSetUpdate={(setIndex, update) => updateSetLog(item.exercise.id, setIndex, update)}
            />
          )}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.completeBtn, !allSetsCompleted && styles.completeBtnDisabled]}
            onPress={handleComplete}
            disabled={!allSetsCompleted}
          >
            <Text style={styles.completeBtnText}>
              {allSetsCompleted ? '✓ Complete Session' : `Complete All Sets First (${activeSession?.exerciseLogs.reduce((acc, el) => acc + el.sets.filter((s) => !s.completed).length, 0)} remaining)`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.bgPrimary },
  restContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Layout.spacing.xl },
  restEmoji: { fontSize: 56, marginBottom: Layout.spacing.lg },
  restTitle: { fontFamily: Typography.sansBold, fontSize: 28, color: Colors.dark.textPrimary, marginBottom: Layout.spacing.sm },
  restSub: { fontFamily: Typography.sans, fontSize: 15, color: Colors.dark.textSecondary, textAlign: 'center', lineHeight: 22 },
  startContainer: { flex: 1, padding: Layout.spacing.xl },
  sessionLabel: { fontFamily: Typography.sansBold, fontSize: 28, color: Colors.dark.textPrimary, marginBottom: 4 },
  exerciseCount: { fontFamily: Typography.sans, fontSize: 14, color: Colors.dark.textSecondary, marginBottom: Layout.spacing.xl },
  exerciseList: { flex: 1, gap: Layout.spacing.sm },
  exerciseName: { fontFamily: Typography.sansMedium, fontSize: 15, color: Colors.dark.textPrimary },
  exerciseNote: { fontFamily: Typography.mono, fontSize: 12, color: Colors.dark.textTertiary },
  startBtn: { backgroundColor: Colors.primaryGreen, borderRadius: Layout.borderRadius.lg, paddingVertical: 16, alignItems: 'center', marginTop: Layout.spacing.xl },
  startBtnText: { fontFamily: Typography.sansBold, fontSize: 16, color: '#FFFFFF' },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Layout.spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  sessionTitle: { fontFamily: Typography.sansBold, fontSize: 20, color: Colors.dark.textPrimary },
  volumeBadge: { backgroundColor: `${Colors.primaryGreen}20`, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  volumeText: { fontFamily: Typography.mono, fontSize: 13, color: Colors.primaryGreen },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Layout.spacing.lg, backgroundColor: Colors.dark.bgPrimary, borderTopWidth: 1, borderTopColor: Colors.dark.border },
  completeBtn: { backgroundColor: Colors.primaryGreen, borderRadius: Layout.borderRadius.lg, paddingVertical: 16, alignItems: 'center' },
  completeBtnDisabled: { opacity: 0.4 },
  completeBtnText: { fontFamily: Typography.sansBold, fontSize: 14, color: '#FFFFFF' },
});
