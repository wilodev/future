import React, { useEffect, useState } from 'react';
import { Pressable, PressableProps, StyleSheet, View } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';

import Text from '~/designSystem/Text';
import IconButton from '~/designSystem/IconButton';
import { RootScreenProps } from '~/navigators/RootNavigationStack';
import { useAnalytics } from '~/utils/analytics';
import { isIOS } from '~/utils/platform';
import {
  cancelPendingNotifications,
  saveRemindersSettings,
  requestNotificationPermission,
  scheduleNotifications,
  selectedDays,
} from '~/utils/notifications';
import { format24HourTime } from '~/utils/dateFormatting';
import useToast from '~/utils/useToast';
import { Spacing } from '~/designSystem/useSpacing';

export default function HeaderDoneButton({
  navigation: { navigate, pop },
  route: {
    params: { remindersData, depth = 1 },
  },
}: RootScreenProps<'LearningRemindersSettings'>) {
  const [remindersAlreadyEnabled, setRemindersAlreadyEnabled] = useState<boolean>();

  useEffect(() => {
    typeof remindersAlreadyEnabled === 'undefined' &&
      setRemindersAlreadyEnabled(remindersData?.useReminders);
  }, [remindersData, remindersAlreadyEnabled]);

  const { track } = useAnalytics();
  const { showToast } = useToast();

  const disabled =
    !remindersData || (remindersData.useReminders && selectedDays(remindersData).length === 0);

  const pressableProps: Partial<PressableProps> = {
    disabled,
    onPress: async () => {
      if (disabled) {
        return;
      }

      try {
        if (!(await requestNotificationPermission())) {
          navigate('LearningRemindersPermissionRequired', { depth: depth + 1 });

          track('Deny notification permission', 'Reminders');
          return;
        }

        await saveRemindersSettings(remindersData);
        await cancelPendingNotifications();

        const { useReminders, time } = remindersData;

        track('Save reminders settings', 'Reminders', {
          enabled: useReminders,
          days: selectedDays(remindersData),
          reminder_time: format24HourTime(new Date(time!)),
        });

        if (useReminders) {
          await scheduleNotifications(remindersData);

          if (remindersAlreadyEnabled) {
            showToast('Reminders updated');
          } else {
            navigate('LearningRemindersSuccess', { remindersData, depth: depth + 1 });
            return;
          }
        } else if (remindersAlreadyEnabled) {
          showToast('Reminders cancelled');
        }

        pop(depth);
      } catch (error) {
        showToast('Something went wrong');
        console.error(error);
        error instanceof Error && crashlytics().recordError(error);
      }
    },
  };

  return (
    <View style={styles.container}>
      {isIOS() ? (
        <Pressable accessibilityRole="button" testID="done-text-button" {...pressableProps}>
          <Text color={disabled ? 'inactive' : 'primary'} weight="semibold">
            Done
          </Text>
        </Pressable>
      ) : (
        <IconButton
          accessibilityLabel="Done"
          isPrimary
          source={require('~/assets/tick.png')}
          testID="done-icon-button"
          {...pressableProps}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: Spacing.small,
  },
});
