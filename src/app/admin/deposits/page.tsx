// src/app/admin/deposits/page.tsx
import { DepositsClient } from './client';

export default function DepositsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Deposit Verification Queue</h1>
      <DepositsClient />
    </div>
  );
}
