// src/app/admin/onboard-user/client.tsx
'use client';

import { useState } from 'react';

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
import { onboardUser, getDirectChildren } from '@/actions/adminActions';
import { DirectChild } from '@/types';
import { Toaster, toast } from 'sonner';

const onboardSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  sponsorId: z.string().optional(),
  dateJoined: z.date().optional(),
  placementDesigneeId: z.string().optional(),
});

type OnboardFormValues = z.infer<typeof onboardSchema>;

export function OnboardUserForm() {
  const [showPlacementDesignee, setShowPlacementDesignee] = useState(false);
  const [lastSponsorId, setLastSponsorId] = useState<string | undefined>(undefined);
  const [designees, setDesignees] = useState<DirectChild[]>([]);
  const [isFetchingDesignees, setIsFetchingDesignees] = useState(false);

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
    const userData = {
      ...data,
      dateJoined: data.dateJoined ? format(data.dateJoined, 'yyyy-MM-dd') : undefined,
    };

    const result = await onboardUser(userData);
    if (result.success) {
      toast.success('User onboarded successfully!');
      reset();
      setShowPlacementDesignee(false);
      setLastSponsorId(undefined);
      setDesignees([]);
    } else {
      toast.error(`Failed to onboard user: ${result.error}`);
      if (result.error === 'Sponsor is full; a placement designee is required.') {
        setShowPlacementDesignee(true);
        setLastSponsorId(data.sponsorId);
        
        if (data.sponsorId) {
          setIsFetchingDesignees(true);
          const childrenResult = await getDirectChildren(data.sponsorId);
          if (childrenResult.success) {
            setDesignees(childrenResult.data.children);
          } else {
            toast.error(`Could not fetch designees: ${childrenResult.error}`);
            setDesignees([]);
          }
          setIsFetchingDesignees(false);
        }
      } else {
        setShowPlacementDesignee(false);
        setLastSponsorId(undefined);
        setDesignees([]);
      }
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
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sponsorId">Sponsor ID (Optional)</Label>
                <Input id="sponsorId" {...register('sponsorId')} />
              </div>
              {showPlacementDesignee && (
                <div className="space-y-2 md:col-span-2 p-4 border border-yellow-400 rounded-md bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Sponsor <strong>{lastSponsorId}</strong> is at capacity (6 directs).
                    Please provide a Placement Designee ID from one of their directs.
                  </p>
                  <Label htmlFor="placementDesigneeId">Placement Designee ID</Label>
                  {isFetchingDesignees ? (
                    <p className="text-sm text-muted-foreground">Loading designees...</p>
                  ) : (
                    <select
                      id="placementDesigneeId"
                      {...register('placementDesigneeId')}
                      className={cn(
                        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        "dark:bg-input/30"
                      )}
                    >
                      <option value="">Select a designee</option>
                      {designees.map((designee) => (
                        <option key={designee.userId} value={designee.userId}>
                          {designee.fullName} ({designee.userId})
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.placementDesigneeId && <p className="text-red-500 text-sm">{errors.placementDesigneeId.message}</p>}
                </div>
              )}
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