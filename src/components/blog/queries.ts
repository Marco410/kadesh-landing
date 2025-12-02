import { gql } from '@apollo/client';
import { PostsQueryResponse, PostsQueryVariables, CategoriesQueryResponse, PostByUrlQueryResponse, PostByUrlQueryVariables } from './types';

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

export const GET_CATEGORIES_QUERY = gql`
  query GetCategories {
    categories {
      id
      url
      image {
        url
      }
      name
      postsCount
    }
  }
`;

export type GetCategoriesQueryResult = CategoriesQueryResponse;

export const GET_POST_BY_URL_QUERY = gql`
  query GetPostByUrl($url: String!) {
    posts(where: { url: { equals: $url } }, take: 1) {
      id
      title
      url
      excerpt
      content {
        document
      }
      image {
        url
      }
      published
      publishedAt
      createdAt
      updatedAt
      author {
        name
        profileImage {
          url
        }
      }
      category {
        name
        url
      }
      tags {
        name
      }
      commentsCount
      post_likesCount
      post_favoritesCount
    }
  }
`;

export type GetPostByUrlQueryResult = PostByUrlQueryResponse;
export type GetPostByUrlQueryVariables = PostByUrlQueryVariables;

