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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getWithdrawalRequests, approveWithdrawalRequest, rejectWithdrawalRequest } from '@/actions/adminActions';
import { WithdrawalRequest, WithdrawalStatus } from '@/types';
import { Toaster, toast } from 'sonner';
import { Copy } from 'lucide-react';

// Helper component for the copy button
function CopyToClipboardButton({ textToCopy }: { textToCopy: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    toast.success('Copied to clipboard!');
  };

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
      <Copy className="h-4 w-4" />
    </Button>
  );
}


export function WithdrawalsClient() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<WithdrawalStatus>('PENDING');
  
  // State for Approve/Reject Modal
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedRequestForAction, setSelectedRequestForAction] = useState<WithdrawalRequest | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // State for Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<WithdrawalRequest | null>(null);


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

  const openActionModal = (request: WithdrawalRequest, action: 'approve' | 'reject') => {
    setSelectedRequestForAction(request);
    setModalAction(action);
    setIsActionModalOpen(true);
    setRejectionReason('');
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedRequestForAction(null);
    setModalAction(null);
  };

  const openDetailsModal = (request: WithdrawalRequest) => {
    setSelectedRequestForDetails(request);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRequestForDetails(null);
  };

  const handleSubmit = async () => {
    if (!selectedRequestForAction || !modalAction) return;

    let result;
    if (modalAction === 'approve') {
      result = await approveWithdrawalRequest(selectedRequestForAction._id);
    } else {
      if (!rejectionReason.trim()) {
        toast.error('Rejection reason cannot be empty.');
        return;
      }
      result = await rejectWithdrawalRequest(selectedRequestForAction._id, rejectionReason);
    }

    if (result.success) {
      toast.success(result.data.message);
      closeActionModal();
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

        {/* Action Modal (Approve/Reject) */}
        {isActionModalOpen && selectedRequestForAction && (
          <Card>
            <CardHeader>
              <CardTitle>
                {modalAction === 'approve' ? 'Approve' : 'Reject'} Withdrawal for {selectedRequestForAction.userId}
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
                  <p>Are you sure you want to approve this withdrawal of ${Math.abs(selectedRequestForAction.amount).toLocaleString()}?</p>
                )}
                <div className="flex space-x-2">
                  <Button onClick={handleSubmit}>
                    Confirm {modalAction === 'approve' ? 'Approval' : 'Rejection'}
                  </Button>
                  <Button variant="outline" onClick={closeActionModal}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Details Modal */}
        {isDetailsModalOpen && selectedRequestForDetails && (
           <Card>
            <CardHeader>
              <CardTitle>Withdrawal Details</CardTitle>
              <CardDescription>User: {selectedRequestForDetails.userId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {selectedRequestForDetails.meta.bankDetails && (
                  <div className="space-y-2 text-sm">
                    <h3 className="font-semibold text-base mb-2 border-b pb-1">Bank Details</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Holder Name:</span>
                      <div className="flex items-center">
                        <span className="font-mono">{selectedRequestForDetails.meta.bankDetails.holderName}</span>
                        <CopyToClipboardButton textToCopy={selectedRequestForDetails.meta.bankDetails.holderName} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Account Number:</span>
                       <div className="flex items-center">
                        <span className="font-mono">{selectedRequestForDetails.meta.bankDetails.accountNumber}</span>
                        <CopyToClipboardButton textToCopy={selectedRequestForDetails.meta.bankDetails.accountNumber} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">IFSC Code:</span>
                       <div className="flex items-center">
                        <span className="font-mono">{selectedRequestForDetails.meta.bankDetails.ifscCode}</span>
                        <CopyToClipboardButton textToCopy={selectedRequestForDetails.meta.bankDetails.ifscCode} />
                      </div>
                    </div>
                     <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Bank Name:</span>
                       <div className="flex items-center">
                        <span className="font-mono">{selectedRequestForDetails.meta.bankDetails.bankName}</span>
                        <CopyToClipboardButton textToCopy={selectedRequestForDetails.meta.bankDetails.bankName} />
                      </div>
                    </div>
                  </div>
                )}

                {selectedRequestForDetails.meta.upiId && (
                   <div className="space-y-2 text-sm">
                    <h3 className="font-semibold text-base mb-2 border-b pb-1">UPI Details</h3>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">UPI ID:</span>
                        <div className="flex items-center">
                          <span className="font-mono">{selectedRequestForDetails.meta.upiId}</span>
                          <CopyToClipboardButton textToCopy={selectedRequestForDetails.meta.upiId} />
                        </div>
                      </div>
                   </div>
                )}

                {selectedRequestForDetails.meta.withdrawalAddress && (
                   <div className="space-y-2 text-sm">
                    <h3 className="font-semibold text-base mb-2 border-b pb-1">Crypto Details</h3>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Wallet Address:</span>
                        <div className="flex items-center">
                          <span className="font-mono">{selectedRequestForDetails.meta.withdrawalAddress}</span>
                          <CopyToClipboardButton textToCopy={selectedRequestForDetails.meta.withdrawalAddress} />
                        </div>
                      </div>
                   </div>
                )}
                 <Button variant="outline" onClick={closeDetailsModal} className="mt-4">
                    Close
                  </Button>
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
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetailsModal(request)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                    <TableCell>{renderStatusBadge(request.status)}</TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="space-x-2">
                      {request.status === 'PENDING' && (
                        <>
                          <Button size="sm" onClick={() => openActionModal(request, 'approve')}>
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openActionModal(request, 'reject')}
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
