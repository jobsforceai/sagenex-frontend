
// src/app/admin/onboard-user/client.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

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
import { onboardUser } from '@/actions/adminActions';
import { Toaster, toast } from 'sonner';

const onboardSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  packageUSD: z.number().min(1, 'Package must be at least 1'),
  phone: z.string().optional(),
  sponsorId: z.string().optional(),
  dateJoined: z.date().optional(),
});

type OnboardFormValues = z.infer<typeof onboardSchema>;

export function OnboardUserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<OnboardFormValues>({
    resolver: zodResolver(onboardSchema),
  });

  const onSubmit = async (data: OnboardFormValues) => {
    // Format the dateJoined field to 'yyyy-MM-dd' if it exists
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
                <Label htmlFor="packageUSD">Package (USD)</Label>
                <Input id="packageUSD" type="number" {...register('packageUSD', { valueAsNumber: true })} />
                {errors.packageUSD && <p className="text-red-500 text-sm">{errors.packageUSD.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sponsorId">Sponsor ID (Optional)</Label>
                <Input id="sponsorId" {...register('sponsorId')} />
              </div>
              <div className="space-y-2">
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
