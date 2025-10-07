// src/app/admin/users/[userId]/client.tsx
'use client';

import { useState } from 'react';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import Link from 'next/link';

interface UserDetailsClientProps {
  user: User;
}

export function UserDetailsClient({ user: initialUser }: UserDetailsClientProps) {
  const [user] = useState<User>(initialUser);

  return (
    <>
      <Toaster />
      <div className="space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Information</CardTitle>
            <Link href={`/admin/users/${user.userId}/tree`}>
              <Button variant="outline">View Referral Tree</Button>
            </Link>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>User ID:</strong> {user.userId}</div>
            <div><strong>Full Name:</strong> {user.fullName}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Status:</strong> <span className="capitalize">{user.status}</span></div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}