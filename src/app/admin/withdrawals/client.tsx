// src/app/admin/withdrawals/client.tsx
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getWithdrawalRequests, approveWithdrawalRequest, rejectWithdrawalRequest } from '@/actions/adminActions';
import { WithdrawalRequest, WithdrawalStatus } from '@/types';
import { Toaster, toast } from 'sonner';

export function WithdrawalsClient() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<WithdrawalStatus>('PENDING');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchRequests = useCallback(async (currentStatus: WithdrawalStatus) => {
    setIsLoading(true);
    const result = await getWithdrawalRequests(currentStatus);
    if (result.success) {
      setRequests(result.data || []);
    } else {
      toast.error(`Failed to fetch withdrawal requests: ${result.error}`);
      setRequests([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests(status);
  }, [status, fetchRequests]);

  const openModal = (request: WithdrawalRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setModalAction(action);
    setIsModalOpen(true);
    setRejectionReason('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    setModalAction(null);
  };

  const handleSubmit = async () => {
    if (!selectedRequest || !modalAction) return;

    let result;
    if (modalAction === 'approve') {
      result = await approveWithdrawalRequest(selectedRequest._id);
    } else {
      if (!rejectionReason.trim()) {
        toast.error('Rejection reason cannot be empty.');
        return;
      }
      result = await rejectWithdrawalRequest(selectedRequest._id, rejectionReason);
    }

    if (result.success) {
      toast.success(result.data.message);
      closeModal();
      fetchRequests(status); // Refresh list
    } else {
      toast.error(`Action failed: ${result.error}`);
    }
  };

  const renderStatusBadge = (status: WithdrawalStatus) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="default">Paid</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Toaster />
      <div className="space-y-4">
        <div className="flex space-x-2">
          {(['PENDING', 'PAID', 'REJECTED'] as WithdrawalStatus[]).map((s) => (
            <Button
              key={s}
              variant={status === s ? 'default' : 'outline'}
              onClick={() => setStatus(s)}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>

        {isModalOpen && selectedRequest && (
          <Card>
            <CardHeader>
              <CardTitle>
                {modalAction === 'approve' ? 'Approve' : 'Reject'} Withdrawal for {selectedRequest.userId}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modalAction === 'reject' ? (
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason">Reason for Rejection</Label>
                    <Input
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g., Invalid address"
                    />
                  </div>
                ) : (
                  <p>Are you sure you want to approve this withdrawal of ${Math.abs(selectedRequest.amount).toLocaleString()}?</p>
                )}
                <div className="flex space-x-2">
                  <Button onClick={handleSubmit}>
                    Confirm {modalAction === 'approve' ? 'Approval' : 'Rejection'}
                  </Button>
                  <Button variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Amount (USDT)</TableHead>
                <TableHead>Payout Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : requests.length ? (
                requests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{request.userId}</TableCell>
                    <TableCell>${Math.abs(request.amount).toLocaleString()}</TableCell>
                    <TableCell className="truncate max-w-xs">
                      {request.meta.upiId ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{request.meta.upiId}</span>
                          <span className="text-xs text-muted-foreground">UPI</span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                           <span className="font-medium">{request.meta.withdrawalAddress}</span>
                           <span className="text-xs text-muted-foreground">Crypto</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{renderStatusBadge(request.status)}</TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="space-x-2">
                      {request.status === 'PENDING' && (
                        <>
                          <Button size="sm" onClick={() => openModal(request, 'approve')}>
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openModal(request, 'reject')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No requests found for this status.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
