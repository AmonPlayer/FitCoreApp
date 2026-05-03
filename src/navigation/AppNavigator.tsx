import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { HomeScreen } from '@/screens/HomeScreen';
import { NutritionScreen } from '@/screens/NutritionScreen';
import { TrainingScreen } from '@/screens/TrainingScreen';
import { ProgressScreen } from '@/screens/ProgressScreen';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

export type AppTabParamList = {
  Home: undefined;
  Nutrition: undefined;
  Train: undefined;
  Progress: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

const TAB_ICONS: Record<string, string> = {
  Home: '⌂',
  Nutrition: '◎',
  Train: '◈',
  Progress: '↗',
};

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.dark.bgSecondary,
          borderTopColor: Colors.dark.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.primaryGreen,
        tabBarInactiveTintColor: Colors.dark.textTertiary,
        tabBarLabelStyle: {
          fontFamily: Typography.sans,
          fontSize: 11,
        },
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 20, color }}>{TAB_ICONS[route.name]}</Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen name="Train" component={TrainingScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
    </Tab.Navigator>
  );
}
