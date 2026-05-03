import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import { useUserStore } from '@/store/useUserStore';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Auth'>;
  route: RouteProp<OnboardingStackParamList, 'Auth'>;
};

export function AuthScreen({ navigation, route }: Props) {
  const initialMode = route.params?.mode ?? 'signup';
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn, signUp, isLoading, error, setError } = useUserStore();

  const handleSubmit = async () => {
    setError(null);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        // Auth state change in App.tsx will handle navigation
      } else {
        await signUp(email, password);
        navigation.navigate('ProfileInput');
      }
    } catch {
      // error already set in store
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    setError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{mode === 'signin' ? 'Welcome back' : 'Create account'}</Text>
          <Text style={styles.subtitle}>{mode === 'signin' ? 'Sign in to continue' : 'Start your journey'}</Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="you@example.com"
              placeholderTextColor={Colors.dark.textTertiary}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={Colors.dark.textTertiary}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>{mode === 'signin' ? 'Sign In' : 'Continue'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMode} style={styles.toggleRow}>
            <Text style={styles.toggleText}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.toggleLink}>{mode === 'signin' ? 'Sign up' : 'Sign in'}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.bgPrimary },
  scroll: { padding: Layout.spacing.xl, paddingTop: Layout.spacing.lg },
  backBtn: { marginBottom: Layout.spacing.xl },
  backText: { fontFamily: Typography.sans, fontSize: 14, color: Colors.dark.textSecondary },
  title: { fontFamily: Typography.sansBold, fontSize: 28, color: Colors.dark.textPrimary, marginBottom: 4 },
  subtitle: { fontFamily: Typography.sans, fontSize: 15, color: Colors.dark.textSecondary, marginBottom: Layout.spacing.xl },
  errorText: { fontFamily: Typography.sans, fontSize: 13, color: Colors.redAccent, marginBottom: Layout.spacing.md, backgroundColor: `${Colors.redAccent}15`, padding: Layout.spacing.md, borderRadius: Layout.borderRadius.md },
  form: { gap: Layout.spacing.sm, marginBottom: Layout.spacing.xl },
  label: { fontFamily: Typography.sansMedium, fontSize: 13, color: Colors.dark.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: Colors.dark.bgSecondary, borderWidth: 1, borderColor: Colors.dark.border, borderRadius: Layout.borderRadius.md, padding: Layout.spacing.md, fontFamily: Typography.sans, fontSize: 15, color: Colors.dark.textPrimary },
  submitBtn: { backgroundColor: Colors.primaryGreen, borderRadius: Layout.borderRadius.lg, paddingVertical: 16, alignItems: 'center', marginBottom: Layout.spacing.lg },
  submitText: { fontFamily: Typography.sansBold, fontSize: 16, color: '#FFFFFF' },
  toggleRow: { alignItems: 'center' },
  toggleText: { fontFamily: Typography.sans, fontSize: 14, color: Colors.dark.textSecondary },
  toggleLink: { color: Colors.primaryGreen, fontFamily: Typography.sansMedium },
});
