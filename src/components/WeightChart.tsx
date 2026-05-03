import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { WeightLog } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';
import { format } from 'date-fns';

interface WeightChartProps {
  logs: WeightLog[];
  targetWeight?: number;
}

const CHART_WIDTH = Dimensions.get('window').width - 64;
const CHART_HEIGHT = 150;
const PAD_LEFT = 40;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;

function toPoints(data: { x: number; y: number }[]): string {
  return data.map((d) => `${d.x},${d.y}`).join(' ');
}

export const WeightChart = React.memo(function WeightChart({ logs, targetWeight }: WeightChartProps) {
  const { points, dots, targetY, xLabels, yLabels, minY, maxY } = useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length === 0) return { points: '', dots: [], targetY: null, xLabels: [], yLabels: [], minY: 0, maxY: 0 };

    const weights = sorted.map((l) => l.weightKg);
    const allWeights = targetWeight ? [...weights, targetWeight] : weights;
    const minW = Math.floor(Math.min(...allWeights) - 1);
    const maxW = Math.ceil(Math.max(...allWeights) + 1);

    const chartW = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
    const chartH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

    const xScale = (i: number) => PAD_LEFT + (i / (sorted.length - 1 || 1)) * chartW;
    const yScale = (w: number) => PAD_TOP + chartH - ((w - minW) / (maxW - minW || 1)) * chartH;

    const data = sorted.map((l, i) => ({ x: xScale(i), y: yScale(l.weightKg) }));

    const tgtY = targetWeight !== undefined ? yScale(targetWeight) : null;

    // X-axis labels: first, middle, last
    const labelIndices = [0, Math.floor((sorted.length - 1) / 2), sorted.length - 1].filter((v, i, a) => a.indexOf(v) === i);
    const xlabels = labelIndices.map((i) => ({
      x: xScale(i),
      label: format(new Date(sorted[i].date), 'MMM d'),
    }));

    // Y-axis labels: 3 evenly spaced
    const ylabels = [minW, Math.round((minW + maxW) / 2), maxW].map((w) => ({
      y: yScale(w),
      label: String(w),
    }));

    return {
      points: toPoints(data),
      dots: data,
      targetY: tgtY,
      xLabels: xlabels,
      yLabels: ylabels,
      minY: minW,
      maxY: maxW,
    };
  }, [logs, targetWeight]);

  if (logs.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No weight logs yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {/* Horizontal grid lines */}
        {yLabels.map((yl) => (
          <Line key={yl.label} x1={PAD_LEFT} y1={yl.y} x2={CHART_WIDTH - PAD_RIGHT} y2={yl.y} stroke={Colors.dark.border} strokeWidth={0.5} />
        ))}

        {/* Target weight dashed line */}
        {targetY !== null && (
          <Line
            x1={PAD_LEFT}
            y1={targetY}
            x2={CHART_WIDTH - PAD_RIGHT}
            y2={targetY}
            stroke={Colors.primaryGreen}
            strokeWidth={1}
            strokeDasharray="4,4"
            opacity={0.5}
          />
        )}

        {/* Weight line */}
        {dots.length > 1 && (
          <Polyline
            points={points}
            fill="none"
            stroke={Colors.primaryGreen}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Dots */}
        {dots.map((d, i) => (
          <Circle key={i} cx={d.x} cy={d.y} r={3} fill={Colors.primaryGreen} />
        ))}

        {/* X-axis labels */}
        {xLabels.map((xl) => (
          <SvgText
            key={xl.label}
            x={xl.x}
            y={CHART_HEIGHT - 4}
            textAnchor="middle"
            fill={Colors.dark.textTertiary}
            fontSize={9}
            fontFamily={Typography.mono}
          >
            {xl.label}
          </SvgText>
        ))}

        {/* Y-axis labels */}
        {yLabels.map((yl) => (
          <SvgText
            key={yl.label}
            x={PAD_LEFT - 4}
            y={yl.y + 4}
            textAnchor="end"
            fill={Colors.dark.textTertiary}
            fontSize={9}
            fontFamily={Typography.mono}
          >
            {yl.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    padding: Layout.spacing.md,
  },
  empty: {
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    padding: Layout.cardPadding,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  emptyText: {
    fontFamily: Typography.sans,
    fontSize: 14,
    color: Colors.dark.textTertiary,
  },
});
