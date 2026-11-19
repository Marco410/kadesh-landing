import { gql } from '@apollo/client';
import { STORE_ITEM_FIELDS, STORE_REVIEW_FIELDS } from './fields';
import type { StoreCatalog, StoreCatalogInput, StoreReviews } from './types';

/** Store operations that run in the browser: «Ver más», reviews with session, wishlist. */

export type StoreCatalogResponse = { storeCatalog: StoreCatalog };
export type StoreCatalogVariables = { input: StoreCatalogInput };

export const STORE_CATALOG_QUERY = gql`
  query StoreCatalogMore($input: StoreCatalogInput) {
    storeCatalog(input: $input) {
      total
      items { ${STORE_ITEM_FIELDS} }
    }
  }
`;

export type StoreReviewsResponse = { storeCatalogReviews: StoreReviews };
export type StoreReviewsVariables = { productId: string; take: number; skip: number };

/** With a session it also brings the caller's own review (`mine`). */
export const STORE_REVIEWS_QUERY = gql`
  query StoreProductReviewsList($productId: ID!, $take: Int, $skip: Int) {
    storeCatalogReviews(productId: $productId, take: $take, skip: $skip) {
      total
      items { ${STORE_REVIEW_FIELDS} }
      mine { ${STORE_REVIEW_FIELDS} }
    }
  }
`;

export type StoreReviewResult = {
  success: boolean;
  message: string;
  reviewId: string | null;
  ratingAverage: number | null;
  ratingCount: number | null;
};

export const SUBMIT_STORE_REVIEW_MUTATION = gql`
  mutation SubmitStoreProductReview($input: StoreProductReviewInput!) {
    submitStoreProductReview(input: $input) {
      success
      message
      reviewId
      ratingAverage
      ratingCount
    }
  }
`;

export const DELETE_STORE_REVIEW_MUTATION = gql`
  mutation DeleteMyStoreProductReview($productId: ID!) {
    deleteMyStoreProductReview(productId: $productId) {
      success
      message
      reviewId
      ratingAverage
      ratingCount
    }
  }
`;

export type MyStoreWishlistIdsResponse = { myStoreWishlistIds: string[] };

/** Every saved product id in one query: paints the hearts of a whole grid. */
export const MY_STORE_WISHLIST_IDS_QUERY = gql`
  query MyStoreWishlistIds {
    myStoreWishlistIds
  }
`;

export type MyStoreWishlistResponse = { myStoreWishlist: StoreCatalog };

export const MY_STORE_WISHLIST_QUERY = gql`
  query MyStoreWishlist($take: Int, $skip: Int) {
    myStoreWishlist(take: $take, skip: $skip) {
      total
      items { ${STORE_ITEM_FIELDS} }
    }
  }
`;

export type SetStoreWishlistResponse = {
  setStoreWishlist: { success: boolean; message: string; saved: boolean };
};

export const SET_STORE_WISHLIST_MUTATION = gql`
  mutation SetStoreWishlist($productId: ID!, $saved: Boolean!) {
    setStoreWishlist(productId: $productId, saved: $saved) {
      success
      message
      saved
    }
  }
`;
