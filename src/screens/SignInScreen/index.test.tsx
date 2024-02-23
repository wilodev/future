import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import {
  AuthenticationTokenContext,
  AuthenticationTokenContextValue,
} from '~/utils/AuthenticationTokenContext';
import useLargeDevice from '~/utils/useLargeDevice';

import SignInScreen from './';
import {
  UserAuthenticateDocument,
  UserAuthenticateMutation,
  UserAuthenticateMutationVariables,
} from './UserAuthenticateMutation.generated';

// import JailMonkey from 'jail-monkey';

type PartialMockedResponse = Partial<MockedResponse<UserAuthenticateMutation>>;

jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: jest.fn().mockImplementation(({ children }) => children),
}));

jest.mock('~/utils/useLargeDevice');

(useLargeDevice as jest.Mock).mockReturnValue({ isLargeDevice: false });

const tabletStyle = {
  width: 350,
};

describe('SignInScreen', () => {
  const accessibilityInfoSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');

  const SAMPLE_EMAIL = 'example@example.com';
  const SAMPLE_PASSWORD = 'sample-password';
  const SAMPLE_TOKEN = 'sample-token';

  const setup = (authenticateResponse: PartialMockedResponse = {}) => {
    const mockedResponse: MockedResponse<UserAuthenticateMutation> = {
      request: {
        query: UserAuthenticateDocument,
        variables: {
          email: SAMPLE_EMAIL,
          password: SAMPLE_PASSWORD,
        },
      },
      ...authenticateResponse,
    };

    const setTokenMock = jest.fn(() => Promise.resolve());
    const authenticationTokenContext = {
      setToken: setTokenMock,
    } as Partial<AuthenticationTokenContextValue> as AuthenticationTokenContextValue;

    const renderScreen = () =>
      render(
        <AuthenticationTokenContext.Provider value={authenticationTokenContext}>
          <MockedProvider mocks={[mockedResponse]}>
            <SignInScreen />
          </MockedProvider>
        </AuthenticationTokenContext.Provider>,
      );

    const renderAndSubmit = (
      { email, password }: UserAuthenticateMutationVariables = {
        email: SAMPLE_EMAIL,
        password: SAMPLE_PASSWORD,
      },
    ) => {
      const rendered = renderScreen();

      const { getByTestId } = rendered;

      fireEvent.changeText(getByTestId('email-input'), email);
      fireEvent.changeText(getByTestId('password-input'), password);
      fireEvent.press(getByTestId('sign-in-button'));

      return rendered;
    };

    return { renderAndSubmit, renderScreen, setTokenMock };
  };

  describe('initial state', () => {
    it('has the sign in button enabled', () => {
      const signInButton = setup().renderScreen().getByTestId('sign-in-button');

      expect(signInButton).not.toBeDisabled();
    });

    it("has the sign in button text set to 'Sign in'", () => {
      const signInButton = setup().renderScreen().getByTestId('sign-in-button');

      expect(signInButton).toHaveTextContent('Sign in');
    });
  });

  describe('validation', () => {
    it('displays a validation error if the email is not present', async () => {
      const { getByText } = setup().renderAndSubmit({ email: '', password: SAMPLE_PASSWORD });

      await waitFor(() => expect(getByText('Please enter an email.')).toBeTruthy());
    });

    it('displays a validation error if the password is not present', async () => {
      const { getByText } = setup().renderAndSubmit({ email: SAMPLE_EMAIL, password: '' });

      await waitFor(() => expect(getByText('Please enter a password.')).toBeTruthy());
    });
  });

  describe('when the user presses the sign in button and the form is valid', () => {
    it('disables the sign in button', async () => {
      const signInButton = setup({ delay: 2 }).renderAndSubmit().getByTestId('sign-in-button');

      await waitFor(() => expect(signInButton).toBeDisabled(), { interval: 1 });
    });

    it("changes the button text to 'Signing in...'", async () => {
      const signInButton = setup({ delay: 2 }).renderAndSubmit().getByTestId('sign-in-button');

      await waitFor(() => expect(signInButton).toHaveTextContent('Signing in...'), { interval: 1 });
    });
  });

  describe('when the user is authenticated successfully', () => {
    const SUCCESS_RESPONSE: PartialMockedResponse = {
      result: {
        data: {
          userAuthenticate: { token: SAMPLE_TOKEN, errors: [] },
        },
      },
    };

    it("does not change the sign in button text back to 'Sign in'", async () => {
      const signInButton = setup(SUCCESS_RESPONSE).renderAndSubmit().getByTestId('sign-in-button');

      await waitFor(() => expect(signInButton).toHaveTextContent('Signing in...'));
    });

    it('stores the token in the authentication context', async () => {
      const { renderAndSubmit, setTokenMock } = setup(SUCCESS_RESPONSE);

      renderAndSubmit();

      await waitFor(() => expect(setTokenMock).toHaveBeenCalledWith(SAMPLE_TOKEN));
    });
  });

  describe('when the user is not authenticated successfully', () => {
    const INCORRECT_CREDENTIALS_RESPONSE: PartialMockedResponse = {
      result: {
        data: {
          userAuthenticate: {
            token: null,
            errors: [{ message: 'Check your email address and password, then try again.' }],
          },
        },
      },
    };

    it('displays a message advising the user to check their email address and password', async () => {
      const { findByText } = setup(INCORRECT_CREDENTIALS_RESPONSE).renderAndSubmit();

      expect(
        await findByText('Check your email address and password, then try again.'),
      ).toBeTruthy();
    });

    it('announces the error message via the AccessibilityInfo API', async () => {
      accessibilityInfoSpy.mockReset();

      setup(INCORRECT_CREDENTIALS_RESPONSE).renderAndSubmit();

      await waitFor(() => {
        expect(accessibilityInfoSpy).toHaveBeenCalledTimes(1);
        expect(accessibilityInfoSpy).toHaveBeenCalledWith(
          expect.stringContaining('Check your email address and password'),
        );
      });
    });

    it('re-enables the sign in button', async () => {
      const signInButton = setup(INCORRECT_CREDENTIALS_RESPONSE)
        .renderAndSubmit()
        .getByTestId('sign-in-button');

      await waitFor(() => expect(signInButton).not.toBeDisabled());
    });

    it("changes the sign in button text back to 'Sign in'", async () => {
      const signInButton = setup(INCORRECT_CREDENTIALS_RESPONSE)
        .renderAndSubmit()
        .getByTestId('sign-in-button');

      await waitFor(() => expect(signInButton).toHaveTextContent('Sign in'));
    });

    it('renders the screen with full width', async () => {
      const { findByTestId } = setup().renderScreen();

      expect(await findByTestId('signin-container')).not.toHaveStyle(tabletStyle);
    });
  });

  describe('when an error occurs calling the mutation', () => {
    const ERROR_RESPONSE: PartialMockedResponse = { error: new Error('Sample error') };

    it('displays a generic error message', async () => {
      const { queryByText } = setup(ERROR_RESPONSE).renderAndSubmit();

      await waitFor(() => expect(queryByText(/Something's not right/)).toBeTruthy());
    });

    it('announces the error message via the AccessibilityInfo API', async () => {
      accessibilityInfoSpy.mockReset();

      setup(ERROR_RESPONSE).renderAndSubmit();

      await waitFor(() => {
        expect(accessibilityInfoSpy).toHaveBeenCalledTimes(1);
        expect(accessibilityInfoSpy).toHaveBeenCalledWith(
          expect.stringContaining("Something's not right"),
        );
      });
    });

    it('re-enables the sign in button', async () => {
      const signInButton = setup(ERROR_RESPONSE).renderAndSubmit().getByTestId('sign-in-button');

      await waitFor(() => expect(signInButton).not.toBeDisabled());
    });

    it("changes the sign in button text back to 'Sign in'", async () => {
      const signInButton = setup(ERROR_RESPONSE).renderAndSubmit().getByTestId('sign-in-button');

      await waitFor(() => expect(signInButton).toHaveTextContent('Sign in'));
    });
  });

  describe('when it is a large device', () => {
    beforeEach(() => {
      (useLargeDevice as jest.Mock).mockReturnValue({ isLargeDevice: true });
    });

    it('renders the screen with constrained width', async () => {
      const { findByTestId } = setup().renderScreen();

      expect(await findByTestId('signin-container')).toHaveStyle(tabletStyle);
    });
  });
});
