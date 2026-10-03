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

// ─── Auth token ──────────────────────────────────────────────────────────────

function getAuthToken(): string | null {
  const token = localStorage.getItem("accessToken");
  return token && token !== "undefined" && token !== "null" ? token : null;
}

// ─── HTTP + GraphQL Upload ────────────────────────────────────────────────────

const uploadLink = createUploadLink({
  uri: GRAPHQL_HTTP_URL,
});

// ─── Auth ────────────────────────────────────────────────────────────────────

const authLink = setContext((_, { headers }) => {
  const token = getAuthToken();

  return {
    headers: {
      ...headers,

      // Apollo Server CSRF protection uchun
      "apollo-require-preflight": "true",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  };
});

// ─── WebSocket ────────────────────────────────────────────────────────────────

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

// ─── Subscription → WS
// ─── Query/Mutation → HTTP + Upload

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

// ─── Apollo Client ────────────────────────────────────────────────────────────

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
