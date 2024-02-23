import { useCallback, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { LaunchArguments } from 'react-native-launch-arguments';

import { useAnalytics } from '~/utils/analytics';
import { AppLaunchInfoContext } from '~/utils/AppLaunchInfoContext';
import { hasBeenShown, PromptKey } from '~/utils/promotionalPrompts';
import { getRemindersSettings } from '~/utils/notifications';

export default function useShowLearningRemindersPrompt(showFn: () => void) {
  const { track } = useAnalytics();
  const { getAppLaunchInfo } = useContext(AppLaunchInfoContext);

  useFocusEffect(
    useCallback(() => {
      let isFocused = true;
      const tenMinutesAgo = Date.now() - 10 * 60000;

      !LaunchArguments.value().suppressRemindersPrompt &&
        (async () =>
          !(await hasBeenShown(PromptKey.LearningReminders)) &&
          !(await getRemindersSettings()).useReminders &&
          (await getAppLaunchInfo()).firstLaunchTime <= tenMinutesAgo &&
          setTimeout(() => {
            if (isFocused) {
              showFn();
              track('Show reminders prompt', 'Reminders');
            }
          }, 1500))();

      return () => {
        isFocused = false;
      };
    }, [getAppLaunchInfo, showFn, track]),
  );
}
