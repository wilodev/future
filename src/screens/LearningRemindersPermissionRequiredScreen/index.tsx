import React, { useEffect } from 'react';
import { AppState, AppStateStatus, Image, Linking, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '~/designSystem/Button';
import Text from '~/designSystem/Text';
import { useTheme } from '~/designSystem/themes';
import { RootScreenProps } from '~/navigators/RootNavigationStack';
import { hasNotificationPermission } from '~/utils/notifications';
import useLargeDevice from '~/utils/useLargeDevice';

export default function LearningRemindersPermissionRequiredScreen({
  navigation: { pop },
  route: {
    params: { depth },
  },
}: RootScreenProps<'LearningRemindersPermissionRequired'>) {
  const { isLargeDevice } = useLargeDevice();
  const { dark } = useTheme();

  const styles = createStyles(isLargeDevice);

  const image = dark
    ? require('~/assets/illustrations/fan-flames-woman-dark.png')
    : require('~/assets/illustrations/fan-flames-woman-light.png');

  useEffect(() => {
    let mounted = true;

    const appStateChangeHandler = async (newState: AppStateStatus) => {
      if (newState === 'active' && (await hasNotificationPermission()) && mounted) {
        pop();
      }
    };

    const { remove: removeAppStateChangeListener } = AppState.addEventListener(
      'change',
      appStateChangeHandler,
    );

    return () => {
      mounted = false;
      removeAppStateChangeListener();
    };
  }, [pop]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Image source={image} resizeMode="contain" style={styles.illustration} />
        <View>
          <Text weight="bold" size="xlarge" style={[styles.text, styles.title]}>
            Permission required
          </Text>
          <Text style={styles.text}>We need your permission to set up learning reminders.</Text>
          <Text style={styles.text}>
            Go to{' '}
            <Text
              accessibilityRole="button"
              accessibilityHint="Open settings"
              color="primary"
              onPress={Linking.openSettings}
              weight="semibold">
              Settings
            </Text>{' '}
            to allow notifications, or set up reminders later from the{' '}
            <Text weight="semibold">Account</Text> screen.
          </Text>
        </View>
      </View>
      <Button title="OK" onPress={() => pop(depth)} style={styles.button} />
    </SafeAreaView>
  );
}

const SPACING = 24;

const createStyles = (isLargeDevice: boolean) => {
  const verticalSpacing = SPACING * (isLargeDevice ? 3 : 1);

  return StyleSheet.create({
    container: {
      alignItems: isLargeDevice ? 'center' : 'stretch',
      flexGrow: 1,
      flexShrink: 1,
      justifyContent: 'center',
      paddingHorizontal: SPACING,
    },
    innerContainer: {
      flexGrow: isLargeDevice ? 0 : 1,
      flexShrink: 1,
      justifyContent: 'space-evenly',
      paddingVertical: verticalSpacing,
    },
    illustration: {
      alignSelf: 'center',
      flexShrink: 1,
      height: 218,
      width: 232,
    },
    title: {
      marginTop: verticalSpacing,
    },
    text: {
      marginTop: SPACING,
      textAlign: 'center',
      maxWidth: 400,
    },
    button: {
      marginBottom: SPACING,
      minWidth: 200,
    },
  });
};
