import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';

interface MacroBarProps {
  label: string;
  consumed: number;
  target: number;
  color: string;
}

export function MacroBar({ label, consumed, target, color }: MacroBarProps) {
  const C = useColors();
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
        <Text style={[styles.label, { color: C.textSecondary }]}>{label}</Text>
        <Text style={styles.values}>
          <Text style={[styles.consumed, { color }]}>{Math.round(consumed)}</Text>
          <Text style={[styles.separator, { color: C.textTertiary }]}> / </Text>
          <Text style={[styles.target, { color: C.textTertiary }]}>{target}g</Text>
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: C.cardBorder }]}>
        <Animated.View style={[styles.fill, { width: widthPct, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Layout.spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontFamily: Typography.sans, fontSize: 13 },
  values: { fontFamily: Typography.mono, fontSize: 12 },
  consumed: { fontFamily: Typography.mono, fontSize: 12 },
  separator: { fontFamily: Typography.mono, fontSize: 12 },
  target: { fontFamily: Typography.mono, fontSize: 12 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
