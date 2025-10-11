// src/app/admin/withdrawals/page.tsx
import { WithdrawalsClient } from './client';

export default function WithdrawalsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Withdrawal Management</h1>
      <WithdrawalsClient />
    </div>
  );
}
