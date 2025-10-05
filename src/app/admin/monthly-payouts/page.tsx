
// src/app/admin/monthly-payouts/page.tsx
import { MonthlyPayoutsClient } from './client';

export default function MonthlyPayoutsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Monthly Payouts</h1>
      <MonthlyPayoutsClient />
    </div>
  );
}
