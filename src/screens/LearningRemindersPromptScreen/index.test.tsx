import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LearningRemindersPromptScreen from '.';
import { RootNavigationProp } from '~/navigators/RootNavigationStack';
import { markAsShown, PromptKey } from '~/utils/promotionalPrompts';

jest.mock('~/utils/promotionalPrompts');

const mockTrackFn = jest.fn();

jest.mock('~/utils/analytics', () => ({
  useAnalytics: () => ({ track: mockTrackFn }),
}));

describe('LearningRemindersPromptScreen', () => {
  const setup = () => {
    jest.useFakeTimers();

    const goBackFn = jest.fn();
    const navigateFn = jest.fn();
    const navigation = {
      goBack: goBackFn,
      navigate: navigateFn,
    } as Partial<
      RootNavigationProp<'LearningRemindersPrompt'>
    > as RootNavigationProp<'LearningRemindersPrompt'>;

    const renderComponent = () =>
      render(
        <SafeAreaProvider>
          <LearningRemindersPromptScreen navigation={navigation} />
        </SafeAreaProvider>,
      );

    return { goBackFn, navigateFn, renderComponent };
  };

  describe('when the scrim is pressed', () => {
    it('closes the screen', () => {
      const { goBackFn, renderComponent } = setup();
      const { getByTestId } = renderComponent();

      fireEvent.press(getByTestId('scrim'));

      jest.runAllTimers();

      expect(goBackFn).toHaveBeenCalled();
    });

    it('tracks that the prompt was dismissed', () => {
      const { getByTestId } = setup().renderComponent();

      fireEvent.press(getByTestId('scrim'));

      jest.runAllTimers();

      expect(mockTrackFn).toHaveBeenCalledWith('Dismiss reminders prompt', 'Reminders', {
        source: 'Overlay',
      });
    });
  });

  describe('when the close button is pressed', () => {
    it('closes the screen', () => {
      const { goBackFn, renderComponent } = setup();
      const { getByTestId } = renderComponent();

      fireEvent.press(getByTestId('close-button'));

      jest.runAllTimers();

      expect(goBackFn).toHaveBeenCalled();
    });

    it('tracks that the prompt was dismissed', () => {
      const { getByTestId } = setup().renderComponent();

      fireEvent.press(getByTestId('close-button'));

      jest.runAllTimers();

      expect(mockTrackFn).toHaveBeenCalledWith('Dismiss reminders prompt', 'Reminders', {
        source: 'CloseButton',
      });
    });
  });

  describe("when the 'I'll do it later' button is pressed", () => {
    it('closes the screen', () => {
      const { goBackFn, renderComponent } = setup();
      const { getByText } = renderComponent();

      fireEvent.press(getByText('I’ll do it later on the Account screen'));

      jest.runAllTimers();

      expect(goBackFn).toHaveBeenCalled();
    });

    it('tracks that the prompt was dismissed', () => {
      const { getByText } = setup().renderComponent();

      fireEvent.press(getByText('I’ll do it later on the Account screen'));

      jest.runAllTimers();

      expect(mockTrackFn).toHaveBeenCalledWith('Dismiss reminders prompt', 'Reminders', {
        source: 'LaterButton',
      });
    });
  });

  it('marks prompt as shown when rendered', () => {
    setup().renderComponent();

    expect(markAsShown).toHaveBeenCalledWith(PromptKey.LearningReminders);
  });

  describe('when the set reminder button is pressed', () => {
    it('navigates to the settings screen when the set button tapped', () => {
      const { navigateFn, renderComponent } = setup();
      const { getByText } = renderComponent();

      fireEvent.press(getByText('Set a learning reminder'));

      expect(navigateFn).toHaveBeenCalledWith('LearningRemindersSettings', {
        depth: 2,
        asModal: true,
      });
    });

    it('tracks that the learning reminders screen has been opened', () => {
      const { getByText } = setup().renderComponent();

      fireEvent.press(getByText('Set a learning reminder'));

      expect(mockTrackFn).toHaveBeenCalledWith('Open reminders settings', 'Reminders', {
        source: 'Prompt',
      });
    });
  });
});
