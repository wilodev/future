import React from 'react';
import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { Theme, useTheme } from '~/designSystem/themes';

import Text from './Text';

type ButtonType = 'primary' | 'secondary' | 'tertiary' | 'story';

type ButtonProps = PressableProps & {
  title: string;
  type?: ButtonType;
};

export default function Button({ type = 'primary', title, style, ...pressableProps }: ButtonProps) {
  const styles = createStyleSheet(useTheme());

  const calculateButtonStyle = (state: PressableStateCallbackType): StyleProp<ViewStyle> => [
    { opacity: state.pressed ? 0.6 : 1 },
    styles.button,
    styles[type],
    typeof style === 'function' ? style(state) : style,
  ];

  function calculateTextColor() {
    if (type === 'primary') {
      return 'primaryButtonText';
    } else if (type === 'secondary') {
      return 'secondaryButtonText';
    } else if (type === 'story') {
      return 'white';
    }
    return 'tertiaryButtonText';
  }

  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={styles.ripple}
      style={calculateButtonStyle}
      {...pressableProps}>
      <Text
        weight={type === 'story' ? 'bold' : 'semibold'}
        color={calculateTextColor()}
        style={styles.text}>
        {title}
      </Text>
    </Pressable>
  );
}

const createStyleSheet = ({ colors }: Theme) =>
  StyleSheet.create({
    button: {
      minHeight: 56,
      justifyContent: 'center',
      borderRadius: 5,
      padding: 16,
    },
    text: {
      textAlign: 'center',
    },
    primary: {
      backgroundColor: colors.primaryButtonBackground,
    },
    secondary: {
      backgroundColor: colors.secondaryButtonBackground,
      borderColor: colors.primary,
      borderRadius: 15,
      borderWidth: 2,
    },
    tertiary: {
      backgroundColor: colors.tertiaryButtonBackground,
    },
    ripple: {
      color: colors.lightGrey,
    },
  });
