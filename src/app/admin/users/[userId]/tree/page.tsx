// src/app/admin/users/[userId]/tree/page.tsx
import { getReferralTree } from '@/actions/adminActions';
import { TreeClient } from './client';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ReferralTreePage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const result = await getReferralTree(userId, 5); // Fetch initial depth of 5

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Referral Tree</h1>
        <Link href={`/admin/users/${userId}`}>
          <Button variant="outline">Back to User</Button>
        </Link>
      </div>
      {result.success ? (
        <TreeClient initialTreeData={result.data} />
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
