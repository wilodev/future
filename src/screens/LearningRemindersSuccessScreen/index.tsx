import React, { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '~/designSystem/Button';
import Text from '~/designSystem/Text';
import { useTheme } from '~/designSystem/themes';
import { RootScreenProps } from '~/navigators/RootNavigationStack';
import { formatShortTime } from '~/utils/dateFormatting';
import { selectedDays } from '~/utils/notifications';
import { capitalize, joinAsSentence } from '~/utils/text';
import useLargeDevice from '~/utils/useLargeDevice';

export default function LearningRemindersSuccessScreen({
  navigation: { pop },
  route: {
    params: { depth, remindersData },
  },
}: RootScreenProps<'LearningRemindersSuccess'>) {
  const { isLargeDevice } = useLargeDevice();

  const styles = createStyles(isLargeDevice);

  const { dark } = useTheme();

  const image = dark
    ? require('~/assets/illustrations/ufo-photocopier-woman-dark.png')
    : require('~/assets/illustrations/ufo-photocopier-woman-light.png');

  const days = useMemo(
    () => joinAsSentence(selectedDays(remindersData).map(capitalize)),
    [remindersData],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Image source={image} resizeMode="contain" style={styles.illustration} />
        <View>
          <Text weight="bold" size="xlarge" style={[styles.text, styles.title]}>
            All done!
          </Text>
          <Text style={styles.text}>
            You’re all set up to receive reminders on <Text weight="semibold">{days}</Text> at{' '}
            <Text weight="semibold">{formatShortTime(new Date(remindersData.time!))}</Text>.
          </Text>
          <Text style={styles.text}>
            You can pause or change your reminders on the <Text weight="semibold">Account</Text>{' '}
            screen.
          </Text>
        </View>
      </View>
      <Button title="Finish" onPress={() => pop(depth)} style={styles.button} />
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
      width: 194,
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
