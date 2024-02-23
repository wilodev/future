import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, Image, LayoutChangeEvent } from 'react-native';
import RNVideo, { OnPlaybackRateData, OnProgressData } from 'react-native-video';

import Icon from '~/designSystem/Icon';
import { useTheme, Theme } from '~/designSystem/themes';
import useLargeDevice from '~/utils/useLargeDevice';

type VideoProps = {
  uri: string;
  posterUri?: string;
  paused: boolean;
  onPlaybackRateChange(playbackRate: number): void;
  onVideoProgress(currentProgress: OnProgressData): void;
  onLayout(event: LayoutChangeEvent): void;
};

export enum VideoStatus {
  Available = 'available',
}

const REFERER = 'https://www.futurelearn.com';

export default function Video({
  uri,
  posterUri,
  paused,
  onPlaybackRateChange,
  onVideoProgress,
  onLayout,
}: VideoProps) {
  const { isLargeDevice } = useLargeDevice();
  const posterIconSize = isLargeDevice ? 80 : 50;

  const styles = createStyleSheet(useTheme(), posterIconSize);

  const [localPaused, setLocalPaused] = useState(true);
  const [isPosterVisible, setIsPosterVisible] = useState(true);

  useEffect(() => {
    setLocalPaused(paused);
  }, [paused]);

  const renderPoster = useCallback(() => {
    return (
      <Pressable
        style={[styles.overlayParent, styles.video]}
        onPress={() => {
          setIsPosterVisible(false);
          setLocalPaused(false);
          onPlaybackRateChange(1);
        }}
        testID="video-poster">
        <Image
          source={{
            uri: posterUri,
          }}
          style={styles.video}
        />
        <View style={styles.posterIconContainer}>
          <View style={styles.posterIconBackground} />
          <Icon
            width={posterIconSize}
            height={posterIconSize}
            source={require('~/assets/poster-play-button.png')}
            style={styles.posterIcon}
          />
        </View>
      </Pressable>
    );
  }, [onPlaybackRateChange, posterUri, styles, posterIconSize]);

  return (
    <View onLayout={onLayout}>
      <RNVideo
        poster={posterUri}
        onError={error => console.error('Video playback error', error)}
        paused={localPaused}
        source={{
          uri,
          headers: { referer: REFERER },
        }}
        ignoreSilentSwitch="ignore"
        playInBackground={true}
        resizeMode="cover"
        style={styles.video}
        controls
        fullscreenOrientation="landscape"
        testID="video"
        onPlaybackRateChange={(data: OnPlaybackRateData) => onPlaybackRateChange(data.playbackRate)}
        onProgress={onVideoProgress}
      />
      {isPosterVisible && renderPoster()}
    </View>
  );
}

const createStyleSheet = ({ colors }: Theme, posterIconSize: number) =>
  StyleSheet.create({
    video: {
      aspectRatio: 16 / 9,
    },
    overlayParent: {
      ...StyleSheet.absoluteFillObject,
    },
    posterIconContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    posterIcon: {
      tintColor: colors.white,
    },
    posterIconBackground: {
      backgroundColor: colors.posterIconBackground,
      borderRadius: 40,
      opacity: 0.3,
      width: posterIconSize,
      height: posterIconSize,
      position: 'absolute',
    },
  });
