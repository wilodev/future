import React from 'react';
import AsyncStorageMock from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import {
  AppLaunchInfoContext,
  AppLaunchInfoContextValue,
  AppLaunchInfoProvider,
  LaunchInfoContextKeys,
} from './AppLaunchInfoContext';
import { render } from '@testing-library/react-native';
import { waitForPromises } from './TestUtils';

const mockRecordError = jest.fn();

jest.mock('@react-native-firebase/crashlytics', () =>
  jest.fn(() => ({ recordError: mockRecordError })),
);

describe('AppLaunchInfoContext', () => {
  const initializeContext = () => {
    let contextValue = {} as AppLaunchInfoContextValue;

    render(
      <AppLaunchInfoProvider>
        <AppLaunchInfoContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </AppLaunchInfoContext.Consumer>
      </AppLaunchInfoProvider>,
    );

    return contextValue;
  };

  it('includes the time of launch in the launch info', async () => {
    const fakeLaunchTime = Date.now();

    jest.spyOn(Date, 'now').mockReturnValue(fakeLaunchTime);

    const { getAppLaunchInfo } = initializeContext();

    await waitForPromises();

    jest.spyOn(Date, 'now').mockReturnValue(fakeLaunchTime + 100);

    const { launchTime } = await getAppLaunchInfo();

    expect(launchTime).toEqual(fakeLaunchTime);
  });

  it('caches the app launch info', async () => {
    const { getAppLaunchInfo } = initializeContext();

    expect(await getAppLaunchInfo()).toEqual(await getAppLaunchInfo());
    expect(AsyncStorageMock.getItem).toHaveBeenCalledTimes(1);
  });

  describe('when there is already a first launch time in async storage', () => {
    const storedFirstLaunchTime = Date.now();

    beforeEach(() =>
      AsyncStorageMock.setItem(
        LaunchInfoContextKeys.FirstLaunchTime,
        JSON.stringify(storedFirstLaunchTime),
      ),
    );

    it('includes the stored first launch time in the launch info', async () => {
      const { firstLaunchTime } = await initializeContext().getAppLaunchInfo();

      expect(firstLaunchTime).toEqual(storedFirstLaunchTime);
    });
  });

  describe('when there is no first launch time in async storage', () => {
    beforeEach(() => {
      AsyncStorageMock.removeItem(LaunchInfoContextKeys.FirstLaunchTime);
    });

    it('sets `firstLaunchTime` to the time now in the launch info', async () => {
      const fakeFirstLaunchTime = Date.now();

      jest.spyOn(Date, 'now').mockReturnValue(fakeFirstLaunchTime);

      const { firstLaunchTime } = await initializeContext().getAppLaunchInfo();

      await waitForPromises();

      expect(firstLaunchTime).toEqual(fakeFirstLaunchTime);
    });

    it('saves first launch time to async storage', async () => {
      const fakeFirstLaunchTime = Date.now();

      jest.spyOn(Date, 'now').mockReturnValue(fakeFirstLaunchTime);

      await initializeContext().getAppLaunchInfo();

      expect(AsyncStorageMock.setItem).toHaveBeenLastCalledWith(
        LaunchInfoContextKeys.FirstLaunchTime,
        JSON.stringify(fakeFirstLaunchTime),
      );
    });
  });

  describe('when an error occurs getting first launch time from async storage', () => {
    const rejection = new Error('Not enough flux energy in cardinal gram-meter');

    beforeEach(() => {
      (AsyncStorageMock.getItem as jest.Mock).mockRejectedValueOnce(rejection);
      jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      (console.error as jest.Mock).mockRestore();
    });

    it('writes the error to the console', async () => {
      await initializeContext().getAppLaunchInfo();

      expect(console.error).toHaveBeenCalledWith('Unable to retrieve the first launch time', {
        rejection,
      });
    });

    it('records the error in crashlytics', async () => {
      await initializeContext().getAppLaunchInfo();

      expect(mockRecordError).toHaveBeenCalledWith(rejection);
    });

    it('sets `firstLaunchTime` to the time now', async () => {
      const fakeFirstLaunchTime = Date.now();

      jest.spyOn(Date, 'now').mockReturnValue(fakeFirstLaunchTime);

      const { firstLaunchTime } = await initializeContext().getAppLaunchInfo();

      expect(firstLaunchTime).toEqual(fakeFirstLaunchTime);
    });
  });

  describe('when an error occurs saving first launch time to async stoage', () => {
    const rejection = new Error('Dodge gears and bearings experiencing magneto-reluctance');

    beforeEach(() => {
      AsyncStorageMock.removeItem(LaunchInfoContextKeys.FirstLaunchTime);

      (AsyncStorageMock.setItem as jest.Mock).mockRejectedValueOnce(rejection);
      jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      (console.error as jest.Mock).mockRestore();
    });

    it('writes the errors to the console', async () => {
      await initializeContext().getAppLaunchInfo();

      expect(console.error).toHaveBeenCalledWith('Unable to store the first launch time', {
        rejection,
      });
    });

    it('records the error in crashlytics', async () => {
      await initializeContext().getAppLaunchInfo();

      expect(mockRecordError).toHaveBeenCalledWith(rejection);
    });
  });
});
