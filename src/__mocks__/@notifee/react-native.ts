export const { EventType } = jest.requireActual('@notifee/react-native/dist/types/Notification');
export const { AuthorizationStatus } = jest.requireActual(
  '@notifee/react-native/dist/types/Notification',
);
export const { RepeatFrequency, TriggerType } = jest.requireActual(
  '@notifee/react-native/dist/types/Trigger',
);

export default {
  cancelTriggerNotifications: jest.fn(),
  createChannel: jest.fn(),
  createTrigger: jest.fn(),
  createTriggerNotification: jest.fn(),
  getNotificationSettings: jest.fn(),
  getTriggerNotificationIds: jest.fn(),
  onBackgroundEvent: jest.fn(),
  onForegroundEvent: jest.fn(),
  requestPermission: jest.fn(),
};
