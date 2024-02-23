import React from 'react';
import { render } from '@testing-library/react-native';

import { RootNavigationProp, RootRouteProp } from '~/navigators/RootNavigationStack';
import {
  getRemindersSettings,
  hasNotificationPermission,
  RemindersData,
} from '~/utils/notifications';
import { waitForPromises } from '~/utils/TestUtils';

import LearningRemindersSettingsScreen from '.';

const MOCK_SETTINGS: RemindersData = {
  useReminders: true,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: true,
  time: new Date(2000, 0, 1, 10, 15, 0).valueOf(),
};

jest.mock('@react-native-community/datetimepicker', () => 'mock-date-time');
jest.mock('~/utils/notifications', () => ({
  getRemindersSettings: jest.fn(async () => MOCK_SETTINGS),
  hasNotificationPermission: jest.fn(),
}));
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');

  return Object.defineProperty(ReactNative, 'Switch', {
    value: 'MockedSwitch',
  });
});

describe('LearningRemindersSettingsScreen', () => {
  const DEPTH = 4;
  const setParamsFn = jest.fn();
  const navigateFn = jest.fn();

  const setup = ({
    hasNotificationPermissionResult = null,
  }: {
    hasNotificationPermissionResult?: boolean | null;
  } = {}) => {
    (hasNotificationPermission as jest.Mock).mockResolvedValue(hasNotificationPermissionResult);

    const navigation = {
      navigate: navigateFn,
      setParams: setParamsFn,
    } as Partial<
      RootNavigationProp<'LearningRemindersSettings'>
    > as RootNavigationProp<'LearningRemindersSettings'>;

    const route = {
      params: { depth: DEPTH },
    } as RootRouteProp<'LearningRemindersSettings'>;

    return render(<LearningRemindersSettingsScreen navigation={navigation} route={route} />);
  };

  describe('when there is data in async storage', () => {
    it('sets all the fields to the correct values', async () => {
      const { findByText, getByTestId } = setup();

      await findByText('Use reminders');

      Object.entries(MOCK_SETTINGS).forEach(([label, value]) => {
        let expectedValue = {
          checked: value,
          disabled: false,
        };

        switch (label) {
          case 'time':
            expect(getByTestId(label)).toHaveProp('value', new Date(value as number));
            break;
          case 'useReminders':
            expect(getByTestId(label)).toHaveProp('accessibilityState', {
              checked: value,
            });
            break;
          default:
            expect(getByTestId(label)).toHaveProp('accessibilityState', expectedValue);
        }
      });
    });
  });

  describe('when an error occurs fetching settings', () => {
    it('displays the error banner', async () => {
      jest.spyOn(console, 'warn').mockImplementation();

      (getRemindersSettings as jest.Mock).mockRejectedValue(new Error(''));

      const { findByText } = setup();

      expect(await findByText('Something went wrong')).toBeTruthy();
    });
  });

  describe('notification permission check', () => {
    describe('when the app is authorized to send notifications', () => {
      it('does not open the permission required screen', async () => {
        setup({ hasNotificationPermissionResult: true });

        await waitForPromises();

        expect(navigateFn).not.toHaveBeenCalled();
      });
    });

    describe('when the app is blocked from sending notifications', () => {
      it('opens the permission required screen', async () => {
        setup({ hasNotificationPermissionResult: false });

        await waitForPromises();

        expect(navigateFn).toHaveBeenCalledWith('LearningRemindersPermissionRequired', {
          depth: DEPTH + 1,
        });
      });
    });

    describe('when the user has yet to be asked to authorize the sending of notifications', () => {
      it('does not open the permission required screen', async () => {
        setup({ hasNotificationPermissionResult: null });

        await waitForPromises();

        expect(navigateFn).not.toHaveBeenCalled();
      });
    });
  });
});
