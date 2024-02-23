import { ApolloServer } from 'apollo-server';
import { addMocksToSchema, createMockStore, IMockStore } from '@graphql-tools/mock';
import { IResolvers } from '@graphql-tools/utils';
import { buildClientSchema } from 'graphql';
import * as introspectedSchema from '../graphql/introspection.json';

const PORT = process.env.LOCAL_SERVER_GRAPHQL_API_PORT;

const DEFAULT_MOCKS = {
  HTML: () => '<p>Hello <b>world</b></p>',
  ISO8601DateTime: () => new Date().toUTCString(),
  URL: () => 'https://example.com',
};

export type MockServerContext = {
  server: ApolloServer;
  mockStore: IMockStore;
};

export async function startMockServer(
  resolvers?: IResolvers | ((store: IMockStore) => IResolvers),
): Promise<MockServerContext> {
  const schema = buildClientSchema(introspectedSchema as any);

  const mockStore = createMockStore({
    schema,
    mocks: DEFAULT_MOCKS,
  });

  const server = new ApolloServer({
    schema: addMocksToSchema({ schema, store: mockStore, resolvers, preserveResolvers: true }),
  });

  await server.listen(PORT);

  return { server, mockStore };
}
