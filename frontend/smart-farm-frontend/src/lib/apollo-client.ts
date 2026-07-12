import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";

const GRAPHQL_HTTP_URL =
  import.meta.env.VITE_GRAPHQL_HTTP_URL ?? "http://localhost:3000/graphql";
const GRAPHQL_WS_URL =
  import.meta.env.VITE_GRAPHQL_WS_URL ?? "ws://localhost:3000/graphql";

// ─── Auth token ──────────────────────────────────────────────────────────────

function getAuthToken(): string | null {
  return localStorage.getItem("accessToken");
}

// ─── HTTP Link (Query/Mutation) ──────────────────────────────────────────────

const httpLink = new HttpLink({
  uri: GRAPHQL_HTTP_URL,
});

const authLink = setContext((_, { headers }) => {
  const token = getAuthToken();
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

// ─── WebSocket Link (Subscription) ────────────────────────────────────────────

const wsLink = new GraphQLWsLink(
  createClient({
    url: GRAPHQL_WS_URL,
    connectionParams: () => {
      const token = getAuthToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    shouldRetry: () => true,
    retryAttempts: 5,
  }),
);

// ─── Split: Subscription → WS, Query/Mutation → HTTP ──────────────────────────

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

// ─── Apollo Client ────────────────────────────────────────────────────────────

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Pagination bo'lgan queryler uchun (masalan adminMembers, deviceCommands)
          // kerak bo'lsa shu yerga merge funksiyalari qo'shiladi
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});
