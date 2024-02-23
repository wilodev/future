import Detox from 'detox';

export const launchAppSetup = (launchOptions?: Detox.DeviceLaunchAppConfig, skipSignIn = true) =>
  Detox.device.launchApp({
    launchArgs: {
      suppressRemindersPrompt: true,
      ...(skipSignIn && { authenticationToken: 'fake-token' }),
    },
    ...launchOptions,
  });

export const isIOS = () => Detox.device.getPlatform() === 'ios';
