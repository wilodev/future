import { useCallback } from 'react';
import { NativeScrollEvent } from 'react-native';
import {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useSharedValue,
  SharedValue,
} from 'react-native-reanimated';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { getDefaultHeaderHeight } from '~/navigators/utils';

export const HEADER_HEIGHT = getDefaultHeaderHeight();
export const HEADER_Y_TRANSLATION = getStatusBarHeight();

export enum Visibility {
  Hidden,
  Visible,
  Animating,
}

export type AnimationValues = {
  footerHeight: number;
  taper: number;
  startOffset: SharedValue<number>;
  endOffset: SharedValue<number>;
  currentOffset: SharedValue<number>;
  visibility: SharedValue<Visibility>;
};

export function useAnimatedElements(footerHeight: number) {
  const animationValues: AnimationValues = {
    footerHeight,
    taper: footerHeight * 2,
    startOffset: useSharedValue(0),
    endOffset: useSharedValue(0),
    currentOffset: useSharedValue(0),
    visibility: useSharedValue(Visibility.Visible) as SharedValue<Visibility>,
  };

  return {
    footerAnimatedStyle: useAnimatedStyle(() =>
      translateYAnimationStyle(animationValues, footerHeight),
    ),
    headerAnimatedStyle: useAnimatedStyle(() =>
      translateYAnimationStyle(animationValues, -HEADER_Y_TRANSLATION),
    ),
    videoAnimatedStyle: useAnimatedStyle(() =>
      marginTopAnimationStyle(animationValues, HEADER_HEIGHT),
    ),
    headerContentAnimatedStyle: useAnimatedStyle(() => fadeAnimationStyle(animationValues)),
    animationValues,
    resetAnimationValues: () => {
      animationValues.startOffset.value = 0;
      animationValues.endOffset.value = 0;
      animationValues.currentOffset.value = 0;
      animationValues.visibility.value = Visibility.Visible;
    },
  };
}

const fadeAnimationStyle = ({
  taper,
  visibility,
  startOffset,
  endOffset,
  currentOffset,
}: AnimationValues) => {
  'worklet';
  if (visibility.value === Visibility.Animating) {
    const start = startOffset.value;
    const end = endOffset.value;

    return {
      opacity: interpolate(
        currentOffset.value,
        [start, start + taper, end - taper, end],
        [1, 0, 0, 1],
        Extrapolate.CLAMP,
      ),
    };
  }

  return {
    opacity: visibility.value === Visibility.Visible ? 1 : 0,
  };
};

const marginTopAnimationStyle = (
  { taper, visibility, startOffset, endOffset, currentOffset }: AnimationValues,
  yTranslationWhenHidden: number,
) => {
  'worklet';
  if (visibility.value === Visibility.Animating) {
    const start = startOffset.value;
    const end = endOffset.value;

    return {
      marginTop: interpolate(
        currentOffset.value,
        [start, start + taper, end - taper, end],
        [
          yTranslationWhenHidden,
          HEADER_Y_TRANSLATION,
          HEADER_Y_TRANSLATION,
          yTranslationWhenHidden,
        ],
        Extrapolate.CLAMP,
      ),
    };
  }

  return {
    marginTop:
      visibility.value === Visibility.Visible ? yTranslationWhenHidden : HEADER_Y_TRANSLATION,
  };
};

const translateYAnimationStyle = (
  { taper, visibility, startOffset, endOffset, currentOffset }: AnimationValues,
  yTranslationWhenHidden: number,
) => {
  'worklet';
  if (visibility.value === Visibility.Animating) {
    const start = startOffset.value;
    const end = endOffset.value;

    return {
      transform: [
        {
          translateY: interpolate(
            currentOffset.value,
            [start, start + taper, end - taper, end],
            [0, yTranslationWhenHidden, yTranslationWhenHidden, 0],
            Extrapolate.CLAMP,
          ),
        },
      ],
    };
  }

  return {
    transform: [
      {
        translateY: visibility.value === Visibility.Visible ? 0 : yTranslationWhenHidden,
      },
    ],
  };
};

export const useContentScrollHandler = ({
  taper,
  startOffset,
  endOffset,
  currentOffset,
  visibility,
}: AnimationValues) => {
  type ScrollContext = {
    dragging: boolean;
    momentuming: boolean;
  };

  const onStartScroll = useCallback(
    (
      { contentOffset, contentSize, layoutMeasurement }: NativeScrollEvent,
      recalculateOffsets: boolean,
    ) => {
      'worklet';

      if (visibility.value === Visibility.Animating) {
        return;
      }

      if (recalculateOffsets) {
        startOffset.value =
          visibility.value === Visibility.Visible ? contentOffset.y : contentOffset.y - taper;
        endOffset.value = contentSize.height - layoutMeasurement.height - HEADER_HEIGHT;
      }

      if (endOffset.value - startOffset.value > 2 * taper) {
        visibility.value = Visibility.Animating;
      }
    },
    [taper, visibility, startOffset, endOffset],
  );

  const onEndScroll = useCallback(() => {
    'worklet';

    if (visibility.value !== Visibility.Animating) {
      return;
    }

    const mainlyVisible =
      currentOffset.value < startOffset.value + taper / 2 ||
      currentOffset.value > endOffset.value - taper / 2;

    visibility.value = mainlyVisible ? Visibility.Visible : Visibility.Hidden;
  }, [taper, visibility, currentOffset, startOffset, endOffset]);

  return useAnimatedScrollHandler<ScrollContext>({
    onScroll: event => {
      currentOffset.value = event.contentOffset.y;
    },
    onBeginDrag: (event, context) => {
      if (context) {
        context.dragging = true;
      }
      onStartScroll(event, true);
    },
    onEndDrag: (_, context) => {
      if (context) {
        context.dragging = false;
      }
      onEndScroll();
    },
    onMomentumBegin: (event, context) => {
      if (context) {
        context.momentuming = true;
      }
      onStartScroll(event, false);
    },
    onMomentumEnd: (_, context) => {
      if (context) {
        context.momentuming = false;
      }
      onEndScroll();
    },
  });
};
