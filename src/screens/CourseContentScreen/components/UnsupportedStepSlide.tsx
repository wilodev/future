import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import Button from '~/designSystem/Button';
import Text from '~/designSystem/Text';
import useLargeDevice, { LARGE_DEVICE_CONTAINER_WIDTH } from '~/utils/useLargeDevice';
import { AnimationValues, HEADER_HEIGHT } from '../HeaderFooterAnimation';

const DEFAULT_SPACE = 16;

type UnsupportedStepSlideProps = {
  animationValues: AnimationValues;
  stepId: string;
  stepTitle: string;
  navigateToWebView: (source: string) => void;
};

export default function UnsupportedStepSlide({
  animationValues: { footerHeight },
  stepId,
  stepTitle,
  navigateToWebView,
}: UnsupportedStepSlideProps) {
  const { isLargeDevice } = useLargeDevice();
  const { height } = useWindowDimensions();

  const containerHeight = height - footerHeight - DEFAULT_SPACE;

  const styles = createStyleSheet(containerHeight);

  return (
    <>
      <View testID={`step-scroll-view-${stepId}`}>
        <View testID="container" style={[isLargeDevice && styles.containerOnLargeDevice]}>
          <View style={[!isLargeDevice && styles.container, styles.horizontalMargin]}>
            <View>
              <Text weight="bold" size="xxlarge" style={styles.title} testID="step-title">
                {stepTitle}
              </Text>
              <View>
                <Text>This step isn't yet available in the app, but we're working on it!</Text>
                <Text style={styles.unsupportedMessage}>
                  You can look at this step in a browser by tapping the button below. When you've
                  completed the step, hit the X in the top right to continue here.
                </Text>
              </View>
            </View>
            <Button
              title="Open in web browser"
              onPress={() => navigateToWebView('unsupportedStepLink')}
              style={styles.button}
              type="tertiary"
            />
          </View>
        </View>
      </View>
    </>
  );
}

const createStyleSheet = (containerHeight: number) =>
  StyleSheet.create({
    container: {
      paddingTop: HEADER_HEIGHT,
      height: containerHeight,
      justifyContent: 'space-between',
      paddingBottom: DEFAULT_SPACE,
    },
    containerOnLargeDevice: {
      paddingTop: HEADER_HEIGHT,
      width: LARGE_DEVICE_CONTAINER_WIDTH,
      alignSelf: 'center',
      marginBottom: 20,
    },
    horizontalMargin: {
      marginHorizontal: DEFAULT_SPACE,
    },
    title: {
      marginVertical: DEFAULT_SPACE * 2,
    },
    unsupportedMessage: {
      marginTop: DEFAULT_SPACE * 2,
      marginBottom: DEFAULT_SPACE,
    },
    button: {
      marginTop: DEFAULT_SPACE,
    },
  });
