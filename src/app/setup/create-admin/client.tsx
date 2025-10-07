// src/app/setup/create-admin/client.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createAdmin } from '@/actions/devActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Creating Admin...' : 'Create Admin'}
    </Button>
  );
}

export function CreateAdminForm() {
  const [state, formAction] = useActionState(createAdmin, undefined);

  useEffect(() => {
    if (state?.success === true) {
      toast.success('Admin created successfully! You can now log in.');
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <>
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Create Initial Admin User</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Your Name"
                required
              />
            </div>
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
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </>
  );
}
