
// src/types/index.ts

// ================================================
// User & Onboarding Types
// ================================================

/**
 * Represents the structure of a User object returned by the API.
 */
export interface User {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  originalSponsorId: string | null;
  parentId: string | null;
  isSplitSponsor: boolean;
  referralCode: string;
  packageUSD: number;
  pvPoints: number;
  dateJoined: string; // ISO 8601 date string
  status: 'active' | 'inactive';
  salary: number;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

/**
 * Defines the parameters required to onboard a new user.
 */
export type OnboardUserParams = {
  fullName: string;
  email: string;
  phone?: string;
  sponsorId?: string;
  dateJoined?: string; // YYYY-MM-DD format
  placementDesigneeId?: string;
};

/**
 * Defines the parameters for updating a user. All fields are optional.
 */
export type UpdateUserParams = {
  fullName?: string;
  phone?: string;
  parentId?: string;
  originalSponsorId?: string;
};

/**
 * Represents the successful response from the user onboarding API endpoint.
 */
export interface OnboardUserSuccessResponse {
  message: string;
  user: User;
}

export interface UserNode {
  userId: string;
  fullName: string;
  packageUSD: number;
  children: UserNode[];
  isSplitSponsor?: boolean;
  originalSponsorId?: string;
}

/**
 * Represents the parent user in the referral tree response.
 */
export interface ParentNode {
  userId: string;
  fullName: string;
}

/**
 * Represents the successful response from the get referral tree API endpoint.
 */
export interface ReferralTreeResponse {
  tree: UserNode;
  parent: ParentNode | null;
}

/**
 * Represents a direct child user, typically for designee selection.
 */
export interface DirectChild {
  userId: string;
  fullName: string;
}

/**
 * Represents the successful response from the get direct children API endpoint.
 */
export interface DirectChildrenSuccessResponse {
  children: DirectChild[];
}

// ================================================
// Auth Types
// ================================================

export interface LoginSuccessResponse {
  token: string;
}

// ================================================
// Collector Types
// ================================================

export interface Collector {
  _id: string;
  collectorId: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

export type CreateCollectorParams = {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
};

export interface CreateCollectorSuccessResponse {
  message: string;
  collector: Collector;
}

export type AllCollectorsSuccessResponse = Collector[];


// ================================================
// Currency & Rates Types
// ================================================

export interface LiveRate {
  [currencyCode: string]: number;
}

export interface FixedRate {
  _id: string;
  currencyCode: string;
  countryName: string;
  rateToUSDT: number;
  updatedAt: string; // ISO 8601 date string
  lastUpdatedBy?: string;
}

export type SetRateParams = {
  currencyCode: string;
  rateToUSDT: number;
};

export interface SetRateSuccessResponse {
  message: string;
  rate: FixedRate;
}

export interface RefreshLiveRatesSuccessResponse {
  message: string;
  rates: LiveRate;
}


// ================================================
// Payouts Types
// ================================================

/**
 * Represents the summary data for the monthly payouts dashboard.
 */
export interface PayoutsSummary {
  totalUsers: number;
  totalPackageVolume: number;
  totalROIMonth: number;
  totalDirectBonusMonth: number;
  totalUnilevelMonth: number;
}

/**
 * Represents the payout details for a single user for a specific month.
 */
export interface UserPayout {
  userId: string;
  fullName: string;
  packageUSD: number;
  roiPayout: number;
  directReferralBonus: number;
  unilevelBonus: number;
  salary: number;
  totalMonthlyIncome: number;
}

/**
 * Represents the successful response from the monthly payouts API endpoint.
 */
export interface MonthlyPayoutsSuccessResponse {
  summary: PayoutsSummary;
  payouts: UserPayout[];
}

// ================================================
// Deposits Types
// ================================================

export type DepositStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type DepositMethod = 'CASH' | 'BANK_TRANSFER' | 'CRYPTO';

export interface Deposit {
  _id: string;
  depositId: string;
  userId: string;
  userFullName: string;
  collectorId: string;
  amountUSDT: number;
  amountLocal?: number;
  currencyCode?: string;
  method: DepositMethod;
  reference: string | null;
  proofUrl: string | null;
  status: DepositStatus;
  verifiedAt?: string; // ISO 8601 date string
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

export type PendingDepositsSuccessResponse = Deposit[];

export interface VerifyDepositSuccessResponse {
  message: string;
  deposit: Deposit;
}


// ================================================
// KYC Types
// ================================================

export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';

export interface KycDocument {
  docType: 'AADHAAR_FRONT' | 'AADHAAR_BACK' | 'PAN' | 'OTHER';
  url: string;
}

export interface KycSubmission {
  _id: string;
  userId: string;
  status: KycStatus;
  documents: KycDocument[];
  submittedAt: string; // ISO 8601 date string
  verifiedAt?: string; // ISO 8601 date string
  verifiedBy?: string;
  rejectionReason?: string;
}

export type KycSubmissionsSuccessResponse = KycSubmission[];

export interface VerifyKycSuccessResponse {
  message: string;
  kyc: KycSubmission;
}

export interface RejectKycSuccessResponse {
  message: string;
  kyc: KycSubmission;
}


// ================================================
// Withdrawal Types
// ================================================

export type WithdrawalStatus = 'PENDING' | 'PAID' | 'REJECTED';

export interface WithdrawalRequest {
  _id: string;
  userId: string;
  amount: number;
  status: WithdrawalStatus;
  createdAt: string; // ISO 8601 date string
  meta: {
    payoutType: 'CRYPTO' | 'UPI' | 'BANK';
    withdrawalAddress?: string; // For CRYPTO
    upiId?: string; // For UPI
    bankDetails?: {
      bankName: string;
      accountNumber: string;
      ifscCode: string;
      holderName: string;
    };
    processedBy?: string;
    processedAt?: string; // ISO 8601 date string
    rejectionReason?: string;
    nowPaymentsPayoutId?: string; // For CRYPTO success
    transactionId?: string; // For CRYPTO success
  };
}

export type WithdrawalRequestsSuccessResponse = WithdrawalRequest[];

export interface ApproveWithdrawalSuccessResponse {
  message: string;
  withdrawal: WithdrawalRequest;
}

export interface RejectWithdrawalSuccessResponse {
  message: string;
  withdrawal: WithdrawalRequest;
}


// ================================================
// Rewards Types
// ================================================

export interface RewardClaim {
  _id: string; // rewardId
  offerId: string;
  claimStatus: 'PENDING' | 'COMPLETED';
  userId: {
    userId: string;
    fullName: string;
    email: string;
  };
  offerSnapshot: {
    name: string;
    reward: string;
  };
  updatedAt: string; // ISO 8601 date string
  isClaimed?: boolean;
  claimedAt?: string;
}

export type PendingRewardClaimsSuccessResponse = RewardClaim[];

export interface ApproveRewardClaimSuccessResponse {
  message: string;
  claim: RewardClaim;
}

export interface RewardProgressDetail {
  name: string;
  type: 'personal' | 'downline';
  currentValue: number;
  targetValue: number;
  isEligible: boolean;
  claimStatus: 'NONE' | 'PENDING' | 'COMPLETED';
}

export interface UserRewardProgress {
  user: {
    userId: string;
    fullName: string;
    email: string;
  };
  rewards: {
    [offerId: string]: RewardProgressDetail;
  };
}

export type AllUsersRewardProgressResponse = UserRewardProgress[];


// ================================================
// Generic & Pagination Types
// ================================================

/**
 * Represents the pagination metadata returned from the API.
 */
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
}

/**
 * Represents the successful response from the get all users API endpoint.
 */
export interface AllUsersSuccessResponse {
  users: User[];
  pagination: Pagination;
}

/**
 * Represents a user who has been deleted.
 * Extends the base User interface with deletion-specific fields.
 */
export interface DeletedUser extends User {
  deletedAt: string; // ISO 8601 date string
  deletedBy: string; // Admin user ID
  transferredAmountUSD?: number; // Amount transferred on deletion
}

/**
 * Represents the successful response from the get all deleted users API endpoint.
 */
export type DeletedUsersSuccessResponse = DeletedUser[];


// ================================================
// Generic API Response Types
// ================================================

/**
 * Represents a generic error response from the API.
 */
export interface ApiErrorResponse {
  message: string;
  error?: string;
}

/**
 * A generic type for server action return values, which can either be
 * a successful data payload (T) or an error object.
 */
export type ServerActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
