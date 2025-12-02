import { gql } from '@apollo/client';
import { PostsQueryResponse, PostsQueryVariables } from './types';

export const GET_POSTS_QUERY = gql`
  query GetPosts($take: Int, $skip: Int!, $where: PostWhereInput!, $orderBy: [PostOrderByInput!]!) {
    posts(take: $take, skip: $skip, where: $where, orderBy: $orderBy) {
      id
      image {
        url
      }
      author {
        name
        profileImage {
          url
        }
      }
      category {
        name
      }
      commentsCount
      content {
        document
      }
      createdAt
      excerpt
      post_favoritesCount
      post_likesCount
      publishedAt
      tags {
        name
      }
      title
      url
    }
    postsCount
  }
`;

export type GetPostsQueryResult = PostsQueryResponse;
export type GetPostsQueryVariables = PostsQueryVariables;

