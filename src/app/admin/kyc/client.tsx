// src/app/admin/kyc/client.tsx
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
import { getKycSubmissions, verifyKycSubmission, rejectKycSubmission } from '@/actions/adminActions';
import { KycSubmission, KycStatus } from '@/types';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';

export function KycClient() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<KycStatus>('PENDING');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState<KycSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchSubmissions = useCallback(async (currentStatus: KycStatus) => {
    setIsLoading(true);
    const result = await getKycSubmissions(currentStatus);
    if (result.success) {
      setSubmissions(result.data || []);
    } else {
      toast.error(`Failed to fetch KYC submissions: ${result.error}`);
      setSubmissions([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSubmissions(status);
  }, [status, fetchSubmissions]);

  const handleVerify = async (kycId: string) => {
    const result = await verifyKycSubmission(kycId);
    if (result.success) {
      toast.success(result.data.message);
      fetchSubmissions(status); // Refresh list
    } else {
      toast.error(`Verification failed: ${result.error}`);
    }
  };

  const openRejectModal = (submission: KycSubmission) => {
    setSelectedKyc(submission);
    setIsRejectModalOpen(true);
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!selectedKyc || !rejectionReason) {
      toast.error('Rejection reason cannot be empty.');
      return;
    }
    const result = await rejectKycSubmission(selectedKyc._id, rejectionReason);
    if (result.success) {
      toast.success(result.data.message);
      setIsRejectModalOpen(false);
      setSelectedKyc(null);
      fetchSubmissions(status); // Refresh list
    } else {
      toast.error(`Rejection failed: ${result.error}`);
    }
  };

  const renderStatusBadge = (status: KycStatus) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge variant="default">Verified</Badge>;
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
          {(['PENDING', 'VERIFIED', 'REJECTED', 'NOT_SUBMITTED'] as KycStatus[]).map((s) => (
            <Button
              key={s}
              variant={status === s ? 'default' : 'outline'}
              onClick={() => setStatus(s)}
            >
              {s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
            </Button>
          ))}
        </div>

        {isRejectModalOpen && selectedKyc && (
          <Card>
            <CardHeader>
              <CardTitle>Reject KYC for {selectedKyc.userId}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Reason for Rejection</Label>
                  <Input
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g., Document is blurry"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleReject}>Confirm Rejection</Button>
                  <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
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
                <TableHead>Status</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : submissions.length ? (
                submissions.map((submission) => (
                  <TableRow key={submission._id}>
                    <TableCell>{submission.userId}</TableCell>
                    <TableCell>{renderStatusBadge(submission.status)}</TableCell>
                    <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        {submission.documents.map((doc, index) => (
                          <Link
                            key={index}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-sm"
                          >
                            {doc.docType}
                          </Link>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="space-x-2">
                      {submission.status === 'PENDING' && (
                        <>
                          <Button size="sm" onClick={() => handleVerify(submission._id)}>
                            Verify
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openRejectModal(submission)}
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
                  <TableCell colSpan={5} className="text-center">
                    No submissions found for this status.
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
