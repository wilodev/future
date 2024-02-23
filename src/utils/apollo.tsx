import React, { FunctionComponent, useContext, useMemo } from 'react';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  createHttpLink,
  from,
  InMemoryCache,
  ServerError,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { asyncMap } from '@apollo/client/utilities';
import { RetryLink } from '@apollo/client/link/retry';
import Config from 'react-native-config';

import { possibleTypes } from '../../graphql/possibleTypes.json';

import { AuthenticationTokenContext } from './AuthenticationTokenContext';

const isServerError = (error: Error): error is ServerError => 'statusCode' in error;

export const createInMemoryCache = () =>
  new InMemoryCache({
    possibleTypes,
    typePolicies: {
      CourseEnrolment: {
        fields: {
          stepProgressByStep: {
            read: (_, { args, toReference }) =>
              toReference({ __typename: 'StepProgress', step: { id: args?.stepId } }),
          },
        },
      },
      StepProgress: { keyFields: ['step', ['id']] },
    },
  });

export function withApolloProvider<T>(Component: FunctionComponent<any>) {
  return (props: T) => {
    const { discardToken, tokenPromise } = useContext(AuthenticationTokenContext);
    const localServerPort = Config.LOCAL_SERVER_GRAPHQL_API_PORT || 3000;
    const localServerAPIUrl = `http://localhost:${localServerPort}/graphql`;

    const client = useMemo(() => {
      const httpLink = createHttpLink({
        uri: Config.GRAPHQL_API_URL || localServerAPIUrl,
        headers: { 'x-futurelearn-csrfp': '1', 'x-futurelearn-client': 'mobile-app' },
      });

      const setAuthorizationHeaderLink = setContext(async () => {
        const token = await tokenPromise;
        return (
          token && {
            headers: { Authorization: `bearer ${token}` },
          }
        );
      });

      const onErrorLink = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
          graphQLErrors.map(({ message, locations, path }) =>
            console.log('[GraphQL Error] %s (location: %o, path: %o)', message, locations, path),
          );
        }
        if (networkError) {
          console.log(
            '[Network Error] %s (name: %s, status: %s)',
            networkError.message,
            networkError.name,
            isServerError(networkError) ? networkError.statusCode : 'unknown',
          );
        }
      });

      const logLink = new ApolloLink((operation, forward) => {
        if (__DEV__) {
          console.log(
            '[GraphQL]',
            operation.operationName,
            operation.getContext().confidential ? '(variables redacted)' : operation.variables,
          );
        }
        return forward(operation);
      });

      const retryLink = new RetryLink({
        delay: {
          initial: 120000,
        },
        attempts: {
          max: 10,
          retryIf: (error, operation) => !!error && operation.getContext().retry,
        },
      });

      const discardTokenLink = new ApolloLink((operation, forward) =>
        asyncMap(
          forward(operation),
          result => result,
          async error => {
            if (isServerError(error) && error.statusCode === 401) {
              await discardToken();
            }
            throw error;
          },
        ),
      );

      return new ApolloClient({
        cache: createInMemoryCache(),
        link: from([
          onErrorLink,
          discardTokenLink,
          retryLink,
          logLink,
          setAuthorizationHeaderLink,
          httpLink,
        ]),
      });
    }, [localServerAPIUrl, discardToken, tokenPromise]);

    return (
      <ApolloProvider client={client}>
        <Component {...props} />
      </ApolloProvider>
    );
  };
}
