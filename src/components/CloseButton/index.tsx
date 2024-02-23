import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Image, Platform, Pressable, StyleSheet } from 'react-native';

import { Theme, useTheme } from '~/designSystem/themes';
import { RootNavigationParamList } from '~/navigators/RootNavigationStack';

type CloseButtonProps = {
  navigation: StackNavigationProp<RootNavigationParamList>;
};

/**
 * CloseButton component.
 *
 * @param {Object} navigation - The navigation object.
 * @returns {JSX.Element} - The CloseButton component.
 */
export default function CloseButton({ navigation }: CloseButtonProps): JSX.Element {
  const theme = useTheme();
  const styles = createStyleSheet(theme);

  /**
   * Handles the onPress event of the CloseButton component.
   */
  const handlePress = (): void => {
    navigation.goBack();
  };
  return (
    <Pressable onPress={handlePress} testID="close-button">
      <Image style={styles.closeButton} source={require('~/assets/cross.png')} />
    </Pressable>
  );
}

const createStyleSheet = ({ colors }: Theme) =>
  StyleSheet.create({
    closeButton: {
      tintColor: colors.text,
      marginRight: Platform.select({ ios: 15 }),
    },
  });
