import React from 'react';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import { ApolloClient, ApolloConsumer, gql } from '@apollo/client';
import { render } from '@testing-library/react-native';
import Config from 'react-native-config';

import { withApolloProvider } from './apollo';
import {
  AuthenticationTokenContext,
  AuthenticationTokenContextValue,
} from './AuthenticationTokenContext';

jest.mock('react-native-config', () => ({}));

enableFetchMocks();

describe('withApolloProvider', () => {
  class MockNetworkError extends Error {
    constructor(public statusCode = 500) {
      super('Mock network error');

      this.name = 'MockNetworkError';
    }
  }

  const logMock = jest.spyOn(console, 'log').mockImplementation();

  const setup = (authenticationTokenContext: Partial<AuthenticationTokenContextValue> = {}) => {
    const expectedData = { greeting: 'Hi Dennis' };

    fetchMock.resetMocks();
    fetchMock.mockResponse(JSON.stringify({ data: expectedData }));
    logMock.mockReset();

    let apolloClient: ApolloClient<object> | undefined;

    const consumer = () => (
      <ApolloConsumer>
        {client => {
          apolloClient = client;
          return null;
        }}
      </ApolloConsumer>
    );

    const WrappedConsumer = withApolloProvider(consumer);

    render(
      <AuthenticationTokenContext.Provider
        value={authenticationTokenContext as AuthenticationTokenContextValue}>
        <WrappedConsumer />
      </AuthenticationTokenContext.Provider>,
    );

    const executeQuery = (context: Record<string, any> = {}) =>
      apolloClient!.query({
        query: gql`
          query Greet($name: String!) {
            greeting(name: $name)
          }
        `,
        variables: {
          name: 'Bob',
        },
        context,
      });

    return { executeQuery, expectedData };
  };

  it('provides a client that can successfully execute queries', async () => {
    const { executeQuery, expectedData } = setup();

    const { data } = await executeQuery();

    expect(data).toEqual(expectedData);
  });

  describe('httpLink', () => {
    it('uses the local GraphQL endpoint', async () => {
      const { executeQuery } = setup();

      await executeQuery();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/graphql', expect.anything());
    });

    it('uses the Local Server GraphQL API PORT when configured in the environment', async () => {
      Config.LOCAL_SERVER_GRAPHQL_API_PORT = '4000';
      const { executeQuery } = setup();

      await executeQuery();

      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/graphql', expect.anything());
    });

    it('uses the GraphQL API URL when configured in the environment', async () => {
      Config.GRAPHQL_API_URL = 'https://www.dennis.example.com/graphql';

      const { executeQuery } = setup();

      await executeQuery();

      expect(fetch).toHaveBeenCalledWith(
        'https://www.dennis.example.com/graphql',
        expect.anything(),
      );
    });

    it('adds the custom XHR header to all requests', async () => {
      const { executeQuery } = setup();

      await executeQuery();

      expect(fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-futurelearn-csrfp': '1',
            'x-futurelearn-client': 'mobile-app',
          }),
        }),
      );
    });
  });

  describe('logLink', () => {
    it('logs each query sent to the server', async () => {
      const { executeQuery } = setup();

      await executeQuery();

      expect(logMock).toHaveBeenCalledWith('[GraphQL]', 'Greet', { name: 'Bob' });
    });

    it('redacts the variables in confidential queries', async () => {
      const { executeQuery } = setup();

      await executeQuery({ confidential: true });

      expect(logMock).toHaveBeenCalledWith('[GraphQL]', 'Greet', '(variables redacted)');
    });
  });

  describe('setAuthorizationHeaderLink', () => {
    it('adds an authorization header when an authentication token is available', async () => {
      const { executeQuery } = setup({ tokenPromise: Promise.resolve('sample-token') });

      await executeQuery();

      expect(fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({ authorization: 'bearer sample-token' }),
        }),
      );
    });

    it('does not add an authorization header when no authentication token is available', async () => {
      const { executeQuery } = setup({ tokenPromise: Promise.resolve(null) });

      await executeQuery();

      expect(fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.not.objectContaining({ authorization: expect.anything() }),
        }),
      );
    });
  });

  describe('onErrorLink', () => {
    describe('when the response includes GraphQL errors', () => {
      const mockGraphQLError = () => {
        const message = 'Too few biscuits';
        const locations = [{ line: 1, column: 2 }];
        const path = ['dog'];

        fetchMock.mockResponse(
          JSON.stringify({
            errors: [{ message, locations, path }],
          }),
        );

        return { message, locations, path };
      };

      it('logs the errors', async () => {
        const { executeQuery } = setup();

        const { message, locations, path } = mockGraphQLError();

        fetchMock.mockResponse(
          JSON.stringify({
            errors: [{ message, locations, path }],
          }),
        );

        try {
          await executeQuery();
        } catch {}

        expect(logMock).toHaveBeenCalledWith(
          '[GraphQL Error] %s (location: %o, path: %o)',
          message,
          locations,
          path,
        );
      });

      it('lets the errors propagate', async () => {
        const { executeQuery } = setup();

        const graphQLError = mockGraphQLError();

        try {
          await executeQuery();
        } catch (actualError: any) {
          expect(actualError.graphQLErrors).toEqual([graphQLError]);
          expect(actualError.message).toEqual(graphQLError.message);
        }
      });
    });

    describe('when a network error occurs', () => {
      it('logs the error', async () => {
        const { executeQuery } = setup();

        fetchMock.mockReject(new MockNetworkError());

        try {
          await executeQuery();
        } catch {}

        expect(logMock).toHaveBeenCalledWith(
          '[Network Error] %s (name: %s, status: %s)',
          'Mock network error',
          'MockNetworkError',
          500,
        );
      });

      it('lets the error propagate', async () => {
        const { executeQuery } = setup();

        const expectedError = new MockNetworkError();

        fetchMock.mockReject(expectedError);

        expect.hasAssertions();

        try {
          await executeQuery();
        } catch (actualError) {
          expect(actualError).toEqual(expectedError);
        }
      });
    });

    it('clears the authentication token when a 401 Unauthorized error occurs', async () => {
      const discardToken = jest.fn();

      const { executeQuery } = setup({ discardToken });

      fetchMock.mockReject(new MockNetworkError(401));

      try {
        await executeQuery();
      } catch {}

      expect(discardToken).toHaveBeenCalled();
    });

    it('does not clear the authentication token when a 403 Forbidden error occurs', async () => {
      const discardToken = jest.fn();

      const { executeQuery } = setup({ discardToken });

      fetchMock.mockReject(new MockNetworkError(403));

      try {
        await executeQuery();
      } catch {}

      expect(discardToken).not.toHaveBeenCalled();
    });
  });
});
