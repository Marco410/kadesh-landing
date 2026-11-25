import { gql } from '@apollo/client';

export const PET_CHANGELOG_LIST_QUERY = gql`
  query PetChangelogList($take: Int!, $skip: Int!) {
    systemReleases(
      where: { isPublished: { equals: true }, product: { in: ["pet", "all"] } }
      orderBy: [{ releasedAt: desc }]
      take: $take
      skip: $skip
    ) {
      id
      version
      product
      title
      body
      releasedAt
    }
    systemReleasesCount(where: { isPublished: { equals: true }, product: { in: ["pet", "all"] } })
  }
`;
