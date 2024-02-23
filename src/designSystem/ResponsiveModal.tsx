import React, { ReactNode } from 'react';
import { ScaledSize } from 'react-native';
import { Pressable, StyleSheet, useWindowDimensions, View, Platform } from 'react-native';

import { Theme, useTheme } from '~/designSystem/themes';
import useLargeDevice from '~/utils/useLargeDevice';

import IconButton from './IconButton';

type ResponsiveModalProps = {
  onClose: () => void;
  nameForAccessibility: string;
  children: ReactNode | ((props: { isDialog: boolean }) => ReactNode);
};

export default function ResponsiveModal({
  onClose,
  nameForAccessibility,
  children,
}: ResponsiveModalProps) {
  const theme = useTheme();
  const { isLargeDevice: isDialog } = useLargeDevice();
  const window = useWindowDimensions();

  const styles = createStyleSheet(theme, window);

  return (
    <View style={[styles.fullscreen, isDialog && styles.overlayDialog]}>
      <Pressable
        accessibilityLabel={`Close ${nameForAccessibility}`}
        accessibilityRole="button"
        onPress={onClose}
        style={styles.backgroundScrim}
        testID="scrim"
      />
      <View style={[styles.container, isDialog ? styles.containerDialog : styles.fullscreen]}>
        {isDialog && (
          <IconButton
            accessibilityLabel={`Close ${nameForAccessibility}`}
            onPress={onClose}
            source={require('~/assets/cross.png')}
            style={styles.closeButton}
            testID="close-button"
          />
        )}
        {typeof children === 'function' ? children({ isDialog }) : children}
      </View>
    </View>
  );
}

const createStyleSheet = ({ colors }: Theme, { width, height }: ScaledSize) =>
  StyleSheet.create({
    backgroundScrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
    },
    fullscreen: {
      flex: 1,
    },
    overlayDialog: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    container: {
      backgroundColor: colors.backgroundAlt,
      justifyContent: 'flex-start',
    },
    containerDialog: {
      borderRadius: Platform.select({ ios: 20 }),
      height: height / 2,
      maxHeight: height / 2,
      width: Math.min(500, width - 100),
    },
    closeButton: {
      alignSelf: 'flex-start',
      margin: 15,
    },
    handle: {
      alignSelf: 'center',
      backgroundColor: colors.bar,
      borderRadius: 5,
      height: 5,
      marginVertical: 23.5,
      width: 36,
    },
  });
