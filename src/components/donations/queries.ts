import { gql } from '@apollo/client';

/** Starts a donation and answers the client secret to confirm with Stripe Elements. */
export const START_DONATION_MUTATION = gql`
  mutation StartDonation($input: StartDonationInput!) {
    startDonation(input: $input) {
      success
      code
      message
      donationId
      clientSecret
      amountCents
    }
  }
`;

/**
 * Right after paying: asks the back to check the payment with Stripe so the donation counts
 * without waiting for the webhook. `true` when it is paid.
 */
export const SETTLE_DONATION_MUTATION = gql`
  mutation SettleDonation($donationId: ID!) {
    settleDonation(donationId: $donationId)
  }
`;

/** «Ver más» of the wall (the first page comes from the server). */
export const DONATION_WALL_QUERY = gql`
  query DonationWall($take: Int, $skip: Int) {
    donationWall(take: $take, skip: $skip) {
      items {
        id
        displayName
        unitCount
        message
        paidAt
      }
      hasMore
    }
  }
`;
