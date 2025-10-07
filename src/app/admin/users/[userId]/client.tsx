// src/app/admin/users/[userId]/client.tsx
'use client';

import { useState, useEffect } from 'react';
import { User, Collector } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import { assignCollector, getCollectors } from '@/actions/adminActions';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';

interface UserDetailsClientProps {
  user: User;
}

export function UserDetailsClient({ user: initialUser }: UserDetailsClientProps) {
  const [user, setUser] = useState<User>(initialUser);

  const [collectorSearch, setCollectorSearch] = useState('');
  const debouncedCollectorSearch = useDebounce(collectorSearch, 500);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [selectedCollector, setSelectedCollector] = useState<Collector | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (debouncedCollectorSearch) {
      setIsSearching(true);
      const fetchCollectors = async () => {
        const result = await getCollectors(debouncedCollectorSearch);
        if (result.success) {
          setCollectors(result.data || []);
        }
        setIsSearching(false);
      };
      fetchCollectors();
    } else {
      setCollectors([]);
    }
  }, [debouncedCollectorSearch]);

  const handleAssignCollector = async () => {
    if (!selectedCollector) {
      toast.error('Please select a collector to assign.');
      return;
    }
    setIsAssigning(true);
    const result = await assignCollector(user.userId, selectedCollector.collectorId);
    if (result.success) {
      toast.success(result.data.message);
      setUser(result.data.user);
      setCollectorSearch('');
      setSelectedCollector(null);
    } else {
      toast.error(`Failed to assign collector: ${result.error}`);
    }
    setIsAssigning(false);
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
            <div><strong>Assigned Collector:</strong> {user.assignedCollectorId || 'N/A'}</div>
            <div><strong>Status:</strong> <span className="capitalize">{user.status}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign Collector</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collector-search">Search for a collector by name or ID</Label>
              <Input
                id="collector-search"
                placeholder="Start typing to search..."
                value={collectorSearch}
                onChange={(e) => {
                  setCollectorSearch(e.target.value);
                  setSelectedCollector(null);
                }}
              />
              {isSearching && <p>Searching...</p>}
              {collectors.length > 0 && !selectedCollector && (
                <ul className="border rounded-md max-h-40 overflow-y-auto">
                  {collectors.map((c) => (
                    <li
                      key={c.collectorId}
                      onClick={() => {
                        setSelectedCollector(c);
                        setCollectorSearch(`${c.fullName} (${c.collectorId})`);
                        setCollectors([]);
                      }}
                      className="p-2 hover:bg-accent cursor-pointer"
                    >
                      {c.fullName} ({c.collectorId})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button onClick={handleAssignCollector} disabled={isAssigning || !selectedCollector}>
              {isAssigning ? 'Assigning...' : 'Assign'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
