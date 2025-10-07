// src/app/admin/currency-rates/page.tsx
import { RatesClient } from './client';

export default function CurrencyRatesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Currency Rate Management</h1>
      <RatesClient />
    </div>
  );
}
