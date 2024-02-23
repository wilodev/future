import React from 'react';
import { DimensionValue, StyleSheet, View, ViewProps } from 'react-native';
import { LinearGradient, Rect, Stop, Svg } from 'react-native-svg';

type LinearGradientProps = ViewProps & {
  startColor: string;
  endColor: string;
  width?: DimensionValue | undefined;
  height?: DimensionValue | undefined;
  rounded?: number;
};

export default function BackgroundLinearGradient({
  startColor,
  endColor,
  width = '100%',
  height = '100%',
  rounded = 10,
  children,
  ...props
}: LinearGradientProps) {
  const styles = createStyleSheet(width, height, rounded);
  return (
    <View style={styles.container} {...props}>
      <View>
        <Svg width="100%" height="100%">
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={startColor} />
            <Stop offset="100%" stopColor={endColor} />
          </LinearGradient>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#gradient)" rx={rounded} />
        </Svg>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const createStyleSheet = (width: DimensionValue, height: DimensionValue, rounded: number) =>
  StyleSheet.create({
    container: {
      width,
      height,
      borderRadius: rounded,
    },
    content: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
    },
  });
