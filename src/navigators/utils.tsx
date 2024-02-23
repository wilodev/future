import { StackNavigationOptions } from '@react-navigation/stack';
import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import ToDoButton from '~/components/ToDoButton';
import { useAnalytics } from '~/utils/analytics';
import { isIOS } from '~/utils/platform';
import useLargeDevice from '~/utils/useLargeDevice';

import { fadeIn, revealFromBottom } from './cardInterpolators';
import { RootNavigationProp } from './RootNavigationStack';
import { openModal, closeModal } from './transitionSpecs';

const BASE_MODAL_OPTIONS: StackNavigationOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: 'transparent' },
  cardOverlayEnabled: true,
  transitionSpec: {
    open: openModal,
    close: closeModal,
  },
};

export const DIALOG_OPTIONS: StackNavigationOptions = {
  ...BASE_MODAL_OPTIONS,
  gestureEnabled: false,
  cardStyleInterpolator: fadeIn,
};

export const bottomSheetOptions = (height: number): StackNavigationOptions => ({
  ...BASE_MODAL_OPTIONS,
  gestureEnabled: true,
  gestureDirection: 'vertical',
  gestureResponseDistance: height,
  cardStyleInterpolator: revealFromBottom,
});

export const useModalOptions = () => {
  const { isLargeDevice } = useLargeDevice();
  const { height } = useWindowDimensions();

  return useMemo(
    () => ({
      bottomSheetOrDialogOptions: isLargeDevice ? DIALOG_OPTIONS : bottomSheetOptions(height),
      fullScreenOrDialogOptions: isLargeDevice ? DIALOG_OPTIONS : {},
    }),
    [isLargeDevice, height],
  );
};

export const getDefaultHeaderHeight = () => (isIOS() ? 44 + getStatusBarHeight() : 56);

export function toDoButtonHeader({
  navigation: { navigate },
  runId,
  track,
  enrolmentId,
}: {
  navigation: RootNavigationProp<'ToDoList'>;
  runId: string;
  track: ReturnType<typeof useAnalytics>['track'];
  enrolmentId: string;
}) {
  return () => (
    <ToDoButton
      onPress={() => {
        track('Open Todo List', 'Course', {
          run_id: runId,
        });
        navigate('ToDoList', {
          runId,
          enrolmentId,
        });
      }}
    />
  );
}
