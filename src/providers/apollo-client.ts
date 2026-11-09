import { ApolloClient, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ApolloLink } from "@apollo/client";
import { clientContextHeaders } from "kadesh/utils/activity/clientContext";
import { requestErrorLink } from "kadesh/utils/activity/requestErrorLink";
import { watchPageLifecycle } from "kadesh/utils/network";
import { readSessionToken } from "kadesh/utils/sessionToken";
import { queryRetryLink } from "./queryRetryLink";
// @ts-expect-error -- apollo-upload-client no publica tipos para este subpath.
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

// Para no reportar las peticiones que el navegador corta al cerrar o salir de la página.
watchPageLifecycle();

/** App y pantalla de cada petición: el back las guarda en Actividad (y en sus errores). */
const clientContextLink = setContext((_, { headers }) => {
  if (typeof window === "undefined") return { headers };
  return { headers: { ...headers, ...clientContextHeaders() } };
});

const authLink = setContext((_, { headers }) => {
  const token = readSessionToken();
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
    // El reporte va antes que los reintentos: solo ve el error final.
    link: ApolloLink.from([
      clientContextLink,
      authLink,
      requestErrorLink,
      queryRetryLink,
      uploadLink,
    ]),
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
