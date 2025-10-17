// src/app/admin/users/client.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Button } from '@/components/ui/button';
import { getUsers } from '@/actions/adminActions';
import { User } from '@/types';
import { Toaster, toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { Crown } from 'lucide-react';

export function AllUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const loader = useRef(null);

  const fetchUsers = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    const result = await getUsers({ page, search });
    if (result.success) {
      setUsers((prevUsers) => (page === 1 ? result.data.users : [...prevUsers, ...result.data.users]));
      setHasMore(result.data.pagination.totalPages > page);
    } else {
      toast.error(`Failed to fetch users: ${result.error}`);
      setUsers([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Reset users and page number when search term changes
    setUsers([]);
    setCurrentPage(1);
    setHasMore(true);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchUsers(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm, fetchUsers]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    },
    [hasMore, isLoading]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '20px',
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    const currentLoader = loader.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }
    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [handleObserver]);

  return (
    <>
      <Toaster />
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Link href="/admin/users/deleted">
            <Button variant="outline">View Deleted Users</Button>
          </Link>
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
                <TableHead>Mobile Number</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user: User) => (
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
                    <TableCell>{user.phone || 'N/A'}</TableCell>
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
                !isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )
              )}
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              <TableRow ref={loader} />
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}