import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';

import { Theme, useTheme } from '~/designSystem/themes';

import Text from './Text';

export type ErrorBannerProps = {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

export default function ErrorBanner({
  children = 'Something went wrong',
  style,
}: ErrorBannerProps) {
  const styles = createStyleSheet(useTheme());

  return <Text style={[styles.errorBanner, style]}>{children}</Text>;
}

const createStyleSheet = ({ colors }: Theme) =>
  StyleSheet.create({
    errorBanner: {
      backgroundColor: colors.card,
      padding: 16,
    },
  });
