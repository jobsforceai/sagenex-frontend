// src/app/admin/users/[userId]/edit/client.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlacementOptions, updateUser } from '@/actions/adminActions';
import { User, UpdateUserParams, PlacementOption } from '@/types';
import { Toaster, toast } from 'sonner';
import { Combobox } from '@/components/ui/combobox';

const editUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  parentId: z.string().optional(),
  originalSponsorId: z.string().optional(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserClientProps {
  user: User;
  placementOptions: PlacementOption[];
}

export function EditUserClient({ user, placementOptions: initialPlacementOptions }: EditUserClientProps) {
  const router = useRouter();
  const [placementOptions, setPlacementOptions] = useState<PlacementOption[]>(initialPlacementOptions);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: user.fullName || '',
      phone: user.phone || '',
      parentId: user.parentId || '',
      originalSponsorId: user.originalSponsorId || '',
    },
  });

  const handleFetchPlacementOptions = async () => {
    const sponsorId = getValues('originalSponsorId');
    if (!sponsorId) {
      toast.warning('Please enter a Sponsor ID to load options.');
      return;
    }

    setIsLoadingOptions(true);
    setValue('parentId', ''); // Reset parentId when sponsor changes
    const result = await getPlacementOptions(sponsorId);
    if (result.success) {
      setPlacementOptions(result.data.options);
      toast.success('Placement options loaded successfully.');
    } else {
      toast.error(`Failed to load placement options: ${result.error}`);
      setPlacementOptions([]); // Clear options on error
    }
    setIsLoadingOptions(false);
  };

  const onSubmit = async (data: EditUserFormValues) => {
    const updateData: UpdateUserParams = {};
    
    if (data.fullName !== user.fullName) {
      updateData.fullName = data.fullName;
    }
    if (data.phone !== user.phone) {
      updateData.phone = data.phone;
    }
    if (data.parentId !== user.parentId) {
      updateData.parentId = data.parentId;
    }
    if (data.originalSponsorId !== user.originalSponsorId) {
      updateData.originalSponsorId = data.originalSponsorId;
    }

    if (Object.keys(updateData).length === 0) {
      toast.info('No changes were made.');
      return;
    }

    const result = await updateUser(user.userId, updateData);

    if (result.success) {
      toast.success('User updated successfully!');
      setTimeout(() => {
        router.push('/admin/users');
        router.refresh();
      }, 1000);
    } else {
      toast.error(`Failed to update user: ${result.error}`);
    }
  };

  const parentIdOptions = placementOptions.map(opt => ({
    value: opt.userId,
    label: `${opt.fullName} (${opt.userId})`,
  }));

  return (
    <>
      <Toaster />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Editing User: {user.fullName} ({user.userId})</CardTitle>
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
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalSponsorId">Original Sponsor ID</Label>
                <div className="flex items-center gap-2">
                  <Input id="originalSponsorId" {...register('originalSponsorId')} />
                  <Button type="button" onClick={handleFetchPlacementOptions} disabled={isLoadingOptions}>
                    {isLoadingOptions ? 'Loading...' : 'Load'}
                  </Button>
                </div>
                 <p className="text-xs text-muted-foreground mt-1">
                  Determines bonus payouts. Use SAGENEX-GOLD for company root.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentId">Parent ID</Label>
                <Controller
                  name="parentId"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      options={parentIdOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select a parent..."
                      searchPlaceholder="Search for a parent..."
                      emptyText={isLoadingOptions ? 'Loading...' : 'No parents found.'}
                    />
                  )}
                />
                 <p className="text-xs text-muted-foreground mt-1">
                  Determines placement in the tree. Use SAGENEX-GOLD for company root.
                </p>
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}