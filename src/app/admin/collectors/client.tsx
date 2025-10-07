// src/app/admin/collectors/client.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCollectors, createCollector } from '@/actions/adminActions';
import { Collector } from '@/types';
import { Toaster, toast } from 'sonner';

const collectorSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

type CollectorFormValues = z.infer<typeof collectorSchema>;

export function CollectorsClient() {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CollectorFormValues>({
    resolver: zodResolver(collectorSchema),
  });

  const fetchCollectors = useCallback(async () => {
    setIsLoading(true);
    const result = await getCollectors();
    if (result.success) {
      setCollectors(result.data || []);
    } else {
      toast.error(`Failed to fetch collectors: ${result.error}`);
      setCollectors([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCollectors();
  }, [fetchCollectors]);

  const onSubmit = async (data: CollectorFormValues) => {
    const result = await createCollector(data);
    if (result.success) {
      toast.success('Collector created successfully!');
      reset();
      setIsModalOpen(false);
      fetchCollectors(); // Refresh the list
    } else {
      toast.error(`Failed to create collector: ${result.error}`);
    }
  };

  return (
    <>
      <Toaster />
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setIsModalOpen(true)}>Create New Collector</Button>
        </div>

        {isModalOpen && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Collector</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" {...register('fullName')} />
                  {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...register('password')} />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input id="phone" {...register('phone')} />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Collector'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collector ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
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
              ) : collectors.length ? (
                collectors.map((collector) => (
                  <TableRow key={collector.collectorId}>
                    <TableCell>{collector.collectorId}</TableCell>
                    <TableCell>{collector.fullName}</TableCell>
                    <TableCell>{collector.email}</TableCell>
                    <TableCell>{collector.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Link href={`/admin/collectors/${collector.collectorId}/deposits`}>
                        <Button variant="outline" size="sm">View Deposits</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No collectors found.
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