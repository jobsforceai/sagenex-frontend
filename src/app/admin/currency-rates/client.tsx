// src/app/admin/currency-rates/client.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getLiveRates, getFixedRates, setFixedRate, refreshLiveRates } from '@/actions/adminActions';
import { LiveRate, FixedRate } from '@/types';
import { Toaster, toast } from 'sonner';

const rateSchema = z.object({
  currencyCode: z.string().min(3, 'Currency code must be 3 characters').max(3),
  rateToUSDT: z.number().positive('Rate must be a positive number'),
});

type RateFormValues = z.infer<typeof rateSchema>;

export function RatesClient() {
  const [liveRates, setLiveRates] = useState<LiveRate | null>(null);
  const [fixedRates, setFixedRates] = useState<FixedRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [editedRateValue, setEditedRateValue] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRates = useMemo(() => {
    if (!searchTerm) {
      return fixedRates;
    }
    return fixedRates.filter(
      (rate) =>
        rate.currencyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rate.countryName && rate.countryName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [fixedRates, searchTerm]);

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

  const handleSaveRate = async (currencyCode: string) => {
    if (editedRateValue <= 0) {
      toast.error('Rate must be a positive number.');
      return;
    }
    const result = await setFixedRate({
      currencyCode,
      rateToUSDT: editedRateValue,
    });

    if (result.success) {
      toast.success('Rate updated successfully!');
      setEditingRateId(null);
      fetchRates(); // Refresh the list
    } else {
      toast.error(`Failed to update rate: ${result.error}`);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const onSubmit = async (data: RateFormValues) => {
    const result = await setFixedRate({
      currencyCode: data.currencyCode.toUpperCase(),
      rateToUSDT: data.rateToUSDT,
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
      fetchRates(); // Re-fetch fixed rates
    } else {
      toast.error(`Failed to refresh rates: ${result.error}`);
    }
    setIsRefreshing(false);
  };

  return (
    <>
      <Toaster />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Column 1: Live Rates */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Live Rate Reference</CardTitle>
                <CardDescription>Live rates vs USDT, refreshed automatically.</CardDescription>
              </div>
              <Button onClick={handleRefresh} disabled={isRefreshing} size="sm">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading live rates...</p>
              ) : liveRates ? (
                <ul className="space-y-2 text-sm">
                  {Object.entries(liveRates).map(([code, rate]) => {
                    if (typeof rate === 'number') {
                      return (
                        <li key={code} className="flex justify-between items-center">
                          <strong className="font-medium">{code}:</strong>
                          <span className="text-muted-foreground">{rate.toFixed(4)}</span>
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>
              ) : (
                <p>Could not load live rates.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Fixed Rates Management */}
        <div className="xl:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Set / Add New Rate</CardTitle>
              <CardDescription>Manually set a new or existing currency rate.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="currencyCode">Currency Code</Label>
                  <Input id="currencyCode" {...register('currencyCode')} placeholder="e.g., INR" />
                  {errors.currencyCode && <p className="text-red-500 text-sm">{errors.currencyCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rateToUSDT">Rate to USDT</Label>
                  <Input id="rateToUSDT" type="number" step="any" {...register('rateToUSDT', { valueAsNumber: true })} placeholder="e.g., 85.17" />
                  {errors.rateToUSDT && <p className="text-red-500 text-sm">{errors.rateToUSDT.message}</p>}
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? 'Saving...' : 'Save Rate'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Fixed Rates</CardTitle>
                  <CardDescription>These are the rates currently used for all calculations.</CardDescription>
                </div>
                <Input
                  placeholder="Search by code or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Rate to USDT</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">Loading...</TableCell>
                    </TableRow>
                  ) : filteredRates.length ? (
                    filteredRates.map((rate) => (
                      <TableRow key={rate._id}>
                        <TableCell className="font-medium">{rate.currencyCode}</TableCell>
                        <TableCell>{rate.countryName}</TableCell>
                        <TableCell>
                          {editingRateId === rate._id ? (
                            <Input
                              type="number"
                              step="any"
                              value={editedRateValue}
                              onChange={(e) => setEditedRateValue(parseFloat(e.target.value))}
                              className="h-8"
                            />
                          ) : (
                            rate.rateToUSDT.toFixed(4)
                          )}
                        </TableCell>
                        <TableCell>{new Date(rate.updatedAt).toLocaleDateString()}</TableCell>
                        <TableCell>{rate.lastUpdatedBy || 'N/A'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          {editingRateId === rate._id ? (
                            <>
                              <Button size="sm" onClick={() => handleSaveRate(rate.currencyCode)}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingRateId(null)}>Cancel</Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingRateId(rate._id);
                                setEditedRateValue(rate.rateToUSDT);
                              }}
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">No rates found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
