import React, { useCallback, useLayoutEffect } from 'react';
import { StyleSheet, SafeAreaView, Pressable, View } from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/core';

import { RootNavigationParamList, RootNavigationProp } from '~/navigators/RootNavigationStack';
import ActivityIndicator from '~/designSystem/ActivityIndicator';
import ErrorBanner from '~/designSystem/ErrorBanner';
import ProgressBar from '~/designSystem/ProgressBar';
import Text from '~/designSystem/Text';
import { Theme, useTheme } from '~/designSystem/themes';
import Icon from '~/designSystem/Icon';
import { formatLongDate, formatShortTime } from '~/utils/dateFormatting';
import { asPercentForDisplay } from '~/utils/numberFormatting';
import useLargeDevice, { LARGE_DEVICE_CONTAINER_WIDTH } from '~/utils/useLargeDevice';

import { useCourseEnrolmentQuery } from './CourseEnrolmentQuery.generated';
import ImageAltText from '~/components/ImageAltText';

type CourseCoverScreenProps = {
  route: RouteProp<RootNavigationParamList, 'CourseCover'>;
  navigation: RootNavigationProp<'CourseCover'>;
};

type Step = {
  id: string;
  number: string;
  title: string;
  contentType: string;
  shortStepTypeLabel: string;
};

export default function CourseCoverScreen({
  route: {
    params: { runId, enrolmentId },
  },
  navigation: { setOptions, navigate },
}: CourseCoverScreenProps) {
  const { error, data, loading, refetch } = useCourseEnrolmentQuery({
    variables: { enrolmentId },
  });

  const { isLargeDevice } = useLargeDevice();
  const styles = createStyleSheet(useTheme(), isLargeDevice);

  const run = data?.courseEnrolment?.run;
  const canParticipate = run?.canParticipate;
  const lastVisitedStep = data?.courseEnrolment?.lastStepVisit?.step;
  const firstOrLastStep = lastVisitedStep || run?.firstStep;
  const accessIsExpired = data?.courseEnrolment?.accessIsExpired;
  const accessExpiryTime = data?.courseEnrolment?.accessExpiryTime;

  const isStarted = run?.isStarted;
  const startTime = run?.startTime ? new Date(run.startTime) : undefined;

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useLayoutEffect(() => {
    setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <View
          style={canParticipate ? styles.showHeaderRightContainer : styles.hideHeaderRightContainer}
        />
      ),
    });
  }, [
    canParticipate,
    setOptions,
    styles.showHeaderRightContainer,
    styles.hideHeaderRightContainer,
  ]);

  const navigateToCourseContent = (id: string) => {
    navigate('CourseContent', {
      currentItem: { id, itemType: 'Step' },
      runId,
      animateOnIndexChange: false,
      enrolmentId,
    });
  };

  const renderProgress = (stepsCompletedRatio: number) => {
    const progressPercentage = asPercentForDisplay(stepsCompletedRatio, {
      maximumFractionDigits: 0,
    });

    return (
      <>
        <Text color="textGrey" size="xsmall" accessibilityLabel={`${progressPercentage} complete`}>
          {progressPercentage}
        </Text>
        <ProgressBar
          value={stepsCompletedRatio}
          style={styles.progressBar}
          importantForAccessibility="no-hide-descendants"
        />
      </>
    );
  };

  const renderFirstOrLastStep = ({ number, title, id, shortStepTypeLabel }: Step) => {
    return (
      <Pressable
        style={styles.stepCard}
        onPress={() => navigateToCourseContent(id)}
        accessibilityRole="button">
        <View style={styles.stepCardContent}>
          <Text weight="medium" color="primary">
            {lastVisitedStep ? 'Last step visited' : 'First step visited'}
          </Text>
          <View style={styles.stepCardItems}>
            <Text weight="medium" size="small" accessibilityLabel={`Step number ${number}.`}>
              {number}
            </Text>
            <View
              style={styles.stepTitleContainer}
              accessibilityLabel={`${title}. ${shortStepTypeLabel}`}>
              <Text weight="medium" size="small">
                {title}
              </Text>
              <Text size="xsmall" style={styles.stepType}>
                {shortStepTypeLabel}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.iconContainer}>
          <Icon
            width={22}
            height={22}
            source={require('~/assets/arrow-right.png')}
            style={styles.arrowIcon}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {error && <ErrorBanner />}
      {accessIsExpired && accessExpiryTime && (
        <ErrorBanner
          children={`Your access to this course expired on ${formatLongDate(
            new Date(accessExpiryTime),
          )}`}
        />
      )}
      {run ? (
        <>
          <ImageAltText
            url={run.imageUrl}
            style={styles.image}
            alt={run?.imageAlt || 'Course image'}
          />
          <View style={styles.innerContainer}>
            <Text style={styles.subHeading} color="textGrey">
              {run.organisation.title}
            </Text>
            <Text weight="bold" size="xlarge" testID="course-title" style={styles.heading}>
              {run.fullTitle}
            </Text>
            {isStarted &&
              data.courseEnrolment?.stepsCompletedRatio !== undefined &&
              renderProgress(data.courseEnrolment.stepsCompletedRatio)}
            {firstOrLastStep && renderFirstOrLastStep(firstOrLastStep)}
            {!isStarted && startTime && (
              <Text weight="medium">
                This course starts on {formatLongDate(startTime)} at {formatShortTime(startTime)}
              </Text>
            )}
          </View>
        </>
      ) : (
        loading && <ActivityIndicator />
      )}
    </SafeAreaView>
  );
}

const createStyleSheet = ({ colors }: Theme, isLargeDevice: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignSelf: 'center',
      maxWidth: LARGE_DEVICE_CONTAINER_WIDTH,
      width: '100%',
    },
    innerContainer: {
      marginTop: 20,
      marginHorizontal: 16,
    },
    subHeading: {
      marginBottom: 10,
    },
    heading: {
      marginBottom: 24,
    },
    stepCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginTop: 16,
      backgroundColor: colors.currentStepBackground,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    stepCardContent: {
      flex: 1,
    },
    stepCardItems: {
      marginTop: 10,
      flexDirection: 'row',
    },
    iconContainer: {
      height: 30,
      width: 30,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignSelf: 'center',
    },
    arrowIcon: {
      alignSelf: 'center',
      tintColor: colors.background,
    },
    stepTitleContainer: {
      flex: 1,
      marginHorizontal: 16,
    },
    stepType: {
      textTransform: 'capitalize',
    },
    showHeaderRightContainer: {
      display: 'flex',
    },
    hideHeaderRightContainer: {
      display: 'none',
      position: 'relative',
    },
    image: {
      flexGrow: 1,
      maxHeight: isLargeDevice ? 500 : 400,
      marginHorizontal: isLargeDevice ? 16 : 0,
    },
    progressBar: {
      marginTop: 12,
      marginBottom: 16,
    },
  });
