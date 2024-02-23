import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
  ScrollView,
  ViewStyle,
  RefreshControl,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  AnimatedStyle,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { OnProgressData } from 'react-native-video';
import { NetworkStatus } from '@apollo/client';

import FormattedHTML from '~/components/FormattedHtml';
import Text from '~/designSystem/Text';
import { Theme, useTheme } from '~/designSystem/themes';
import useLargeDevice, { LARGE_DEVICE_CONTAINER_WIDTH } from '~/utils/useLargeDevice';
import Video, { VideoStatus } from '~/components/Video';
import IconButton from '~/designSystem/IconButton';

import { StepContentQuery } from '../StepContentQuery.generated';

import { AnimationValues, HEADER_HEIGHT, useContentScrollHandler } from '../HeaderFooterAnimation';
import useVideoTracking from '../useVideoTracking';

const DEFAULT_SPACE = 16;

export type contentType = Extract<
  StepContentQuery['contentByStepId'],
  { bodyForMobileApp: string }
>;

type SupportedStepSlideProps = {
  runId: string;
  stepId: string;
  stepTitle: string;
  animationValues: AnimationValues;
  navigateToWebView: (source: string) => void;
  currentIndex: number;
  videoAnimatedStyle: AnimatedStyle<ViewStyle>;
  content: contentType;
  networkStatus: NetworkStatus;
  refresh: () => void;
  refreshing: boolean;
};

export default function SupportedStepSlide({
  runId,
  stepId,
  stepTitle,
  animationValues,
  navigateToWebView,
  currentIndex,
  videoAnimatedStyle,
  content,
  networkStatus,
  refresh,
  refreshing,
}: SupportedStepSlideProps) {
  const { trackVideoPercentagePlayed, trackVideoStart } = useVideoTracking({ runId, stepId });

  const onScroll = useContentScrollHandler(animationValues);

  const { isLargeDevice } = useLargeDevice();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const contentWidth =
    (isLargeDevice ? LARGE_DEVICE_CONTAINER_WIDTH : windowWidth) - DEFAULT_SPACE * 2;
  const displayVideo =
    'video' in content && content.video.status === VideoStatus.Available && !!content.video.hlsUrl;
  const [videoPaused, setVideoPaused] = useState(true);

  const onPlaybackRateChange = useCallback(
    (playbackRate: number) => {
      if (playbackRate > 0) {
        trackVideoStart();
      }
      setVideoPaused(playbackRate === 0);
    },
    [trackVideoStart],
  );

  const onVideoProgress = useCallback(
    (onProgressData: OnProgressData) => {
      trackVideoPercentagePlayed(onProgressData);
    },
    [trackVideoPercentagePlayed],
  );

  const isFocused = useIsFocused();

  useEffect(() => {
    setVideoPaused(true);
    setIsTranscriptVisible(false);
  }, [isFocused, currentIndex]);

  const styles = createStyleSheet(useTheme(), animationValues);

  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const transcriptViewHeight = useSharedValue(0);

  const toggleTranscriptView = useCallback(() => {
    displayVideo && content.video.englishTranscript && setIsTranscriptVisible(!isTranscriptVisible);
  }, [content, displayVideo, isTranscriptVisible]);

  const [videoHeight, setVideoHeight] = useState(0);

  const animatedTranscriptViewStyles = useAnimatedStyle(() => {
    return {
      height: withTiming(isTranscriptVisible ? transcriptViewHeight.value : 0),
      transform: [
        {
          translateY: withTiming(!isTranscriptVisible ? windowHeight : videoHeight + HEADER_HEIGHT),
        },
      ],
    };
  });

  useEffect(() => {
    transcriptViewHeight.value = windowHeight - videoHeight - HEADER_HEIGHT;
  }, [transcriptViewHeight, videoHeight, windowHeight]);

  const formatTime = useCallback((time: number) => {
    const digit = (n: number) => (n < 10 ? `0${n}` : n);
    const seconds = digit(Math.floor(time % 60));
    const mins = digit(Math.floor((time / 60) % 60));
    return mins + ':' + seconds;
  }, []);

  return (
    <>
      {displayVideo && (
        <Animated.View style={[isLargeDevice && styles.containerOnLargeDevice, videoAnimatedStyle]}>
          <Video
            uri={content.video.hlsUrl!}
            posterUri={content.video.posterImageUrl ?? undefined}
            paused={videoPaused}
            onPlaybackRateChange={onPlaybackRateChange}
            onVideoProgress={onVideoProgress}
            onLayout={event => {
              setVideoHeight(event.nativeEvent.layout.height);
            }}
          />
          <Text
            color="primary"
            weight="medium"
            size="small"
            style={styles.viewTranscriptButton}
            onPress={toggleTranscriptView}
            accessibilityRole={content.video.englishTranscript ? 'button' : undefined}>
            {content.video.englishTranscript ? 'View transcript' : 'No transcript available'}
          </Text>
        </Animated.View>
      )}
      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollViewContentContainer,
          !displayVideo && styles.scrollViewContentContainerTop,
        ]}
        refreshControl={
          <RefreshControl
            enabled={networkStatus !== NetworkStatus.loading}
            refreshing={refreshing}
            onRefresh={refresh}
          />
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
        testID={`step-scroll-view-${stepId}`}>
        <View
          testID="container"
          style={[styles.stepSlideContainer, isLargeDevice && styles.containerOnLargeDevice]}>
          <View style={styles.horizontalMargin}>
            <Text weight="bold" size="xxlarge" style={styles.title} testID="step-title">
              {stepTitle}
            </Text>
            <>
              <View style={styles.formattedHTMLContainer}>
                <FormattedHTML contentWidth={contentWidth} html={content.bodyForMobileApp} />
                {!!content.copyrightForMobileApp?.trim() && (
                  <View style={styles.copyrightContainer}>
                    <FormattedHTML
                      contentWidth={contentWidth}
                      html={content.copyrightForMobileApp}
                      color="textGrey"
                      size="small"
                    />
                  </View>
                )}
              </View>
              <View style={styles.divider}>
                <Text>
                  For{displayVideo && ' video subtitles and'} commenting on this step{' '}
                  <Text
                    color="primary"
                    weight="medium"
                    onPress={() => navigateToWebView('supportedStepLink')}
                    accessibilityRole="link">
                    open in a web browser
                  </Text>
                </Text>
              </View>
            </>
          </View>
        </View>
      </Animated.ScrollView>
      {displayVideo && content.video.englishTranscript && (
        <Animated.View style={[styles.transcriptParent, animatedTranscriptViewStyles]}>
          <View
            style={isLargeDevice ? styles.containerOnLargeDevice : styles.transcriptFooterOffset}>
            <IconButton
              accessibilityLabel="Close transcript"
              onPress={toggleTranscriptView}
              source={require('~/assets/cross.png')}
              style={styles.closeButton}
              testID="close-button"
            />
            <ScrollView>
              {content.video.englishTranscript.paragraphs.map(({ text, timestamp }: any, index) => {
                return (
                  <View key={index} style={styles.transcriptTextContainer}>
                    <Text>{timestamp && formatTime(parseInt(timestamp, 10))}</Text>
                    <FormattedHTML contentWidth={contentWidth} html={text} />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </Animated.View>
      )}
    </>
  );
}

const createStyleSheet = ({ colors }: Theme, { footerHeight }: AnimationValues) =>
  StyleSheet.create({
    button: {
      marginVertical: DEFAULT_SPACE * 2,
    },
    closeButton: {
      alignSelf: 'flex-end',
      paddingVertical: DEFAULT_SPACE,
    },
    containerOnLargeDevice: {
      width: LARGE_DEVICE_CONTAINER_WIDTH,
      alignSelf: 'center',
      marginBottom: 20,
    },
    copyrightContainer: {
      marginTop: 5,
    },
    divider: {
      paddingTop: 25,
      borderTopWidth: 0.8,
      borderColor: colors.bar,
    },
    formattedHTMLContainer: {
      marginBottom: 20,
    },
    horizontalMargin: {
      marginHorizontal: DEFAULT_SPACE,
      flex: 1,
    },
    scrollViewContentContainer: {
      paddingBottom: footerHeight,
    },
    scrollViewContentContainerTop: {
      paddingTop: HEADER_HEIGHT,
    },
    title: {
      marginVertical: DEFAULT_SPACE * 2,
    },
    transcriptFooterOffset: {
      paddingBottom: footerHeight + DEFAULT_SPACE,
    },
    transcriptParent: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background,
      paddingHorizontal: DEFAULT_SPACE,
      paddingBottom: 50,
    },
    transcriptTextContainer: {
      paddingBottom: 20,
    },
    unsupportedMessage: {
      marginTop: DEFAULT_SPACE * 2,
    },
    viewTranscriptButton: {
      paddingHorizontal: DEFAULT_SPACE,
      paddingVertical: 8,
    },
    stepSlideContainer: {
      flex: 1,
    },
  });
