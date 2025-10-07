// src/app/admin/currency-rates/client.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLiveRates, getFixedRates, setFixedRate, refreshLiveRates } from '@/actions/adminActions';
import { LiveRate, FixedRate } from '@/types';
import { Toaster, toast } from 'sonner';

const rateSchema = z.object({
  currencyCode: z.string().min(3, 'Currency code must be 3 characters').max(3),
  rate: z.number().positive('Rate must be a positive number'),
});

type RateFormValues = z.infer<typeof rateSchema>;

export function RatesClient() {
  const [liveRates, setLiveRates] = useState<LiveRate | null>(null);
  const [fixedRates, setFixedRates] = useState<FixedRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RateFormValues>({
    resolver: zodResolver(rateSchema),
  });

  const fetchRates = async () => {
    setIsLoading(true);
    const [liveResult, fixedResult] = await Promise.all([
      getLiveRates(),
      getFixedRates(),
    ]);

    if (liveResult.success) {
      setLiveRates(liveResult.data);
    } else {
      toast.error(`Failed to fetch live rates: ${liveResult.error}`);
    }

    if (fixedResult.success) {
      setFixedRates(fixedResult.data || []);
    } else {
      toast.error(`Failed to fetch fixed rates: ${fixedResult.error}`);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const onSubmit = async (data: RateFormValues) => {
    const result = await setFixedRate({
      ...data,
      currencyCode: data.currencyCode.toUpperCase(),
    });
    if (result.success) {
      toast.success('Rate set successfully!');
      reset();
      fetchRates(); // Refresh the list
    } else {
      toast.error(`Failed to set rate: ${result.error}`);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const result = await refreshLiveRates();
    if (result.success) {
      toast.success(result.data.message);
      setLiveRates(result.data.rates);
    } else {
      toast.error(`Failed to refresh rates: ${result.error}`);
    }
    setIsRefreshing(false);
  };

  return (
    <>
      <Toaster />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Set Fixed Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="flex items-end space-x-4">
                <div className="space-y-2">
                  <Label htmlFor="currencyCode">Currency Code (e.g., INR)</Label>
                  <Input id="currencyCode" {...register('currencyCode')} />
                  {errors.currencyCode && <p className="text-red-500 text-sm">{errors.currencyCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate to USDT</Label>
                  <Input id="rate" type="number" step="0.01" {...register('rate', { valueAsNumber: true })} />
                  {errors.rate && <p className="text-red-500 text-sm">{errors.rate.message}</p>}
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Rate'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Fixed Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency Code</TableHead>
                    <TableHead>Rate to USDT</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : fixedRates.length ? (
                    fixedRates.map((rate) => (
                      <TableRow key={rate.currencyCode}>
                        <TableCell>{rate.currencyCode}</TableCell>
                        <TableCell>{rate.rateToUSDT}</TableCell>
                        <TableCell>{new Date(rate.updatedAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No fixed rates set.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Live Rate Reference (vs USDT)</CardTitle>
              <Button onClick={handleRefresh} disabled={isRefreshing} size="sm">
                {isRefreshing ? 'Refreshing...' : 'Refresh Live Rates'}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading live rates...</p>
              ) : liveRates ? (
                <ul className="space-y-2">
                  {Object.entries(liveRates).map(([code, rate]) => {
                    if (typeof rate === 'number') {
                      return (
                        <li key={code} className="flex justify-between">
                          <strong>{code}:</strong>
                          <span>{rate.toFixed(4)}</span>
                        </li>
                      );
                    }
                    console.warn(`Unexpected live rate format for ${code}:`, rate);
                    return null;
                  })}
                </ul>
              ) : (
                <p>Could not load live rates.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
