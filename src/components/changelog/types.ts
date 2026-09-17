export interface SystemRelease {
  id: string;
  version: string;
  product: string;
  title: string | null;
  body: string | null;
  releasedAt: string;
}

export interface PetChangelogListResponse {
  systemReleases: SystemRelease[];
  systemReleasesCount: number;
}

export interface PetChangelogListVariables {
  take: number;
  skip: number;
}
