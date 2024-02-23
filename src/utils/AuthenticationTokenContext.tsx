import React, { createContext, FunctionComponent, useCallback, useEffect, useState } from 'react';
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';

export const TOKEN_STORAGE_KEY = 'api-authentication-token';

export enum AuthenticationTokenStatus {
  NotPresent,
  Present,
  Unknown,
}

export type AuthenticationTokenContextValue = {
  tokenPromise: Promise<string | null>;
  tokenStatus: AuthenticationTokenStatus;
  setToken(newToken: string): Promise<void>;
  discardToken(): Promise<void>;
};

export const AuthenticationTokenContext = createContext<AuthenticationTokenContextValue>(
  {} as AuthenticationTokenContextValue,
);

type AuthenticationTokenContextProviderProps = {
  initialToken?: string;
  children: React.ReactNode;
};
const tokenState = (token: string | null) => ({
  tokenPromise: Promise.resolve(token),
  tokenStatus: token ? AuthenticationTokenStatus.Present : AuthenticationTokenStatus.NotPresent,
});

export const AuthenticationTokenContextProvider: FunctionComponent<
  AuthenticationTokenContextProviderProps
> = ({ initialToken = null, children }) => {
  const [{ tokenPromise, tokenStatus }, setState] = useState(tokenState(initialToken));

  const updateState = useCallback(
    (newToken: string | null) => setState(tokenState(newToken)),
    [setState],
  );

  const discardToken = useCallback(async () => {
    await deleteItemAsync(TOKEN_STORAGE_KEY);
    updateState(null);
  }, [updateState]);

  const setToken = useCallback(
    async (newToken: string) => {
      await setItemAsync(TOKEN_STORAGE_KEY, newToken);
      updateState(newToken);
    },
    [updateState],
  );

  const getTokenFromStorage = useCallback(async () => {
    const token = await getItemAsync(TOKEN_STORAGE_KEY);
    updateState(token);
    return token;
  }, [updateState]);

  useEffect(() => {
    if (!initialToken) {
      setState({
        tokenPromise: getTokenFromStorage(),
        tokenStatus: AuthenticationTokenStatus.Unknown,
      });
    }
  }, [getTokenFromStorage, initialToken, setState]);

  return (
    <AuthenticationTokenContext.Provider
      value={{ tokenPromise, tokenStatus, discardToken, setToken }}>
      {children}
    </AuthenticationTokenContext.Provider>
  );
};

export function withAuthenticationTokenContext<T>(
  Component: FunctionComponent<any>,
  initialToken?: string,
): FunctionComponent<T> {
  return (props: T) => (
    <AuthenticationTokenContextProvider initialToken={initialToken}>
      <Component {...props} />
    </AuthenticationTokenContextProvider>
  );
}
