import React from 'react';
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';
import { act, render } from '@testing-library/react-native';

import {
  AuthenticationTokenContext,
  AuthenticationTokenContextProvider,
  AuthenticationTokenContextValue,
  AuthenticationTokenStatus,
  TOKEN_STORAGE_KEY,
} from './AuthenticationTokenContext';

jest.mock('expo-secure-store');

describe('AuthenticationTokenContext', () => {
  const SAMPLE_TOKEN = 'sample-token';

  const renderContext = ({
    initialToken,
    tokenInStorage = null,
  }: { initialToken?: string; tokenInStorage?: string | null } = {}) => {
    const result = {} as { current: AuthenticationTokenContextValue };

    (getItemAsync as jest.MockedFunction<typeof getItemAsync>).mockResolvedValueOnce(
      tokenInStorage,
    );

    render(
      <AuthenticationTokenContextProvider initialToken={initialToken}>
        <AuthenticationTokenContext.Consumer>
          {contextValue => {
            result.current = contextValue;
            return null;
          }}
        </AuthenticationTokenContext.Consumer>
      </AuthenticationTokenContextProvider>,
    );

    const waitForGetItem = async () => {
      await act(async () => {
        await result.current.tokenPromise;
      });
    };

    return { result, waitForGetItem };
  };

  describe('initialization', () => {
    describe('when no initial token has been provided', () => {
      it('initially has a token state of `Unknown`', async () => {
        const { result, waitForGetItem } = renderContext({ tokenInStorage: SAMPLE_TOKEN });

        expect(result.current.tokenStatus).toEqual(AuthenticationTokenStatus.Unknown);

        await waitForGetItem();
      });

      it('has a token promise that resolves to the result of getting the token from secure storage', async () => {
        const { result } = renderContext({ tokenInStorage: SAMPLE_TOKEN });

        await act(async () => expect(await result.current.tokenPromise).toEqual(SAMPLE_TOKEN));
      });

      describe('when a token is found in secure storage', () => {
        it('is updated to have a token state of `Present`', async () => {
          const { result, waitForGetItem } = renderContext({ tokenInStorage: SAMPLE_TOKEN });

          await waitForGetItem();

          expect(result.current.tokenStatus).toEqual(AuthenticationTokenStatus.Present);
        });
      });

      describe('when no token is found in secure storage', () => {
        it('is updated to have a token state of `NotPresent`', async () => {
          const { result, waitForGetItem } = renderContext({ tokenInStorage: null });

          await waitForGetItem();

          expect(result.current.tokenStatus).toEqual(AuthenticationTokenStatus.NotPresent);
        });
      });
    });

    describe('when an initial token has been provided for testing', () => {
      it('has a token promise that resolves to the specified token', async () => {
        const { result } = renderContext({ initialToken: SAMPLE_TOKEN });

        expect(await result.current.tokenPromise).toEqual(SAMPLE_TOKEN);
      });

      it('has a token state of `Present`', () => {
        const { result } = renderContext({ initialToken: SAMPLE_TOKEN });

        expect(result.current.tokenStatus).toEqual(AuthenticationTokenStatus.Present);
      });

      it('does not retrieve the token from secure storage', () => {
        (getItemAsync as jest.Mock).mockReset();

        renderContext({ initialToken: SAMPLE_TOKEN });

        expect(getItemAsync).not.toHaveBeenCalled();
      });
    });
  });

  describe('discardToken', () => {
    it('replaces the token promise with one that resolves to null', async () => {
      const { result } = renderContext({ initialToken: SAMPLE_TOKEN });

      await act(() => result.current.discardToken());

      expect(await result.current.tokenPromise).toBeNull();
    });

    it('sets the token status to `NotPresent`', async () => {
      const { result } = renderContext({ initialToken: SAMPLE_TOKEN });

      await act(() => result.current.discardToken());

      expect(result.current.tokenStatus).toEqual(AuthenticationTokenStatus.NotPresent);
    });

    it('deletes the token from secure storage', async () => {
      (deleteItemAsync as jest.Mock).mockReset();

      const { result } = renderContext({ initialToken: SAMPLE_TOKEN });

      await act(() => result.current.discardToken());

      expect(deleteItemAsync).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
    });
  });

  describe('setToken', () => {
    const NEW_TOKEN = 'new-token';

    it('replaces the token promise with one that resolves to the new token', async () => {
      const { result } = renderContext({ initialToken: SAMPLE_TOKEN });

      await act(() => result.current.setToken(NEW_TOKEN));

      expect(await result.current.tokenPromise).toEqual(NEW_TOKEN);
    });

    it('sets the token status to `Present`', async () => {
      const { result } = renderContext({ initialToken: SAMPLE_TOKEN });

      await act(() => result.current.setToken(NEW_TOKEN));

      expect(result.current.tokenStatus).toEqual(AuthenticationTokenStatus.Present);
    });

    it('saves the token to secure storage', async () => {
      (setItemAsync as jest.Mock).mockReset();

      const { result } = renderContext();

      await act(() => result.current.setToken(NEW_TOKEN));

      expect(setItemAsync).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, NEW_TOKEN);
    });
  });
});
