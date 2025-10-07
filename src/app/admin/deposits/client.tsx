// src/app/admin/deposits/client.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getPendingDeposits, verifyDeposit } from '@/actions/adminActions';
import { Deposit } from '@/types';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';

export function DepositsClient() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeposits = async () => {
    setIsLoading(true);
    const result = await getPendingDeposits();
    if (result.success) {
      setDeposits(result.data || []);
    } else {
      toast.error(`Failed to fetch deposits: ${result.error}`);
      setDeposits([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleVerify = async (depositId: string) => {
    const result = await verifyDeposit(depositId);
    if (result.success) {
      toast.success(result.data.message);
      // Refresh the list of pending deposits
      fetchDeposits();
    } else {
      toast.error(`Verification failed: ${result.error}`);
    }
  };

  return (
    <>
      <Toaster />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deposit Date</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>User Full Name</TableHead>
              <TableHead>Collector ID</TableHead>
              <TableHead>Amount (USDT)</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : deposits.length ? (
              deposits.map((deposit) => (
                <TableRow key={deposit._id}>
                  <TableCell>{new Date(deposit.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{deposit.userId}</TableCell>
                  <TableCell>{deposit.userFullName}</TableCell>
                  <TableCell>{deposit.collectorId}</TableCell>
                  <TableCell>
                    {typeof deposit.amountUSDT === 'number'
                      ? `$${deposit.amountUSDT.toLocaleString()}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{deposit.method}</TableCell>
                  <TableCell>{deposit.reference || 'N/A'}</TableCell>
                  <TableCell>
                    {deposit.proofUrl ? (
                      <Link href={deposit.proofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        View Proof
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleVerify(deposit._id)}>Verify</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  No pending deposits found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
