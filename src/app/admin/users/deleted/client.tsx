// src/app/admin/users/deleted/client.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getDeletedUsers } from '@/actions/adminActions';
import { DeletedUser } from '@/types';
import { Toaster, toast } from 'sonner';
import { format } from 'date-fns';

export function DeletedUsersClient() {
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDeletedUsers() {
      setIsLoading(true);
      const result = await getDeletedUsers();
      if (result.success) {
        setDeletedUsers(result.data);
      } else {
        toast.error(`Failed to fetch deleted users: ${result.error}`);
      }
      setIsLoading(false);
    }
    fetchDeletedUsers();
  }, []);

  return (
    <>
      <Toaster />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Transferred Amount (USD)</TableHead>
              <TableHead>Deleted At</TableHead>
              <TableHead>Deleted By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : deletedUsers.length > 0 ? (
              deletedUsers.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.userId}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.transferredAmountUSD != null
                      ? `$${user.transferredAmountUSD.toLocaleString()}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{format(new Date(user.deletedAt), 'PPP p')}</TableCell>
                  <TableCell>{user.deletedBy}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No deleted users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
