// src/app/admin/rewards/client.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getPendingRewardClaims, approveRewardClaim, getAllUsersRewardProgress } from '@/actions/adminActions';
import { RewardClaim, UserRewardProgress, RewardProgressDetail } from '@/types';
import { Toaster, toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

type View = 'claims' | 'progress';

export function RewardsClient() {
  const [view, setView] = useState<View>('claims');
  
  // State for Pending Claims
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [isClaimsLoading, setIsClaimsLoading] = useState(true);

  // State for All User Progress
  const [progressData, setProgressData] = useState<UserRewardProgress[]>([]);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const rewardHeaders = useMemo(() => {
    if (progressData.length === 0) return [];
    // Create a set of all unique reward keys (offerIds) and their names
    const headersMap = new Map<string, string>();
    progressData.forEach(p => {
      Object.entries(p.rewards).forEach(([offerId, rewardDetails]) => {
        if (!headersMap.has(offerId)) {
          headersMap.set(offerId, rewardDetails.name);
        }
      });
    });
    return Array.from(headersMap.entries());
  }, [progressData]);

  const filteredProgressData = useMemo(() => {
    if (!debouncedSearchTerm) {
      return progressData;
    }
    return progressData.filter(p =>
      p.user.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      p.user.userId.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [progressData, debouncedSearchTerm]);


  const fetchClaims = useCallback(async () => {
    setIsClaimsLoading(true);
    const result = await getPendingRewardClaims();
    if (result.success) {
      setClaims(result.data || []);
    } else {
      toast.error(`Failed to fetch reward claims: ${result.error}`);
      setClaims([]);
    }
    setIsClaimsLoading(false);
  }, []);

  const fetchProgress = useCallback(async () => {
    setIsProgressLoading(true);
    const result = await getAllUsersRewardProgress();
    if (result.success) {
      setProgressData(result.data || []);
    } else {
      toast.error(`Failed to fetch reward progress: ${result.error}`);
      setProgressData([]);
    }
    setIsProgressLoading(false);
  }, []);

  useEffect(() => {
    if (view === 'claims') {
      fetchClaims();
    } else {
      fetchProgress();
    }
  }, [view, fetchClaims, fetchProgress]);

  const handleApprove = async (rewardId: string) => {
    const result = await approveRewardClaim(rewardId);
    if (result.success) {
      toast.success(result.data.message);
      fetchClaims(); // Refresh the list of pending claims
    } else {
      toast.error(`Approval failed: ${result.error}`);
    }
  };

  const renderClaimStatusBadge = (status: RewardClaim['claimStatus'] | RewardProgressDetail['claimStatus']) => {
     switch (status) {
      case 'COMPLETED':
        return <Badge variant="default">Completed</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      case 'NONE':
         return <Badge variant="outline">None</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const renderEligibilityBadge = (isEligible: boolean) => {
    return isEligible ? 
      <Badge className="bg-green-500 text-white hover:bg-green-600">Eligible</Badge> : 
      <Badge variant="destructive">Not Eligible</Badge>;
  }

  return (
    <>
      <Toaster />
       <div className="space-y-4">
        <div className="flex space-x-2 border-b">
          <Button variant={view === 'claims' ? 'ghost' : 'ghost'} onClick={() => setView('claims')} className={`rounded-none border-b-2 ${view === 'claims' ? 'border-primary text-primary' : 'border-transparent'}`}>Pending Claims</Button>
          <Button variant={view === 'progress' ? 'ghost' : 'ghost'} onClick={() => setView('progress')} className={`rounded-none border-b-2 ${view === 'progress' ? 'border-primary text-primary' : 'border-transparent'}`}>All User Progress</Button>
        </div>

        {view === 'claims' && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Reward Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>User Name</TableHead>
                      <TableHead>Offer</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Claim Status</TableHead>
                      <TableHead>Claim Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isClaimsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : claims.length ? (
                      claims.map((claim) => (
                        <TableRow key={claim._id}>
                          <TableCell>{claim.userId.userId}</TableCell>
                          <TableCell>{claim.userId.fullName}</TableCell>
                          <TableCell>{claim.offerSnapshot.name}</TableCell>
                          <TableCell>{claim.offerSnapshot.reward}</TableCell>
                          <TableCell>{renderClaimStatusBadge(claim.claimStatus)}</TableCell>
                          <TableCell>{new Date(claim.updatedAt).toLocaleString()}</TableCell>
                          <TableCell>
                            {claim.claimStatus === 'PENDING' && (
                              <Button size="sm" onClick={() => handleApprove(claim._id)}>
                                Approve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No pending reward claims found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {view === 'progress' && (
           <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Users Reward Progress</CardTitle>
                 <Input
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-card">User</TableHead>
                      {rewardHeaders.map(([offerId, name]) => (
                        <TableHead key={offerId}>{name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isProgressLoading ? (
                      <TableRow>
                        <TableCell colSpan={rewardHeaders.length + 1} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredProgressData.length ? (
                      filteredProgressData.map((progress) => (
                        <TableRow key={progress.user.userId}>
                          <TableCell className="font-medium sticky left-0 bg-card">
                             <div className="flex flex-col">
                                <span>{progress.user.fullName}</span>
                                <span className="text-xs text-muted-foreground">{progress.user.userId}</span>
                             </div>
                          </TableCell>
                          {rewardHeaders.map(([offerId]) => {
                            const reward = progress.rewards[offerId];
                            return (
                              <TableCell key={offerId}>
                                {reward ? (
                                  <div className="flex flex-col space-y-1 text-xs">
                                    <span>
                                      ${reward.currentValue.toLocaleString()} / ${reward.targetValue.toLocaleString()}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {renderEligibilityBadge(reward.isEligible)}
                                      {renderClaimStatusBadge(reward.claimStatus)}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs">N/A</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={rewardHeaders.length + 1} className="text-center">
                          No user progress data found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
