import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { withOS } from '~/utils/TestUtils';

import HeaderDoneButton from './HeaderDoneButton';
import { RootNavigationProp, RootRouteProp } from '~/navigators/RootNavigationStack';
import {
  saveRemindersSettings,
  requestNotificationPermission,
  scheduleNotifications,
  RemindersData,
  cancelPendingNotifications,
} from '~/utils/notifications';
import { format24HourTime } from '~/utils/dateFormatting';

const mockRecordError = jest.fn();

jest.mock('@react-native-firebase/crashlytics', () =>
  jest.fn(() => ({ recordError: mockRecordError })),
);

const mockTrackFn = jest.fn();

jest.mock('~/utils/analytics', () => ({
  useAnalytics: () => ({ track: mockTrackFn }),
}));

jest.mock('~/utils/notifications', () => {
  const { selectedDays } = jest.requireActual('~/utils/notifications');

  return {
    cancelPendingNotifications: jest.fn(() => Promise.resolve()),
    saveRemindersSettings: jest.fn(),
    requestNotificationPermission: jest.fn(() => Promise.resolve()),
    scheduleNotifications: jest.fn(() => Promise.resolve()),
    selectedDays,
  };
});

const mockShowToast = jest.fn();

jest.mock('~/utils/useToast', () => () => ({ showToast: mockShowToast }));

describe('HeaderDoneButton', () => {
  const DEPTH = 3;
  const navigateFn = jest.fn();
  const popFn = jest.fn();

  const mockRemindersData: RemindersData = {
    useReminders: true,
    monday: true,
    tuesday: false,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
  };

  const setup = (data?: RemindersData, permissionGranted = true) => {
    (requestNotificationPermission as jest.Mock).mockResolvedValue(permissionGranted);

    const navigation = { navigate: navigateFn, pop: popFn } as Partial<
      RootNavigationProp<'LearningRemindersSettings'>
    > as RootNavigationProp<'LearningRemindersSettings'>;

    const createElement = (remindersData?: RemindersData) => {
      const route = {
        params: { remindersData, depth: DEPTH },
      } as RootRouteProp<'LearningRemindersSettings'>;

      return <HeaderDoneButton navigation={navigation} route={route} />;
    };

    const rendered = render(createElement(data));
    const { getByRole } = rendered;

    const getButton = () => getByRole('button');
    const press = () => fireEvent.press(getButton()) as unknown as Promise<void>;
    const rerenderWith = (newData: RemindersData) => rendered.rerender(createElement(newData));

    return { ...rendered, getButton, press, rerenderWith };
  };

  const itProcessesDataCorrectly = () => {
    describe('when the screen is fully initialized', () => {
      it('enables the button', () => {
        const { getButton } = setup(mockRemindersData);

        expect(getButton()).not.toBeDisabled();
      });

      describe('when the user declines to give the app permission to send notifications', () => {
        it('navigates to the permission denied screen', async () => {
          await setup(mockRemindersData, false).press();

          expect(navigateFn).toHaveBeenCalledWith('LearningRemindersPermissionRequired', {
            depth: DEPTH + 1,
          });
        });

        it('tracks that the notification permission was denied', async () => {
          await setup(mockRemindersData, false).press();

          expect(mockTrackFn).toHaveBeenCalledWith('Deny notification permission', 'Reminders');
        });

        it('does not save the settings', async () => {
          await setup(mockRemindersData, false).press();

          expect(saveRemindersSettings).not.toHaveBeenCalled();
        });
      });

      describe("when the button is pressed with 'Use reminders' switched on", () => {
        const mockData: RemindersData = { ...mockRemindersData, useReminders: true };

        it('saves the settings', async () => {
          await setup(mockData).press();

          expect(saveRemindersSettings).toHaveBeenCalledWith(mockData);
        });

        it('tracks the saved settings', async () => {
          const time = new Date(2022, 3, 4, 5, 6, 7);

          await setup({
            useReminders: true,
            monday: true,
            wednesday: false,
            thursday: true,
            time: time.valueOf(),
          }).press();

          expect(mockTrackFn).toHaveBeenCalledWith('Save reminders settings', 'Reminders', {
            enabled: true,
            days: ['monday', 'thursday'],
            reminder_time: format24HourTime(time),
          });
        });

        it('cancels pending notifications', async () => {
          await setup(mockData).press();

          expect(cancelPendingNotifications).toHaveBeenCalled();
        });

        it('schedules a notification', async () => {
          await setup(mockData).press();

          expect(scheduleNotifications).toHaveBeenCalled();
        });

        describe('when reminders were previously on', () => {
          it("displays the 'reminders updated' toast message", async () => {
            const { press, rerenderWith } = setup({ useReminders: true });

            rerenderWith(mockData);

            await press();

            expect(mockShowToast).toHaveBeenCalledWith('Reminders updated');
          });

          it('closes the screen', async () => {
            const { press, rerenderWith } = setup({ useReminders: true });

            rerenderWith(mockData);

            await press();

            expect(popFn).toHaveBeenCalledWith(DEPTH);
          });
        });

        describe('when reminders were previously off', () => {
          it('opens the success screen', async () => {
            const { press, rerenderWith } = setup({ useReminders: false });

            rerenderWith(mockData);

            await press();

            expect(navigateFn).toHaveBeenCalledWith('LearningRemindersSuccess', {
              remindersData: mockData,
              depth: DEPTH + 1,
            });
          });
        });
      });

      describe("when the button is pressed with 'Use reminders' switched off", () => {
        const mockData: RemindersData = { ...mockRemindersData, useReminders: false };

        it('saves the settings', async () => {
          await setup(mockData).press();

          expect(saveRemindersSettings).toHaveBeenCalledWith(mockData);
        });

        it('tracks the saved settings', async () => {
          const time = new Date(2022, 3, 4, 5, 6, 7);

          await setup({
            useReminders: false,
            monday: true,
            wednesday: false,
            thursday: true,
            time: time.valueOf(),
          }).press();

          expect(mockTrackFn).toHaveBeenCalledWith('Save reminders settings', 'Reminders', {
            enabled: false,
            days: ['monday', 'thursday'],
            reminder_time: format24HourTime(time),
          });
        });

        it('cancels pending notifications', async () => {
          await setup(mockData).press();

          expect(cancelPendingNotifications).toHaveBeenCalled();
        });

        it('does not schedule a notification', async () => {
          await setup(mockData).press();

          expect(scheduleNotifications).not.toHaveBeenCalled();
        });

        it('closes the screen', async () => {
          await setup(mockData).press();

          expect(popFn).toHaveBeenCalledWith(DEPTH);
        });

        describe('when reminders were previously on', () => {
          it("displays the 'reminders cancelled' toast message", async () => {
            const { press, rerenderWith } = setup({ useReminders: true });

            rerenderWith(mockData);

            await press();

            expect(mockShowToast).toHaveBeenCalledWith('Reminders cancelled');
          });
        });

        describe('when reminders were previously off', () => {
          it("does not display the 'reminders cancelled' toast message", async () => {
            const { press, rerenderWith } = setup({ useReminders: false });

            rerenderWith(mockData);

            await press();

            expect(mockShowToast).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('when the settings are still being retrieved from storage', () => {
      it('disables the button', () => {
        const { getButton } = setup(undefined);

        expect(getButton()).toBeDisabled();
      });

      it('does nothing when the button is pressed', async () => {
        await setup(undefined).press();

        expect(saveRemindersSettings).not.toHaveBeenCalled();
        expect(requestNotificationPermission).not.toHaveBeenCalled();
        expect(scheduleNotifications).not.toHaveBeenCalled();
        expect(popFn).not.toHaveBeenCalled();
      });
    });

    describe('validation', () => {
      describe('when reminders are switched off', () => {
        it('enables the button, even if no days are selected', () => {
          const { getButton } = setup({ useReminders: false });

          expect(getButton()).not.toBeDisabled();
        });
      });

      describe('when reminders are switched on but no days are selected', () => {
        it('disables the button', () => {
          const { getButton } = setup({ useReminders: true });

          expect(getButton()).toBeDisabled();
        });
      });

      describe('when reminders are switched on and at least one day is selected', () => {
        it('does not disable the button', () => {
          const { getButton } = setup({ useReminders: true, tuesday: true, thursday: true });

          expect(getButton()).not.toBeDisabled();
        });
      });
    });

    describe('when an error occurs', () => {
      const error = new Error('Uh oh');

      const setupAndPressWithError = async () => {
        jest.spyOn(console, 'error').mockImplementation();

        const { press } = setup(mockRemindersData);

        (requestNotificationPermission as jest.Mock).mockRejectedValue(error);

        await press();
      };

      it('displays a toast message', async () => {
        await setupAndPressWithError();

        expect(mockShowToast).toHaveBeenCalledWith('Something went wrong');
      });

      it('logs the error', async () => {
        await setupAndPressWithError();

        expect(console.error).toHaveBeenCalledWith(error);
      });

      it('sends the error to crashlytics', async () => {
        await setupAndPressWithError();

        expect(mockRecordError).toHaveBeenCalledWith(error);
      });
    });
  };

  describe('when the device is Android', () => {
    withOS('android');

    it('displays an icon link', () => {
      expect(setup().getByTestId('done-icon-button')).toBeTruthy();
    });

    itProcessesDataCorrectly();
  });

  describe('when the device is iOS', () => {
    withOS('ios');

    it('displays a text link', () => {
      expect(setup().getByText('Done')).toBeTruthy();
    });

    itProcessesDataCorrectly();
  });
});
