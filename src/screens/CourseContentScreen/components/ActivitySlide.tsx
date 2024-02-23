import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import ActivityIndicator from '~/designSystem/ActivityIndicator';

import Text from '~/designSystem/Text';
import { Theme, useTheme } from '~/designSystem/themes';
import useLargeDevice, { LARGE_DEVICE_CONTAINER_WIDTH } from '~/utils/useLargeDevice';

import { AnimationValues, useContentScrollHandler } from '../HeaderFooterAnimation';

const DEFAULT_SPACE = 16;

type ActivitySlideProps = {
  id: string;
  title: string;
  description: string;
  activityLength: number;
  imageUrl?: string;
  animationValues: AnimationValues;
};

export default function ActivitySlide({
  id,
  title,
  description,
  activityLength,
  imageUrl,
  animationValues,
}: ActivitySlideProps) {
  const [imageLoading, setImageLoading] = React.useState(true);

  const onScroll = useContentScrollHandler(animationValues);
  const styles = createStyles(useTheme());

  const { isLargeDevice } = useLargeDevice();

  return (
    <>
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={onScroll}
        scrollEventThrottle={16}
        testID={`activity-scroll-view-${id}`}>
        <View
          style={[styles.activityContainer, isLargeDevice && styles.containerOnLargeDevice]}
          testID="activity-slide-container">
          <View style={[styles.imageContainer, styles.imageCircleShape]}>
            {imageUrl && (
              <Image
                source={{
                  uri: imageUrl,
                }}
                style={styles.imageCircleShape}
                onLoadEnd={() => setImageLoading(false)}
                testID="activity-image"
                resizeMode="contain"
              />
            )}
            {imageUrl && imageLoading && (
              <View style={[styles.imageCircleShape, styles.imagePlaceholder]}>
                <ActivityIndicator size="large" />
              </View>
            )}
          </View>
          <Text weight="bold" size="large" style={styles.content} testID="activity-title">
            {title}
          </Text>
          <Text
            style={[styles.content, styles.descriptionText]}
            color="textGrey"
            testID="activity-description">
            {description}
          </Text>
          <Text size="small" weight="bold" style={styles.content} testID="activity-length">
            {activityLength} step{activityLength > 1 && 's'}
          </Text>
        </View>
      </Animated.ScrollView>
    </>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    activityContainer: {
      alignItems: 'center',
    },
    containerOnLargeDevice: {
      width: LARGE_DEVICE_CONTAINER_WIDTH,
      alignSelf: 'center',
    },
    scrollView: {
      paddingHorizontal: DEFAULT_SPACE,
    },
    content: {
      textAlign: 'center',
    },
    descriptionText: {
      marginVertical: 40,
    },
    imageContainer: {
      marginBottom: 48,
      marginTop: 136,
      backgroundColor: colors.placeholder,
    },
    imageCircleShape: {
      width: 200,
      height: 200,
      backgroundColor: 'transparent',
    },
    imagePlaceholder: {
      position: 'absolute',
    },
  });
