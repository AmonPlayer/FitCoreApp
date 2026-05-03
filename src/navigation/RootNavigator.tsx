import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AppNavigator } from './AppNavigator';
import { SettingsScreen } from '@/screens/SettingsScreen';

export type RootStackParamList = {
  Tabs: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={AppNavigator} />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ presentation: 'modal', cardStyle: { backgroundColor: 'transparent' } }}
      />
    </Stack.Navigator>
  );
}
