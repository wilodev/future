import React, { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { NetworkStatus } from '@apollo/client';

import ToDoList, { ToDoListStep, ToDoListItem } from '~/screens/ToDoListScreen/components/ToDoList';
import ActivityIndicator from '~/designSystem/ActivityIndicator';
import ErrorBanner from '~/designSystem/ErrorBanner';
import ResponsiveModal from '~/designSystem/ResponsiveModal';
import { RootScreenProps } from '~/navigators/RootNavigationStack';
import useRefreshingState from '~/utils/useRefreshingState';
import { useAnalytics } from '~/utils/analytics';

import { useStepsQuery } from './StepsQuery.generated';

export type { ToDoListItemKey } from '~/screens/ToDoListScreen/components/ToDoList';

export default function ToDoListScreen({
  route: {
    params: { runId, currentItem, enrolmentId },
  },
  navigation: { goBack, navigate },
}: RootScreenProps<'ToDoList'>) {
  const { data, error, networkStatus, refetch } = useStepsQuery({ variables: { runId } });
  const { refreshing, refresh } = useRefreshingState(refetch);
  const { track } = useAnalytics();

  const sections = useMemo(
    () =>
      data?.run?.weeks.map(week => ({
        id: week.id,
        weekNumber: week.number,
        weekTitle: week.title || '',
        data: week.activities.flatMap<ToDoListItem>(a => [
          {
            id: a.id,
            itemType: 'Activity',
            shortDescription: a.shortDescription,
            title: a.title,
          },
          ...a.steps.map<ToDoListStep>(s => {
            return { itemType: 'Step', ...s };
          }),
        ]),
      })),
    [data],
  );

  const navigateToCourseContent = (item: ToDoListItem) => {
    const { id, itemType } = item;
    if (itemType === 'Activity') {
      track('View activity', 'Course', {
        source: 'ToDoList',
        run_id: runId,
        activity_id: id,
        enrolmentId,
      });
    } else {
      track('View step', 'Course', {
        source: 'ToDoList',
        run_id: runId,
        step_id: id,
        step_type: item.contentType,
        enrolmentId,
      });
    }

    navigate('CourseContent', {
      currentItem: { id, itemType },
      runId,
      animateOnIndexChange: false,
      enrolmentId,
    });
  };

  return (
    <ResponsiveModal onClose={goBack} nameForAccessibility="To do list">
      {({ isDialog }) => (
        <>
          {error && <ErrorBanner />}
          {sections && (
            <ToDoList
              currentItem={currentItem}
              sections={sections}
              initialNumToRender={15}
              onItemPress={navigateToCourseContent}
              refreshing={refreshing}
              onRefresh={refresh}
              testID="to-do-list"
              style={isDialog && Platform.select({ ios: styles.roundedDialog })}
              enrolmentId={enrolmentId}
            />
          )}
          {networkStatus === NetworkStatus.loading && <ActivityIndicator />}
        </>
      )}
    </ResponsiveModal>
  );
}

const styles = StyleSheet.create({
  roundedDialog: {
    borderBottomStartRadius: 20,
    borderBottomEndRadius: 20,
  },
});
