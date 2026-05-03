import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeScreen } from '@/screens/onboarding/WelcomeScreen';
import { AuthScreen } from '@/screens/onboarding/AuthScreen';
import { ProfileInputScreen } from '@/screens/onboarding/ProfileInputScreen';
import { ActivityQuizScreen } from '@/screens/onboarding/ActivityQuizScreen';
import { GoalSelectionScreen } from '@/screens/onboarding/GoalSelectionScreen';
import { TDEEResultScreen } from '@/screens/onboarding/TDEEResultScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  Auth: { mode: 'signin' | 'signup' };
  ProfileInput: undefined;
  ActivityQuiz: undefined;
  GoalSelection: undefined;
  TDEEResult: undefined;
};

const Stack = createStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#0D0D0D' } }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="ProfileInput" component={ProfileInputScreen} />
      <Stack.Screen name="ActivityQuiz" component={ActivityQuizScreen} />
      <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <Stack.Screen name="TDEEResult" component={TDEEResultScreen} />
    </Stack.Navigator>
  );
}
