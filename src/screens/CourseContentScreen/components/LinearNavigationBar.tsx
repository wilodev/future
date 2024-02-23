import React from 'react';
import { StyleSheet, View } from 'react-native';

import IconButton from '~/designSystem/IconButton';
import { showMarkAsComplete } from '~/utils/stepCompletion';
import { FOOTER_CONTENT_HEIGHT, FOOTER_VERTICAL_PADDING } from '~/utils/useFooterHeight';
import { LARGE_DEVICE_CONTAINER_WIDTH } from '~/utils/useLargeDevice';

import { CourseContentItem } from '..';
import MarkAsCompleteButton from './MarkAsCompleteButton';

export type LinearNavigationBarProps = {
  onNext?: () => void;
  onPrevious?: () => void;
  currentItem?: CourseContentItem;
  enrolmentId: string;
};

export default function LinearNavigationBar({
  onNext,
  onPrevious,
  currentItem,
  enrolmentId,
}: LinearNavigationBarProps) {
  return (
    <View style={styles.container} testID="linear-navigation-bar">
      <View style={[styles.column, styles.startColumn]} />
      <View style={[styles.column, styles.centerColumn]}>
        {currentItem?.itemType === 'Step' && showMarkAsComplete(currentItem.contentType) && (
          <MarkAsCompleteButton enrolmentId={enrolmentId} step={currentItem} />
        )}
      </View>
      <View style={[styles.column, styles.endColumn]}>
        <IconButton
          disabled={!onPrevious}
          accessibilityLabel="Previous step"
          onPress={onPrevious}
          source={require('~/assets/arrow-left.png')}
          style={styles.button}
          testID="previous-button"
        />
        <IconButton
          disabled={!onNext}
          accessibilityLabel="Next step"
          onPress={onNext}
          source={require('~/assets/arrow-right.png')}
          style={styles.button}
          testID="next-button"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    maxWidth: LARGE_DEVICE_CONTAINER_WIDTH,
    width: '100%',
    flexDirection: 'row',
    height: FOOTER_CONTENT_HEIGHT,
    marginTop: FOOTER_VERTICAL_PADDING,
    paddingHorizontal: 16,
  },
  column: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startColumn: {
    justifyContent: 'flex-start',
  },
  centerColumn: {
    justifyContent: 'center',
  },
  endColumn: {
    justifyContent: 'flex-end',
  },
  button: {
    marginStart: 20,
    marginEnd: 8,
  },
});
