// src/actions/devActions.ts
'use server';

import { ServerActionResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

export async function createAdmin(
  prevState: ServerActionResponse<null> | undefined,
  formData: FormData
): Promise<ServerActionResponse<null>> {
  const fullName = formData.get('fullName');
  const email = formData.get('email');
  const password = formData.get('password');

  if (!ADMIN_API_KEY) {
    return { success: false, error: 'ADMIN_API_KEY is not set in the environment variables.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ADMIN_API_KEY,
      },
      body: JSON.stringify({ fullName, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to create admin.' };
    }

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
