import React, { useMemo, useEffect, useState, useLayoutEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, NativeSyntheticEvent, NativeScrollEvent, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NetworkStatus } from '@apollo/client';
import { useHeaderHeight } from '@react-navigation/elements';

import CoursesList, { CoursesListItem } from '~/components/CoursesList';
import ActivityIndicator from '~/designSystem/ActivityIndicator';
import ErrorBanner from '~/designSystem/ErrorBanner';
import Text from '~/designSystem/Text';
import IconButton from '~/designSystem/IconButton';
import { RootNavigationProp } from '~/navigators/RootNavigationStack';
import useRefreshingState from '~/utils/useRefreshingState';
import { useAnalytics } from '~/utils/analytics';
import { isIOS } from '~/utils/platform';
import { useSpacing, DefaultSpacing } from '~/designSystem/useSpacing';

import useShowLearningRemindersPrompt from './useShowLearningRemindersPrompt';
import { useYourCoursesQuery } from './YourCoursesQuery.generated';
import { useFocusEffect } from '@react-navigation/native';

export type YourCoursesScreenProps = {
  navigation: RootNavigationProp<'YourCourses'>;
};

type YourCoursesScreenItem = {
  runId: string;
  createdAt: string;
} & CoursesListItem;

export default function YourCoursesScreen({ navigation }: YourCoursesScreenProps) {
  const refContainer = useRef<FlatList>(null);
  const { navigate, setParams } = navigation;

  const scrollToTop = useCallback(() => {
    refContainer.current?.scrollToOffset({ animated: true, offset: 0 });
  }, [refContainer]);

  const styles = createStyleSheet(useHeaderHeight(), useSpacing());

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <IconButton
          accessibilityLabel="scroll to top"
          onPress={scrollToTop}
          source={require('~/assets/fl-logo.png')}
          style={styles.headerLeftButton}
          iconStyle={styles.headerLeftIcon}
        />
      ),
    });
  }, [navigation, scrollToTop, styles.headerLeftButton, styles.headerLeftIcon]);

  const { error, data, networkStatus, refetch } = useYourCoursesQuery({
    notifyOnNetworkStatusChange: true,
  });
  const { refreshing, refresh } = useRefreshingState(refetch);
  const { track } = useAnalytics();
  const [scrollOffsetY, setScrollOffsetY] = useState(0);
  const [subHeadingPositionY, setSubHeadingPositionY] = useState(0);

  useFocusEffect(
    useCallback(() => {
      track('View your courses', 'CourseList');
    }, [track]),
  );

  const listHeader = () => {
    if (!data?.currentUser?.firstName) {
      return null;
    }

    return (
      <View style={styles.header}>
        <Text size="xlarge" style={styles.greeting}>
          Ready to learn,{' '}
          <Text size="xlarge" weight="bold">
            {data.currentUser.firstName}?
          </Text>
        </Text>
        <Text
          size="large"
          weight="bold"
          onLayout={e => setSubHeadingPositionY(e.nativeEvent.layout.y)}>
          Courses
        </Text>
      </View>
    );
  };

  const sortedItems = useMemo(
    () =>
      data?.currentUser?.activeCourseEnrolments
        ?.map<YourCoursesScreenItem>(enrolment => ({
          id: enrolment.id,
          createdAt: enrolment.createdAt,
          imageUrl: enrolment.run.imageUrl,
          organisationTitle: enrolment.run.course.organisation.title,
          runTitle: enrolment.run.fullTitle,
          runId: enrolment.run.id,
        }))
        ?.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data],
  );

  const navigateToCourse = ({ runId, id }: YourCoursesScreenItem) => {
    track('View course', 'Course', { run_id: runId });
    navigate('CourseCover', { runId, enrolmentId: id });
  };

  const scrollOffset = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setScrollOffsetY(e.nativeEvent.contentOffset.y);

  useEffect(() => {
    setParams({ headerTitleVisible: scrollOffsetY > subHeadingPositionY });
  }, [setParams, scrollOffsetY, subHeadingPositionY]);

  useShowLearningRemindersPrompt(
    useCallback(() => navigate('LearningRemindersPrompt'), [navigate]),
  );
  return (
    <SafeAreaView style={styles.container}>
      {error && <ErrorBanner style={styles.errorBanner} />}
      {networkStatus === NetworkStatus.loading && <ActivityIndicator />}
      {/* {isChangeOrientation && <ActivityIndicator />} */}
      {sortedItems && (
        <CoursesList
          ref={refContainer}
          data={sortedItems}
          ListHeaderComponent={listHeader}
          navigateToCourse={navigateToCourse}
          refreshing={refreshing}
          onRefresh={refresh}
          testID="courses-list"
          scrollOffset={scrollOffset}
        />
      )}
    </SafeAreaView>
  );
}

const createStyleSheet = (headerHeight: number, { horizontalScreenPadding }: DefaultSpacing) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexWrap: 'wrap',
      width: '100%',
      justifyContent: 'space-between',
      justifyItems: 'space-between',
    },
    greeting: {
      marginBottom: 24,
    },
    header: {
      marginTop: isIOS() ? headerHeight : 24,
      marginBottom: 24,
    },
    errorBanner: {
      marginTop: 8,
    },
    headerLeftButton: {
      marginLeft: horizontalScreenPadding,
    },
    headerLeftIcon: {
      width: 25,
      height: 25,
    },
  });
