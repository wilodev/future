import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, View, Platform } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import IconButton from '~/designSystem/IconButton';
import { Theme, useTheme } from '~/designSystem/themes';
import useLargeDevice from '~/utils/useLargeDevice';

type ModalProps = {
  onClose: (source: string) => void;
  children: ReactNode;
  maxDialogWidth?: number;
};

export default function Modal({ onClose, children, maxDialogWidth }: ModalProps) {
  const theme = useTheme();
  const { isLargeDevice: isDialog } = useLargeDevice();
  const insets = useSafeAreaInsets();

  const styles = createStyleSheet(theme, insets, maxDialogWidth);

  return (
    <View style={isDialog ? styles.overlayDialog : styles.overlaySheet}>
      <Pressable
        accessible={false}
        importantForAccessibility="no"
        onPress={() => onClose('Overlay')}
        style={styles.backgroundScrim}
        testID="scrim"
      />
      <View style={[styles.container, isDialog ? styles.containerDialog : styles.containerSheet]}>
        <IconButton
          accessibilityLabel="Dismiss message"
          onPress={() => onClose('CloseButton')}
          source={require('~/assets/cross.png')}
          style={styles.closeButton}
          testID="close-button"
        />
        {children}
      </View>
    </View>
  );
}

const createStyleSheet = ({ colors }: Theme, insets: EdgeInsets, maxDialogWidth?: number) =>
  StyleSheet.create({
    backgroundScrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
    },
    overlaySheet: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    overlayDialog: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    container: {
      flexShrink: 1,
      backgroundColor: colors.backgroundAlt,
      justifyContent: 'flex-start',
    },
    containerSheet: {
      borderTopStartRadius: 20,
      borderTopEndRadius: 20,
      marginTop: insets.top + 20,
      paddingBottom: insets.bottom,
    },
    containerDialog: {
      borderRadius: Platform.select({ ios: 20 }),
      marginHorizontal: Math.max(insets.left, insets.right) + 20,
      marginVertical: Math.max(insets.top, insets.bottom) + 20,
      maxWidth: maxDialogWidth,
    },
    closeButton: {
      alignSelf: 'flex-end',
      margin: 15,
    },
  });
