// src/app/admin/collectors/page.tsx
import { CollectorsClient } from './client';

export default function CollectorsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Collector Management</h1>
      <CollectorsClient />
    </div>
  );
}
