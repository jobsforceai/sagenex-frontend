
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
  sponsorId: string | null;
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
 * All fields except phone, sponsorId, and dateJoined are required.
 */
export type OnboardUserParams = {
  fullName: string;
  email: string;
  packageUSD: number;
  phone?: string;
  sponsorId?: string;
  dateJoined?: string; // YYYY-MM-DD format
};

/**
 * Represents the successful response from the user onboarding API endpoint.
 */
export interface OnboardUserSuccessResponse {
  message: string;
  user: User;
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

// ================================================
// Generic API Response Types
// ================================================

/**
 * Represents a generic error response from the API.
 */
export interface ApiErrorResponse {
  message: string;
}

/**
 * A generic type for server action return values, which can either be
 * a successful data payload (T) or an error object.
 */
export type ServerActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
