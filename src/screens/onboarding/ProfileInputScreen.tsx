import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import { useUserStore } from '@/store/useUserStore';
import { Sex } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

type Props = { navigation: StackNavigationProp<OnboardingStackParamList, 'ProfileInput'> };

const SEX_OPTIONS: { label: string; value: Sex }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export function ProfileInputScreen({ navigation }: Props) {
  const { updateOnboardingDraft } = useUserStore();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [sex, setSex] = useState<Sex>('male');

  const canContinue = name.trim() && age && heightCm && weightKg;

  const handleContinue = () => {
    updateOnboardingDraft({
      name: name.trim(),
      age: parseInt(age, 10),
      heightCm: parseFloat(heightCm),
      weightKg: parseFloat(weightKg),
      sex,
    });
    navigation.navigate('ActivityQuiz');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.progress}><View style={[styles.progressFill, { width: '33%' }]} /></View>
          <Text style={styles.step}>Step 1 of 3</Text>
          <Text style={styles.title}>About You</Text>
          <Text style={styles.subtitle}>Help us personalize your experience</Text>

          <View style={styles.form}>
            <FormField label="Name">
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={Colors.dark.textTertiary} />
            </FormField>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FormField label="Age">
                  <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="25" placeholderTextColor={Colors.dark.textTertiary} />
                </FormField>
              </View>
              <View style={{ width: Layout.spacing.md }} />
              <View style={{ flex: 1 }}>
                <FormField label="Height (cm)">
                  <TextInput style={styles.input} value={heightCm} onChangeText={setHeightCm} keyboardType="decimal-pad" placeholder="175" placeholderTextColor={Colors.dark.textTertiary} />
                </FormField>
              </View>
            </View>

            <FormField label="Weight (kg)">
              <TextInput style={styles.input} value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" placeholder="75" placeholderTextColor={Colors.dark.textTertiary} />
            </FormField>

            <FormField label="Sex">
              <View style={styles.sexRow}>
                {SEX_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.sexChip, sex === opt.value && styles.sexChipActive]}
                    onPress={() => setSex(opt.value)}
                  >
                    <Text style={[styles.sexChipText, sex === opt.value && styles.sexChipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FormField>
          </View>

          <TouchableOpacity style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]} onPress={handleContinue} disabled={!canContinue}>
            <Text style={styles.continueBtnText}>Continue →</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: Layout.spacing.md }}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: { fontFamily: Typography.sansMedium, fontSize: 13, color: Colors.dark.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.bgPrimary },
  scroll: { padding: Layout.spacing.xl },
  progress: { height: 3, backgroundColor: Colors.dark.border, borderRadius: 2, marginBottom: Layout.spacing.lg },
  progressFill: { height: '100%', backgroundColor: Colors.primaryGreen, borderRadius: 2 },
  step: { fontFamily: Typography.sans, fontSize: 12, color: Colors.dark.textTertiary, marginBottom: Layout.spacing.sm },
  title: { fontFamily: Typography.sansBold, fontSize: 26, color: Colors.dark.textPrimary, marginBottom: 4 },
  subtitle: { fontFamily: Typography.sans, fontSize: 15, color: Colors.dark.textSecondary, marginBottom: Layout.spacing.xl },
  form: { marginBottom: Layout.spacing.xl },
  row: { flexDirection: 'row' },
  input: { backgroundColor: Colors.dark.bgSecondary, borderWidth: 1, borderColor: Colors.dark.border, borderRadius: Layout.borderRadius.md, padding: Layout.spacing.md, fontFamily: Typography.sans, fontSize: 15, color: Colors.dark.textPrimary },
  sexRow: { flexDirection: 'row', gap: Layout.spacing.sm },
  sexChip: { flex: 1, paddingVertical: 12, borderRadius: Layout.borderRadius.md, borderWidth: 1, borderColor: Colors.dark.border, alignItems: 'center' },
  sexChipActive: { borderColor: Colors.primaryGreen, backgroundColor: `${Colors.primaryGreen}20` },
  sexChipText: { fontFamily: Typography.sansMedium, fontSize: 14, color: Colors.dark.textSecondary },
  sexChipTextActive: { color: Colors.primaryGreen },
  continueBtn: { backgroundColor: Colors.primaryGreen, borderRadius: Layout.borderRadius.lg, paddingVertical: 16, alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { fontFamily: Typography.sansBold, fontSize: 16, color: '#FFFFFF' },
});
