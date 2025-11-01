// src/app/admin/rewards/page.tsx
import { RewardsClient } from './client';

export default function RewardsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reward Claims Management</h1>
      <RewardsClient />
    </div>
  );
}
