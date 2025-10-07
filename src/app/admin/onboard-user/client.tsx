
// src/app/admin/onboard-user/client.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { onboardUser, getFixedRates } from '@/actions/adminActions';
import { Toaster, toast } from 'sonner';
import { FixedRate } from '@/types';

const onboardSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  initialInvestmentLocal: z.number().positive('Investment must be a positive number').optional(),
  currencyCode: z.string().optional(),
  sponsorId: z.string().optional(),
  dateJoined: z.date().optional(),
}).refine(data => {
  if (data.initialInvestmentLocal && !data.currencyCode) {
    return false;
  }
  return true;
}, {
  message: 'Currency code is required when an investment is entered.',
  path: ['currencyCode'],
});

type OnboardFormValues = z.infer<typeof onboardSchema>;

export function OnboardUserForm() {
  const [fixedRates, setFixedRates] = useState<FixedRate[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>();
  const [investmentAmount, setInvestmentAmount] = useState<number | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    watch,
  } = useForm<OnboardFormValues>({
    resolver: zodResolver(onboardSchema),
  });

  const watchedCurrency = watch('currencyCode');
  const watchedInvestment = watch('initialInvestmentLocal');

  useEffect(() => {
    const fetchRates = async () => {
      const result = await getFixedRates();
      if (result.success) {
        setFixedRates(result.data || []);
      } else {
        toast.error('Could not load currency rates.');
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    setSelectedCurrency(watchedCurrency);
    setInvestmentAmount(watchedInvestment);
  }, [watchedCurrency, watchedInvestment]);

  const getConversion = () => {
    if (selectedCurrency && investmentAmount) {
      const rate = fixedRates.find(r => r.currencyCode === selectedCurrency);
      if (rate) {
        const convertedAmount = investmentAmount / rate.rateToUSDT;
        return `~ ${convertedAmount.toFixed(2)} USDT`;
      }
    }
    return null;
  };

  const onSubmit = async (data: OnboardFormValues) => {
    const userData = {
      ...data,
      dateJoined: data.dateJoined ? format(data.dateJoined, 'yyyy-MM-dd') : undefined,
    };

    const result = await onboardUser(userData);
    if (result.success) {
      toast.success('User onboarded successfully!');
      reset();
    } else {
      toast.error(`Failed to onboard user: ${result.error}`);
    }
  };

  return (
    <>
      <Toaster />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="initialInvestmentLocal">Initial Investment (Optional)</Label>
                <Input id="initialInvestmentLocal" type="number" {...register('initialInvestmentLocal', { valueAsNumber: true })} />
                {errors.initialInvestmentLocal && <p className="text-red-500 text-sm">{errors.initialInvestmentLocal.message}</p>}
                <p className="text-sm text-muted-foreground">{getConversion()}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currencyCode">Currency</Label>
                <select
                  id="currencyCode"
                  {...register('currencyCode')}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Currency</option>
                  {fixedRates.map(rate => (
                    <option key={rate.currencyCode} value={rate.currencyCode}>
                      {rate.currencyCode}
                    </option>
                  ))}
                </select>
                {errors.currencyCode && <p className="text-red-500 text-sm">{errors.currencyCode.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sponsorId">Sponsor ID (Optional)</Label>
                <Input id="sponsorId" {...register('sponsorId')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="dateJoined">Date Joined (Optional)</Label>
                <Controller
                  control={control}
                  name="dateJoined"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Onboarding...' : 'Onboard User'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
