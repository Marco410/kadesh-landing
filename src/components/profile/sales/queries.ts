import { gql } from "@apollo/client";

export const USER_COMPANY_CATEGORIES_QUERY = gql`
  query UserCompanyCategories($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      salesComission
      company {
        id
        allowedGooglePlaceCategories
        subscriptions {
          id
          activeInStripe
          activatedAt
          planCost
          planCurrency
          planFrequency
          planLeadLimit
          planName
          status
          stripeCustomerId
          stripeSubscriptionId
          currentPeriodEnd
        }
      }
    }
  }
`;

export interface UserCompanyCategoriesVariables {
  where: { id: string };
}

export interface UserCompanyCategoriesResponse {
  user: {
    id: string;
    salesComission: number;
    company: {
      id: string;
      allowedGooglePlaceCategories: string[];
      subscriptions: Subscription[] | null;
    } | null;
  } | null;
}

export interface Subscription {
  id: string;
  activeInStripe: boolean;
  activatedAt: string;
  planCost: number;
  planCurrency: string;
  planFrequency: string;
  planLeadLimit: number;
  planName: string;
  status: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodEnd: string;
}

export const TECH_BUSINESS_LEADS_QUERY = gql`
  query TechBusinessLeads(
    $where: TechBusinessLeadWhereInput!
    $take: Int
    $skip: Int
    $statusWhere: TechStatusBusinessLeadWhereInput
    $salesPersonWhere2: UserWhereInput!
  ) {
    techBusinessLeads(where: $where, take: $take, skip: $skip) {
      id
      address
      businessName
      category
      city
      state
      country
      createdAt
      phone
      rating
      source
      salesPerson(where: $salesPersonWhere2) {
        id
        name
        lastName
      }
      status(where: $statusWhere) {
        id
        estimatedValue
        firstContactDate
        nextFollowUpDate
        opportunityLevel
        pipelineStatus
        salesPerson {
          id
          name
          lastName
        }
        saasCompany {
          id
          name
        }
      }
    }
  }
`;

/** Filtro para la relación status (solo devolver el status de esta company/vendedor). */
export interface TechStatusBusinessLeadWhereInputFilter {
  AND?: Array<{
    salesPerson?: { id: { equals: string } };
    saasCompany?: { id: { equals: string } };
  }>;
  salesPerson?: { id: { equals: string } };
  saasCompany?: { id: { equals: string } };
}

export interface TechBusinessLeadsVariables {
  where: {
    id?: { equals: string };
    salesPerson?: { some: { id: { equals: string } } };
    saasCompany?: { some: { id: { equals: string } } };
    status?: {
      pipelineStatus?: { equals: string | null };
      some?: {
        AND?: Array<{
          salesPerson?: { id: { equals: string } };
          saasCompany?: { id: { equals: string } };
          pipelineStatus?: { equals: string | null };
        }>;
        salesPerson?: { id: { equals: string } };
        saasCompany?: { id: { equals: string } };
      };
    };
    category?: { equals: string } | { in: string[] };
    businessName?: { contains: string; mode?: "insensitive" };
  };
  /** Filtro aplicado a la relación status: solo se devuelven status que coincidan (company + opcionalmente salesPerson). */
  statusWhere?: TechStatusBusinessLeadWhereInputFilter | null;
  salesPersonWhere2?: UserWhereInput | null;
    take?: number;
    skip?: number;
  }

  export interface UserWhereInput {
    company?: { id: { equals: string } };
  }

export interface TechBusinessLeadsResponse {
  techBusinessLeads: Array<{
    id: string;
    address: string | null;
    businessName: string;
    category: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    createdAt: string;
    phone: string | null;
    rating: number | null;
    source: string | null;
    salesPerson: Array<{
      id: string;
      name: string;
      lastName: string;
    }> | null;
    status: Array<{
      id: string;
      estimatedValue: number | null;
      firstContactDate: string | null;
      nextFollowUpDate: string | null;
      opportunityLevel: string | null;
      pipelineStatus: string | null;
      salesPerson: {
        id: string;
        name: string;
        lastName: string;
      } | null;
      saasCompany: {
        id: string;
        name: string;
      } | null;
    }> | null;
  }>;
}

/** Query para obtener un lead por id filtrando por acceso (salesPerson + saasCompany en status). Usar take: 1. */
export const TECH_BUSINESS_LEAD_ACCESSIBLE_QUERY = gql`
  query TechBusinessLeadAccessible($where: TechBusinessLeadWhereInput!, $take: Int) {
    techBusinessLeads(where: $where, take: $take) {
      id
      address
      businessName
      category
      city
      state
      country
      createdAt
      facebook
      googleMapsUrl
      hasWebsite
      instagram
      websiteUrl
      phone
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
      status {
        id
        estimatedValue
        firstContactDate
        nextFollowUpDate
        notes
        opportunityLevel
        pipelineStatus
        productOffered
        salesPerson {
          id
          name
        }
        saasCompany {
          id
          name
        }
      }
    }
  }
`;

export interface TechBusinessLeadAccessibleVariables {
  where: TechBusinessLeadsVariables["where"];
  take?: number;
}

export interface TechBusinessLeadAccessibleResponse {
  techBusinessLeads: Array<{
    id: string;
    address: string | null;
    businessName: string;
    category: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    createdAt: string;
    facebook: string | null;
    googleMapsUrl: string | null;
    hasWebsite: boolean | null;
    instagram: string | null;
    websiteUrl: string | null;
    phone: string | null;
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
    status: {
      id: string;
      estimatedValue: number | null;
      firstContactDate: string | null;
      nextFollowUpDate: string | null;
      notes: string | null;
      opportunityLevel: string | null;
      pipelineStatus: string | null;
      productOffered: string | null;
      salesPerson: { id: string; name: string } | null;
      saasCompany: { id: string; name: string } | null;
    } | null;
  }>;
}

export const TECH_BUSINESS_LEADS_COUNT_QUERY = gql`
  query TechBusinessLeadsCount($where: TechBusinessLeadWhereInput!) {
    techBusinessLeadsCount(where: $where)
  }
`;

export interface TechBusinessLeadsCountVariables {
  where: {
    id?: { equals: string };
    salesPerson?: { some: { id: { equals: string } } };
    saasCompany?: { some: { id: { equals: string } } };
    status?: {
      pipelineStatus?: { equals: string | null };
      firstContactDate?: { not: null } | null;
      some?: {
        AND?: Array<{
          salesPerson?: { id: { equals: string } };
          saasCompany?: { id: { equals: string } };
          pipelineStatus?: { equals: string | null };
        }>;
        salesPerson?: { id: { equals: string } };
        saasCompany?: { id: { equals: string } };
      };
    };
    category?: { equals: string } | { in: string[] };
    businessName?: { contains: string; mode?: "insensitive" };
  };
}

export interface TechBusinessLeadsCountResponse {
  techBusinessLeadsCount: number;
}

export const TECH_BUSINESS_LEAD_QUERY = gql`
  query TechBusinessLead(
    $where: TechBusinessLeadWhereUniqueInput!
    $statusWhere: TechStatusBusinessLeadWhereInput
  ) {
    techBusinessLead(where: $where) {
      id
      address
      businessName
      category
      city
      state
      createdAt
      facebook
      googleMapsUrl
      hasWebsite
      instagram
      websiteUrl
      phone
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
      status(where: $statusWhere) {
        id
        estimatedValue
        firstContactDate
        nextFollowUpDate
        notes
        opportunityLevel
        pipelineStatus
        productOffered
        salesPerson {
          id
          name
        }
        saasCompany {
          id
          name
        }
      }
    }
  }
`;

export interface TechBusinessLeadVariables {
  where: { id: string };
  /** Filtro para la relación status: solo devolver el de esta company (y vendedor si no es admin). */
  statusWhere?: TechStatusBusinessLeadWhereInputFilter | null;
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
    facebook: string | null;
    googleMapsUrl: string | null;
    hasWebsite: boolean | null;
    instagram: string | null;
    websiteUrl: string | null;
    phone: string | null;
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
    status: Array<{
      id: string;
      estimatedValue: number | null;
      firstContactDate: string | null;
      nextFollowUpDate: string | null;
      notes: string | null;
      opportunityLevel: string | null;
      pipelineStatus: string | null;
      productOffered: string | null;
      salesPerson: {
        id: string;
        name: string;
      } | null;
      saasCompany: {
        id: string;
        name: string;
      } | null;
    }> | null;
  } | null;
}

export const UPDATE_TECH_BUSINESS_LEAD_MUTATION = gql`
  mutation UpdateTechBusinessLead(
    $where: TechBusinessLeadWhereUniqueInput!
    $data: TechBusinessLeadUpdateInput!
  ) {
    updateTechBusinessLead(where: $where, data: $data) {
      id
      facebook
      instagram
      tiktok
      xTwitter
      hasWebsite
      updatedAt
    }
  }
`;

export interface UpdateTechBusinessLeadVariables {
  where: { id: string };
  data: {
    facebook?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    xTwitter?: string | null;
    hasWebsite?: boolean | null;
    websiteUrl?: string | null;
    salesPerson?: { connect: Array<{ id: string }> };
  };
}

export interface UpdateTechBusinessLeadMutation {
  updateTechBusinessLead: {
    id: string;
    facebook: string | null;
    instagram: string | null;
    tiktok: string | null;
    xTwitter: string | null;
    hasWebsite: boolean | null;
    updatedAt: string | null;
  };
}

/** Campos que viven en TechStatusBusinessLead (relación 1:1 con TechBusinessLead). */
export const UPDATE_TECH_STATUS_BUSINESS_LEAD_MUTATION = gql`
  mutation UpdateTechStatusBusinessLead(
    $where: TechStatusBusinessLeadWhereUniqueInput!
    $data: TechStatusBusinessLeadUpdateInput!
  ) {
    updateTechStatusBusinessLead(where: $where, data: $data) {
      id
      estimatedValue
      firstContactDate
      nextFollowUpDate
      notes
      opportunityLevel
      pipelineStatus
      productOffered
    }
  }
`;

export interface UpdateTechStatusBusinessLeadVariables {
  where: { id: string };
  data: {
    estimatedValue?: number | null;
    firstContactDate?: string | null;
    nextFollowUpDate?: string | null;
    notes?: string | null;
    opportunityLevel?: string | null;
    pipelineStatus?: string | null;
    productOffered?: string | null;
    salesPerson?: { connect: { id: string } };
    saasCompany?: { connect: { id: string } };
  };
}

export interface UpdateTechStatusBusinessLeadMutation {
  updateTechStatusBusinessLead: {
    id: string;
    estimatedValue: number | null;
    firstContactDate: string | null;
    nextFollowUpDate: string | null;
    notes: string | null;
    opportunityLevel: string | null;
    pipelineStatus: string | null;
    productOffered: string | null;
  };
}

export const CREATE_TECH_STATUS_BUSINESS_LEAD_MUTATION = gql`
  mutation CreateTechStatusBusinessLead($data: TechStatusBusinessLeadCreateInput!) {
    createTechStatusBusinessLead(data: $data) {
      id
      estimatedValue
      firstContactDate
      nextFollowUpDate
      notes
      opportunityLevel
      pipelineStatus
      productOffered
    }
  }
`;

export interface CreateTechStatusBusinessLeadVariables {
  data: {
    businessLead: { connect: { id: string } };
    estimatedValue?: number | null;
    firstContactDate?: string | null;
    nextFollowUpDate?: string | null;
    notes?: string | null;
    opportunityLevel?: string | null;
    pipelineStatus?: string | null;
    productOffered?: string | null;
    salesPerson?: { connect: { id: string } };
    saasCompany?: { connect: { id: string } };
  };
}

export interface CreateTechStatusBusinessLeadMutation {
  createTechStatusBusinessLead: {
    id: string;
    estimatedValue: number | null;
    firstContactDate: string | null;
    nextFollowUpDate: string | null;
    notes: string | null;
    opportunityLevel: string | null;
    pipelineStatus: string | null;
    productOffered: string | null;
  };
}

export const TECH_SALES_ACTIVITIES_COUNT_QUERY = gql`
  query TechSalesActivitiesCount($where: TechSalesActivityWhereInput!) {
    techSalesActivitiesCount(where: $where)
  }
`;

export interface TechSalesActivitiesCountResponse {
  techSalesActivitiesCount: number;
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

export const TECH_SALES_ACTIVITY_QUERY = gql`
  query TechSalesActivity($where: TechSalesActivityWhereUniqueInput!) {
    techSalesActivity(where: $where) {
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

export interface TechSalesActivityVariables {
  where: { id: string };
}

export interface TechSalesActivityResponse {
  techSalesActivity: {
    id: string;
    activityDate: string;
    type: string;
    result: string | null;
    comments: string | null;
    createdAt: string;
    businessLead: { id: string; businessName: string } | null;
  } | null;
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

// --- TechProposal ---

export const TECH_PROPOSALS_QUERY = gql`
  query TechProposals($where: TechProposalWhereInput!) {
    techProposals(where: $where) {
      id
      sentDate
      amount
      status
      fileOrUrl
      createdAt
      updatedAt
      businessLead {
        id
        businessName
      }
    }
  }
`;

export const TECH_PROPOSALS_COUNT_QUERY = gql`
  query TechProposalsCount($where: TechProposalWhereInput!) {
    techProposalsCount(where: $where)
  }
`;

export interface TechProposalsVariables {
  where: {
    AND: Array<{
      assignedSeller: { id: { equals: string } };
      businessLead: { id: { equals: string } };
    }>;
  };
}

/** Variables para filtrar propuestas por vendedor y estado (ej. comisiones = status Comprada) */
export interface TechProposalsBySellerAndStatusVariables {
  where: {
    AND: [
      { assignedSeller: { id: { equals: string } } },
      { status: { equals: string } },
    ];
  };
}

/** Variables para filtrar solo por vendedor (todas las propuestas del usuario) */
export interface TechProposalsBySellerVariables {
  where: {
    assignedSeller: { id: { equals: string } };
  };
}

export interface TechProposalsResponse {
  techProposals: Array<{
    id: string;
    sentDate: string;
    amount: number | null;
    status: string;
    fileOrUrl: string | null;
    createdAt: string;
    updatedAt: string | null;
    businessLead: { id: string; businessName: string } | null;
  }>;
}

export interface TechProposalsCountResponse {
  techProposalsCount: number;
}

export const TECH_PROPOSAL_QUERY = gql`
  query TechProposal($where: TechProposalWhereUniqueInput!) {
    techProposal(where: $where) {
      id
      sentDate
      amount
      status
      fileOrUrl
      createdAt
      updatedAt
      businessLead {
        id
        businessName
      }
    }
  }
`;

export interface TechProposalVariables {
  where: { id: string };
}

export interface TechProposalResponse {
  techProposal: {
    id: string;
    sentDate: string;
    amount: number | null;
    status: string;
    fileOrUrl: string | null;
    createdAt: string;
    updatedAt: string | null;
    businessLead: { id: string; businessName: string } | null;
  } | null;
}

export const CREATE_TECH_PROPOSAL_MUTATION = gql`
  mutation CreateTechProposal($data: TechProposalCreateInput!) {
    createTechProposal(data: $data) {
      id
      sentDate
      amount
      status
      fileOrUrl
      businessLead {
        businessName
      }
      assignedSeller {
        name
      }
      createdAt
    }
  }
`;

export interface CreateTechProposalVariables {
  data: {
    sentDate: string;
    amount?: number | null;
    status?: string | null;
    fileOrUrl?: string | null;
    businessLead: { connect: { id: string } };
    assignedSeller: { connect: { id: string } };
  };
}

export interface CreateTechProposalMutation {
  createTechProposal: {
    id: string;
    sentDate: string;
    amount: number | null;
    status: string;
    fileOrUrl: string | null;
    businessLead: { businessName: string } | null;
    assignedSeller: { name: string } | null;
    createdAt: string;
  };
}

export const UPDATE_TECH_PROPOSAL_MUTATION = gql`
  mutation UpdateTechProposal(
    $where: TechProposalWhereUniqueInput!
    $data: TechProposalUpdateInput!
  ) {
    updateTechProposal(where: $where, data: $data) {
      id
      amount
      createdAt
      fileOrUrl
      sentDate
      status
      updatedAt
      businessLead {
        businessName
      }
    }
  }
`;

export interface UpdateTechProposalVariables {
  where: { id: string };
  data: {
    sentDate?: string | null;
    amount?: number | null;
    status?: string | null;
    fileOrUrl?: string | null;
  };
}

export interface UpdateTechProposalMutation {
  updateTechProposal: {
    id: string;
    amount: number | null;
    createdAt: string;
    fileOrUrl: string | null;
    sentDate: string;
    status: string;
    updatedAt: string | null;
    businessLead: { businessName: string } | null;
  };
}

// --- TechFollowUpTask ---

export const TECH_FOLLOW_UP_TASKS_QUERY = gql`
  query TechFollowUpTasks($where: TechFollowUpTaskWhereInput!) {
    techFollowUpTasks(where: $where) {
      id
      scheduledDate
      status
      priority
      notes
      createdAt
      updatedAt
      businessLead {
        id
        businessName
      }
    }
  }
`;

export const TECH_FOLLOW_UP_TASKS_COUNT_QUERY = gql`
  query TechFollowUpTasksCount($where: TechFollowUpTaskWhereInput!) {
    techFollowUpTasksCount(where: $where)
  }
`;

export interface TechFollowUpTasksVariables {
  where: {
    AND: Array<{
      assignedSeller: { id: { equals: string } };
      businessLead: { id: { equals: string } };
    }>;
  };
}

export interface TechFollowUpTasksResponse {
  techFollowUpTasks: Array<{
    id: string;
    scheduledDate: string;
    status: string;
    priority: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string | null;
    businessLead: { id: string; businessName: string } | null;
  }>;
}

export interface TechFollowUpTasksCountResponse {
  techFollowUpTasksCount: number;
}

export const TECH_FOLLOW_UP_TASK_QUERY = gql`
  query TechFollowUpTask($where: TechFollowUpTaskWhereUniqueInput!) {
    techFollowUpTask(where: $where) {
      id
      scheduledDate
      status
      priority
      notes
      createdAt
      updatedAt
      businessLead {
        id
        businessName
      }
    }
  }
`;

export interface TechFollowUpTaskVariables {
  where: { id: string };
}

export interface TechFollowUpTaskResponse {
  techFollowUpTask: {
    id: string;
    scheduledDate: string;
    status: string;
    priority: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string | null;
    businessLead: { id: string; businessName: string } | null;
  } | null;
}

export const CREATE_TECH_FOLLOW_UP_TASK_MUTATION = gql`
  mutation CreateTechFollowUpTask($data: TechFollowUpTaskCreateInput!) {
    createTechFollowUpTask(data: $data) {
      id
      scheduledDate
      status
      priority
      notes
      businessLead {
        businessName
      }
      assignedSeller {
        name
      }
      createdAt
    }
  }
`;

export interface CreateTechFollowUpTaskVariables {
  data: {
    scheduledDate: string;
    status?: string | null;
    priority?: string | null;
    notes?: string | null;
    businessLead: { connect: { id: string } };
    assignedSeller: { connect: { id: string } };
  };
}

export interface CreateTechFollowUpTaskMutation {
  createTechFollowUpTask: {
    id: string;
    scheduledDate: string;
    status: string;
    priority: string;
    notes: string | null;
    businessLead: { businessName: string } | null;
    assignedSeller: { name: string } | null;
    createdAt: string;
  };
}

export const UPDATE_TECH_FOLLOW_UP_TASK_MUTATION = gql`
  mutation UpdateTechFollowUpTask(
    $where: TechFollowUpTaskWhereUniqueInput!
    $data: TechFollowUpTaskUpdateInput!
  ) {
    updateTechFollowUpTask(where: $where, data: $data) {
      id
      scheduledDate
      status
      priority
      notes
      updatedAt
      businessLead {
        businessName
      }
    }
  }
`;

export interface UpdateTechFollowUpTaskVariables {
  where: { id: string };
  data: {
    scheduledDate?: string | null;
    status?: string | null;
    priority?: string | null;
    notes?: string | null;
  };
}

export interface UpdateTechFollowUpTaskMutation {
  updateTechFollowUpTask: {
    id: string;
    scheduledDate: string;
    status: string;
    priority: string;
    notes: string | null;
    updatedAt: string | null;
    businessLead: { businessName: string } | null;
  };
}

// ─── Agregar vendedor ───────────────────────────────────────────────────────

export const COMPANY_VENDEDORES_QUERY = gql`
  query CompanyVendedores($where: UserWhereInput!) {
    users(where: $where, orderBy: [{ name: asc }]) {
      id
      name
      lastName
      email
      phone
      birthday
      salesComission
      salesPersonVerified
    }
  }
`;

export interface CompanyVendedoresVariables {
  where: {
    company?: { id?: { equals: string } };
    roles?: { some?: { name?: { equals: string } } };
  };
}

export interface CompanyVendedoresResponse {
  users: Array<{
    id: string;
    name: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    birthday: string | null;
    salesComission: number | null;
    salesPersonVerified: boolean | null;
  }>;
}

export const UPDATE_VENDEDOR_MUTATION = gql`
  mutation UpdateVendedor($where: UserWhereUniqueInput!, $data: UserUpdateInput!) {
    updateUser(where: $where, data: $data) {
      id
      name
      lastName
      email
      phone
      birthday
      salesComission
      salesPersonVerified
    }
  }
`;

export interface UpdateVendedorVariables {
  where: { id: string };
  data: {
    name?: string;
    lastName?: string | null;
    email?: string | null;
    password?: string | null;
    phone?: string | null;
    birthday?: string | null;
    salesComission?: number | null;
    salesPersonVerified?: boolean | null;
  };
}

export interface UpdateVendedorResponse {
  updateUser: {
    id: string;
    name: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    birthday: string | null;
    salesComission: number | null;
    salesPersonVerified: boolean | null;
  } | null;
}

export const ROLES_BY_NAMES_QUERY = gql`
  query RolesByNames($where: RoleWhereInput!) {
    roles(where: $where) {
      id
      name
    }
  }
`;

export interface RolesByNamesVariables {
  where: { name?: { in?: string[] } };
}

export interface RolesByNamesResponse {
  roles: Array<{ id: string; name: string }>;
}

export const CREATE_SALES_PERSON_MUTATION = gql`
  mutation CreateSalesPerson($data: UserCreateInput!) {
    createUser(data: $data) {
      id
      name
      email
      phone
      birthday
      salesComission
      salesPersonVerified
      company {
        id
        name
      }
      roles {
        id
        name
      }
    }
  }
`;

export interface CreateSalesPersonVariables {
  data: {
    name: string;
    lastName?: string | null;
    email: string;
    password?: string | null;
    phone?: string | null;
    birthday?: string | null;
    salesComission?: number | null;
    salesPersonVerified?: boolean | null;
    roles?: { connect: Array<{ id: string }> };
    company?: { connect: { id: string } };
  };
}

export interface CreateSalesPersonResponse {
  createUser: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    birthday: string | null;
    salesComission: number | null;
    salesPersonVerified: boolean | null;
    company: { id: string; name: string } | null;
    roles: Array<{ id: string; name: string }>;
  };
}
