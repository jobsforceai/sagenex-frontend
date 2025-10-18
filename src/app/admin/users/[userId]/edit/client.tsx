// src/app/admin/users/[userId]/edit/client.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { updateUser, getReferralTree, assignUserToRoot } from '@/actions/adminActions';
import { User, UpdateUserParams } from '@/types';
import { Toaster, toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  const [isParentEditable, setIsParentEditable] = useState(false);
  const [helperText, setHelperText] = useState("Checking eligibility...");
  const [isAssigningToRoot, setIsAssigningToRoot] = useState(false);

  useEffect(() => {
    async function checkParentEditability() {
      const treeResult = await getReferralTree(user.userId, 1);
      if (treeResult.success && treeResult.data.tree.children.length > 0) {
        setIsParentEditable(false);
        setHelperText("Cannot change parent: User already has direct children.");
      } else {
        setIsParentEditable(true);
        setHelperText("Warning: Changing the parent may be irreversible if the user has verified deposits.");
      }
    }
    checkParentEditability();
  }, [user.userId]);

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
    const updateData: UpdateUserParams = {};
    if (data.fullName && data.fullName !== user.fullName) {
      updateData.fullName = data.fullName;
    }
    if (data.phone !== user.phone) {
      updateData.phone = data.phone;
    }
    if (isParentEditable && data.parentId !== user.parentId) {
      updateData.parentId = data.parentId;
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

  const handleAssignToRoot = async () => {
    setIsAssigningToRoot(true);
    const result = await assignUserToRoot(user.userId);
    if (result.success) {
      toast.success('User successfully assigned to root.');
      router.refresh();
    } else {
      toast.error(`Failed to assign user to root: ${result.error}`);
    }
    setIsAssigningToRoot(false);
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
                <Input
                  id="parentId"
                  {...register('parentId')}
                  disabled={!isParentEditable}
                  className={!isParentEditable ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {helperText}
                </p>
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4 border-t pt-6">
          <div>
            <h3 className="font-semibold">Advanced Actions</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Assign this user directly to the company root (SAGENEX-GOLD). This action might be irreversible.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isAssigningToRoot || !isParentEditable || user.parentId === 'SAGENEX-GOLD'}
              >
                {isAssigningToRoot ? 'Assigning...' : 'Assign to Root'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will move the user directly under the company. This action cannot be undone if the user has verified deposits or children.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleAssignToRoot}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </>
  );
}