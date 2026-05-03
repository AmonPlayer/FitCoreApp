import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SleepLog } from '@/types';
import { useColors } from '@/hooks/useColors';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

interface SleepEntryProps {
  onSubmit: (bedtime: Date, wake: Date, quality: number) => void;
  existingLog?: SleepLog;
}

function parseTimeToDate(timeStr: string): Date | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3]?.toLowerCase();
  if (ampm === 'pm' && hours < 12) hours += 12;
  if (ampm === 'am' && hours === 12) hours = 0;
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function SleepEntry({ onSubmit, existingLog }: SleepEntryProps) {
  const C = useColors();
  const [bedtime, setBedtime] = useState(existingLog ? new Date(existingLog.bedtimeISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:30 PM');
  const [wake, setWake] = useState(existingLog ? new Date(existingLog.wakeISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '6:30 AM');
  const [quality, setQuality] = useState(existingLog?.qualityScore ?? 3);

  const handleSubmit = () => {
    const bedDate = parseTimeToDate(bedtime);
    const wakeDate = parseTimeToDate(wake);
    if (!bedDate || !wakeDate) return;
    if (wakeDate <= bedDate) wakeDate.setDate(wakeDate.getDate() + 1);
    onSubmit(bedDate, wakeDate, quality);
  };

  return (
    <View style={[styles.container, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
      <Text style={[styles.title, { color: C.textPrimary }]}>Log Sleep</Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>Bedtime</Text>
          <TextInput
            style={[styles.timeInput, { backgroundColor: C.bgSecondary, borderColor: C.border }]}
            value={bedtime}
            onChangeText={setBedtime}
            placeholder="10:30 PM"
            placeholderTextColor={C.textTertiary}
          />
        </View>
        <Text style={[styles.arrow, { color: C.textTertiary }]}>→</Text>
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>Wake</Text>
          <TextInput
            style={[styles.timeInput, { backgroundColor: C.bgSecondary, borderColor: C.border }]}
            value={wake}
            onChangeText={setWake}
            placeholder="6:30 AM"
            placeholderTextColor={C.textTertiary}
          />
        </View>
      </View>

      <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>Quality</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setQuality(star)}>
            <Text style={[styles.star, { color: C.border }, star <= quality && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Save Sleep Log</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: Layout.borderRadius.lg, borderWidth: 1, padding: Layout.cardPadding },
  title: { fontFamily: Typography.sansBold, fontSize: 15, marginBottom: Layout.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Layout.spacing.md, marginBottom: Layout.spacing.md },
  field: { flex: 1 },
  fieldLabel: { fontFamily: Typography.sans, fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  timeInput: { borderWidth: 1, borderRadius: Layout.borderRadius.md, padding: Layout.spacing.sm, fontFamily: Typography.mono, fontSize: 16, color: Colors.blueAccent, textAlign: 'center' },
  arrow: { fontSize: 18, marginTop: 18 },
  stars: { flexDirection: 'row', gap: 8, marginBottom: Layout.spacing.md, marginTop: 4 },
  star: { fontSize: 26 },
  starActive: { color: Colors.orangeAccent },
  submitBtn: { backgroundColor: Colors.blueAccent, borderRadius: Layout.borderRadius.md, paddingVertical: 12, alignItems: 'center' },
  submitText: { fontFamily: Typography.sansBold, fontSize: 14, color: '#FFFFFF' },
});
