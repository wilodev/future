import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  Event,
  EventType,
  AuthorizationStatus,
  NotificationSettings,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

import { lightTheme } from '~/designSystem/themes';

import { createStandaloneTrackFunction, TrackFunction } from './analytics';
import { DayOfWeek, daysOfWeekStartingMonday, DAYS_OF_WEEK } from './daysOfWeek';
import { isIOS } from './platform';

export type RemindersData = {
  useReminders?: boolean;
  time?: number;
} & Partial<Record<DayOfWeek, boolean>>;

export enum StorageKeys {
  RemindersSettings = 'remindersSettings',
}

export const LEARNING_REMINDER_CHANNEL = {
  id: 'learning-reminders',
  name: 'Learning reminders',
} as const;

export const NotificationName = {
  LearningReminder: 'learning_reminder',
} as const;

export const cancelPendingNotifications = async () => {
  const pendingNotificationsIds = await notifee.getTriggerNotificationIds();

  notifee.cancelTriggerNotifications(pendingNotificationsIds);
};

export const getRemindersSettings = async (): Promise<RemindersData> => {
  const data = await AsyncStorage.getItem(StorageKeys.RemindersSettings);
  return data
    ? JSON.parse(data)
    : {
        useReminders: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
        time: new Date(2000, 0, 1, 12).valueOf(),
      };
};

export const saveRemindersSettings = (remindersData: RemindersData) =>
  AsyncStorage.setItem(StorageKeys.RemindersSettings, JSON.stringify(remindersData));

export const hasNotificationPermission = async () =>
  convertAuthorizationStatus(await notifee.getNotificationSettings());

export const requestNotificationPermission = async () =>
  convertAuthorizationStatus(await notifee.requestPermission());

export const scheduleNotifications = async (remindersData: RemindersData) => {
  const { time, useReminders } = remindersData;

  if (!time || !useReminders) {
    return;
  }

  DAYS_OF_WEEK.forEach((day, dayIndex) => {
    if (remindersData[day]) {
      const dayToSendOn = findNextDateForDayOfWeek(dayIndex);
      const timestamp = calculateTriggerTimestamp(dayToSendOn, time);

      scheduleNotification(timestamp);
    }
  });
};

export const scheduleNotification = async (timestamp: number) => {
  const channelId = await notifee.createChannel(LEARNING_REMINDER_CHANNEL);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: timestamp,
    repeatFrequency: RepeatFrequency.WEEKLY,
    alarmManager: { allowWhileIdle: true },
  };

  await notifee.createTriggerNotification(
    {
      title: isIOS() ? 'FutureLearn - Learning time' : 'Learning time',
      body: 'Continue learning on FutureLearn now',
      data: {
        name: NotificationName.LearningReminder,
      },
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
        smallIcon: 'ic_stat_steps',
        color: lightTheme.colors.staticPink500,
      },
    },
    trigger,
  );
};

export const selectedDays = (remindersData: RemindersData) =>
  daysOfWeekStartingMonday().filter(key => remindersData[key]);

export const calculateTriggerTimestamp = (day: number, time: number) => {
  const date = new Date(day);
  const reminderTime = new Date(time);
  const SEVEN_DAYS = 7;

  date.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0);

  if (date.valueOf() <= Date.now()) {
    date.setDate(date.getDate() + SEVEN_DAYS);
  }

  return date.valueOf();
};

export const findNextDateForDayOfWeek = (dayOfWeekAsIndex: number) => {
  const day = new Date(Date.now());
  day.setDate(day.getDate() + ((7 + dayOfWeekAsIndex - day.getDay()) % 7));
  return day.valueOf();
};

const convertAuthorizationStatus = (settings: NotificationSettings) => {
  switch (settings.authorizationStatus) {
    case AuthorizationStatus.AUTHORIZED:
      return true;
    case AuthorizationStatus.DENIED:
      return false;
    default:
      return null;
  }
};

export const trackBackgroundNotificationEvents = () =>
  notifee.onBackgroundEvent(event =>
    trackNotificationEvent(
      (...args) => createStandaloneTrackFunction()(...args),
      'background',
      event,
    ),
  );

export const trackForegroundNotificationEvents = (track: TrackFunction) =>
  notifee.onForegroundEvent(event => trackNotificationEvent(track, 'foreground', event));

const trackNotificationEvent = async (
  track: TrackFunction,
  appState: 'background' | 'foreground',
  { type, detail: { notification } }: Event,
) => {
  const trackEvent = (eventName: string) =>
    track(eventName, 'Reminders', {
      app_state: appState,
      notification_name: notification?.data?.name,
    });

  switch (type) {
    case EventType.DELIVERED:
      return trackEvent('Deliver notification');
    case EventType.DISMISSED:
      return trackEvent('Dismiss notification');
    case EventType.PRESS:
      return trackEvent('Press notification');
  }
};
