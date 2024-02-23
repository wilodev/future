import React from 'react';
import {
  StyleSheet,
  Text as ReactNativeText,
  TextProps as ReactNativeTextProps,
} from 'react-native';

import { useTheme, ColorName } from '~/designSystem/themes';
import { FontSize, FontWeight } from '~/designSystem/typography';

export type TextProps = ReactNativeTextProps & {
  children: React.ReactNode;
  color?: ColorName;
  size?: keyof typeof FontSize;
  weight?: keyof typeof FontWeight;
  underline?: boolean;
  lineHeight?: number;
};

export default function Text({
  children,
  color,
  size = 'medium',
  weight = 'regular',
  underline = false,
  style,
  ...props
}: TextProps) {
  const { colors } = useTheme();
  const defaultColor = colors.text;
  const customColor = color && colors[color];
  const styles = StyleSheet.create({
    base: {
      color: customColor ?? defaultColor,
      fontSize: FontSize[size],
      fontWeight: FontWeight[weight],
      textDecorationLine: underline ? 'underline' : 'none',
      lineHeight: props.lineHeight && props.lineHeight,
    },
  });

  return (
    <ReactNativeText style={[styles.base, style]} {...props}>
      {children}
    </ReactNativeText>
  );
}
