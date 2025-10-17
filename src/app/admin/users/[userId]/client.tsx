// src/app/admin/users/[userId]/client.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';
import { deleteUser } from '@/actions/adminActions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserDetailsClientProps {
  user: User;
}

export function UserDetailsClient({ user: initialUser }: UserDetailsClientProps) {
  const [user] = useState<User>(initialUser);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteUser(user.userId);
    if (result.success) {
      toast.success('User deleted successfully.');
      router.push('/admin/users');
      router.refresh();
    } else {
      toast.error(`Failed to delete user: ${result.error}`);
    }
    setIsDeleting(false);
  };

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
          <CardFooter className="flex justify-end border-t pt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete User'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the user
                    and transfer their funds. You cannot delete a user if they have
                    direct children in their downline.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}