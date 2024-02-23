import React from 'react';
import { DimensionValue, StyleSheet, View, ViewProps } from 'react-native';

import { asPercentForDisplay, asPercentForStyleProp } from '~/utils/numberFormatting';

import { Theme, useTheme } from './themes';

type ProgressBarProps = {
  value: number;
  maxValue?: number;
} & ViewProps;

export default function ProgressBar({
  value,
  maxValue = 1,
  style,
  ...otherProps
}: ProgressBarProps) {
  const ratio = value / maxValue;

  const styles = createStyleSheet(useTheme(), ratio);

  return (
    <View
      style={[styles.track, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{
        text: asPercentForDisplay(ratio, { maximumFractionDigits: 0 }),
      }}
      {...otherProps}>
      <View style={styles.progress} />
    </View>
  );
}

const createStyleSheet = ({ colors }: Theme, ratio: number) =>
  StyleSheet.create({
    track: {
      backgroundColor: colors.progressBarTrack,
      flexDirection: 'row',
      height: 1,
      width: '100%',
    },
    progress: {
      backgroundColor: colors.primary,
      width: asPercentForStyleProp(ratio) as DimensionValue,
    },
  });
