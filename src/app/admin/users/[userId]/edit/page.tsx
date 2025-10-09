// src/app/admin/users/[userId]/edit/page.tsx
import { getUser } from '@/actions/adminActions';
import { EditUserClient } from './client';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function EditUserPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const result = await getUser(userId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit User</h1>
        <Link href={`/admin/users`}>
          <Button variant="outline">Back to All Users</Button>
        </Link>
      </div>
      {result.success ? (
        <EditUserClient user={result.data} />
      ) : (
        <Card>
          <CardContent>
            <p className="text-red-500 pt-6">{result.error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
