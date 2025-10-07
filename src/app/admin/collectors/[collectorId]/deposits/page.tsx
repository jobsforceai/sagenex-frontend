// src/app/admin/collectors/[collectorId]/deposits/page.tsx
import { getCollectorDeposits } from '@/actions/adminActions';
import { CollectorDepositsClient } from './client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CollectorDepositsPageProps {
  params: {
    collectorId: string;
  };
}

export default async function CollectorDepositsPage({ params }: CollectorDepositsPageProps) {
  const { collectorId } = params;
  const result = await getCollectorDeposits(collectorId);

  if (!result.success) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <CollectorDepositsClient deposits={result.data} collectorId={collectorId} />;
}
