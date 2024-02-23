import React from 'react';
import { Animated, StyleSheet } from 'react-native';

import { FontSize, FontWeight } from '~/designSystem/typography';
import { Theme, useTheme } from '~/designSystem/themes';
import useFadeOutAnimation from '~/utils/useFadeOutAnimation';

export default function HeaderTitle({ headerTitleVisible }: { headerTitleVisible?: boolean }) {
  const { fadeAnim } = useFadeOutAnimation({ isVisible: headerTitleVisible });

  const styles = createStyleSheet(useTheme());

  return <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>Courses</Animated.Text>;
}

const createStyleSheet = ({ colors }: Theme) =>
  StyleSheet.create({
    text: {
      fontWeight: FontWeight.medium,
      fontSize: FontSize.medium,
      color: colors.text,
    },
  });
