import React, { createContext, FunctionComponent, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';

export type AppLaunchInfo = {
  launchTime: number;
  firstLaunchTime: number;
};

export type AppLaunchInfoContextValue = {
  getAppLaunchInfo(): Promise<AppLaunchInfo>;
};

export const AppLaunchInfoContext = createContext({} as AppLaunchInfoContextValue);

export enum LaunchInfoContextKeys {
  FirstLaunchTime = 'first-launch-time',
}

export const AppLaunchInfoProvider: FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  const initialize = async (): Promise<AppLaunchInfo> => {
    let firstLaunchTime;

    const storedFirstLaunchTime = await AsyncStorage.getItem(
      LaunchInfoContextKeys.FirstLaunchTime,
    ).catch(rejection => {
      console.error('Unable to retrieve the first launch time', { rejection });
      crashlytics().recordError(rejection);
    });

    if (storedFirstLaunchTime) {
      firstLaunchTime = JSON.parse(storedFirstLaunchTime);
    } else {
      firstLaunchTime = Date.now();

      await AsyncStorage.setItem(
        LaunchInfoContextKeys.FirstLaunchTime,
        JSON.stringify(firstLaunchTime),
      ).catch(rejection => {
        console.error('Unable to store the first launch time', { rejection });
        crashlytics().recordError(rejection);
      });
    }

    return {
      launchTime: Date.now(),
      firstLaunchTime,
    };
  };

  const launchInfoPromise = useMemo(() => initialize(), []);

  return (
    <AppLaunchInfoContext.Provider value={{ getAppLaunchInfo: () => launchInfoPromise }}>
      {children}
    </AppLaunchInfoContext.Provider>
  );
};

export const withAppLaunchInfo =
  <T extends React.JSX.IntrinsicAttributes>(Component: FunctionComponent<T>) =>
  (props: T) => (
    <AppLaunchInfoProvider>
      <Component {...props} />
    </AppLaunchInfoProvider>
  );
