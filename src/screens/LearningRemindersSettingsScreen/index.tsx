import React, { useCallback, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import ErrorBanner from '~/designSystem/ErrorBanner';
import { RootScreenProps } from '~/navigators/RootNavigationStack';
import { getRemindersSettings, hasNotificationPermission } from '~/utils/notifications';
import useAsyncFetch from '~/utils/useAsyncFetch';
import { LARGE_DEVICE_CONTAINER_WIDTH } from '~/utils/useLargeDevice';
import { Spacing } from '~/designSystem/useSpacing';

import RemindersForm from './components/RemindersForm';

export default function LearningRemindersSettingsScreen({
  navigation: { navigate, setParams },
  route: {
    params: { depth = 1 },
  },
}: RootScreenProps<'LearningRemindersSettings'>) {
  const { data: initialSettings, error } = useAsyncFetch(getRemindersSettings);
  const { data: hasPermission } = useAsyncFetch(hasNotificationPermission);

  useEffect(() => {
    hasPermission === false &&
      navigate('LearningRemindersPermissionRequired', { depth: depth + 1 });
  }, [depth, hasPermission, navigate]);

  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToEnd = useCallback(() => {
    scrollViewRef.current?.scrollToEnd();
  }, [scrollViewRef]);

  return (
    <>
      {error && <ErrorBanner />}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        testID="learning-reminders-form">
        {initialSettings && (
          <RemindersForm
            initialFormData={initialSettings}
            onFormValuesUpdate={setParams}
            scrollToEnd={scrollToEnd}
          />
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    padding: Spacing.small,
    maxWidth: LARGE_DEVICE_CONTAINER_WIDTH,
    width: '100%',
  },
});
