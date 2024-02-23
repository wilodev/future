import { View, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import Text from '~/designSystem/Text';
import { Theme, useTheme } from '~/designSystem/themes';

export const Footer = (props: any) => {
  const theme = useTheme();
  const styles = createStyleSheet(theme);
  return (
    <View style={styles.container} testID="social-container">
      <Text
        color="text"
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        style={styles.text}>
        You can sign in without Google or Facebook
      </Text>
      <Pressable onPress={props.onPressFooter}>
        <Text style={styles.text2}>Show me how</Text>
      </Pressable>
    </View>
  );
};

const createStyleSheet = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      flex: 0.2,
      justifyContent: 'center',
      alignItems: 'center',
      gap: -4,
    },
    text: {
      fontSize: 16,
      lineHeight: 20,
      textAlign: 'center',
      width: 320,
    },
    text2: {
      fontSize: 16,
      lineHeight: 56,
      textAlign: 'center',
      width: 300,
      textDecorationLine: 'underline',
      textDecorationColor: colors.primary,
      color: colors.primary,
    },
  });
