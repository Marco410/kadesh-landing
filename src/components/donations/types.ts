/** Where the donation form was opened from (saved with the donation, for the team). */
export type DonationSource =
  | 'header'
  | 'animal'
  | 'veterinary'
  | 'blog'
  | 'blog_post'
  | 'home'
  | 'donations_page'
  | 'reunited'
  | 'event'
  | 'profile'
  | 'footer'
  | 'about'
  | 'contact';

export type DonationOpenOptions = {
  source: DonationSource;
  /** Slug of the page (animal, veterinary, post, event). */
  sourceRef?: string | null;
};

export type DonationWallEntry = {
  id: string;
  displayName: string;
  unitCount: number;
  message: string | null;
  paidAt: string;
};

export type DonationWallPage = {
  items: DonationWallEntry[];
  hasMore: boolean;
};

export type DonorRankingEntry = {
  rank: number;
  displayName: string;
  units: number;
  donations: number;
};

export type DonationSummary = {
  supporters: number;
  units: number;
  /** Paid donations whose message shows on the wall (gates the wall, `isWallReady`). */
  wallMessages: number;
};

export type DonationsBoard = {
  wall: DonationWallPage;
  rankingMonth: DonorRankingEntry[];
  rankingAllTime: DonorRankingEntry[];
  summary: DonationSummary;
};

export type StartDonationResult = {
  success: boolean;
  code: string | null;
  message: string;
  donationId: string | null;
  clientSecret: string | null;
  amountCents: number | null;
};
