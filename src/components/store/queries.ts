import { gql } from '@apollo/client';
import {
  STORE_ADDRESS_FIELDS,
  STORE_ITEM_FIELDS,
  STORE_ORDER_SUMMARY_FIELDS,
  STORE_QUOTE_FIELDS,
  STORE_REVIEW_FIELDS,
  STORE_TRANSFER_FIELDS,
} from './fields';
import type {
  CartQuote,
  PlaceOrderResult,
  StoreAddress,
  StoreCatalog,
  StoreCatalogInput,
  StoreOrderDetail,
  StoreOrderSummary,
  StoreReviews,
} from './types';

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

// ─── Cart, checkout and orders ──────────────────────────────────────────────────────────────

export type StoreCartQuoteResponse = { storeCartQuote: CartQuote };

/** What the cart costs right now. Asked when the cart opens or changes, never on a timer. */
export const STORE_CART_QUOTE_QUERY = gql`
  query StoreCartQuote($items: [StoreCartItemInput!]!) {
    storeCartQuote(items: $items) {
      ${STORE_QUOTE_FIELDS}
    }
  }
`;

export type MyStoreAddressesResponse = { myStoreAddresses: StoreAddress[] };

export const MY_STORE_ADDRESSES_QUERY = gql`
  query MyStoreAddresses {
    myStoreAddresses {
      ${STORE_ADDRESS_FIELDS}
    }
  }
`;

export type PlaceStoreOrderResponse = { placeStoreOrder: PlaceOrderResult };

export const PLACE_STORE_ORDER_MUTATION = gql`
  mutation PlaceStoreOrder($input: StorePlaceOrderInput!) {
    placeStoreOrder(input: $input) {
      success
      message
      code
      orderNumber
      totalCents
      stripeClientSecret
      sessionToken
      transfer {
        ${STORE_TRANSFER_FIELDS}
      }
      quote {
        ${STORE_QUOTE_FIELDS}
      }
    }
  }
`;

export type MyStoreOrdersResponse = { myStoreOrders: { total: number; items: StoreOrderSummary[] } };

export const MY_STORE_ORDERS_QUERY = gql`
  query MyStoreOrders($take: Int, $skip: Int) {
    myStoreOrders(take: $take, skip: $skip) {
      total
      items {
        ${STORE_ORDER_SUMMARY_FIELDS}
      }
    }
  }
`;

export type MyStoreOrderResponse = { myStoreOrder: StoreOrderDetail | null };

export const MY_STORE_ORDER_QUERY = gql`
  query MyStoreOrder($number: String!) {
    myStoreOrder(number: $number) {
      summary {
        ${STORE_ORDER_SUMMARY_FIELDS}
      }
      subtotalCents
      shippingCents
      customerNote
      cancelReason
      address {
        ${STORE_ADDRESS_FIELDS}
      }
      items {
        id
        productId
        productSlug
        name
        variantTitle
        coverUrl
        quantity
        unitPriceCents
        totalCents
      }
      shipments {
        id
        status
        statusLabel
        carrier
        trackingCode
        trackingUrl
        shippedAt
        deliveredAt
        items
      }
      timeline {
        type
        message
        createdAt
      }
      transfer {
        ${STORE_TRANSFER_FIELDS}
      }
      proofUploaded
      proofRejectedReason
      canCancel
      canPay
      returnPolicy
      supportWhatsapp
    }
  }
`;

export type StoreOrderActionResult = { success: boolean; message: string };

export const UPLOAD_STORE_TRANSFER_PROOF_MUTATION = gql`
  mutation UploadStoreTransferProof($orderNumber: String!, $file: Upload!, $reference: String) {
    uploadStoreTransferProof(orderNumber: $orderNumber, file: $file, reference: $reference) {
      success
      message
    }
  }
`;

export type ResumeStoreOrderPaymentResponse = {
  resumeStoreOrderPayment: StoreOrderActionResult & { stripeClientSecret: string | null; totalCents: number | null };
};

export const RESUME_STORE_ORDER_PAYMENT_MUTATION = gql`
  mutation ResumeStoreOrderPayment($orderNumber: String!) {
    resumeStoreOrderPayment(orderNumber: $orderNumber) {
      success
      message
      stripeClientSecret
      totalCents
    }
  }
`;

export const CANCEL_MY_STORE_ORDER_MUTATION = gql`
  mutation CancelMyStoreOrder($orderNumber: String!) {
    cancelMyStoreOrder(orderNumber: $orderNumber) {
      success
      message
    }
  }
`;
