import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  Event,
  EventType,
  AuthorizationStatus,
  NotificationSettings,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';

import { createStandaloneTrackFunction } from './analytics';
import {
  calculateTriggerTimestamp,
  cancelPendingNotifications,
  findNextDateForDayOfWeek,
  getRemindersSettings,
  saveRemindersSettings,
  requestNotificationPermission,
  scheduleNotification,
  scheduleNotifications,
  StorageKeys,
  LEARNING_REMINDER_CHANNEL,
  RemindersData,
  hasNotificationPermission,
  selectedDays,
  NotificationName,
  trackBackgroundNotificationEvents,
  trackForegroundNotificationEvents,
} from './notifications';
import { withOS } from './TestUtils';
import { lightTheme } from '~/designSystem/themes';
import { DayOfWeek } from './daysOfWeek';

jest.mock('./analytics');

describe('notifications', () => {
  const mockData = {
    useReminders: true,
    time: new Date(2021, 10, 23, 14, 30, 0).valueOf(),
    monday: true,
    tuesday: true,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  };

  type ExpectedDaysToDates = {
    day: DayOfWeek;
    index: number;
    expectedDate: Date;
  };

  const expectedDaysToDates: ExpectedDaysToDates[] = [
    {
      day: 'sunday',
      index: 0,
      expectedDate: new Date(2022, 1, 20),
    },
    {
      day: 'monday',
      index: 1,
      expectedDate: new Date(2022, 1, 21),
    },
    {
      day: 'tuesday',
      index: 2,
      expectedDate: new Date(2022, 1, 22),
    },
    {
      day: 'wednesday',
      index: 3,
      expectedDate: new Date(2022, 1, 23),
    },
    {
      day: 'thursday',
      index: 4,
      expectedDate: new Date(2022, 1, 24),
    },
    {
      day: 'friday',
      index: 5,
      expectedDate: new Date(2022, 1, 18),
    },
    {
      day: 'saturday',
      index: 6,
      expectedDate: new Date(2022, 1, 19),
    },
  ];

  describe('getRemindersSettings', () => {
    const mockGetItemValue = (value: string | null) =>
      (AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>).mockResolvedValue(
        value,
      );

    it('looks for existing settings in async storage', () => {
      getRemindersSettings();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(StorageKeys.RemindersSettings);
    });

    describe('when there are saved settings in async storage', () => {
      const SAVED_SETTINGS: RemindersData = {
        useReminders: true,
        monday: true,
        tuesday: false,
        wednesday: true,
        thursday: false,
        friday: true,
        saturday: false,
        sunday: true,
        time: new Date(2000, 0, 1, 10, 15, 0).valueOf(),
      };

      beforeEach(() => mockGetItemValue(JSON.stringify(SAVED_SETTINGS)));

      it('returns the saved settings', async () =>
        expect(await getRemindersSettings()).toEqual(SAVED_SETTINGS));
    });

    describe('when there are no saved settings in async storage', () => {
      beforeEach(() => mockGetItemValue(null));

      it('returns the default settings', async () => {
        const expectedDefaults: RemindersData = {
          useReminders: false,
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false,
          time: new Date(2000, 0, 1, 12, 0, 0).valueOf(),
        };

        expect(await getRemindersSettings()).toEqual(expectedDefaults);
      });
    });
  });

  describe('saveRemindersPreference', () => {
    it('saves the reminder settings', () => {
      saveRemindersSettings(mockData);

      expect(AsyncStorage.setItem).toBeCalledWith(
        StorageKeys.RemindersSettings,
        JSON.stringify(mockData),
      );
    });
  });

  describe('hasNotificationPermission', () => {
    const setupGetNotificationSettings = (authorizationStatus: AuthorizationStatus) =>
      jest.spyOn(notifee, 'getNotificationSettings').mockResolvedValue({
        authorizationStatus,
      } as Partial<NotificationSettings> as NotificationSettings);

    it('returns null if the user has yet to be asked to authorize notifications for the app', async () => {
      setupGetNotificationSettings(AuthorizationStatus.NOT_DETERMINED);

      expect(await hasNotificationPermission()).toBeNull();
    });

    it('returns false if the app is not authorized to raise notifications', async () => {
      setupGetNotificationSettings(AuthorizationStatus.DENIED);

      expect(await hasNotificationPermission()).toBe(false);
    });

    it('returns true if the app is fully authorized to raise notifications', async () => {
      setupGetNotificationSettings(AuthorizationStatus.AUTHORIZED);

      expect(await hasNotificationPermission()).toBe(true);
    });

    it('returns null if the app is provisionally authorized to raise only silent notifications', async () => {
      setupGetNotificationSettings(AuthorizationStatus.PROVISIONAL);

      expect(await hasNotificationPermission()).toBeNull();
    });
  });

  describe('requestNotificationPermission', () => {
    const setupRequestPermission = (authorizationStatus: AuthorizationStatus) =>
      jest.spyOn(notifee, 'requestPermission').mockResolvedValue({
        authorizationStatus,
      } as Partial<NotificationSettings> as NotificationSettings);

    it('returns null if the authorization status cannot be determined', async () => {
      setupRequestPermission(AuthorizationStatus.NOT_DETERMINED);

      expect(await requestNotificationPermission()).toBeNull();
    });

    it('returns false if the user declined to grant the app permission to raise notifications', async () => {
      setupRequestPermission(AuthorizationStatus.DENIED);

      expect(await requestNotificationPermission()).toBe(false);
    });

    it('returns true if the user agreed to grant the app permission to raise permissions', async () => {
      setupRequestPermission(AuthorizationStatus.AUTHORIZED);

      expect(await requestNotificationPermission()).toBe(true);
    });

    it('returns null if the app was provisionally granted permission to to raise only silent notifications', async () => {
      setupRequestPermission(AuthorizationStatus.PROVISIONAL);

      expect(await requestNotificationPermission()).toBeNull();
    });
  });

  describe('scheduleNotifications', () => {
    describe('when two days of the week are selected', () => {
      it('it schedules two notifications with the correct timestampts ', async () => {
        const fakeDateNow = new Date(2022, 1, 18, 9, 0, 0);
        jest.spyOn(Date, 'now').mockReturnValue(fakeDateNow.valueOf());

        const expectedTimestampMonday = new Date(2022, 1, 21, 14, 30, 0).valueOf();
        const expectedTimestampTuesday = new Date(2022, 1, 22, 14, 30, 0).valueOf();

        await scheduleNotifications(mockData);

        expect(notifee.createTriggerNotification).toHaveBeenCalledTimes(2);
        expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            timestamp: expectedTimestampMonday,
          }),
        );
        expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            timestamp: expectedTimestampTuesday,
          }),
        );
      });
    });

    describe('when there is no reminders time set', () => {
      it('does not schedule notifications', async () => {
        await scheduleNotifications({ ...mockData, time: undefined });

        expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
      });
    });

    describe('when reminders are not enabled', () => {
      it('does not schedule notifications', async () => {
        await scheduleNotifications({ ...mockData, useReminders: false });

        expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
      });
    });
  });

  describe('calculateTriggerTimestamp', () => {
    describe('when current time is earlier in the day than the learner selected time', () => {
      it("sets the notification time to reminderData time and today's date", () => {
        const selectedTime = new Date(2021, 1, 1, 14, 30, 0);
        const fakeDateNow = new Date(2021, 2, 1, 9, 0, 0);
        jest.spyOn(Date, 'now').mockReturnValue(fakeDateNow.valueOf());

        const expectedTimestamp = new Date(
          fakeDateNow.getFullYear(),
          fakeDateNow.getMonth(),
          fakeDateNow.getDate(),
          selectedTime.getHours(),
          selectedTime.getMinutes(),
          0,
        ).valueOf();

        expect(calculateTriggerTimestamp(fakeDateNow.valueOf(), selectedTime.valueOf())).toEqual(
          expectedTimestamp,
        );
      });
    });

    describe('when the current time is later in the day than the learner selected time', () => {
      it('sets the notification time to reminderData time for the same time the following week', () => {
        const selectedTime = new Date(2021, 1, 1, 14, 30, 0);
        const fakeDateNow = new Date(2021, 2, 1, 18, 0, 0);
        jest.spyOn(Date, 'now').mockReturnValue(fakeDateNow.valueOf());

        const expectedTimestamp = new Date(
          fakeDateNow.getFullYear(),
          fakeDateNow.getMonth(),
          fakeDateNow.getDate() + 7,
          selectedTime.getHours(),
          selectedTime.getMinutes(),
          0,
        ).valueOf();

        expect(calculateTriggerTimestamp(fakeDateNow.valueOf(), selectedTime.valueOf())).toEqual(
          expectedTimestamp,
        );
      });
    });

    describe('when the current time is the same as the learner selected time', () => {
      it('sets the notification time to reminderData time for the same time the following week', () => {
        const selectedTime = new Date(2021, 1, 1, 14, 30, 0);
        const fakeDateNow = new Date(2021, 2, 1, 14, 30, 0);
        jest.spyOn(Date, 'now').mockReturnValue(fakeDateNow.valueOf());

        const expectedTimestamp = new Date(
          fakeDateNow.getFullYear(),
          fakeDateNow.getMonth(),
          fakeDateNow.getDate() + 7,
          selectedTime.getHours(),
          selectedTime.getMinutes(),
          0,
        ).valueOf();

        expect(calculateTriggerTimestamp(fakeDateNow.valueOf(), selectedTime.valueOf())).toEqual(
          expectedTimestamp,
        );
      });
    });
  });

  describe('scheduleNotification', () => {
    it("calls Notifee's createChannel and createTriggerNotification methods", async () => {
      jest.spyOn(notifee, 'createChannel').mockResolvedValue('channel-id');

      const expectedTimestamp = 1234;

      await scheduleNotification(expectedTimestamp);

      expect(notifee.createChannel).toHaveBeenCalledWith(LEARNING_REMINDER_CHANNEL);

      expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'Continue learning on FutureLearn now',
          data: {
            name: NotificationName.LearningReminder,
          },
          android: {
            channelId: 'channel-id',
            pressAction: { id: 'default' },
            smallIcon: 'ic_stat_steps',
            color: lightTheme.colors.staticPink500,
          },
        }),
        {
          timestamp: expectedTimestamp,
          type: TriggerType.TIMESTAMP,
          repeatFrequency: RepeatFrequency.WEEKLY,
          alarmManager: { allowWhileIdle: true },
        },
      );
    });

    describe('on iOS', () => {
      withOS('ios');

      it('includes FutureLearn in the notification title', async () => {
        await scheduleNotifications(mockData);

        expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'FutureLearn - Learning time',
          }),
          expect.anything(),
        );
      });
    });

    describe('on Android', () => {
      withOS('android');

      it('does not include FutureLearn in the notification title', async () => {
        await scheduleNotifications(mockData);

        expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Learning time',
          }),
          expect.anything(),
        );
      });
    });
  });

  describe('cancelPendingNotifications', () => {
    it("calls Notifee's cancelPendingNotifications method with the correct trigger notification ids", async () => {
      const mockNotificationIds = ['notification-1', 'notification-2'];

      jest.spyOn(notifee, 'getTriggerNotificationIds').mockResolvedValue(mockNotificationIds);

      await cancelPendingNotifications();

      expect(notifee.cancelTriggerNotifications).toHaveBeenCalledWith(mockNotificationIds);
    });
  });

  describe('findNextDateForDayOfWeek', () => {
    it('converts dayIndex to next date', () => {
      jest.spyOn(Date, 'now').mockReturnValue(new Date(2022, 1, 18).valueOf());

      expectedDaysToDates.forEach(({ index, expectedDate }) => {
        const expectedTimestamp = expectedDate.valueOf();
        expect(findNextDateForDayOfWeek(index)).toEqual(expectedTimestamp);
      });
    });
  });

  describe('tracking', () => {
    const NOTIFICATION_NAME = 'notification-name';

    const track = jest.fn();

    const mockEvent = (type: EventType): Event => ({
      type,
      detail: { notification: { data: { name: NOTIFICATION_NAME } } },
    });

    describe('trackBackgroundNotificationEvents', () => {
      const simulateBackgroundEvent = (type: EventType) => {
        (createStandaloneTrackFunction as jest.Mock).mockReturnValue(track);

        trackBackgroundNotificationEvents();

        (
          notifee.onBackgroundEvent as jest.MockedFunction<typeof notifee.onBackgroundEvent>
        ).mock.calls[0][0](mockEvent(type));
      };

      it('tracks background DELIVERED events', () => {
        simulateBackgroundEvent(EventType.DELIVERED);

        expect(track).toHaveBeenCalledWith('Deliver notification', 'Reminders', {
          app_state: 'background',
          notification_name: NOTIFICATION_NAME,
        });
      });

      it('tracks background DISMISSED events', () => {
        simulateBackgroundEvent(EventType.DISMISSED);

        expect(track).toHaveBeenCalledWith('Dismiss notification', 'Reminders', {
          app_state: 'background',
          notification_name: NOTIFICATION_NAME,
        });
      });

      it('tracks background PRESS events', () => {
        simulateBackgroundEvent(EventType.PRESS);

        expect(track).toHaveBeenCalledWith('Press notification', 'Reminders', {
          app_state: 'background',
          notification_name: NOTIFICATION_NAME,
        });
      });

      it('does not create a track function when handling other events', () => {
        simulateBackgroundEvent(EventType.TRIGGER_NOTIFICATION_CREATED);

        expect(createStandaloneTrackFunction).not.toHaveBeenCalled();
      });
    });

    describe('trackForegroundNotificationEvents', () => {
      const simulateForegroundEvent = (type: EventType) => {
        trackForegroundNotificationEvents(track);

        (
          notifee.onForegroundEvent as jest.MockedFunction<typeof notifee.onForegroundEvent>
        ).mock.calls[0][0](mockEvent(type));
      };

      it('tracks foreground DELIVERED events', () => {
        simulateForegroundEvent(EventType.DELIVERED);

        expect(track).toHaveBeenCalledWith('Deliver notification', 'Reminders', {
          app_state: 'foreground',
          notification_name: NOTIFICATION_NAME,
        });
      });

      it('tracks foreground DISMISSED events', () => {
        simulateForegroundEvent(EventType.DISMISSED);

        expect(track).toHaveBeenCalledWith('Dismiss notification', 'Reminders', {
          app_state: 'foreground',
          notification_name: NOTIFICATION_NAME,
        });
      });

      it('tracks foreground PRESS events', () => {
        simulateForegroundEvent(EventType.PRESS);

        expect(track).toHaveBeenCalledWith('Press notification', 'Reminders', {
          app_state: 'foreground',
          notification_name: NOTIFICATION_NAME,
        });
      });

      it('does not call the track function when handling other events', () => {
        simulateForegroundEvent(EventType.TRIGGER_NOTIFICATION_CREATED);

        expect(track).not.toHaveBeenCalled();
      });
    });
  });
});

describe('selectedDays', () => {
  it('returns the days for which reminders are enabled', () => {
    expect(
      selectedDays({
        useReminders: true,
        sunday: true,
        monday: true,
        tuesday: false,
        wednesday: true,
        time: Date.now(),
      }),
    ).toEqual(['monday', 'wednesday', 'sunday']);
  });
});
