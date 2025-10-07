// src/app/login/client.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login } from '@/actions/authActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Logging in...' : 'Login'}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, undefined);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Image
          src="/logo.png"
          alt="Sagenex Logo"
          width={120}
          height={40}
          className="mx-auto mb-4 rounded-lg"
        />
        <CardTitle>Admin Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {state?.success === false && state.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
