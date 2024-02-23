import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { RouteProp } from '@react-navigation/core';
import { StyleSheet, View, Platform, SafeAreaView, Dimensions } from 'react-native';
import { HeaderBackButton, HeaderTitle } from '@react-navigation/elements';
import Animated from 'react-native-reanimated';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import ErrorBanner from '~/designSystem/ErrorBanner';
import FullScreenCarousel from '~/designSystem/FullScreenCarousel';
import { RootNavigationParamList, RootNavigationProp } from '~/navigators/RootNavigationStack';
import { Theme, useTheme } from '~/designSystem/themes';

import { useAllStepsQuery } from './AllStepsQuery.generated';
import LinearNavigationBar from './components/LinearNavigationBar';
import StepSlide from './components/StepSlide';
import { HEADER_HEIGHT, useAnimatedElements } from './HeaderFooterAnimation';
import ToDoButton from '~/components/ToDoButton';
import ActivitySlide from './components/ActivitySlide';
import { useAnalytics } from '~/utils/analytics';
import useFooterHeight from '~/utils/useFooterHeight';

import useStepVisitTracking from './useStepVisitTracking';
import { useMaxViewWidth } from '~/utils/useMaxWidth';

type CourseContentScreenProps = {
  navigation: RootNavigationProp<'CourseContent'>;
  route: RouteProp<RootNavigationParamList, 'CourseContent'>;
};

export type CourseContentStep = {
  id: string;
  itemType: 'Step';
  number: string;
  title: string;
  contentType: string;
  mobileSsoUrl: string;
};

export type CourseContentActivity = {
  id: string;
  itemType: 'Activity';
  shortDescription: string;
  title: string;
  stepCount: number;
  imageUrl?: string;
};

export type CourseContentItem = CourseContentStep | CourseContentActivity;

export type CourseContentItemKey = Pick<CourseContentItem, 'itemType' | 'id'>;

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

export default function CourseContentScreen({
  route: {
    params: {
      currentItem: { id, itemType },
      runId,
      animateOnIndexChange,
      enrolmentId,
    },
  },
  navigation,
}: CourseContentScreenProps) {
  const theme = useTheme();
  const [headerTitle, setHeaderTitle] = useState('');
  const windowWidth = useMaxViewWidth();
  const footerHeight = useFooterHeight();

  const styles = useMemo(
    () => createStyles(theme, windowWidth, footerHeight),
    [theme, windowWidth, footerHeight],
  );

  const { error, data } = useAllStepsQuery({
    variables: { enrolmentId },
    notifyOnNetworkStatusChange: true,
  });

  const { track } = useAnalytics();

  const items: CourseContentItem[] | undefined = useMemo(
    () =>
      data?.courseEnrolment?.run?.weeks.flatMap(week =>
        week.activities.flatMap(a => [
          {
            id: a.id,
            itemType: 'Activity',
            shortDescription: a.shortDescription,
            title: a.title,
            imageUrl: a.imageUrl ?? undefined,
            stepCount: a.steps.length,
          },
          ...a.steps.map<CourseContentStep>(s => ({ itemType: 'Step', ...s })),
        ]),
      ),
    [data],
  );

  const currentIndex = useMemo(
    () => items?.findIndex(item => item.id === id && item.itemType === itemType) ?? 0,
    [items, id, itemType],
  );

  const currentItem = items?.[currentIndex];

  useEffect(
    () =>
      setHeaderTitle(
        currentItem && currentItem.itemType === 'Step' ? `Step ${currentItem.number}` : 'Up next',
      ),
    [items, currentItem],
  );

  const navigateToIndex = useCallback(
    (targetIndex: number, source: string) => {
      if (!items) {
        return;
      }

      const targetItem = items[targetIndex];

      if (targetItem.itemType === 'Activity') {
        track('View activity', 'Course', {
          run_id: runId,
          activity_id: targetItem.id,
          source,
        });
      } else {
        track('View step', 'Course', {
          run_id: runId,
          step_id: targetItem.id,
          step_type: targetItem.contentType,
          source,
        });
      }

      navigation.setParams({
        currentItem: targetItem,
        animateOnIndexChange: true,
      });
    },
    [items, navigation, runId, track],
  );

  const onNavigateToOffset = useMemo(
    () => (offset: number, source: string) => {
      const newIndex = currentIndex + offset;

      return items && newIndex >= 0 && newIndex < items.length
        ? () => navigateToIndex(newIndex, source)
        : undefined;
    },
    [items, currentIndex, navigateToIndex],
  );

  const onNext = useMemo(() => onNavigateToOffset(1, 'LinearNav'), [onNavigateToOffset]);
  const onPrevious = useMemo(() => onNavigateToOffset(-1, 'LinearNav'), [onNavigateToOffset]);

  const {
    footerAnimatedStyle,
    headerAnimatedStyle,
    headerContentAnimatedStyle,
    animationValues,
    resetAnimationValues,
    videoAnimatedStyle,
  } = useAnimatedElements(footerHeight);
  useEffect(resetAnimationValues, [currentIndex, resetAnimationValues]);

  const navigateToWebView = useCallback(
    (step: CourseContentStep, source: string) => {
      track('Open in web view', 'Course', {
        source,
        run_id: runId,
        step_id: step.id,
        step_type: step.contentType,
      });
      navigation.navigate('WebView', {
        uri: step.mobileSsoUrl,
        title: headerTitle,
      });
    },
    [navigation, headerTitle, runId, track],
  );

  const renderCourseSlide = useCallback(
    (item: CourseContentItem) =>
      item.itemType === 'Step' ? (
        <StepSlide
          runId={runId}
          stepId={item.id}
          stepTitle={item.title}
          animationValues={animationValues}
          navigateToWebView={source => navigateToWebView(item, source)}
          currentIndex={currentIndex}
          videoAnimatedStyle={videoAnimatedStyle}
        />
      ) : (
        <ActivitySlide
          id={item.id}
          title={item.title}
          description={item.shortDescription}
          activityLength={item.stepCount}
          imageUrl={item.imageUrl}
          animationValues={animationValues}
        />
      ),
    [runId, animationValues, navigateToWebView, currentIndex, videoAnimatedStyle],
  );

  const renderItem = useCallback(
    ({ item }: { item: CourseContentItem }) => (
      <View style={styles.slide}>{renderCourseSlide(item)}</View>
    ),
    [renderCourseSlide, styles],
  );

  const openToDoList = () => {
    track('Open Todo List', 'Course', { run_id: runId });

    navigation.navigate('ToDoList', {
      runId,
      currentItem,
      enrolmentId,
    });
  };

  const onCarouselIndexChange = useCallback(
    (index: any) => navigateToIndex(index, 'Swipe'),
    [navigateToIndex],
  );

  useStepVisitTracking(currentItem);

  return (
    <SafeAreaView style={styles.container}>
      {error && <ErrorBanner />}
      {items && (
        <SafeAreaView>
          <Animated.View
            style={[styles.headerContainer, headerAnimatedStyle]}
            testID="step-screen-header">
            <Animated.View style={[styles.headerContent, headerContentAnimatedStyle]}>
              <View style={styles.headerBackButtonContainer}>
                <HeaderBackButton onPress={navigation.goBack} tintColor={theme.colors.text} />
              </View>
              <HeaderTitle style={styles.headerTitle}>{headerTitle}</HeaderTitle>
              <View style={styles.toDoButtonContainer}>
                <ToDoButton style={styles.toDoButton} onPress={openToDoList} />
              </View>
            </Animated.View>
          </Animated.View>
          <View style={styles.fullView}>
            <FullScreenCarousel
              data={items}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              index={currentIndex}
              onIndexChange={onCarouselIndexChange}
              testID="course-carousel"
              animateOnIndexChange={animateOnIndexChange}
            />
          </View>
        </SafeAreaView>
      )}
      <Animated.View style={[footerAnimatedStyle, styles.footerContainer]}>
        <LinearNavigationBar
          onNext={onNext}
          onPrevious={onPrevious}
          currentItem={currentItem}
          enrolmentId={enrolmentId}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const keyExtractor = ({ id }: { id: string }) => id;
const createStyles = ({ colors }: Theme, width: number, footerHeight: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    slide: {
      width,
      maxWidth: width,
      alignSelf: 'center',
    },
    footerContainer: {
      height: footerHeight,
      backgroundColor: colors.background,
      ...StyleSheet.absoluteFillObject,
      top: 'auto',
    },
    headerContainer: {
      ...StyleSheet.absoluteFillObject,
      height: HEADER_HEIGHT,
      backgroundColor: colors.background,
      alignItems: 'center',
      flexDirection: 'row',
      zIndex: 100,
      paddingTop: Platform.select({ ios: getStatusBarHeight() }),
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    toDoButton: {
      paddingRight: 20,
    },
    headerTitle: {
      flex: 4,
      textAlign: 'center',
    },
    headerBackButtonContainer: {
      flex: 1,
    },
    toDoButtonContainer: {
      flex: 1,
      alignItems: 'flex-end',
      paddingVertical: Platform.select({ ios: 8.5, android: 4 }),
      justifyContent: 'center',
    },
    fullView: {
      height: deviceHeight,
      width: deviceWidth,
    },
  });
