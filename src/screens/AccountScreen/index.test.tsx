import React from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { fireEvent, render } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { RootNavigationProp } from '~/navigators/RootNavigationStack';
import {
  AuthenticationTokenContext,
  AuthenticationTokenContextValue,
} from '~/utils/AuthenticationTokenContext';

import AccountScreen from '.';
import { UserProfileDocument } from './UserProfileQuery.generated';
import { ENV } from '~/config/env';

const PRIVACY_POLICY_URL = ENV.PRIVACY_POLICY_URL;
const TERMS_URL = ENV.TERMS_URL;
const CONTACT_US_URL = ENV.CONTACT_US_URL;

jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(() => 1),
  getBuildNumber: jest.fn(() => 1),
}));

const mockTrackFn = jest.fn();

jest.mock('~/utils/analytics', () => ({
  useAnalytics: () => ({ track: mockTrackFn }),
}));

describe('ProfileScreen', () => {
  const defaultApolloResponse: MockedResponse = {
    request: {
      query: UserProfileDocument,
    },
    result: {
      data: {
        currentUser: { id: 1, email: 'example@example.com' },
      },
    },
  };

  const setup = (apolloResponse = defaultApolloResponse) => {
    const discardTokenFn = jest.fn();
    const authenticationTokenContext = {
      discardToken: discardTokenFn,
    } as Partial<AuthenticationTokenContextValue> as AuthenticationTokenContextValue;

    const navigateFn = jest.fn();
    const navigation = {
      navigate: navigateFn,
    } as Partial<RootNavigationProp<'Account'>> as RootNavigationProp<'Account'>;

    const renderScreen = () => {
      const renderResult = render(
        <MockedProvider mocks={[apolloResponse]}>
          <AuthenticationTokenContext.Provider value={authenticationTokenContext}>
            <AccountScreen navigation={navigation} />
          </AuthenticationTokenContext.Provider>
        </MockedProvider>,
      );

      const waitForData = () => renderResult.findByText('Signed in as example@example.com');

      return { ...renderResult, waitForData };
    };

    return { renderScreen, discardTokenFn, navigateFn };
  };

  describe('when the query is running', () => {
    it('renders the loading message', async () => {
      const { queryByTestId, waitForData } = setup().renderScreen();

      expect(queryByTestId('loading-indicator')).toBeTruthy();

      await waitForData();

      expect(queryByTestId('loading-indicator')).toBeNull();
    });
  });

  describe('when the query completes', () => {
    it('renders the user email', async () => {
      expect(
        await setup().renderScreen().findByText('Signed in as example@example.com'),
      ).toBeTruthy();
    });
  });

  describe('when the query fails', () => {
    it('renders an error message', async () => {
      const { findByText } = setup({
        request: {
          query: UserProfileDocument,
        },
        error: new Error('Sample error'),
      }).renderScreen();

      expect(await findByText('Something went wrong')).toBeTruthy();
    });
  });

  describe('when the sign out button is pressed', () => {
    it('signs the user out', async () => {
      const { renderScreen, discardTokenFn } = setup();

      const { getByText, waitForData } = renderScreen();

      fireEvent.press(getByText('Sign out'));

      expect(discardTokenFn).toHaveBeenCalled();

      await waitForData();
    });
  });

  describe('when Terms and conditions is pressed', () => {
    it('navigates to browser', async () => {
      const openURLspy = jest.spyOn(Linking, 'openURL');

      const { getByText, waitForData } = setup().renderScreen();

      fireEvent.press(getByText('Terms and conditions'));

      expect(openURLspy).toHaveBeenCalledWith(TERMS_URL);

      await waitForData();
    });
  });

  describe('when Contact us is pressed', () => {
    it('navigates to browser', async () => {
      const openURLspy = jest.spyOn(Linking, 'openURL');

      const { getByText, waitForData } = setup().renderScreen();

      fireEvent.press(getByText('Contact us'));

      expect(openURLspy).toHaveBeenCalledWith(CONTACT_US_URL);

      await waitForData();
    });
  });

  describe('when privacy policy is pressed', () => {
    it('navigates to browser', async () => {
      const openURLspy = jest.spyOn(Linking, 'openURL');

      const { getByText, waitForData } = setup().renderScreen();

      fireEvent.press(getByText('Privacy policy'));

      expect(openURLspy).toHaveBeenCalledWith(PRIVACY_POLICY_URL);

      await waitForData();
    });
  });

  describe('when learning reminders item is pressed', () => {
    it('opens the learning reminders settings screen', async () => {
      const { navigateFn, renderScreen } = setup();

      const { getByText, waitForData } = renderScreen();

      fireEvent.press(getByText('Learning reminders'));

      expect(navigateFn).toHaveBeenCalledWith('LearningRemindersSettings', {});

      await waitForData();
    });

    it('tracks that the learning reminders screen has been opened', async () => {
      const { getByText, waitForData } = setup().renderScreen();

      fireEvent.press(getByText('Learning reminders'));

      expect(mockTrackFn).toHaveBeenCalledWith('Open reminders settings', 'Reminders', {
        source: 'Account',
      });

      await waitForData();
    });
  });
});
