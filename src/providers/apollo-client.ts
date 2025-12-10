import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
// @ts-ignore
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

export const createApolloClient = () => {
  const uploadLink = createUploadLink({
    uri: process.env.NEXT_PUBLIC_API_URL,
    credentials: 'include',
  });

  // Auth link para agregar el token en los headers
  const authLink = setContext((_, { headers, operationName }) => {
    // Obtener el token del localStorage o cookie
    let token: string | null = null;
    
    if (typeof window !== 'undefined') {
      // Intentar obtener de localStorage primero
      token = localStorage.getItem('keystonejs-session-token');
      
      // Si no está en localStorage, intentar obtener de cookies
      if (!token) {
        const cookies = document.cookie.split(';');
        const sessionCookie = cookies.find(c => c.trim().startsWith('keystonejs-session='));
        if (sessionCookie) {
          token = sessionCookie.split('=')[1];
        }
      }
    }

    return {
      headers: {
        ...headers,
        'apollo-require-preflight': 'true',
        ...(operationName && { 'x-apollo-operation-name': operationName }),
        ...(token && { authorization: `Bearer ${token}` }),
      },
    };
  });

  return new ApolloClient({
    link: from([authLink, uploadLink]),
    cache: new InMemoryCache(),
    credentials: 'include',
  });
};

const client = createApolloClient();
export default client;