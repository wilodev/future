import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { AppState, AppStateStatus, Linking } from 'react-native';

import { RootNavigationProp, RootRouteProp } from '~/navigators/RootNavigationStack';
import { hasNotificationPermission } from '~/utils/notifications';
import { waitForPromises } from '~/utils/TestUtils';

import LearningRemindersPermissionRequiredScreen from '.';

jest.mock('~/utils/notifications', () => ({
  hasNotificationPermission: jest.fn(() => Promise.resolve(false)),
}));

describe('LearningRemindersPermissionRequiredScreen', () => {
  const DEPTH = 5;
  const popFn = jest.fn();

  const mockHasNotificationPermission = (result: boolean) => {
    (hasNotificationPermission as jest.Mock).mockResolvedValue(result);
  };

  beforeEach(() => mockHasNotificationPermission(false));

  const renderScreen = () => {
    const navigation = {
      pop: popFn,
    } as Partial<
      RootNavigationProp<'LearningRemindersPermissionRequired'>
    > as RootNavigationProp<'LearningRemindersPermissionRequired'>;

    const route = {
      params: { depth: DEPTH },
    } as RootRouteProp<'LearningRemindersPermissionRequired'>;

    return render(
      <LearningRemindersPermissionRequiredScreen navigation={navigation} route={route} />,
    );
  };

  describe('when the settings link is tapped', () => {
    it('opens the app settings', () => {
      jest.spyOn(Linking, 'openSettings');

      const { getByText } = renderScreen();

      fireEvent.press(getByText('Settings'));

      expect(Linking.openSettings).toHaveBeenCalled();
    });
  });

  describe('when the OK button is tapped', () => {
    it('pops the correct number of screens from the stack', () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('OK'));

      expect(popFn).toHaveBeenCalledWith(5);
    });
  });

  describe('app status changes', () => {
    const simulateStatusChange = (newStatus: AppStateStatus) => {
      const appStateListener: (state: AppStateStatus) => void = (
        AppState.addEventListener as jest.Mock
      ).mock.calls[0][1];

      appStateListener(newStatus);
    };

    describe('when the app is foregrounded', () => {
      it('closes the screen if the notification permission has been granted', async () => {
        renderScreen();

        mockHasNotificationPermission(true);

        simulateStatusChange('active');

        await waitForPromises();

        expect(popFn).toHaveBeenCalledWith();
      });

      it("does not close the screen if the notification permission still hasn't been granted", async () => {
        renderScreen();

        simulateStatusChange('active');

        await waitForPromises();

        expect(popFn).not.toHaveBeenCalledWith();
      });

      it('does not try to close the screen after the component has been unmounted', async () => {
        const { unmount } = renderScreen();

        mockHasNotificationPermission(true);

        simulateStatusChange('active');

        unmount();

        await waitForPromises();

        expect(popFn).not.toHaveBeenCalledWith();
      });
    });

    it('does not recheck the permission status after other app status changes', async () => {
      renderScreen();

      mockHasNotificationPermission(true);

      simulateStatusChange('background');

      await waitForPromises();

      expect(hasNotificationPermission).not.toHaveBeenCalledWith();
    });

    it('unsubscribes from the app state change event when the component is unmounted', () => {
      const removeFn = jest.fn();

      (AppState.addEventListener as jest.Mock).mockReturnValue({ remove: removeFn });

      const { unmount } = renderScreen();

      unmount();

      expect(removeFn).toHaveBeenCalled();
    });
  });
});
