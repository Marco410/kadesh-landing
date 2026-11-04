import { ApolloClient, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ApolloLink } from "@apollo/client";
import { clientContextHeaders } from "kadesh/utils/activity/clientContext";
import { requestErrorLink } from "kadesh/utils/activity/requestErrorLink";
// @ts-ignore
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

const SESSION_TOKEN_KEY = "keystonejs-session-token";

/** App y pantalla de cada petición: el back las guarda en Actividad (y en sus errores). */
const clientContextLink = setContext((_, { headers }) => {
  if (typeof window === "undefined") return { headers };
  return { headers: { ...headers, ...clientContextHeaders() } };
});

const authLink = setContext((_, { headers }) => {
  if (typeof window === "undefined") return { headers };
  const token = window.localStorage?.getItem(SESSION_TOKEN_KEY);
  if (!token) return { headers };
  return {
    headers: {
      ...headers,
      authorization: `Bearer ${token}`,
    },
  };
});

const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  headers: {
    "apollo-require-preflight": "true",
  },
});

export const createApolloClient = () => {
  return new ApolloClient({
    link: ApolloLink.from([clientContextLink, authLink, requestErrorLink, uploadLink]),
    cache: new InMemoryCache(),
    credentials: "include",
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
      },
    },
  });
};

const client = createApolloClient();
export default client;
