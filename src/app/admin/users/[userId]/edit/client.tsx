// src/app/admin/users/[userId]/edit/client.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateUser } from '@/actions/adminActions';
import { User, UpdateUserParams } from '@/types';
import { Toaster, toast } from 'sonner';

const editUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  parentId: z.string().optional(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserClientProps {
  user: User;
}

export function EditUserClient({ user }: EditUserClientProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: user.fullName || '',
      phone: user.phone || '',
      parentId: user.parentId || '',
    },
  });

  const onSubmit = async (data: EditUserFormValues) => {
    // Filter out empty strings so they are not sent in the PATCH request
    const updateData: UpdateUserParams = {};
    if (data.fullName && data.fullName !== user.fullName) {
      updateData.fullName = data.fullName;
    }
    if (data.phone !== user.phone) { // Allows setting phone to empty
      updateData.phone = data.phone;
    }
    if (data.parentId !== user.parentId) { // Allows setting parentId to empty
      updateData.parentId = data.parentId;
    }

    if (Object.keys(updateData).length === 0) {
      toast.info('No changes were made.');
      return;
    }

    const result = await updateUser(user.userId, updateData);

    if (result.success) {
      toast.success('User updated successfully!');
      // Optionally, redirect after a short delay
      setTimeout(() => {
        router.push('/admin/users');
        router.refresh(); // to see the changes in the table
      }, 1000);
    } else {
      toast.error(`Failed to update user: ${result.error}`);
    }
  };

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
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="parentId">Parent ID</Label>
                <Input id="parentId" {...register('parentId')} />
                <p className="text-xs text-muted-foreground mt-1">
                  Warning: Changing the parent is only allowed if the user has no direct children.
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
