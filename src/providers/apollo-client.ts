import { ApolloClient, InMemoryCache } from '@apollo/client';
// @ts-ignore
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

export const createApolloClient = () => {
  return new ApolloClient({
    link: createUploadLink({
      uri: process.env.NEXT_PUBLIC_API_URL,
      credentials: 'include',
    }),
    cache: new InMemoryCache(),
    credentials: 'include',
  });
};

const client = createApolloClient();
export default client;