
// src/app/admin/users/page.tsx
import { AllUsersClient } from './client';

export default function AllUsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Users</h1>
      <AllUsersClient />
    </div>
  );
}
