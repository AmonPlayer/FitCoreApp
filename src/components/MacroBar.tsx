import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

interface MacroBarProps {
  label: string;
  consumed: number;
  target: number;
  color: string;
}

export function MacroBar({ label, consumed, target, color }: MacroBarProps) {
  const animValue = useRef(new Animated.Value(0)).current;
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const widthPct = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.values}>
          <Text style={[styles.consumed, { color }]}>{Math.round(consumed)}</Text>
          <Text style={styles.separator}> / </Text>
          <Text style={styles.target}>{target}g</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthPct, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontFamily: Typography.sans,
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  values: {
    fontFamily: Typography.mono,
    fontSize: 12,
  },
  consumed: {
    fontFamily: Typography.mono,
    fontSize: 12,
  },
  separator: {
    color: Colors.dark.textTertiary,
    fontFamily: Typography.mono,
    fontSize: 12,
  },
  target: {
    color: Colors.dark.textTertiary,
    fontFamily: Typography.mono,
    fontSize: 12,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.cardBorder,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
