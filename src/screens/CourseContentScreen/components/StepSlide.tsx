import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import { useSharedValue, AnimatedStyle } from 'react-native-reanimated';
import { NetworkStatus } from '@apollo/client';

import ActivityIndicator from '~/designSystem/ActivityIndicator';
import ErrorBanner from '~/designSystem/ErrorBanner';
import useLargeDevice, { LARGE_DEVICE_CONTAINER_WIDTH } from '~/utils/useLargeDevice';
import useRefreshingState from '~/utils/useRefreshingState';
import SupportedStepSlide from './SupportedStepSlide';
import UnsupportedStepSlide from './UnsupportedStepSlide';

import { useStepContentQuery } from '../StepContentQuery.generated';
import { AnimationValues, HEADER_HEIGHT } from '../HeaderFooterAnimation';

type StepSlideProps = {
  runId: string;
  stepId: string;
  stepTitle: string;
  animationValues: AnimationValues;
  navigateToWebView: (source: string) => void;
  currentIndex: number;
  videoAnimatedStyle: AnimatedStyle<ViewStyle>;
};

export default function StepSlide({
  runId,
  stepId,
  stepTitle,
  animationValues,
  navigateToWebView,
  currentIndex,
  videoAnimatedStyle,
}: StepSlideProps) {
  const { error, data, networkStatus, refetch } = useStepContentQuery({
    variables: { stepId },
    notifyOnNetworkStatusChange: true,
  });

  const { refresh, refreshing } = useRefreshingState(refetch);

  const content = data?.contentByStepId;

  const { isLargeDevice } = useLargeDevice();
  const { height: windowHeight } = useWindowDimensions();

  const transcriptViewHeight = useSharedValue(0);

  const [videoHeight] = useState(0);
  const styles = createStyleSheet();

  useEffect(() => {
    transcriptViewHeight.value = windowHeight - videoHeight - HEADER_HEIGHT;
  }, [transcriptViewHeight, videoHeight, windowHeight]);

  return (
    <>
      {error && (
        <View
          style={isLargeDevice && styles.containerOnLargeDevice}
          testID="error-banner-container">
          <ErrorBanner />
        </View>
      )}
      {networkStatus === NetworkStatus.loading && <ActivityIndicator />}
      {content &&
        ('bodyForMobileApp' in content ? (
          <SupportedStepSlide
            runId={runId}
            stepId={stepId}
            stepTitle={stepTitle}
            animationValues={animationValues}
            navigateToWebView={navigateToWebView}
            currentIndex={currentIndex}
            videoAnimatedStyle={videoAnimatedStyle}
            content={content}
            networkStatus={networkStatus}
            refresh={refresh}
            refreshing={refreshing}
          />
        ) : (
          <UnsupportedStepSlide
            animationValues={animationValues}
            stepId={stepId}
            stepTitle={stepTitle}
            navigateToWebView={navigateToWebView}
          />
        ))}
    </>
  );
}

const createStyleSheet = () =>
  StyleSheet.create({
    containerOnLargeDevice: {
      width: LARGE_DEVICE_CONTAINER_WIDTH,
      alignSelf: 'center',
      marginBottom: 20,
    },
  });
