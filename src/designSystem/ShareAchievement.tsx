import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackProps,
  View,
} from 'react-native';

import { Theme, useTheme } from '~/designSystem/themes';

import Text from './Text';

type ButtonProps = TouchableWithoutFeedbackProps & {
  onPress: () => void;
};

export default function ShareAchievement({ ...pressableProps }: ButtonProps) {
  const styles = createStyleSheet(useTheme());

  return (
    <TouchableWithoutFeedback accessibilityRole="button" {...pressableProps}>
      <View style={styles.button}>
        <Image source={require('~/assets/story-slides/icons/arrow-top.png')} style={styles.icon} />
        <Text style={styles.text}>Share achievement</Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const createStyleSheet = ({ colors }: Theme) =>
  StyleSheet.create({
    button: {
      minHeight: 56,
      maxWidth: 358,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5,
      padding: 16,
      backgroundColor: 'transparent',
      display: 'flex',
      flexDirection: 'row',
    },
    icon: {
      tintColor: colors.textColorStories,
    },
    text: {
      textAlign: 'center',
      color: colors.textColorStories,
      marginLeft: 16,
      fontWeight: 'bold',
      fontSize: 17,
      lineHeight: 34,
    },
  });
