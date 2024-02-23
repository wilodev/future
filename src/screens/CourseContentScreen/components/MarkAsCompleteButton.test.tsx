import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import Sound from 'react-native-sound';
import * as Haptics from 'expo-haptics';

import MarkAsCompleteButton from './MarkAsCompleteButton';
import useMarkAsComplete from '../useMarkAsComplete';

const MockSoundInstance = {
  play: jest.fn(),
};

jest.mock('react-native-sound', () => jest.fn(() => MockSoundInstance));
Sound.setCategory = jest.fn();

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
}));

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('../useMarkAsComplete');

describe('MarkAsCompleteButton', () => {
  const enrolmentId = 'enrolment-id';
  const step = { id: 'step-id', number: '1.1' };

  const completeFn = jest.fn();
  const undoFn = jest.fn();

  const setup = (isComplete: boolean) => {
    jest.useFakeTimers();

    (useMarkAsComplete as jest.MockedFunction<typeof useMarkAsComplete>).mockReturnValue({
      isComplete,
      complete: completeFn,
      undo: undoFn,
    });

    const { getByTestId } = render(<MarkAsCompleteButton enrolmentId={enrolmentId} step={step} />);

    const getButton = () => getByTestId('mark-as-complete-toggle');

    return { getButton };
  };

  const runAllTimers = () => act(() => jest.runAllTimers());

  describe('when the step is not yet marked as complete', () => {
    it('has the correct accessibility label', () => {
      expect(setup(false).getButton()).toHaveProp('accessibilityState', {
        checked: false,
        disabled: false,
      });
    });

    describe('when the button is pressed', () => {
      it('disables the button until the animation completes', () => {
        const { getButton } = setup(true);

        fireEvent.press(getButton());

        expect(getButton()).toBeDisabled();

        runAllTimers();

        expect(getButton()).not.toBeDisabled();
      });

      it('plays a sound', () => {
        const { getButton } = setup(false);

        fireEvent.press(getButton());

        expect(MockSoundInstance.play).toHaveBeenCalled();
      });

      it('triggers impact and notification haptics', () => {
        const { getButton } = setup(false);

        fireEvent.press(getButton());

        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Success,
        );
      });

      it('invokes the `complete` function', () => {
        const { getButton } = setup(false);

        fireEvent.press(getButton());

        expect(completeFn).toHaveBeenCalled();
      });
    });
  });

  describe('when the step is already marked as complete', () => {
    it('has the correct accessibility label', () => {
      expect(setup(true).getButton()).toHaveProp('accessibilityState', {
        checked: true,
        disabled: false,
      });
    });

    describe('when the button is pressed', () => {
      it('disables the button until the animation completes', () => {
        const { getButton } = setup(true);

        fireEvent.press(getButton());

        expect(getButton()).toBeDisabled();

        runAllTimers();

        expect(getButton()).not.toBeDisabled();
      });

      it('plays a sound and impact haptic', () => {
        const { getButton } = setup(true);

        fireEvent.press(getButton());

        expect(MockSoundInstance.play).toHaveBeenCalled();
      });

      it('triggers an impact haptic', () => {
        const { getButton } = setup(true);

        fireEvent.press(getButton());

        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
      });

      it('invokes the `undo` function', () => {
        const { getButton } = setup(true);

        fireEvent.press(getButton());

        expect(undoFn).toHaveBeenCalled();
      });
    });
  });
});
