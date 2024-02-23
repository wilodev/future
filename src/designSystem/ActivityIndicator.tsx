import React from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

import { useTheme } from '~/designSystem/themes';

enum Size {
  medium = '20%',
  large = '40%',
}

export default function ActivityIndicator({ size = 'medium' }: { size?: keyof typeof Size }) {
  const { dark } = useTheme();

  const styles = createStyleSheet(Size[size]);

  const activityIndicatorAnimation = dark
    ? require('../assets/animations/activity-indicator-dark.json')
    : require('../assets/animations/activity-indicator-light.json');

  return (
    <View style={styles.container} testID="loading-indicator">
      <LottieView source={activityIndicatorAnimation} style={styles.animation} autoPlay loop />
    </View>
  );
}

const createStyleSheet = (size: Size) =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    animation: {
      width: size,
    },
  });
