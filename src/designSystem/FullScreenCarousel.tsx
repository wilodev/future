import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  FlatListProps,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
} from 'react-native';
import { useMaxViewWidth } from '~/utils/useMaxWidth';

type CarouselProps<T> = {
  index: number;
  onIndexChange: (index: number) => void;
  animateOnIndexChange?: boolean;
} & Pick<FlatListProps<T>, 'data' | 'keyExtractor' | 'renderItem' | 'testID'>;

export default function FullScreenCarousel<T>({
  renderItem,
  data,
  keyExtractor,
  index,
  onIndexChange,
  testID,
  animateOnIndexChange = true,
}: CarouselProps<T>) {
  const refContainer = useRef<FlatList>(null);
  const scrollIndex = useRef(0);
  const scrollToIndex = (newIndex: number, animated: boolean) => {
    if (refContainer.current && newIndex >= 0) {
      refContainer.current.scrollToIndex({ index: newIndex, animated });
    }
  };
  const windowWidth = useMaxViewWidth();
  const styles = useMemo(() => createStyles(windowWidth), [windowWidth]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => scrollToIndex(index, false), [windowWidth]);

  useEffect(() => {
    if (index !== scrollIndex.current) {
      scrollToIndex(index, animateOnIndexChange);
    }
  }, [index, animateOnIndexChange]);

  const onScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const slideSize = windowWidth;
      const slideIndex = nativeEvent.contentOffset.x / slideSize;
      const roundIndex = Math.round(slideIndex);

      const distance = Math.abs(roundIndex - slideIndex);

      const isNoMansLand = distance > 0.4;

      if (roundIndex !== scrollIndex.current && !isNoMansLand) {
        const callOnIndexChange = scrollIndex.current === index;

        scrollIndex.current = roundIndex;

        if (callOnIndexChange) {
          onIndexChange(roundIndex);
        }
      }
    },
    [index, onIndexChange, windowWidth],
  );

  const flatListOptimizationProps: Partial<FlatListProps<T>> = {
    initialNumToRender: 0,
    maxToRenderPerBatch: 1,
    removeClippedSubviews: true,
    scrollEventThrottle: 16,
    windowSize: 1,
    getItemLayout: useCallback(
      (_: any, localIndex: number) => ({
        index: localIndex,
        length: windowWidth,
        offset: localIndex * windowWidth,
      }),
      [windowWidth],
    ),
  };

  return (
    <FlatList
      ref={refContainer}
      data={data}
      keyExtractor={keyExtractor}
      style={styles.carousel}
      renderItem={renderItem}
      pagingEnabled
      horizontal
      showsHorizontalScrollIndicator={false}
      bounces={false}
      onScroll={onScroll}
      testID={testID}
      numColumns={1}
      contentInset={{ top: 0, left: 0, bottom: 0, right: 0 }}
      centerContent
      initialScrollIndex={index}
      {...flatListOptimizationProps}
    />
  );
}

const createStyles = (width: number) =>
  StyleSheet.create({
    carousel: {
      width: width,
      maxWidth: width,
      alignSelf: 'center',
    },
  });
