import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

interface CalorieRingProps {
  consumed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

export const CalorieRing = React.memo(function CalorieRing({
  consumed,
  target,
  size = 200,
  strokeWidth = 14,
}: CalorieRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  const strokeDashoffset = circumference * (1 - pct);
  const center = size / 2;

  const overTarget = consumed > target;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.dark.cardBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={overTarget ? Colors.redAccent : Colors.primaryGreen}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={styles.consumed}>{Math.round(consumed)}</Text>
        <Text style={styles.unit}>kcal</Text>
        <Text style={styles.target}>/ {target}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  consumed: {
    fontFamily: Typography.mono,
    fontSize: 32,
    color: Colors.dark.textPrimary,
    lineHeight: 38,
  },
  unit: {
    fontFamily: Typography.sans,
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  target: {
    fontFamily: Typography.mono,
    fontSize: 12,
    color: Colors.dark.textTertiary,
    marginTop: 2,
  },
});
