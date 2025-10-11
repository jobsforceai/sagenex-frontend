// src/app/admin/users/client.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { getUsers } from '@/actions/adminActions';
import { AllUsersSuccessResponse, User } from '@/types';
import { Toaster, toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { Crown } from 'lucide-react';

export function AllUsersClient() {
  const [data, setData] = useState<AllUsersSuccessResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchUsers = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    const result = await getUsers({ page, search });
    if (result.success) {
      setData(result.data);
    } else {
      toast.error(`Failed to fetch users: ${result.error}`);
      setData(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm, fetchUsers]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= (data?.pagination.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <Toaster />
      <div className="space-y-4">
        <div className="flex justify-end">
          <Input
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Package (USD)</TableHead>
                <TableHead>Sponsorship</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data?.users.length ? (
                data.users.map((user: User) => (
                  <TableRow
                    key={user.userId}
                    className={user.originalSponsorId === 'SAGENEX-GOLD' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500' : ''}
                  >
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.originalSponsorId === 'SAGENEX-GOLD' ? (
                          <>
                            <Crown className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{user.fullName}</span>
                          </>
                        ) : (
                          user.fullName
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>${user.packageUSD.toLocaleString()}</TableCell>
                    <TableCell>
                      {user.isSplitSponsor ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{user.parentId} (Parent)</span>
                          <span className="text-xs text-muted-foreground">
                            {user.originalSponsorId} (Sponsor)
                          </span>
                        </div>
                      ) : (
                        <span>{user.parentId || 'N/A'}</span>
                      )}
                    </TableCell>
                    <TableCell>{user.referralCode}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell className="space-x-2 whitespace-nowrap">
                      <Link href={`/admin/users/${user.userId}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <Link href={`/admin/users/${user.userId}/edit`}>
                        <Button variant="secondary" size="sm">Edit</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {data && data.pagination.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                />
              </PaginationItem>
              {/* Simple pagination - for more complex scenarios, you might generate page numbers */}
              <PaginationItem>
                <span className="px-4 py-2 text-sm font-medium">
                  Page {currentPage} of {data.pagination.totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </>
  );
}