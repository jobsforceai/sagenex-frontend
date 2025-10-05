
// src/app/admin/monthly-payouts/client.tsx
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getMonthlyPayouts } from '@/actions/adminActions';
import { MonthlyPayoutsSuccessResponse } from '@/types';
import { Toaster, toast } from 'sonner';

export function MonthlyPayoutsClient() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [data, setData] = useState<MonthlyPayoutsSuccessResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchPayouts = async () => {
    if (!date) {
      toast.error('Please select a month.');
      return;
    }
    setIsLoading(true);
    const month = format(date, 'yyyy-MM');
    const result = await getMonthlyPayouts(month);
    if (result.success) {
      setData(result.data);
    } else {
      toast.error(`Failed to fetch payouts: ${result.error}`);
      setData(null);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Toaster />
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Fetch Payout Report</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end space-x-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[280px] justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'MMMM yyyy') : <span>Pick a month</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleFetchPayouts} disabled={isLoading}>
              {isLoading ? 'Fetching...' : 'Fetch Report'}
            </Button>
          </CardContent>
        </Card>

        {data && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Payout Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {Object.entries(data.summary).map(([key, value]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h2 className="text-2xl font-bold mb-4">User Payouts</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Package (USD)</TableHead>
                    <TableHead>ROI Payout</TableHead>
                    <TableHead>Direct Bonus</TableHead>
                    <TableHead>Unilevel Bonus</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Total Income</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.payouts.map((payout) => (
                    <TableRow key={payout.userId}>
                      <TableCell>{payout.userId}</TableCell>
                      <TableCell>{payout.fullName}</TableCell>
                      <TableCell>${payout.packageUSD.toLocaleString()}</TableCell>
                      <TableCell>${payout.roiPayout.toLocaleString()}</TableCell>
                      <TableCell>${payout.directReferralBonus.toLocaleString()}</TableCell>
                      <TableCell>${payout.unilevelBonus.toLocaleString()}</TableCell>
                      <TableCell>${payout.salary.toLocaleString()}</TableCell>
                      <TableCell className="font-bold">${payout.totalMonthlyIncome.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
