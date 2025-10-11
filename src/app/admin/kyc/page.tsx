// src/app/admin/kyc/page.tsx
import { KycClient } from './client';

export default function KycPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">KYC Management</h1>
      <KycClient />
    </div>
  );
}
