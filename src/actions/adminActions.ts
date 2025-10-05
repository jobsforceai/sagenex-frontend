
// src/actions/adminActions.ts
'use server';

import {
  OnboardUserParams,
  OnboardUserSuccessResponse,
  MonthlyPayoutsSuccessResponse,
  ApiErrorResponse,
  ServerActionResponse,
  AllUsersSuccessResponse
} from '@/types';

// It's a good practice to use an environment variable for the API base URL.
// Remember to create a .env.local file in your project root and add:
// NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json();
      // Return a structured error object
      return { success: false, error: errorData.message || 'An unknown error occurred.' };
    }

    const successData: OnboardUserSuccessResponse = await response.json();
    return { success: true, data: successData };

  } catch (error) {
    console.error('Network or other error in onboardUser:', error);
    // Handle network errors or other exceptions
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
  // Basic validation for the month format
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return { success: false, error: "Invalid month format. Expected 'YYYY-MM'." };
  }

  const url = new URL(`${API_BASE_URL}/admin/payouts`);
  url.searchParams.append('month', month);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Caching can be beneficial for GET requests that don't change often.
      // 'no-store' ensures we always get the latest data.
      cache: 'no-store', 
    });

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json();
      return { success: false, error: errorData.message || 'An unknown error occurred.' };
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
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json();
      return { success: false, error: errorData.message || 'An unknown error occurred.' };
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
