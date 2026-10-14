import { ApolloClient, InMemoryCache, split } from "@apollo/client";

import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";

import { createUploadLink } from "apollo-upload-client";

const GRAPHQL_HTTP_URL =
  import.meta.env.VITE_GRAPHQL_HTTP_URL ?? "http://localhost:3010/graphql";

const GRAPHQL_WS_URL =
  import.meta.env.VITE_GRAPHQL_WS_URL ?? "ws://localhost:3010/graphql";

function getAuthToken(): string | null {
  const token = localStorage.getItem("accessToken");
  return token && token !== "undefined" && token !== "null" ? token : null;
}

const uploadLink = createUploadLink({
  uri: GRAPHQL_HTTP_URL,
});

const authLink = setContext((_, { headers }) => {
  const token = getAuthToken();

  return {
    headers: {
      ...headers,

      "apollo-require-preflight": "true",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: GRAPHQL_WS_URL,

    connectionParams: () => {
      const token = getAuthToken();

      return token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};
    },

    shouldRetry: () => true,
    retryAttempts: 5,
  }),
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);

    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(uploadLink),
);

export const apolloClient = new ApolloClient({
  link: splitLink,

  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {},
      },
    },
  }),

  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});
