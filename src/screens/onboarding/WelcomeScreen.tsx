import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

type Props = { navigation: StackNavigationProp<OnboardingStackParamList, 'Welcome'> };

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoArea}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>FC</Text>
          </View>
          <Text style={styles.appName}>FitCore</Text>
          <Text style={styles.tagline}>Track. Train. Transform.</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Auth', { mode: 'signup' })}>
            <Text style={styles.primaryBtnText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Auth', { mode: 'signin' })}>
            <Text style={styles.secondaryBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bgPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.spacing.xl,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 48,
  },
  logoArea: {
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: Layout.borderRadius.xl,
    backgroundColor: Colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.sm,
  },
  logoText: {
    fontFamily: Typography.sansBold,
    fontSize: 28,
    color: '#FFFFFF',
  },
  appName: {
    fontFamily: Typography.sansBold,
    fontSize: 36,
    color: Colors.dark.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: Typography.sans,
    fontSize: 16,
    color: Colors.dark.textSecondary,
    letterSpacing: 0.5,
  },
  actions: {
    gap: Layout.spacing.md,
  },
  primaryBtn: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: Layout.borderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: Typography.sansBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  secondaryBtn: {
    borderRadius: Layout.borderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  secondaryBtnText: {
    fontFamily: Typography.sansMedium,
    fontSize: 16,
    color: Colors.dark.textPrimary,
  },
});
