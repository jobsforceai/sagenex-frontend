// src/actions/adminActions.ts
'use server';

import { cookies } from 'next/headers';
import {
  OnboardUserParams,
  OnboardUserSuccessResponse,
  MonthlyPayoutsSuccessResponse,
  ApiErrorResponse,
  ServerActionResponse,
  AllUsersSuccessResponse,
  PendingDepositsSuccessResponse,
  VerifyDepositSuccessResponse,
  User,
  AllCollectorsSuccessResponse,
  CreateCollectorParams,
  CreateCollectorSuccessResponse,
  LiveRate,
  FixedRate,
  SetRateParams,
  SetRateSuccessResponse,
  RefreshLiveRatesSuccessResponse,
  Deposit,
  DirectChildrenSuccessResponse,
  ReferralTreeResponse,
  UpdateUserParams,
  KycSubmissionsSuccessResponse,
  VerifyKycSuccessResponse,
  RejectKycSuccessResponse,
  WithdrawalRequestsSuccessResponse,
  ApproveWithdrawalSuccessResponse,
  RejectWithdrawalSuccessResponse,
  DeletedUsersSuccessResponse,
  PendingRewardClaimsSuccessResponse,
  ApproveRewardClaimSuccessResponse,
  AllUsersRewardProgressResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const AUTH_COOKIE_NAME = 'sagenex_auth_token';

/**
 * Creates the authorization headers for API requests.
 * @returns A Headers object with the Authorization token.
 */
async function getAuthHeaders(): Promise<Headers> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  return headers;
}

/**
 * Handles API error responses gracefully.
 * If the response is JSON, it extracts the message.
 * If not, it returns the response text.
 * @param response - The fetch response object.
 * @returns A structured error object.
 */
async function handleApiError(response: Response): Promise<{ success: false; error: string }> {
  let errorMessage = `Request failed with status ${response.status}`;
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData: ApiErrorResponse = await response.json();
      let detailedError = errorData.message || 'An unknown error occurred.';
      if (errorData.error) {
        if (typeof errorData.error === 'object') {
          detailedError += `: ${JSON.stringify(errorData.error)}`;
        } else {
          detailedError += `: ${errorData.error}`;
        }
      }
      errorMessage = detailedError;
    } else {
      const textError = await response.text();
      errorMessage = textError || errorMessage;
    }
  } catch (e) {
    console.error('Failed to parse error response:', e);
  }
  return { success: false, error: errorMessage };
}

/**
 * Onboards a new user by making a POST request to the /admin/onboard endpoint.
 *
 * @param userData - The data for the new user.
 * @returns A promise that resolves to a ServerActionResponse containing either the success data or an error message.
 */
export async function onboardUser(
  userData: OnboardUserParams
): Promise<ServerActionResponse<OnboardUserSuccessResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/onboard`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: OnboardUserSuccessResponse = await response.json();
    return { success: true, data: successData };

  } catch (error) {
    console.error('Network or other error in onboardUser:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Retrieves the monthly payouts dashboard for a specific month.
 *
 * @param month - The month to generate the report for, in YYYY-MM format.
 * @returns A promise that resolves to a ServerActionResponse containing either the dashboard data or an error message.
 */
export async function getMonthlyPayouts(
  month: string
): Promise<ServerActionResponse<MonthlyPayoutsSuccessResponse>> {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return { success: false, error: "Invalid month format. Expected 'YYYY-MM'." };
  }

  const url = new URL(`${API_BASE_URL}/admin/payouts`);
  url.searchParams.append('month', month);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store', 
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: MonthlyPayoutsSuccessResponse = await response.json();
    return { success: true, data: successData };

  } catch (error) {
    console.error('Network or other error in getMonthlyPayouts:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Retrieves a paginated list of all users, with optional search.
 *
 * @param params - The query parameters for pagination and search.
 * @returns A promise that resolves to a ServerActionResponse containing the list of users and pagination info.
 */
export async function getUsers({
  page = 1,
  limit = 10,
  search = '',
}: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ServerActionResponse<AllUsersSuccessResponse>> {
  const url = new URL(`${API_BASE_URL}/admin/users`);
  url.searchParams.append('page', String(page));
  url.searchParams.append('limit', String(limit));
  if (search) {
    url.searchParams.append('search', search);
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: AllUsersSuccessResponse = await response.json();
    return { success: true, data: successData };

  } catch (error) {
    console.error('Network or other error in getUsers:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Retrieves a single user by their ID.
 *
 * @param userId - The ID of the user to retrieve.
 * @returns A promise that resolves to a ServerActionResponse containing the user data.
 */
export async function getUser(
  userId: string
): Promise<ServerActionResponse<User>> {
  const url = new URL(`${API_BASE_URL}/admin/users/${userId}`);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: User = await response.json();
    return { success: true, data: successData };

  } catch (error) {
    console.error('Network or other error in getUser:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Retrieves the referral tree for a specific user.
 *
 * @param userId - The ID of the root user.
 * @param depth - The maximum depth of the tree to fetch.
 * @returns A promise that resolves to a ServerActionResponse containing the referral tree data.
 */
export async function getReferralTree(
  userId: string,
  depth?: number
): Promise<ServerActionResponse<ReferralTreeResponse>> {
  const url = new URL(`${API_BASE_URL}/admin/users/${userId}/tree`);
  if (depth) {
    url.searchParams.append('depth', String(depth));
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: ReferralTreeResponse = await response.json();
    return { success: true, data: successData };
  } catch (error) {
    console.error('Network or other error in getReferralTree:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Retrieves a list of all deposits with a 'PENDING' status.
 *
 * @returns A promise that resolves to a ServerActionResponse containing the list of pending deposits.
 */
export async function getPendingDeposits(): Promise<ServerActionResponse<PendingDepositsSuccessResponse>> {
  const url = new URL(`${API_BASE_URL}/admin/deposits`);
  url.searchParams.append('status', 'PENDING');

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: PendingDepositsSuccessResponse = await response.json();
    return { success: true, data: successData };
  } catch (error) {
    console.error('Network or other error in getPendingDeposits:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Verifies a pending deposit.
 *
 * @param depositId - The ID of the deposit to verify.
 * @returns A promise that resolves to a ServerActionResponse containing the success message and updated deposit.
 */
export async function verifyDeposit(
  depositId: string
): Promise<ServerActionResponse<VerifyDepositSuccessResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/deposits/${depositId}/verify`, {
      method: 'POST',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: VerifyDepositSuccessResponse = await response.json();
    return { success: true, data: successData };
  } catch (error) {
    console.error('Network or other error in verifyDeposit:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Retrieves a list of all collectors.
 *
 * @param search - Optional search term to filter collectors.
 * @returns A promise that resolves to a ServerActionResponse containing the list of collectors.
 */
export async function getCollectors(
  search: string = ''
): Promise<ServerActionResponse<AllCollectorsSuccessResponse>> {
  const url = new URL(`${API_BASE_URL}/admin/collectors`);
  if (search) {
    url.searchParams.append('search', search);
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: AllCollectorsSuccessResponse = await response.json();
    return { success: true, data: successData };
  } catch (error) {
    console.error('Network or other error in getCollectors:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Creates a new collector.
 *
 * @param collectorData - The data for the new collector.
 * @returns A promise that resolves to a ServerActionResponse containing the success message and new collector data.
 */
export async function createCollector(
  collectorData: CreateCollectorParams
): Promise<ServerActionResponse<CreateCollectorSuccessResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/collectors`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(collectorData),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: CreateCollectorSuccessResponse = await response.json();
    return { success: true, data: successData };
  } catch (error) {
    console.error('Network or other error in createCollector:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Retrieves all deposits recorded by a specific collector.
 *
 * @param collectorId - The ID of the collector.
 * @returns A promise that resolves to a ServerActionResponse containing the list of deposits.
 */
export async function getCollectorDeposits(
  collectorId: string
): Promise<ServerActionResponse<Deposit[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/collectors/${collectorId}/deposits`, {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: Deposit[] = await response.json();
    return { success: true, data: successData };
  } catch (error) {
    console.error('Network or other error in getCollectorDeposits:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Retrieves live currency conversion rates.
 *
 * @returns A promise that resolves to a ServerActionResponse containing live rate data.
 */
export async function getLiveRates(): Promise<ServerActionResponse<LiveRate>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/rates/live`, {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: LiveRate = await response.json();
    return { success: true, data: successData };
  } catch (error) {
    console.error('Network or other error in getLiveRates:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Retrieves the list of admin-set fixed currency rates.
 *
 * @returns A promise that resolves to a ServerActionResponse containing the list of fixed rates.
 */
export async function getFixedRates(): Promise<ServerActionResponse<FixedRate[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/rates`, {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: FixedRate[] = await response.json();
    return { success: true, data: successData };
  } catch (error) {
    console.error('Network or other error in getFixedRates:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Sets or updates a fixed currency rate.
 *
 * @param rateData - The currency code and the new rate.
 * @returns A promise that resolves to a ServerActionResponse containing the success message.
 */
export async function setFixedRate(
  rateData: SetRateParams
): Promise<ServerActionResponse<SetRateSuccessResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/rates`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(rateData), // rateData now contains rateToUSDT
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: SetRateSuccessResponse = await response.json();
    return { success: true, data: successData };
  } catch (error) {
    console.error('Network or other error in setFixedRate:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Triggers a refresh of the live currency rates.
 *
 * @returns A promise that resolves to a ServerActionResponse containing the newly refreshed rates.
 */
export async function refreshLiveRates(): Promise<ServerActionResponse<RefreshLiveRatesSuccessResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/rates/live/refresh`, {
      method: 'POST',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: RefreshLiveRatesSuccessResponse = await response.json();
    return { success: true, data: successData };
  } catch (error) {
    console.error('Network or other error in refreshLiveRates:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Deletes a user by their ID.
 *
 * @param userId - The ID of the user to delete.
 * @returns A promise that resolves to a ServerActionResponse indicating success or failure.
 */
export async function deleteUser(
  userId: string
): Promise<ServerActionResponse<null>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });

    if (response.status === 204) {
      return { success: true, data: null };
    }

    if (!response.ok) {
      return handleApiError(response);
    }

    // This part should ideally not be reached for a 204 response,
    // but as a fallback for other 2xx statuses.
    return { success: true, data: null };

  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

  

/**
 * Retrieves a list of all deleted users.
 *
 * @returns A promise that resolves to a ServerActionResponse containing the list of deleted users.
 */
export async function getDeletedUsers(): Promise<ServerActionResponse<DeletedUsersSuccessResponse>> {
  const url = new URL(`${API_BASE_URL}/admin/users/deleted`);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: DeletedUsersSuccessResponse = await response.json();
    return { success: true, data: successData };
  } catch (error) {
    console.error('Network or other error in getDeletedUsers:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Updates a user's details.
 *
 * @param userId - The ID of the user to update.
 * @param userData - The data to update.
 * @returns A promise that resolves to a ServerActionResponse containing the updated user data.
 */
export async function updateUser(
  userId: string,
  userData: UpdateUserParams
): Promise<ServerActionResponse<User>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: { message: string; user: User } = await response.json();
    return { success: true, data: successData.user };

  } catch (error) {
    console.error('Network or other error in updateUser:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

    /**
     * Retrieves the direct children of a specific user using the dedicated endpoint.
     *
     * @param userId - The ID of the user whose children to retrieve.
     * @returns A promise that resolves to a ServerActionResponse containing the list of direct children.
     */
        export async function getDirectChildren(
          userId: string
        ): Promise<ServerActionResponse<DirectChildrenSuccessResponse>> {
          const url = new URL(`${API_BASE_URL}/admin/users/${userId}/children`);
        
          try {
            const response = await fetch(url.toString(), {
              method: 'GET',
              headers: await getAuthHeaders(),
              cache: 'no-store',
            });
        
            if (!response.ok) {
              return handleApiError(response);
            }
        
            const successData: DirectChildrenSuccessResponse = await response.json();
            return { success: true, data: successData };
        
          } catch (error) {
            console.error('Network or other error in getDirectChildren:', error);
            if (error instanceof Error) {
              return { success: false, error: error.message };
            }
        return { success: false, error: 'An unexpected error occurred.' };
      }
    }

/**
 * Retrieves a list of all pending reward claims.
 *
 * @returns A promise that resolves to a ServerActionResponse containing the list of pending reward claims.
 */
export async function getPendingRewardClaims(): Promise<ServerActionResponse<PendingRewardClaimsSuccessResponse>> {
  const url = new URL(`${API_BASE_URL}/admin/rewards/pending`);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: PendingRewardClaimsSuccessResponse = await response.json();
    return { success: true, data: successData };
  } catch (error) {
    console.error('Network or other error in getPendingRewardClaims:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Approves a pending reward claim.
 *
 * @param rewardId - The ID of the reward to approve.
 * @returns A promise that resolves to a ServerActionResponse containing the success message and updated claim.
 */
export async function approveRewardClaim(
  rewardId: string
): Promise<ServerActionResponse<ApproveRewardClaimSuccessResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/rewards/${rewardId}/approve`, {
      method: 'POST',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: ApproveRewardClaimSuccessResponse = await response.json();
    return { success: true, data: successData };
  } catch (error) {
    console.error('Network or other error in approveRewardClaim:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

    /**
     * Retrieves a list of KYC submissions, filterable by status.
     *
     * @param status - The status to filter by (e.g., 'PENDING', 'VERIFIED').
     * @returns A promise that resolves to a ServerActionResponse containing the list of KYC submissions.
     */
    export async function getKycSubmissions(
      status: string = 'PENDING'
    ): Promise<ServerActionResponse<KycSubmissionsSuccessResponse>> {
      const url = new URL(`${API_BASE_URL}/admin/kyc`);
      url.searchParams.append('status', status);
    
      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: await getAuthHeaders(),
          cache: 'no-store',
        });
    
        if (!response.ok) {
          return handleApiError(response);
        }
    
        const successData: KycSubmissionsSuccessResponse = await response.json();
        return { success: true, data: successData };
      } catch (error) {
        console.error('Network or other error in getKycSubmissions:', error);
        if (error instanceof Error) {
          return { success: false, error: error.message };
        }
        return { success: false, error: 'An unexpected error occurred.' };
      }
    }
    
    /**
     * Verifies a KYC submission.
     *
     * @param kycId - The ID of the KYC submission to verify.
     * @returns A promise that resolves to a ServerActionResponse containing the success message and updated KYC data.
     */
    export async function verifyKycSubmission(
      kycId: string
    ): Promise<ServerActionResponse<VerifyKycSuccessResponse>> {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/kyc/${kycId}/verify`, {
          method: 'POST',
          headers: await getAuthHeaders(),
        });
    
        if (!response.ok) {
          return handleApiError(response);
        }
    
        const successData: VerifyKycSuccessResponse = await response.json();
        return { success: true, data: successData };
      } catch (error) {
        console.error('Network or other error in verifyKycSubmission:', error);
        if (error instanceof Error) {
          return { success: false, error: error.message };
        }
        return { success: false, error: 'An unexpected error occurred.' };
      }
    }
    
    /**
     * Rejects a KYC submission.
     *
     * @param kycId - The ID of the KYC submission to reject.
     * @param reason - The reason for rejection.
     * @returns A promise that resolves to a ServerActionResponse containing the success message and updated KYC data.
     */
    export async function rejectKycSubmission(
      kycId: string,
      reason: string
    ): Promise<ServerActionResponse<RejectKycSuccessResponse>> {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/kyc/${kycId}/reject`, {
          method: 'POST',
          headers: await getAuthHeaders(),
          body: JSON.stringify({ reason }),
        });
    
        if (!response.ok) {
          return handleApiError(response);
        }
    
        const successData: RejectKycSuccessResponse = await response.json();
        return { success: true, data: successData };
      } catch (error) {
        console.error('Network or other error in rejectKycSubmission:', error);
        if (error instanceof Error) {
          return { success: false, error: error.message };
        }
        return { success: false, error: 'An unexpected error occurred.' };
      }
    }
    
    /**
     * Retrieves a list of withdrawal requests, filterable by status.
     *
     * @param status - The status to filter by (e.g., 'PENDING', 'COMPLETED').
     * @returns A promise that resolves to a ServerActionResponse containing the list of withdrawal requests.
     */
    export async function getWithdrawalRequests(
      status: string = 'PENDING'
    ): Promise<ServerActionResponse<WithdrawalRequestsSuccessResponse>> {
      const url = new URL(`${API_BASE_URL}/admin/withdrawals`);
      url.searchParams.append('status', status);
    
      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: await getAuthHeaders(),
          cache: 'no-store',
        });
    
        if (!response.ok) {
          return handleApiError(response);
        }
    
        const successData: WithdrawalRequestsSuccessResponse = await response.json();
        return { success: true, data: successData };
      } catch (error) {
        console.error('Network or other error in getWithdrawalRequests:', error);
        if (error instanceof Error) {
          return { success: false, error: error.message };
        }
        return { success: false, error: 'An unexpected error occurred.' };
      }
    }
    
    /**
     * Approves a withdrawal request.
     *
     * @param requestId - The ID of the withdrawal request to approve.
     * @returns A promise that resolves to a ServerActionResponse containing the success message and updated withdrawal data.
     */
    export async function approveWithdrawalRequest(
      requestId: string
    ): Promise<ServerActionResponse<ApproveWithdrawalSuccessResponse>> {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/withdrawals/${requestId}/approve`, {
          method: 'POST',
          headers: await getAuthHeaders(),
        });
    
        if (!response.ok) {
          return handleApiError(response);
        }
    
        const successData: ApproveWithdrawalSuccessResponse = await response.json();
        return { success: true, data: successData };
      } catch (error) {
        console.error('Network or other error in approveWithdrawalRequest:', error);
        if (error instanceof Error) {
          return { success: false, error: error.message };
        }
        return { success: false, error: 'An unexpected error occurred.' };
      }
    }    
    /**
     * Rejects a withdrawal request.
     *
     * @param requestId - The ID of the withdrawal request to reject.
     * @param reason - The reason for rejection.
     * @returns A promise that resolves to a ServerActionResponse containing the success message and updated withdrawal data.
     */
    export async function rejectWithdrawalRequest(
      requestId: string,
      reason: string
    ): Promise<ServerActionResponse<RejectWithdrawalSuccessResponse>> {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/withdrawals/${requestId}/reject`, {
          method: 'POST',
          headers: await getAuthHeaders(),
          body: JSON.stringify({ reason }),
        });
    
        if (!response.ok) {
          return handleApiError(response);
        }
    
        const successData: RejectWithdrawalSuccessResponse = await response.json();
        return { success: true, data: successData };
      } catch (error) {
        console.error('Network or other error in rejectWithdrawalRequest:', error);
        if (error instanceof Error) {
          return { success: false, error: error.message };
        }
        return { success: false, error: 'An unexpected error occurred.' };
      }
    }
    
/**
 * Retrieves a comprehensive report of reward progress for all users.
 *
 * @returns A promise that resolves to a ServerActionResponse containing the reward progress data.
 */
export async function getAllUsersRewardProgress(): Promise<ServerActionResponse<AllUsersRewardProgressResponse>> {
  const url = new URL(`${API_BASE_URL}/admin/rewards/progress`);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const successData: AllUsersRewardProgressResponse = await response.json();
    return { success: true, data: successData };
  } catch (error) {
    console.error('Network or other error in getAllUsersRewardProgress:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
