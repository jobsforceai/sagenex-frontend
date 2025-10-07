
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
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { getUsers } from '@/actions/adminActions';
import { AllUsersSuccessResponse, User } from '@/types';
import { Toaster, toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

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
                <TableHead>Sponsor ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data?.users.length ? (
                data.users.map((user: User) => (
                  <TableRow key={user.userId}>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>${user.packageUSD.toLocaleString()}</TableCell>
                    <TableCell>{user.sponsorId || 'N/A'}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell>
                      <Link href={`/admin/users/${user.userId}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
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
                <PaginationLink href="#">
                  Page {currentPage} of {data.pagination.totalPages}
                </PaginationLink>
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
