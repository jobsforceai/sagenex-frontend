// src/app/admin/rewards/client.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
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
import { Label } from '@/components/ui/label';
import {
  getPendingRewardClaims,
  approveRewardClaim,
  rejectRewardClaim,
  getPendingDocumentReviews,
  approveRewardDocuments,
  rejectRewardDocuments,
  getAllUsersRewardProgress,
} from '@/actions/adminActions';
import { RewardClaim, UserRewardProgress, RewardProgressDetail, RewardClaimStatus } from '@/types';
import { Toaster, toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

type View = 'pendingClaims' | 'pendingDocuments' | 'progress';
type RejectionType = 'initial' | 'documents';

export function RewardsClient() {
  const [view, setView] = useState<View>('pendingClaims');

  // State for Pending Claims
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [isClaimsLoading, setIsClaimsLoading] = useState(true);

  // State for Pending Document Reviews
  const [docClaims, setDocClaims] = useState<RewardClaim[]>([]);
  const [isDocClaimsLoading, setIsDocClaimsLoading] = useState(true);

  // State for All User Progress
  const [progressData, setProgressData] = useState<UserRewardProgress[]>([]);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filterOfferId, setFilterOfferId] = useState<string | null>(null);

  // State for Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<RewardClaim | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionType, setRejectionType] = useState<RejectionType>('initial');

  const fetchClaims = useCallback(async () => {
    setIsClaimsLoading(true);
    const result = await getPendingRewardClaims();
    if (result.success) {
      setClaims(result.data || []);
    } else {
      toast.error(`Failed to fetch pending claims: ${result.error}`);
      setClaims([]);
    }
    setIsClaimsLoading(false);
  }, []);

  const fetchDocReviews = useCallback(async () => {
    setIsDocClaimsLoading(true);
    const result = await getPendingDocumentReviews();
    if (result.success) {
      setDocClaims(result.data || []);
    } else {
      toast.error(`Failed to fetch pending document reviews: ${result.error}`);
      setDocClaims([]);
    }
    setIsDocClaimsLoading(false);
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
    if (view === 'pendingClaims') {
      fetchClaims();
    } else if (view === 'pendingDocuments') {
      fetchDocReviews();
    } else {
      fetchProgress();
    }
  }, [view, fetchClaims, fetchDocReviews, fetchProgress]);

  // Handlers for Initial Claim Approval/Rejection
  const handleApproveClaim = async (rewardId: string) => {
    const result = await approveRewardClaim(rewardId);
    if (result.success) {
      toast.success(result.data.message);
      fetchClaims(); // Refresh list
    } else {
      toast.error(`Approval failed: ${result.error}`);
    }
  };

  const handleRejectClaim = async () => {
    if (!selectedClaim || !rejectionReason) {
      toast.error('Rejection reason cannot be empty.');
      return;
    }
    const result = await rejectRewardClaim(selectedClaim._id, rejectionReason);
    if (result.success) {
      toast.success(result.data.message);
      closeRejectModal();
      fetchClaims(); // Refresh list
    } else {
      toast.error(`Rejection failed: ${result.error}`);
    }
  };

  // Handlers for Document Approval/Rejection
  const handleApproveDocuments = async (rewardId: string) => {
    const result = await approveRewardDocuments(rewardId);
    if (result.success) {
      toast.success(result.data.message);
      fetchDocReviews(); // Refresh list
    } else {
      toast.error(`Document approval failed: ${result.error}`);
    }
  };

  const handleRejectDocuments = async () => {
    if (!selectedClaim || !rejectionReason) {
      toast.error('Rejection reason cannot be empty.');
      return;
    }
    const result = await rejectRewardDocuments(selectedClaim._id, rejectionReason);
    if (result.success) {
      toast.success(result.data.message);
      closeRejectModal();
      fetchDocReviews(); // Refresh list
    } else {
      toast.error(`Document rejection failed: ${result.error}`);
    }
  };

  // Modal Controls
  const openRejectModal = (claim: RewardClaim, type: RejectionType) => {
    setSelectedClaim(claim);
    setRejectionType(type);
    setIsRejectModalOpen(true);
    setRejectionReason('');
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setSelectedClaim(null);
    setRejectionReason('');
  };

  const handleConfirmRejection = () => {
    if (rejectionType === 'initial') {
      handleRejectClaim();
    } else {
      handleRejectDocuments();
    }
  };

  const rewardHeaders = useMemo(() => {
    if (progressData.length === 0) return [];
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
    let filteredData = progressData;

    if (debouncedSearchTerm) {
      filteredData = filteredData.filter(p =>
        p.user.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        p.user.userId.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (filterOfferId) {
      filteredData = filteredData.filter(p => p.rewards[filterOfferId]?.isEligible);
    }

    return filteredData;
  }, [progressData, debouncedSearchTerm, filterOfferId]);

  const renderClaimStatusBadge = (status: RewardClaimStatus | RewardProgressDetail['claimStatus']) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="default">Completed</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      case 'DOCUMENTS_PENDING':
        return <Badge className="bg-yellow-500 text-white">Docs Pending</Badge>;
      case 'DOCUMENTS_REQUIRED':
        return <Badge className="bg-blue-500 text-white">Docs Required</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
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
  };

  return (
    <>
      <Toaster />
      <div className="space-y-4">
        <div className="flex space-x-2 border-b">
          <Button variant="ghost" onClick={() => setView('pendingClaims')} className={`rounded-none border-b-2 ${view === 'pendingClaims' ? 'border-primary text-primary' : 'border-transparent'}`}>Pending Claims</Button>
          <Button variant="ghost" onClick={() => setView('pendingDocuments')} className={`rounded-none border-b-2 ${view === 'pendingDocuments' ? 'border-primary text-primary' : 'border-transparent'}`}>Pending Documents</Button>
          <Button variant="ghost" onClick={() => setView('progress')} className={`rounded-none border-b-2 ${view === 'progress' ? 'border-primary text-primary' : 'border-transparent'}`}>All User Progress</Button>
        </div>

        {isRejectModalOpen && selectedClaim && (
          <Card>
            <CardHeader>
              <CardTitle>Reject Claim for {(selectedClaim.user || selectedClaim.userId).fullName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Reason for Rejection</Label>
                  <Input
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g., Incomplete information"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleConfirmRejection}>Confirm Rejection</Button>
                  <Button variant="outline" onClick={closeRejectModal}>Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {view === 'pendingClaims' && (
          <Card>
            <CardHeader><CardTitle>Pending Initial Reward Claims</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Claim Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isClaimsLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                  ) : claims.length ? (
                    claims.map((claim) => (
                      <TableRow key={claim._id}>
                        <TableCell>{claim.userId.fullName} ({claim.userId.userId})</TableCell>
                        <TableCell>{claim.offerSnapshot.name}</TableCell>
                        <TableCell>{new Date(claim.updatedAt).toLocaleString()}</TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" onClick={() => handleApproveClaim(claim._id)}>Approve</Button>
                          <Button variant="destructive" size="sm" onClick={() => openRejectModal(claim, 'initial')}>Reject</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} className="text-center">No pending claims found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {view === 'pendingDocuments' && (
          <Card>
            <CardHeader><CardTitle>Pending Document Reviews</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isDocClaimsLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                  ) : docClaims.length ? (
                    docClaims.map((claim) => {
                      const userInfo = claim.user || claim.userId;
                      return (
                        <TableRow key={claim._id}>
                          <TableCell>{userInfo.fullName} ({userInfo.userId})</TableCell>
                          <TableCell>{claim.offerSnapshot.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              {claim.uploadedDocuments?.map((doc, index) => (
                                <Link key={index} href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                                  {doc.docType}
                                </Link>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(claim.updatedAt).toLocaleString()}</TableCell>
                          <TableCell className="space-x-2">
                            <Button size="sm" onClick={() => handleApproveDocuments(claim._id)}>Approve</Button>
                            <Button variant="destructive" size="sm" onClick={() => openRejectModal(claim, 'documents')}>Reject</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow><TableCell colSpan={5} className="text-center">No claims pending document review.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {view === 'progress' && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <CardTitle>All Users Reward Progress</CardTitle>
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-full sm:max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="offerFilter" className="shrink-0">Filter by Offer:</Label>
                    <select
                      id="offerFilter"
                      value={filterOfferId || ''}
                      onChange={(e) => setFilterOfferId(e.target.value || null)}
                      className="border rounded-md p-1.5 text-sm w-full sm:w-auto"
                    >
                      <option value="">All Offers</option>
                      {rewardHeaders.map(([offerId, name]) => (
                        <option key={offerId} value={offerId}>{name}</option>
                      ))}
                    </select>
                  </div>
                  {filterOfferId && (
                    <Button variant="outline" size="sm" onClick={() => setFilterOfferId(null)} className="w-full sm:w-auto">Clear Filter</Button>
                  )}
                  <div className="flex flex-wrap gap-2 text-sm mt-2 sm:mt-0">
                    {rewardHeaders.map(([offerId, name]) => (
                      <div key={offerId} className="flex items-center gap-1 p-2 rounded-md bg-gray-100">
                        <span className="font-semibold">{name}:</span>
                        <span>{progressData.filter(p => p.rewards[offerId]?.isEligible).length} Eligible</span>
                      </div>
                    ))}
                  </div>
                </div>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-card z-10">User</TableHead>
                      {rewardHeaders.map(([offerId, name]) => (
                        <TableHead key={offerId}>{name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isProgressLoading ? (
                      <TableRow><TableCell colSpan={rewardHeaders.length + 1} className="text-center">Loading...</TableCell></TableRow>
                    ) : filteredProgressData.length ? (
                      filteredProgressData.map((progress) => (
                        <TableRow key={progress.user.userId}>
                          <TableCell className="font-medium sticky left-0 bg-card z-10">
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
                                    <span>${reward.currentValue.toLocaleString()} / ${reward.targetValue.toLocaleString()}</span>
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
                      <TableRow><TableCell colSpan={rewardHeaders.length + 1} className="text-center">No user progress data found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
