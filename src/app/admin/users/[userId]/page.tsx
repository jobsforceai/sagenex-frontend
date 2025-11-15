// src/app/admin/users/[userId]/page.tsx
import { getUser } from '@/actions/adminActions';
import { UserDetailsClient } from './client';
import { Card, CardContent } from '@/components/ui/card';

export default async function UserDetailsPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const result = await getUser(userId);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Details</h1>
      {result.success ? (
        <UserDetailsClient user={result.data.user} />
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
