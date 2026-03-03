import { gql } from "@apollo/client";

export const TECH_BUSINESS_LEADS_QUERY = gql`
  query TechBusinessLeads($where: TechBusinessLeadWhereInput!) {
    techBusinessLeads(where: $where) {
      id
      address
      businessName
      category
      city
      state
      createdAt
      estimatedValue
      firstContactDate
      nextFollowUpDate
      opportunityLevel
      phone
      pipelineStatus
      rating
      source
    }
  }
`;

export interface TechBusinessLeadsVariables {
  where: {
    salesPerson?: { id: { equals: string } };
    pipelineStatus?: { equals: string | null };
  };
}

export interface TechBusinessLeadsResponse {
  techBusinessLeads: Array<{
    id: string;
    address: string | null;
    businessName: string;
    category: string | null;
    city: string | null;
    state: string | null;
    createdAt: string;
    estimatedValue: number | null;
    firstContactDate: string | null;
    nextFollowUpDate: string | null;
    opportunityLevel: string | null;
    phone: string | null;
    pipelineStatus: string | null;
    rating: number | null;
    source: string | null;
  }>;
}

export const TECH_BUSINESS_LEAD_QUERY = gql`
  query TechBusinessLead($where: TechBusinessLeadWhereUniqueInput!) {
    techBusinessLead(where: $where) {
      id
      address
      businessName
      category
      city
      state
      createdAt
      estimatedValue
      facebook
      firstContactDate
      googleMapsUrl
      hasWebsite
      instagram
      nextFollowUpDate
      notes
      opportunityLevel
      phone
      pipelineStatus
      productOffered
      rating
      reviewCount
      source
      tiktok
      topReview1
      topReview2
      topReview3
      topReview4
      topReview5
      updatedAt
      xTwitter
    }
  }
`;

export interface TechBusinessLeadVariables {
  where: { id: string };
}

export interface TechBusinessLeadResponse {
  techBusinessLead: {
    id: string;
    address: string | null;
    businessName: string;
    category: string | null;
    city: string | null;
    state: string | null;
    createdAt: string;
    estimatedValue: number | null;
    facebook: string | null;
    firstContactDate: string | null;
    googleMapsUrl: string | null;
    hasWebsite: boolean | null;
    instagram: string | null;
    nextFollowUpDate: string | null;
    notes: string | null;
    opportunityLevel: string | null;
    phone: string | null;
    pipelineStatus: string | null;
    productOffered: string | null;
    rating: number | null;
    reviewCount: number | null;
    source: string | null;
    tiktok: string | null;
    topReview1: string | null;
    topReview2: string | null;
    topReview3: string | null;
    topReview4: string | null;
    topReview5: string | null;
    updatedAt: string | null;
    xTwitter: string | null;
  } | null;
}

export const UPDATE_TECH_BUSINESS_LEAD_MUTATION = gql`
  mutation UpdateTechBusinessLead(
    $where: TechBusinessLeadWhereUniqueInput!
    $data: TechBusinessLeadUpdateInput!
  ) {
    updateTechBusinessLead(where: $where, data: $data) {
      id
      pipelineStatus
      notes
      facebook
      instagram
      tiktok
      xTwitter
      productOffered
      hasWebsite
      updatedAt
    }
  }
`;

export interface UpdateTechBusinessLeadVariables {
  where: { id: string };
  data: {
    pipelineStatus?: string | null;
    notes?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    xTwitter?: string | null;
    productOffered?: string | null;
    hasWebsite?: boolean | null;
  };
}

export interface UpdateTechBusinessLeadMutation {
  updateTechBusinessLead: {
    id: string;
    pipelineStatus: string | null;
    notes: string | null;
    facebook: string | null;
    instagram: string | null;
    tiktok: string | null;
    xTwitter: string | null;
    productOffered: string | null;
    hasWebsite: boolean | null;
    updatedAt: string | null;
  };
}

export const TECH_SALES_ACTIVITIES_QUERY = gql`
  query TechSalesActivities($where: TechSalesActivityWhereInput!) {
    techSalesActivities(where: $where) {
      id
      activityDate
      type
      result
      comments
      createdAt
      businessLead {
        id
        businessName
      }
    }
  }
`;

export interface TechSalesActivitiesVariables {
  where: {
    AND: Array<{
      assignedSeller: { id: { equals: string } };
      businessLead: { id: { equals: string } };
    }>;
  };
}

export interface TechSalesActivitiesResponse {
  techSalesActivities: Array<{
    id: string;
    activityDate: string;
    type: string;
    result: string | null;
    comments: string | null;
    createdAt: string;
    businessLead: { id: string; businessName: string } | null;
  }>;
}

export const CREATE_TECH_SALES_ACTIVITY_MUTATION = gql`
  mutation CreateTechSalesActivity($data: TechSalesActivityCreateInput!) {
    createTechSalesActivity(data: $data) {
      id
      type
      activityDate
      result
      comments
    }
  }
`;

export interface CreateTechSalesActivityVariables {
  data: {
    type: string;
    activityDate: string;
    result?: string | null;
    comments?: string | null;
    businessLead: { connect: { id: string } };
    assignedSeller: { connect: { id: string } };
  };
}

export interface CreateTechSalesActivityMutation {
  createTechSalesActivity: {
    id: string;
    type: string;
    activityDate: string;
    result: string | null;
    comments: string | null;
  };
}
