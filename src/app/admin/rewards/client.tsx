// src/app/admin/rewards/client.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { getPendingRewardClaims, approveRewardClaim } from '@/actions/adminActions';
import { RewardClaim } from '@/types';
import { Toaster, toast } from 'sonner';

export function RewardsClient() {
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClaims = useCallback(async () => {
    setIsLoading(true);
    const result = await getPendingRewardClaims();
    if (result.success) {
      setClaims(result.data || []);
    } else {
      toast.error(`Failed to fetch reward claims: ${result.error}`);
      setClaims([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleApprove = async (rewardId: string) => {
    const result = await approveRewardClaim(rewardId);
    if (result.success) {
      toast.success(result.data.message);
      fetchClaims(); // Refresh the list of pending claims
    } else {
      toast.error(`Approval failed: ${result.error}`);
    }
  };

  const renderClaimStatusBadge = (status: RewardClaim['claimStatus']) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="default">Completed</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Toaster />
      <Card>
        <CardHeader>
          <CardTitle>Pending Reward Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : claims.length ? (
                  claims.map((claim) => (
                    <TableRow key={claim._id}>
                      <TableCell>{claim._id}</TableCell>
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
                    <TableCell colSpan={8} className="text-center">
                      No pending reward claims found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
