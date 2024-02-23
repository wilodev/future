import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import Sound from 'react-native-sound';
import * as Haptics from 'expo-haptics';
// import { useNavigation } from '@react-navigation/native';

import { useTheme } from '~/designSystem/themes';
import useSound from '~/utils/useSound';

import { CourseContentStep } from '..';
import useMarkAsComplete from '../useMarkAsComplete';

export default function MarkAsCompleteButton({
  enrolmentId,
  step,
}: {
  enrolmentId: string;
  step: Pick<CourseContentStep, 'id' | 'number'>;
}) {
  const { isComplete, complete, undo } = useMarkAsComplete(enrolmentId, step);

  const [isAnimating, setIsAnimating] = useState(false);

  const { dark } = useTheme();

  // const navigation = useNavigation<any>();

  const markCompleteAnimation = dark
    ? require('~/assets/animations/mark-as-complete-dark.json')
    : require('~/assets/animations/mark-as-complete-light.json');

  const progressComplete = useRef(new Animated.Value(0));

  useEffect(() => {
    if (!isAnimating) {
      progressComplete.current.setValue(isComplete ? 0.5 : 0);
    }
  }, [isAnimating, isComplete]);

  Sound.setCategory('Ambient', true);

  const completeSound = useSound(require('~/assets/sounds/success.m4a'), { volume: 0.3 });
  const undoSound = useSound(require('~/assets/sounds/cancel.m4a'), { volume: 0.3 });

  const triggerAction = useCallback(
    ({
      action,
      animateTo,
      playSoundAndHaptic,
    }: {
      action: () => Promise<unknown>;
      animateTo: number;
      playSoundAndHaptic: () => void;
    }) => {
      setIsAnimating(true);

      action();

      playSoundAndHaptic();

      Animated.timing(progressComplete.current, {
        toValue: animateTo,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
    },
    [],
  );

  const triggerComplete = useCallback(
    () =>
      triggerAction({
        action: complete,
        animateTo: 0.5,
        playSoundAndHaptic() {
          completeSound.play();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // navigation.navigate('CourseCompleteScreen');
        },
      }),
    [triggerAction, complete, completeSound],
  );

  const triggerUndo = useCallback(
    () =>
      triggerAction({
        action: undo,
        animateTo: 1,
        playSoundAndHaptic() {
          undoSound.play();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      }),
    [triggerAction, undo, undoSound],
  );

  return (
    <Pressable
      accessibilityRole="togglebutton"
      accessibilityState={{ checked: isComplete }}
      accessibilityLabel="Mark as complete"
      android_disableSound
      disabled={isAnimating}
      hitSlop={4}
      onPress={isComplete ? triggerUndo : triggerComplete}
      testID="mark-as-complete-toggle">
      <LottieView
        source={markCompleteAnimation}
        style={styles.markCompleteAnimation}
        progress={progressComplete.current}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  markCompleteAnimation: {
    height: 44,
    width: 44,
    alignSelf: 'center',
  },
});
