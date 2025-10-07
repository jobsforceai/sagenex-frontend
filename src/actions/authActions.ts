// src/actions/authActions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginSuccessResponse, ServerActionResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const AUTH_COOKIE_NAME = 'sagenex_auth_token';

export async function login(
  prevState: ServerActionResponse<null> | undefined,
  formData: FormData
): Promise<ServerActionResponse<null>> {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role: 'admin' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Login failed' };
    }

    const successData: LoginSuccessResponse = await response.json();
    
    (await cookies()).set(AUTH_COOKIE_NAME, successData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }

  redirect('/admin/onboard-user');
}

export async function logout() {
  (await cookies()).delete(AUTH_COOKIE_NAME);
  redirect('/login');
}
