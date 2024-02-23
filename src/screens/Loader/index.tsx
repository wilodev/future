import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActivityIndicator from '~/designSystem/ActivityIndicator';
import { Theme, useTheme } from '~/designSystem/themes';

export default function NotEligibleScreen() {
  const theme = useTheme();
  const styles = createStyleSheet(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" />
    </SafeAreaView>
  );
}

const createStyleSheet = ({}: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
