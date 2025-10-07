// src/app/admin/collectors/[collectorId]/deposits/client.tsx
'use client';

import { Deposit } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CollectorDepositsClientProps {
  deposits: Deposit[];
  collectorId: string;
}

export function CollectorDepositsClient({ deposits, collectorId }: CollectorDepositsClientProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Deposit History for Collector: {collectorId}</CardTitle>
        <Link href="/admin/collectors">
          <Button variant="outline">Back to Collectors</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deposit ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Amount (USDT)</TableHead>
                <TableHead>Amount (Local)</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.length ? (
                deposits.map((deposit) => (
                  <TableRow key={deposit._id}>
                    <TableCell>{deposit.depositId}</TableCell>
                    <TableCell>{deposit.userId}</TableCell>
                    <TableCell>
                      {typeof deposit.amountUSDT === 'number'
                        ? `$${deposit.amountUSDT.toLocaleString()}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {deposit.amountLocal?.toLocaleString()} {deposit.currencyCode}
                    </TableCell>
                    <TableCell>{deposit.method}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          deposit.status === 'VERIFIED'
                            ? 'default'
                            : deposit.status === 'PENDING'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {deposit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(deposit.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No deposits found for this collector.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
